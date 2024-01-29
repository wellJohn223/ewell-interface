import React, { useCallback, useEffect, useMemo, useState } from 'react';
import TradingPairList, { ITradingParCard } from '../components/TradingPairList';
import './styles.less';
import { Button, message } from 'antd';
import { CreateStepProps } from '../types';
import { useLocalStorage } from 'react-use';
import storages from '../storages';
import { request } from 'api';
import { DEFAULT_CHAIN_ID, NETWORK_CONFIG } from 'constants/network';
import ButtonGroup from '../components/ButtonGroup';
import { useWallet } from 'contexts/useWallet/hooks';
import { WebLoginState } from 'aelf-web-login';
import myEvents from 'utils/myEvent';
import { emitLoading } from 'utils/events';
import { mockTokenList } from './mock';

const ConfirmTradingPair: React.FC<CreateStepProps> = ({ onNext }) => {
  const [tradingPair, setTradingPair] = useLocalStorage(storages.ConfirmTradingPair);
  const [select, setSelect] = useState<ITradingParCard>(tradingPair as ITradingParCard);
  const [tokenList, setTokenList] = useState<ITradingParCard[]>([]);
  const [disabledBtn, setDisabledBtn] = useState<boolean>(true);

  const { loginState } = useWallet();
  const isBtnDisabled = useMemo(
    () => loginState !== WebLoginState.logined || (disabledBtn && !select),
    [disabledBtn, loginState, select],
  );

  const onSelect = useCallback((value: ITradingParCard) => {
    setDisabledBtn(false);
    setSelect({ ...value });
  }, []);

  const onClick = useCallback(() => {
    setTradingPair(select);
    console.log('click-next', select);
    onNext?.();
  }, [setTradingPair, select, onNext]);

  const getTokenList = useCallback(async () => {
    emitLoading(true);
    try {
      const {
        code,
        data,
        message: msg,
      } = await request.project.getTokenList({
        params: { chainId: DEFAULT_CHAIN_ID },
      });
      if (code === '20000') {
        setTokenList(data);
        return;
      }
      msg && message.error(msg);
    } catch (error: any) {
      console.log('error', error);
      message.error(error?.message || 'get token list failed');
    } finally {
      emitLoading(false);
    }
  }, []);

  useEffect(() => {
    getTokenList();
    const { remove } = myEvents.AuthToken.addListener(getTokenList);
    return () => {
      remove();
    };
  }, [getTokenList]);

  return (
    <div className="trading-page">
      <div className="trading-title">Raise funds for your project in ewell</div>
      <div className="trading-sub-title">
        Select the token you want to sell. Currently only ELF can be used to purchase your token.
      </div>
      <TradingPairList list={tokenList} current={select} onChange={onSelect} />
      <div className="trading-footer">
        <div className="footer-text">
          No token found in your wallet. Note: You can only select tokens for which you are the issuer. You can create a
          token using SEED which is acquirable through{' '}
          <span className="link-text" onClick={() => window.open(NETWORK_CONFIG.symbolMarketUrl)}>
            Symbol Market
          </span>
          .
        </div>
      </div>
      <ButtonGroup onNext={onClick} disabledNext={isBtnDisabled} />
    </div>
  );
};
export default ConfirmTradingPair;

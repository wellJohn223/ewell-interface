import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import TradingPairList, { ITradingParCard } from '../components/TradingPairList';
import './styles.less';
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
import { checkIsAuthorized } from 'api/utils';
import { Select } from 'antd';
import { arrow } from 'assets/images';
import { TokenType } from 'constants/misc';
import { currencyOptions } from '../constants';

const ConfirmTradingPair: React.FC<CreateStepProps> = ({ onNext }) => {
  const [tradingPair, setTradingPair] = useLocalStorage<ITradingParCard>(storages.ConfirmTradingPair);
  const [currency, setCurrency] = useLocalStorage<TokenType>(storages.Currency);
  const [select, setSelect] = useState<ITradingParCard | undefined>(tradingPair);
  const selectRef = useRef<ITradingParCard>();
  selectRef.current = select;

  const [tokenList, setTokenList] = useState<ITradingParCard[]>([]);
  const [disabledBtn, setDisabledBtn] = useState<boolean>(true);

  const { loginState } = useWallet();
  const isBtnDisabled = useMemo(
    () => loginState !== WebLoginState.logined || (disabledBtn && !select) || !tokenList.length,
    [disabledBtn, loginState, select, tokenList.length],
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
        const selectToken = selectRef.current;
        if (selectToken) {
          const selectTokenIndex = data.findIndex(
            (item) => item.symbol === selectToken.symbol && item.chainId === selectToken.chainId,
          );
          selectTokenIndex < 0 ? setSelect(undefined) : setSelect(data[selectTokenIndex]);
        }

        return;
      }
      console.log('getTokenList-error:', msg);
    } catch (error: any) {
      console.log('error', error);
    } finally {
      emitLoading(false);
    }
  }, []);

  useEffect(() => {
    const isAuthorized = checkIsAuthorized();
    isAuthorized && getTokenList();

    const { remove } = myEvents.AuthToken.addListener(getTokenList);
    return () => {
      remove();
    };
  }, [getTokenList]);

  const onSelectCurrency = useCallback((val) => setCurrency(val), [setCurrency]);

  return (
    <div className="trading-page">
      <div className="trading-title">Raise funds for your project in ewell</div>
      <div className="trading-sub-title">
        Select the token you want to sell. Currently only ELF can be used to purchase your token.
      </div>
      <TradingPairList list={tokenList} current={select} onChange={onSelect} />
      <div className="trading-footer">
        <div className="footer-text">
          {tokenList.length <= 0 && <span>No token found in your wallet.</span>}
          Note: You can only select tokens for which you are the issuer. You can create a token using SEED which is
          acquirable through{' '}
          <span className="link-text" onClick={() => window.open(NETWORK_CONFIG.symbolMarketUrl)}>
            Symbol Market
          </span>
          .
        </div>
      </div>
      <div className="trading-footer">
        <div className="trading-sub-title">2. Choose a currency that can be used to purchase your tokens.</div>
        <Select
          suffixIcon={<img src={arrow} />}
          defaultValue={currency || TokenType.ELF}
          options={currencyOptions}
          style={{ width: '100%' }}
          onSelect={onSelectCurrency}
        />
      </div>
      <ButtonGroup onNext={onClick} disabledNext={isBtnDisabled} />
    </div>
  );
};
export default ConfirmTradingPair;

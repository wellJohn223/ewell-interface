import React, { useCallback, useState } from 'react';
import clsx from 'clsx';
import './styles.less';
import { divDecimalsStr } from 'utils/calculate';
import ImgLoading from 'components/ImgLoading';
import { NETWORK_CONFIG } from 'constants/network';

export interface ITradingParCard {
  chainId: string;
  symbol: string;
  tokenName: string;
  imageUrl: string;
  decimals: number;
  balance: string;
}

interface TradingParCardProps {
  list: ITradingParCard[];
  current?: ITradingParCard;
  onChange?: (value: ITradingParCard) => void;
}

const TokenImg = ({ src, symbol }: { src: string; symbol: string }) => {
  const [imgLoadErr, setImgLoadErr] = useState(false);
  return (
    <>
      {imgLoadErr ? (
        <div className="token-icon token-img-bg">{symbol[0]}</div>
      ) : (
        <img className="token-icon" src={src} onError={() => setImgLoadErr(true)} />
      )}
    </>
  );
};

const TradingPairList: React.FC<TradingParCardProps> = ({ list = [], current, onChange }) => {
  const onClick = useCallback(
    (item: ITradingParCard) => {
      onChange?.(item);
    },
    [onChange],
  );

  return (
    <div>
      {list.map((item) => (
        <div
          className={clsx({ 'trading-card': true, active: current?.symbol === item.symbol })}
          key={item.symbol}
          onClick={() => onClick(item)}>
          <div className="card-left">
            <TokenImg src={item.imageUrl} symbol={item.symbol} />
            <div>
              <div className="token-name">{item.symbol}</div>
              <div className="chain-info">
                {item.chainId === NETWORK_CONFIG.mainChainId
                  ? `MainChain ${NETWORK_CONFIG.mainChainId}`
                  : `SideChain ${NETWORK_CONFIG.sideChainId}`}
              </div>
            </div>
          </div>
          <div className="card-right">
            <div className="token-quantity">{divDecimalsStr(item.balance, item.decimals)}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
export default TradingPairList;

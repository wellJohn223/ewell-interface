import React, { useCallback, useState } from 'react';
import clsx from 'clsx';
import './styles.less';
import { divDecimalsStr } from 'utils/calculate';

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
            <img className="token-icon" src={item.imageUrl} />
            <div>
              <div className="token-name">{item.symbol}</div>
              <div className="chain-info">{item.chainId === 'AELF' ? 'MainChain AELF' : 'SideChain tDVV'}</div>
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

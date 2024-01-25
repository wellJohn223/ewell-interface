import React, { useCallback, useState } from 'react';
import clsx from 'clsx';
import './styles.less';
import { divDecimals } from 'utils/calculate';

export interface ITrandingParCard {
  chainId: string;
  symbol: string;
  tokenName: string;
  imageUrl: string;
  decimals: number;
  balance: string;
}

interface TrandingParCardProps {
  list: ITrandingParCard[];
  current?: ITrandingParCard;
  onChange?: (value: ITrandingParCard) => void;
}

const TradingPairList: React.FC<TrandingParCardProps> = ({ list = [], current, onChange }) => {
  const onClick = useCallback(
    (item: ITrandingParCard) => {
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
            <div className="token-quantity">{divDecimals(item.balance, item.decimals).toFixed(0)}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
export default TradingPairList;

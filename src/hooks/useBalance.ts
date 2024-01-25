import { useCallback, useEffect, useMemo, useState } from 'react';
import { useViewContract } from 'contexts/useViewContract/hooks';
import { useWallet } from 'contexts/useWallet/hooks';

export const useBalance = (symbol?: string) => {
  const { getTokenContract } = useViewContract();
  const { wallet } = useWallet();

  const [balance, setBalance] = useState('0');

  const owner = useMemo(() => wallet?.walletInfo.address, [wallet?.walletInfo.address]);

  const updateBalance = useCallback(async () => {
    if (!symbol || !owner) {
      return;
    }
    const tokenContract = await getTokenContract();
    const result = await tokenContract.GetBalance.call({
      symbol,
      owner,
    });
    setBalance(result.balance);
  }, [getTokenContract, owner, symbol]);

  useEffect(() => {
    updateBalance();
  }, [updateBalance]);

  return {
    balance,
    updateBalance,
  };
};

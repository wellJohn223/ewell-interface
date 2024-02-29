import { useCallback, useMemo } from 'react';
import { SET_TOKEN_PRICE, SET_TX_FEE, useAssetsContext } from '.';
import { getTokenPriceApi, getTxFeeApi } from './utils';
import { handleLoopFetch } from 'utils';
import { DEFAULT_TX_FEE } from 'constants/assets';

export function useAssets() {
  const [{ txFee, tokenPrice }, dispatch] = useAssetsContext();

  const getTokenPrice = useCallback(async () => {
    const baseCoin = 'ELF';
    const quoteCoin = 'USD';
    const { price } = await getTokenPriceApi(baseCoin, quoteCoin);
    dispatch({
      type: SET_TOKEN_PRICE,
      payload: {
        tokenPrice: {
          [`${baseCoin}_${quoteCoin}`]: price,
        },
      },
    });
    return price;
  }, [dispatch]);

  const getTxFee = useCallback(async () => {
    const { transactionFee } = await getTxFeeApi();
    dispatch({
      type: SET_TX_FEE,
      payload: {
        txFee: {
          common: transactionFee,
        },
      },
    });
    return transactionFee;
  }, [dispatch]);

  const initTxFee = useCallback(async () => {
    try {
      await handleLoopFetch({
        fetch: () => {
          return getTxFee();
        },
        times: 5,
        interval: 1000,
        checkIsContinue: (result) => {
          return !result;
        },
      });
    } catch (error) {
      console.log('Init txFee', error);
    }
  }, [getTxFee]);

  const initTokenPrice = useCallback(async () => {
    try {
      await handleLoopFetch({
        fetch: () => {
          return getTokenPrice();
        },
        times: 5,
        interval: 1000,
        checkIsContinue: (result) => {
          return !result;
        },
      });
    } catch (error) {
      console.log('Init tokenPrice', error);
    }
  }, [getTokenPrice]);

  const init = useCallback(() => {
    initTxFee();
    initTokenPrice();
  }, [initTokenPrice, initTxFee]);

  return {
    txFee,
    tokenPrice,
    getTokenPrice,
    getTxFee,
    init,
    initTxFee,
    initTokenPrice,
  };
}

export function useTokenPrice() {
  const { tokenPrice, getTokenPrice } = useAssets();

  const _tokenPrice = useMemo(() => tokenPrice?.['ELF_USD'], [tokenPrice]);

  return {
    tokenPrice: _tokenPrice,
    getTokenPrice,
  };
}

export function useTxFee() {
  const { txFee, getTxFee } = useAssets();

  const _txFee = useMemo(() => (txFee || DEFAULT_TX_FEE).common, [txFee]);

  return {
    txFee: _txFee,
    getTxFee,
  };
}

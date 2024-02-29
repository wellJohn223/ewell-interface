import BigNumber from 'bignumber.js';
import { DEFAULT_CHAIN_ID, NETWORK_CONFIG } from './network';

export enum REQ_CODE {
  UserDenied = -1,
  Fail = -2,
  Success = 1,
}

export const LANG_MAX = new BigNumber('9223372036854774784');

export const ZERO = new BigNumber(0);
export const ONE = new BigNumber(1);

export const isEffectiveNumber = (v: any) => {
  const val = new BigNumber(v);
  return !val.isNaN() && !val.lte(0);
};

export const AELF_TOKEN_INFO = {
  symbol: 'ELF',
  decimals: 8,
  chainId: DEFAULT_CHAIN_ID,
  name: 'Native Token',
  address: NETWORK_CONFIG.sideChainInfo.tokenContractAddress,
  id: `${DEFAULT_CHAIN_ID}-ELF`,
};

export const PriceDecimal = 8;
export const InstallmentDecimal = 8;

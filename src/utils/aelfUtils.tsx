import { sleep } from 'utils';
import AElf from 'aelf-sdk';
import { COMMON_PRIVATE } from 'constants/aelf';
import { NETWORK_CONFIG } from 'constants/network';
const Wallet = AElf.wallet;

let wallet: any = null;
const httpProviders: any = {};
export function getAElf(rpc = NETWORK_CONFIG.sideChainInfo.endPoint) {
  if (!httpProviders[rpc]) httpProviders[rpc] = new AElf(new AElf.providers.HttpProvider(rpc));
  return httpProviders[rpc];
}

export function getWallet() {
  if (!wallet) wallet = Wallet.getWalletByPrivateKey(COMMON_PRIVATE);

  return wallet;
}

export async function getTxResult(TransactionId: string, reGetCount = 0, rpc?: string): Promise<any> {
  const txFun = getAElf(rpc).chain.getTxResult;

  let txResult;
  try {
    txResult = await txFun(TransactionId);
  } catch (error) {
    console.log('getTxResult:error', error);
    throw { error: handleContractError(error), transactionId: TransactionId };
  }

  console.log(txResult, TransactionId, 'compBalanceMetadata====txResult');
  const result = txResult?.result || txResult;

  if (!result) {
    throw Error('Can not get transaction result.');
  }

  if (result.Status.toLowerCase() === 'pending' || result.Status.toLowerCase() === 'pending_validation') {
    if (reGetCount > 20) {
      return result;
    }
    await sleep(1000);
    reGetCount++;
    return getTxResult(TransactionId, reGetCount, rpc);
  }

  if (result.Status.toLowerCase() === 'mined') {
    return result;
  }

  throw Error(result.Error || `Transaction: ${result.Status}`);
}

export function handleContractError(error?: any, req?: any) {
  if (typeof error === 'string') return { message: error };
  if (error?.message) return error;
  if (error.Error) {
    return {
      message: error.Error.Details || error.Error.Message || error.Error || error.Status,
      code: error.Error.Code,
    };
  }
  return {
    code: req?.error?.message?.Code || req?.error,
    message: req?.errorMessage?.message || req?.error?.message?.Message,
  };
}

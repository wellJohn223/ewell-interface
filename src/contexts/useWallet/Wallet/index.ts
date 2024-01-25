import { WalletInfo, WalletType, CallContractParams, SignatureData } from 'aelf-web-login';
import { CallContractFunc, GetSignatureFunc, IWallet, IWalletProps, TSignatureParams } from './types';
import { sleep } from 'utils';
import { getTxResult } from 'utils/aelfUtils';
import { NETWORK_CONFIG } from 'constants/network';

class Wallet implements IWallet {
  walletInfo: WalletInfo;
  walletType: WalletType;

  _getSignature: GetSignatureFunc;
  _callContract: CallContractFunc;

  constructor(props: IWalletProps) {
    this.walletInfo = props.walletInfo;
    this.walletType = props.walletType;
    this._callContract = props.callContract;
    this._getSignature = props.getSignature;
  }

  setCallContract(callContract: CallContractFunc) {
    this._callContract = callContract;
  }
  setGetSignature(getSignature: GetSignatureFunc) {
    this._getSignature = getSignature;
  }

  public async callContract<T, R>(params: CallContractParams<T>): Promise<R> {
    let req: any;
    if (this.walletType !== WalletType.portkey) {
      req = await this._callContract(params);
    } else {
      req = await this._callContract({
        contractAddress: NETWORK_CONFIG.sideChainInfo.caContractAddress,
        methodName: 'ManagerForwardCall',
        args: {
          caHash: this.walletInfo.portkeyInfo?.caInfo?.caHash || '',
          contractAddress: params.contractAddress,
          methodName: params.methodName,
          args: params.args,
        },
      });
    }

    console.log('callContract req', req);
    if (req.error) {
      console.log(req.error, '===req.error');
      throw {
        code: req.error.message?.Code || req.error,
        message: req.errorMessage?.message || req.error.message?.Message,
      };
    }

    const { TransactionId } = req.result || req;
    await sleep(1000);
    return getTxResult(TransactionId);
  }

  getSignature(params: TSignatureParams): Promise<SignatureData> {
    return this._getSignature({
      // TODO: add appName
      appName: '',
      address: this.walletInfo.address,
      ...params,
    });
  }
}

export default Wallet;

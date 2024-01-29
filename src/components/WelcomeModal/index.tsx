import './styles.less';
import { useCallback, useEffect, useRef } from 'react';
import myEvents from 'utils/myEvent';
import { useWallet } from 'contexts/useWallet/hooks';
import { IWallet } from 'contexts/useWallet/Wallet/types';
import { WalletType, PortkeyDid } from 'aelf-web-login';
import { GetCAHolderByManagerParams } from '@portkey/services';
import AElf from 'aelf-sdk';
import { recoverPubKey, setLocalJWT } from 'contexts/useWallet/utils';
import { NETWORK_CONFIG } from 'constants/network';
import axios from 'axios';
import { stringify } from 'query-string';
import { service } from 'api/axios';
import { CommonModal, ICommonModalInterface } from 'components/CommonModal';

export const WelcomeModal = () => {
  const commonModalRef = useRef<ICommonModalInterface>();
  const walletRef = useRef<IWallet>();
  const { logout } = useWallet();

  const onCancel = useCallback(() => {
    logout();
    walletRef.current = undefined;
  }, [logout]);

  const onAccept = useCallback(async () => {
    let caHash: string | undefined;
    const wallet = walletRef.current;
    if (!wallet) return;

    const address = wallet.walletInfo.address;
    const key = `ELF_${address}_${NETWORK_CONFIG.sideChainId}`;
    if (wallet.walletType === WalletType.discover) {
      try {
        const res = await PortkeyDid.did.services.getHolderInfoByManager({
          caAddresses: [address],
        } as unknown as GetCAHolderByManagerParams);
        const caInfo = res[0];
        caHash = caInfo?.caHash || '';
        console.log('caHash', caHash);
      } catch (error) {
        return;
      }
    }

    if (wallet.walletType === WalletType.portkey) {
      caHash = wallet.walletInfo.portkeyInfo?.caInfo?.caHash || '';
    }

    try {
      const plainText = `Nonce:${Date.now()}`;
      const plainTextHex = Buffer.from(plainText).toString('hex');
      const result = await wallet?.getSignature({
        signInfo: AElf.utils.sha256(plainTextHex),
      });
      if (result.error) throw result.errorMessage;
      const signature = result?.signature || '';
      const pubKey = recoverPubKey(plainTextHex, signature);

      const apiData = {
        grant_type: 'signature',
        scope: 'EwellServer',
        client_id: 'EwellServer_App',
        pubkey: pubKey,
        signature,
        plain_text: plainTextHex,
        ca_hash: caHash,
        chain_id: NETWORK_CONFIG.sideChainId,
      };

      const res = await axios.post<any>(`/connect/token`, stringify(apiData), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 8000,
      });
      console.log('/connect/token', res);
      setLocalJWT(key, res.data);
      service.defaults.headers.common['Authorization'] = `${res.data.token_type} ${res.data.access_token}`;
      myEvents.AuthToken.emit();
    } catch (error) {
      console.log('authToken error', error);
      logout();
    }
  }, [logout]);

  useEffect(() => {
    const { remove } = myEvents.AuthAsk.addListener((wallet: IWallet) => {
      walletRef.current = wallet;
      if (wallet.walletType === WalletType.portkey) {
        onAccept();
      } else {
        commonModalRef.current?.show();
      }
    });
    return () => {
      remove();
    };
  }, [onAccept]);

  return (
    <CommonModal
      className="welcome-modal-wrap"
      ref={commonModalRef}
      width={438}
      title={'Welcome'}
      confirmText="Continue"
      onConfirmClick={onAccept}
      cancelText="Cancel"
      onCancelClick={onCancel}>
      <div className="terms-info">
        {'Click "Continue" to sign in to ewell.'}
        <br />
        {'This request will not trigger a blockchain transaction or cost any transaction fees.'}
      </div>
    </CommonModal>
  );
};

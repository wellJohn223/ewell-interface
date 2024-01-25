import './styles.less';
import closeSvg from 'assets/images/close.svg';
import { Button, Modal } from 'aelf-design';
import { Checkbox } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import myEvents from 'utils/myEvent';
import { useWallet } from 'contexts/useWallet/hooks';
import { IWallet } from 'contexts/useWallet/Wallet/types';
import { WalletType, did } from 'aelf-web-login';
import { GetCAHolderByManagerParams } from '@portkey/services';
import AElf from 'aelf-sdk';
import { recoverPubKey, setLocalJWT } from 'contexts/useWallet/utils';
import { NETWORK_CONFIG } from 'constants/network';
import axios from 'axios';
import { stringify } from 'query-string';
import { service } from 'api/axios';

export const WelcomeModal = () => {
  const { logout } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const walletRef = useRef<IWallet>();

  const onCancel = useCallback(() => {
    logout();
    setIsOpen(false);
    walletRef.current = undefined;
  }, [logout]);

  const onAccept = useCallback(async () => {
    setIsOpen(false);

    let caHash: string | undefined;
    const wallet = walletRef.current;
    if (!wallet) return;

    const address = wallet.walletInfo.address;
    const key = `ELF_${address}_${NETWORK_CONFIG.sideChainId}`;
    if (wallet.walletType === WalletType.discover) {
      try {
        const res = await did.services.getHolderInfoByManager({
          caAddresses: [address],
        } as unknown as GetCAHolderByManagerParams);
        const caInfo = res[0];
        caHash = caInfo?.caHash || '';
        console.log('caHash', caHash);
      } catch (error) {
        return;
      }
    }

    try {
      const plainText = `Nonce:${Date.now()}`;
      const plainTextHex = Buffer.from(plainText).toString('hex');
      const result = await wallet?.getSignature({
        signInfo: AElf.utils.sha256(plainTextHex),
      });
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

  const onCheck = useCallback((e) => {
    setIsActive(e.target.checked);
  }, []);

  useEffect(() => {
    const { remove } = myEvents.AuthAsk.addListener((wallet: IWallet) => {
      walletRef.current = wallet;
      setIsActive(false);
      setIsOpen(true);
    });
    return () => {
      remove();
    };
  }, []);

  return (
    <Modal width={438} title={null} footer={null} open={isOpen} closeIcon={false}>
      <div className="terms-frame">
        <div className="terms-header">
          Welcome
          <img className="terms-close" src={closeSvg} alt="" onClick={onCancel} />
        </div>
        <div className="terms-content">
          <div className="terms-info">
            By connecting your wallet and using EWELL, you agree to our <span>Terms of Service</span> and{' '}
            <span>Privacy Policy</span>
          </div>
          <div className="terms-check-wrap">
            <Checkbox checked={isActive} onChange={onCheck}></Checkbox>
            <div className="terms-check-info">I have read and accept the Terms of Service and Privacy Policy</div>
          </div>
        </div>
        <div className="terms-footer">
          <div className="terms-btn">
            <Button onClick={onCancel} block>
              Cancel
            </Button>
          </div>
          <div className="terms-btn">
            <Button type="primary" disabled={!isActive} onClick={onAccept} block>
              Accept
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

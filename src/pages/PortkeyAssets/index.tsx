import './styles.less';
import assetsBackImg from './images/assetsBack.svg';
import { useNavigate } from 'react-router-dom';
import { useCallback, useEffect } from 'react';
import { PortkeyDid, WalletType, WebLoginState } from 'aelf-web-login';
import { useWallet } from 'contexts/useWallet/hooks';
import { NETWORK_CONFIG } from 'constants/network';
import { useEffectOnce } from 'react-use';
import myEvents from 'utils/myEvent';

export default function PortkeyAssets() {
  const navigate = useNavigate();
  const { wallet, loginState } = useWallet();

  useEffectOnce(() => {
    console.log('useEffectOnce: loginState', loginState, wallet);
    if (loginState === WebLoginState.logined && wallet?.walletType !== WalletType.portkey) {
      navigate('/', { replace: true });
    }
  });

  useEffect(() => {
    const { remove } = myEvents.AuthToken.addListener((wallet) => {
      if (wallet?.walletType === WalletType.portkey) return;
      navigate('/', { replace: true });
    });
    return () => {
      remove();
    };
  }, [navigate]);

  const onOverviewBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  return (
    <PortkeyDid.PortkeyAssetProvider
      pin={wallet?.walletInfo.portkeyInfo?.pin || ''}
      caHash={wallet?.walletInfo.portkeyInfo?.caInfo.caHash}
      originChainId={wallet?.walletInfo.portkeyInfo?.chainId || NETWORK_CONFIG.sideChainId}>
      <PortkeyDid.Asset
        className="portkey-assets"
        backIcon={<img className="assets-back-wrap" src={assetsBackImg} alt="" />}
        onLifeCycleChange={(lifeCycle) => {
          console.log(lifeCycle, 'onLifeCycleChange');
        }}
        onOverviewBack={onOverviewBack}
      />
    </PortkeyDid.PortkeyAssetProvider>
  );
}

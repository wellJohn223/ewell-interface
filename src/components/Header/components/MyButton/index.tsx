import './styles.less';
import { useWallet } from 'contexts/useWallet/hooks';
import userSvg from '../../images/user.svg';
import { useMobile } from 'contexts/useStore/hooks';
import walletSvg from '../../images/wallet.svg';
import { Button, HashAddress } from 'aelf-design';
import { NETWORK_CONFIG } from 'constants/network';
import { useNavigate } from 'react-router-dom';
import projectsSvg from '../../images/projects.svg';
import logoutSvg from '../../images/logout.svg';
import { WebLoginState } from 'aelf-web-login';
import { useCallback, useRef } from 'react';
import { MyDrawer } from '../MyDrawer';
import { ICommonDrawerInterface } from 'components/CommonDrawer';
import { WalletInfo } from '../WalletInfo';

export const MyButton = () => {
  const isMobile = useMobile();
  const { login, loginState, logout, wallet } = useWallet();
  const navigate = useNavigate();

  const onWalletClick = useCallback(() => {
    console.log('WebLoginState', loginState);
    if (loginState === WebLoginState.initial) return login();
  }, [login, loginState]);

  const menuDrawerRef = useRef<ICommonDrawerInterface>();
  const onMyClick = useCallback(() => {
    if (isMobile) {
      menuDrawerRef.current?.show();
    }
  }, [isMobile]);

  return (
    <div className="my-wrap">
      {loginState === WebLoginState.logined ? (
        <>
          <div className="my-btn cursor-pointer" onClick={onMyClick}>
            <img className="my-icon" src={userSvg} alt="" />
            {!isMobile && <span className="my-label">My</span>}
          </div>

          {!isMobile && (
            <div className="wallet-drawer">
              <div className="wallet-drawer-box">
                <WalletInfo />
              </div>
            </div>
          )}
        </>
      ) : (
        <Button type="primary" size={isMobile ? 'small' : 'medium'} className="login-btn" onClick={onWalletClick}>
          Log In
        </Button>
      )}

      {isMobile && <MyDrawer drawerRef={menuDrawerRef} />}
    </div>
  );
};

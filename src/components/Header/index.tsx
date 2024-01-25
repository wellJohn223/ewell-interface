import clsx from 'clsx';
import { useMobile } from 'contexts/useStore/hooks';
import { useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-use';
import userSvg from './images/user.svg';
import walletSvg from './images/wallet.svg';
import projectsSvg from './images/projects.svg';
import logoutSvg from './images/logout.svg';
import arrowSvg from 'assets/images/arrow.svg';
import './styles.less';
import { useWallet } from 'contexts/useWallet/hooks';
import { WebLoginState } from 'aelf-web-login';
import { NETWORK_CONFIG } from 'constants/network';
import { Button, HashAddress } from 'aelf-design';
import { useCheckRoute } from 'hooks';
import menuSvg from './images/menu.svg';
import { COMMUNITY_LIST } from 'constants/community';
import { WelcomeModal } from 'components/WelcomeModal';
import { ICommonDrawerInterface } from 'components/CommonDrawer';
import { CommunityItem } from './components/CommunityItem';
import { MenuDrawer } from './components/MenuDrawer';
import { logo } from 'assets/images';

export type TMenuItem = {
  name: string;
  icon?: string;
  content?: string;
  onClick?: () => void;
  children?: TMenuItem[];
  isActive?: boolean;
};

export default function Header() {
  const isMobile = useMobile();
  const { pathname } = useLocation();

  const navigate = useNavigate();
  const isHome = useMemo(() => {
    return pathname === '/';
  }, [pathname]);

  const { login, loginState, logout, wallet } = useWallet();
  const isProjectPage = useCheckRoute('projects');

  const menuList: TMenuItem[] = useMemo(
    () => [
      {
        name: 'Projects',
        onClick: () => {
          console.log('project');
          navigate('/projects/all', { replace: true });
        },
        isActive: isProjectPage,
      },
      {
        name: 'Community',
        children: COMMUNITY_LIST.map((item) => ({
          ...item,
          onClick: () => {
            //
          },
        })),
        onClick: () => {
          //
        },
      },
      {
        name: 'Launch with EWELL',
        onClick: () => {
          if (loginState === WebLoginState.logining) return;
          if (loginState === WebLoginState.logined) {
            navigate('/create-project', { replace: true });
          }
          if (loginState === WebLoginState.initial) return login();
        },
      },
    ],
    [isProjectPage, login, loginState, navigate],
  );

  const onWalletClick = useCallback(() => {
    console.log('WebLoginState', loginState);
    if (loginState === WebLoginState.initial) return login();
  }, [login, loginState]);

  const menuDrawerRef = useRef<ICommonDrawerInterface>();
  const switchMenuOpen = useCallback(() => {
    menuDrawerRef.current?.show();
  }, []);

  return (
    <>
      <header className="header common-page">
        <div className="header-body flex-row-center">
          <img
            className="header-logo cursor-pointer"
            src={logo}
            alt="logo"
            onClick={() => navigate('/', { replace: true })}
          />
          <div className="btn-row">
            {!isMobile &&
              menuList.map((menu, menuIdx) => (
                <div className="btn-item-wrap" key={menuIdx}>
                  <Button
                    className={clsx('btn-item-box', menu.isActive && 'btn-item-box-active')}
                    type="link"
                    onClick={menu.onClick}>
                    {menu.name}
                    {menu.children && <img className="arrow-wrap " src={arrowSvg} alt="" />}
                  </Button>
                  {menu.children && (
                    <div className="drawer-wrap">
                      <div className="drawer-wrap-box">
                        {menu.children.map((childMenu, childMenuIdx) => (
                          <CommunityItem key={childMenuIdx} data={childMenu} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

            {!isMobile &&
              !isHome &&
              (loginState === WebLoginState.logined ? (
                <div className="my-wrap">
                  <div className="my-btn cursor-pointer">
                    <img className="my-icon" src={userSvg} alt="" />
                    <span className="my-label">My</span>
                  </div>

                  <div className="wallet-drawer">
                    <div className="wallet-drawer-box">
                      <div className="wallet-item-wrap">
                        <img src={walletSvg} alt="" />
                        <div className="wallet-item-body">
                          <span className="wallet-item-title">My Address</span>
                          <div className="wallet-item-content">
                            <HashAddress
                              address={wallet?.walletInfo.address || ''}
                              preLen={8}
                              endLen={9}
                              hasCopy
                              chain={NETWORK_CONFIG.sideChainId as any}
                              size="small"
                            />
                          </div>
                        </div>
                      </div>

                      <div
                        className="wallet-item-wrap"
                        onClick={() => {
                          navigate('/projects/my', { replace: true });
                        }}>
                        <img src={projectsSvg} alt="" />
                        <div className="wallet-item-body">
                          <span className="wallet-item-title">My Projects</span>
                        </div>
                      </div>

                      <div
                        className="wallet-item-wrap"
                        onClick={() => {
                          logout();
                        }}>
                        <img src={logoutSvg} alt="" />
                        <div className="wallet-item-body">
                          <span className="wallet-item-title">Log Out</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Button type="primary" size="medium" className="login-btn" onClick={onWalletClick}>
                  Log In
                </Button>
              ))}

            {isMobile && <img className="menu-btn" src={menuSvg} onClick={switchMenuOpen} />}
          </div>
        </div>
      </header>
      <WelcomeModal />
      {isMobile && <MenuDrawer drawerRef={menuDrawerRef} list={menuList} />}
    </>
  );
}

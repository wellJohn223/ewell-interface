import clsx from 'clsx';
import { useMobile } from 'contexts/useStore/hooks';
import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-use';
import logoSvg from './images/logo.svg';
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
import { Drawer } from 'antd';
import { createStyles } from 'antd-style';
import type { DrawerClassNames } from 'antd/es/drawer/DrawerPanel';
import { COMMUNITY_LIST } from 'constants/community';
import { WelcomeModal } from 'components/WelcomeModal';

const useStyle = createStyles(() => ({
  'menu-drawer-header': {
    visibility: 'hidden',
    height: '64px',
    flex: 'unset !important',
  },
  'menu-drawer-body': {
    padding: '0 !important',
  },
  // 'menu-drawer-content': {
  //   boxShadow: 'none !important',
  // },
}));

type TMenuItem = {
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
  const { styles } = useStyle();

  const drawerClassNames: DrawerClassNames = useMemo(
    () => ({
      header: styles['menu-drawer-header'],
      body: styles['menu-drawer-body'],
      // contentWrapper: styles['menu-drawer-content'],
    }),
    [styles],
  );

  const navigate = useNavigate();
  const isHome = useMemo(() => {
    return pathname === '/';
  }, [pathname]);

  const { login, loginState, logout, wallet } = useWallet();
  const isProjectPage = useCheckRoute('projects');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const switchMenuOpen = useCallback(() => {
    setIsMenuOpen((v) => !v);
  }, []);

  return (
    <>
      <header className="header common-page">
        <div className="header-body flex-row-center">
          <img
            className="header-logo cursor-pointer"
            src={logoSvg}
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
                          <div className="child-wrap" onClick={childMenu.onClick} key={childMenuIdx}>
                            <div className="icon-wrap">
                              <img className="icon-box" src={childMenu.icon} alt="" />
                            </div>
                            <div className="child-body-wrap">
                              <span className="child-title">{childMenu.name}</span>
                              <span className="child-content">{childMenu.content}</span>
                            </div>
                          </div>
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
      {isMobile && (
        <div className="menu-drawer"></div>
        // <Drawer
        //   rootClassName="menu-drawer"
        //   classNames={drawerClassNames}
        //   title="Basic Drawer"
        //   onClose={() => {}}
        //   open={isMenuOpen}
        //   width={'100%'}
        //   placement="left"
        //   mask={false}>
        //   <div className="mobile-menu-item">
        //     <span className="mobile-menu-item-title">1</span>
        //     <img src={arrowSvg} className="mobile-menu-item-arrow" />
        //   </div>
        // </Drawer>
      )}
    </>
  );
}

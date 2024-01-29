import { HashAddress } from 'aelf-design';
import walletSvg from '../../images/wallet.svg';
import { useWallet } from 'contexts/useWallet/hooks';
import { NETWORK_CONFIG } from 'constants/network';
import { useNavigate } from 'react-router-dom';
import projectsSvg from '../../images/projects.svg';
import logoutSvg from '../../images/logout.svg';
import './styles.less';
import { useMobile } from 'contexts/useStore/hooks';
import { useCallback } from 'react';
import myEvents from 'utils/myEvent';
import { getExploreLink } from 'utils';

export interface IWalletInfoProps {
  onMyProjectClick?: () => void;
}

export const WalletInfo = ({ onMyProjectClick }: IWalletInfoProps) => {
  const { wallet, logout } = useWallet();
  const navigate = useNavigate();
  const isMobile = useMobile();
  const onLogout = useCallback(() => {
    myEvents.LogoutAsk.emit();
  }, []);

  return (
    <>
      <div className="wallet-info-item-wrap">
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
              addressClickCallback={(_, address) => {
                const exploreLink = address ? getExploreLink(address) : '';
                if (exploreLink) {
                  window.open(exploreLink, '_blank');
                }
              }}
            />
          </div>
        </div>
      </div>

      <div
        className="wallet-info-item-wrap"
        onClick={() => {
          navigate('/projects/my', { replace: true });
          onMyProjectClick?.();
        }}>
        <img src={projectsSvg} alt="" />
        <div className="wallet-item-body">
          <span className="wallet-item-title">My Projects</span>
        </div>
      </div>

      {!isMobile && (
        <div className="wallet-info-item-wrap" onClick={onLogout}>
          <img src={logoutSvg} alt="" />
          <div className="wallet-item-body">
            <span className="wallet-item-title">Log out</span>
          </div>
        </div>
      )}
    </>
  );
};

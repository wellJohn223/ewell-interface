import { HashAddress } from 'aelf-design';
import walletSvg from '../../images/wallet.svg';
import { useWallet } from 'contexts/useWallet/hooks';
import { NETWORK_CONFIG } from 'constants/network';
import { useNavigate } from 'react-router-dom';
import projectsSvg from '../../images/projects.svg';
import logoutSvg from '../../images/logout.svg';
import './styles.less';
import { useMobile } from 'contexts/useStore/hooks';

export interface IWalletInfoProps {
  onMyProjectClick?: () => void;
}

export const WalletInfo = ({ onMyProjectClick }: IWalletInfoProps) => {
  const { wallet, logout } = useWallet();
  const navigate = useNavigate();
  const isMobile = useMobile();

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
        <div
          className="wallet-info-item-wrap"
          onClick={() => {
            logout();
          }}>
          <img src={logoutSvg} alt="" />
          <div className="wallet-item-body">
            <span className="wallet-item-title">Log Out</span>
          </div>
        </div>
      )}
    </>
  );
};

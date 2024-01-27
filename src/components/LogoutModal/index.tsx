import './styles.less';
import { useCallback, useEffect, useRef } from 'react';
import { useWallet } from 'contexts/useWallet/hooks';
import { CommonModal, ICommonModalInterface } from 'components/CommonModal';
import myEvents from 'utils/myEvent';

export const LogoutModal = () => {
  const commonModalRef = useRef<ICommonModalInterface>();
  const { logout } = useWallet();

  const onAccept = useCallback(() => {
    logout();
  }, [logout]);

  useEffect(() => {
    const { remove } = myEvents.LogoutAsk.addListener(() => {
      commonModalRef.current?.show();
    });
    return () => {
      remove();
    };
  }, []);

  return (
    <CommonModal
      className="logout-modal-wrap"
      ref={commonModalRef}
      width={438}
      title={'Confirmed to Log Out?'}
      onConfirmClick={onAccept}
      confirmText="Log Out">
      <div className="logout-info">
        {'We will save you current progress and inputs so that you can continue with your project at any time.'}
        <br />
        {''}
      </div>
    </CommonModal>
  );
};

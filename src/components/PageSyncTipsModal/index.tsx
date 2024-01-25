import { useState, useCallback, useEffect } from 'react';
import { eventBus } from 'aelf-web-login';
import { Flex } from 'antd';
import { Modal, Typography, Button } from 'aelf-design';
import { SET_GLOBAL_SYNC_TIPS_MODAL } from 'constants/events';

const { Text } = Typography;

export interface ILoadingInfo {
  isLoading: boolean;
  text: string;
}

export default function PageSyncTipsModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const setModalHandler = useCallback((isOpen) => {
    setIsModalOpen(isOpen);
  }, []);

  useEffect(() => {
    eventBus.addListener(SET_GLOBAL_SYNC_TIPS_MODAL, setModalHandler);
    return () => {
      eventBus.removeListener(SET_GLOBAL_SYNC_TIPS_MODAL, setModalHandler);
    };
  }, [setModalHandler]);

  return (
    <Modal title="Tips" footer={null} centered open={isModalOpen} onCancel={() => setIsModalOpen(false)}>
      <Flex vertical gap={24} align="center">
        <Text className="text-center">Synchronizing on-chain account information...</Text>
        <Button className="modal-single-button" type="primary" onClick={() => setIsModalOpen(false)}>
          OK
        </Button>
      </Flex>
    </Modal>
  );
}

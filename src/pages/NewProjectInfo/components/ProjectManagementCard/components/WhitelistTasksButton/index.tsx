import { useState, useEffect, useMemo } from 'react';
import { Flex, message } from 'antd';
import { Button, Modal, Typography, Input } from 'aelf-design';
import { success } from 'assets/images';
import { useWallet } from 'contexts/useWallet/hooks';
import { emitLoading, emitSyncTipsModal } from 'utils/events';
import { NETWORK_CONFIG } from 'constants/network';
import './styles.less';

interface IWhitelistTasksButtonProps {
  whitelistId?: string;
  whitelistTasksUrl?: string;
  disabled?: boolean;
}

const { Text } = Typography;

export default function WhitelistTasksButton({ whitelistId, whitelistTasksUrl, disabled }: IWhitelistTasksButtonProps) {
  const { wallet, checkManagerSyncState } = useWallet();
  const [messageApi, contextHolder] = message.useMessage();

  const [isWhitelistTasksModalOpen, setIsWhitelistTasksModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState('');

  const isEdit = useMemo(() => !!whitelistTasksUrl, [whitelistTasksUrl]);

  useEffect(() => {
    if (isWhitelistTasksModalOpen) {
      setUrlInputValue(whitelistTasksUrl || '');
    }
  }, [isWhitelistTasksModalOpen, whitelistTasksUrl]);

  const handleSubmit = async () => {
    setIsWhitelistTasksModalOpen(false);
    emitLoading(true);
    const isManagerSynced = await checkManagerSyncState();
    if (!isManagerSynced) {
      emitLoading(false);
      emitSyncTipsModal(true);
      return;
    }
    try {
      const result = await wallet?.callContract({
        contractAddress: NETWORK_CONFIG.whitelistContractAddress,
        methodName: 'ChangeWhitelistUrl',
        args: {
          whitelistId,
          url: urlInputValue,
        },
      });
      console.log('ChangeWhitelistUrl result', result);
      setIsSuccessModalOpen(true);
    } catch (error: any) {
      console.log('ChangeWhitelistUrl error', error);
      messageApi.open({
        type: 'error',
        content: error?.message || 'ChangeWhitelistUrl failed',
      });
    } finally {
      emitLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Button onClick={() => setIsWhitelistTasksModalOpen(true)}>Whitelist Tasks</Button>
      <Modal
        title={`${isEdit ? 'Edit' : 'Open'} Whitelist Tasks`}
        footer={null}
        centered
        open={isWhitelistTasksModalOpen}
        onCancel={() => setIsWhitelistTasksModalOpen(false)}>
        <Flex vertical gap={24}>
          <Flex vertical gap={12}>
            <Text className="text-center">
              Please enter an accessible link that users can click on to view project whitelisting tasks.
            </Text>
            <Input placeholder="placeholder" value={urlInputValue} onChange={(e) => setUrlInputValue(e.target.value)} />
          </Flex>
          <Flex gap={16}>
            <Button className="flex-1" onClick={() => setIsWhitelistTasksModalOpen(false)}>
              Cancel
            </Button>
            <Button className="flex-1" type="primary" disabled={disabled || !urlInputValue} onClick={handleSubmit}>
              Submit
            </Button>
          </Flex>
        </Flex>
      </Modal>
      <Modal
        title={`${isEdit ? 'Edited' : 'Opened'} Successfully`}
        footer={null}
        centered
        open={isSuccessModalOpen}
        onCancel={() => setIsSuccessModalOpen(false)}>
        <Flex vertical gap={24} align="center">
          <Flex vertical gap={8} align="center">
            <img className="success-icon" src={success} alt="success" />
            <Text>Whitelist tasks {isEdit ? 'has edited' : 'opened'} successfully</Text>
          </Flex>
          <Button
            className="whitelist-tasks-update-success-button"
            type="primary"
            onClick={() => setIsSuccessModalOpen(false)}>
            OK
          </Button>
        </Flex>
      </Modal>
    </>
  );
}

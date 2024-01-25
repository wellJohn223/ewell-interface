import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Flex, message } from 'antd';
import { Button, Modal, Typography, FontWeightEnum, HashAddress } from 'aelf-design';
import SuccessModal from '../../../OperationComponents/SuccessModal';
import { emitLoading, emitSyncTipsModal } from 'utils/events';
import { useWallet } from 'contexts/useWallet/hooks';
import { IProjectInfo } from 'types/project';
import { divDecimalsStr } from 'utils/calculate';
import { DEFAULT_CHAIN_ID, NETWORK_CONFIG } from 'constants/network';
import { useTokenPrice, useTxFee } from 'contexts/useAssets/hooks';
import { renderTokenPrice } from 'utils/project';

const { Text, Title } = Typography;

interface ICancelProjectButtonProps {
  projectInfo?: IProjectInfo;
}

export default function CancelProjectButton({ projectInfo }: ICancelProjectButtonProps) {
  const { wallet, checkManagerSyncState } = useWallet();
  const { tokenPrice } = useTokenPrice();
  const { txFee } = useTxFee();
  const [messageApi, contextHolder] = message.useMessage();
  const { projectId } = useParams();

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  const handleSubmit = async () => {
    setIsSubmitModalOpen(false);
    emitLoading(true, { text: 'Processing on the blockchain...' });
    const isManagerSynced = await checkManagerSyncState();
    if (!isManagerSynced) {
      emitLoading(false);
      emitSyncTipsModal(true);
      return;
    }
    try {
      const result = await wallet?.callContract<any, any>({
        contractAddress: NETWORK_CONFIG.ewellContractAddress,
        methodName: 'Cancel',
        args: projectId,
      });
      console.log('result', result);
      const { TransactionId } = result;
      setTransactionId(TransactionId);
      setIsSuccessModalOpen(true);
    } catch (error: any) {
      console.log('Cancel error', error);
      messageApi.open({
        type: 'error',
        content: error?.message || 'Cancel failed',
      });
    } finally {
      emitLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Button danger onClick={() => setIsConfirmModalOpen(true)}>
        Closure Of Project
      </Button>
      <Modal
        title="Closure of Project"
        footer={null}
        centered
        open={isConfirmModalOpen}
        onCancel={() => setIsConfirmModalOpen(false)}>
        <Flex vertical gap={24}>
          <Text className="text-center">
            You are closing project{' '}
            <Text fontWeight={FontWeightEnum.Medium}>“{projectInfo?.additionalInfo?.projectName}”</Text>. After the
            project is closed, you will not receive the funds raised, but only the full amount of Token.
          </Text>
          <Flex gap={16}>
            <Button className="flex-1" onClick={() => setIsConfirmModalOpen(false)}>
              Back
            </Button>
            <Button
              className="flex-1"
              type="primary"
              danger
              onClick={() => {
                setIsConfirmModalOpen(false);
                setIsSubmitModalOpen(true);
              }}>
              Closure and Claim
            </Button>
          </Flex>
        </Flex>
      </Modal>
      <Modal
        title="Claim Token"
        footer={null}
        centered
        open={isSubmitModalOpen}
        onCancel={() => setIsSubmitModalOpen(false)}>
        <Flex vertical gap={24}>
          <Text>
            Click to extract ELF from EWELL contract. If you have any token left, it will be withdrawn as well.
          </Text>
          <Flex gap={8} justify="center" align="baseline">
            <Title level={4} fontWeight={FontWeightEnum.Medium}>
              {divDecimalsStr(projectInfo?.crowdFundingIssueAmount, projectInfo?.crowdFundingIssueToken?.decimals)}
            </Title>
            <Title fontWeight={FontWeightEnum.Medium}>{projectInfo?.crowdFundingIssueToken?.symbol || '--'}</Title>
          </Flex>
          <Flex className="modal-box-data-wrapper" justify="space-between" align="center">
            <Text className="half-width">Address</Text>
            <HashAddress
              className="half-width hash-address-small"
              preLen={8}
              endLen={9}
              chain={DEFAULT_CHAIN_ID}
              address={wallet?.walletInfo.address || ''}
            />
          </Flex>
          <Flex justify="space-between" align="center">
            <Text>Estimated Transaction Fee</Text>
            <Flex gap={8} justify="flex-end" align="baseline">
              <Text>
                {txFee} {projectInfo?.toRaiseToken?.symbol ?? '--'}
              </Text>
              {renderTokenPrice({
                textProps: {
                  size: 'small',
                },
                amount: txFee,
                decimals: 0,
                tokenPrice,
              })}
            </Flex>
          </Flex>
          <Flex justify="center">
            <Button className="modal-single-button" type="primary" onClick={handleSubmit}>
              Submit
            </Button>
          </Flex>
        </Flex>
      </Modal>
      <SuccessModal
        modalProps={{
          title: 'Closure and Claim Success',
          open: isSuccessModalOpen,
          onCancel: () => {
            setIsSuccessModalOpen(false);
          },
          onOk: () => {
            setIsSuccessModalOpen(false);
          },
        }}
        data={{
          amountList: [
            {
              amount: divDecimalsStr(
                projectInfo?.crowdFundingIssueAmount,
                projectInfo?.crowdFundingIssueToken?.decimals,
              ),
              symbol: projectInfo?.crowdFundingIssueToken?.symbol || '--',
            },
          ],
          description: 'Congratulations, transfer success!',
          boxData: {
            label: 'Transaction ID',
            value: transactionId,
          },
        }}
      />
    </>
  );
}

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
import { getExploreLink } from 'utils';

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
    emitLoading(true, { text: 'Synchronising data on the blockchain...' });
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
        Cancel Sale
      </Button>
      <Modal
        className="common-modal"
        title="Cancel Sale"
        footer={null}
        centered
        open={isConfirmModalOpen}
        onCancel={() => setIsConfirmModalOpen(false)}>
        <Flex vertical gap={24}>
          <Text className="text-center">
            Are you sure you want to cancel the sale? Once cancelled, you can claim all the tokens you provided, yet you
            won't receive any ELF raised.
          </Text>
          <Flex className="mobile-flex-vertical-reverse" gap={16}>
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
              Cancel and Claim
            </Button>
          </Flex>
        </Flex>
      </Modal>
      <Modal
        className="common-modal"
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
            <Text>My address</Text>
            <HashAddress
              className="hash-address-small"
              preLen={8}
              endLen={9}
              chain={DEFAULT_CHAIN_ID}
              address={wallet?.walletInfo.address || ''}
              addressClickCallback={(_, address) => {
                const exploreLink = address ? getExploreLink(address) : '';
                if (exploreLink) {
                  window.open(exploreLink, '_blank');
                }
              }}
            />
          </Flex>
          <Flex justify="space-between" align="center">
            <Flex className="mobile-flex-vertical-gap-0" gap={3}>
              <Text>Estimated</Text>
              <Text>Transaction Fee</Text>
            </Flex>
            <Flex className="mobile-flex-vertical-end-gap-2" gap={8} justify="flex-end" align="baseline">
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
          title: 'Sale Cancelled and Tokens Claimed',
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
          description: 'Congratulations! Your tokens have been successfully claimed and the sale is now cancelled.',
          boxData: {
            label: 'Transaction ID',
            value: transactionId,
          },
        }}
      />
    </>
  );
}

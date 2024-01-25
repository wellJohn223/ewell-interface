// TODO: check whether the operation is automatic
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Flex, message } from 'antd';
import { Button, Typography, FontWeightEnum, Modal, HashAddress } from 'aelf-design';
import SuccessModal from '../SuccessModal';
import { IProjectInfo } from 'types/project';
import { divDecimalsStr } from 'utils/calculate';
import { useWallet } from 'contexts/useWallet/hooks';
import { emitLoading, emitSyncTipsModal } from 'utils/events';
import { DEFAULT_CHAIN_ID, NETWORK_CONFIG } from 'constants/network';
import { useTokenPrice, useTxFee } from 'contexts/useAssets/hooks';
import { renderTokenPrice } from 'utils/project';

const { Text, Title } = Typography;

interface IClaimTokenButtonProps {
  projectInfo?: IProjectInfo;
}

export default function RevokeFineButton({ projectInfo }: IClaimTokenButtonProps) {
  const { projectId } = useParams();
  const { wallet, checkManagerSyncState } = useWallet();
  const { tokenPrice } = useTokenPrice();
  const { txFee } = useTxFee();
  const [messageApi, contextHolder] = message.useMessage();

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
        methodName: 'ClaimLiquidatedDamage',
        args: projectId,
      });
      console.log('ClaimLiquidatedDamage result', result);
      const { TransactionId } = result;
      setTransactionId(TransactionId);
      setIsSuccessModalOpen(true);
    } catch (error: any) {
      console.log('ClaimLiquidatedDamage error', error);
      messageApi.open({
        type: 'error',
        content: error?.message || 'ClaimLiquidatedDamage failed',
      });
    } finally {
      emitLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Button type="primary" onClick={() => setIsConfirmModalOpen(true)}>
        Revoke Token
      </Button>
      <Modal
        title="Revoke Token"
        footer={null}
        centered
        open={isConfirmModalOpen}
        onCancel={() => {
          setIsConfirmModalOpen(false);
        }}>
        <Flex vertical gap={24}>
          <Text>
            Are you sure you want to cancel your investment? Withdrawal of investment will be charged 10% of your ELF as
            liquidated damages and the remaining ELF will be refunded after deduction of Gas.
          </Text>
          <Flex gap={16}>
            <Button className="flex-1" onClick={() => setIsConfirmModalOpen(false)}>
              Back
            </Button>
            <Button
              className="flex-1"
              type="primary"
              onClick={() => {
                setIsConfirmModalOpen(false);
                setIsSubmitModalOpen(true);
              }}>
              Revoke Token
            </Button>
          </Flex>
        </Flex>
      </Modal>
      <Modal
        title="Revoke Token"
        footer={null}
        centered
        open={isSubmitModalOpen}
        onCancel={() => {
          setIsSubmitModalOpen(false);
        }}>
        <Flex vertical gap={24}>
          <Text>After clicking “Submit”, EWELL transfer ELF to the designated account.</Text>
          <Flex gap={8} justify="center" align="baseline">
            <Title fontWeight={FontWeightEnum.Medium} level={4}>
              {divDecimalsStr(projectInfo?.liquidatedDamageAmount, projectInfo?.toRaiseToken?.decimals)}
            </Title>
            <Title fontWeight={FontWeightEnum.Medium}>{projectInfo?.toRaiseToken?.symbol || '--'}</Title>
          </Flex>
          <Flex className="modal-box-data-wrapper" justify="space-between">
            <Text fontWeight={FontWeightEnum.Medium}>Address</Text>
            <HashAddress
              className="hash-address-small"
              preLen={8}
              endLen={9}
              chain={DEFAULT_CHAIN_ID}
              address={wallet?.walletInfo.address || ''}
            />
          </Flex>
          <Flex vertical gap={8}>
            <Flex justify="space-between">
              <Text>Estimated Transaction Fee</Text>
              <Flex gap={8} align="baseline">
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
          title: 'Revoke Successfully',
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
              amount: divDecimalsStr(projectInfo?.liquidatedDamageAmount, projectInfo?.toRaiseToken?.decimals),
              symbol: projectInfo?.toRaiseToken?.symbol || '--',
            },
          ],
          description: 'Congratulations, your token has been revoked successfully!',
          boxData: {
            label: 'Transaction ID',
            value: transactionId,
          },
        }}
      />
    </>
  );
}

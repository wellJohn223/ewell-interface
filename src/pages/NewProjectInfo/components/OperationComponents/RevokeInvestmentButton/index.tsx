import { useEffect, useMemo, useState } from 'react';
import BigNumber from 'bignumber.js';
import clsx from 'clsx';
import { useParams } from 'react-router-dom';
import { Flex, message } from 'antd';
import { Button, Typography, FontWeightEnum, Modal, HashAddress } from 'aelf-design';
import SuccessModal from '../SuccessModal';
import { useWallet } from 'contexts/useWallet/hooks';
import { IProjectInfo } from 'types/project';
import { divDecimalsStr, timesDecimals } from 'utils/calculate';
import { ZERO } from 'constants/misc';
import { emitLoading, emitSyncTipsModal } from 'utils/events';
import { DEFAULT_CHAIN_ID, NETWORK_CONFIG } from 'constants/network';
import { useTokenPrice, useTxFee } from 'contexts/useAssets/hooks';
import { renderTokenPrice } from 'utils/project';
import { useBalance } from 'hooks/useBalance';
import './styles.less';

const { Text } = Typography;

interface IRevokeInvestmentButtonProps {
  projectInfo?: IProjectInfo;
}

export default function RevokeInvestmentButton({ projectInfo }: IRevokeInvestmentButtonProps) {
  const { wallet, checkManagerSyncState } = useWallet();
  const { tokenPrice } = useTokenPrice();
  const { txFee } = useTxFee();
  const [messageApi, contextHolder] = message.useMessage();
  const { projectId } = useParams();
  const { balance, updateBalance } = useBalance(projectInfo?.toRaiseToken?.symbol);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    if (isSubmitModalOpen) {
      updateBalance();
    }
  }, [updateBalance, isSubmitModalOpen]);

  const txFeeAmount = useMemo(() => {
    return timesDecimals(txFee, projectInfo?.toRaiseToken?.decimals);
  }, [txFee, projectInfo?.toRaiseToken?.decimals]);

  const revokeAmount = useMemo(() => {
    return new BigNumber(projectInfo?.investAmount ?? 0).times(0.9);
  }, [projectInfo?.investAmount]);

  const finalAmount = useMemo(() => {
    const amount = revokeAmount.minus(txFeeAmount);
    if (amount.lt(0)) {
      return ZERO;
    } else {
      return amount;
    }
  }, [revokeAmount, txFeeAmount]);

  const notEnoughTokens = useMemo(() => {
    return new BigNumber(balance).lt(txFeeAmount);
  }, [balance, txFeeAmount]);

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
        methodName: 'UnInvest',
        args: projectId,
      });
      console.log('UnInvest result', result);
      const { TransactionId } = result;
      setTransactionId(TransactionId);
      setIsSuccessModalOpen(true);
    } catch (error: any) {
      console.log('error', error);
      messageApi.open({
        type: 'error',
        content: error?.message || 'UnInvest failed',
      });
    } finally {
      emitLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Text
        className="revoke-investment-button cursor-pointer"
        fontWeight={FontWeightEnum.Medium}
        onClick={() => setIsConfirmModalOpen(true)}>
        Cancel Investment
      </Text>
      <Modal
        className="common-modal"
        title="Cancel Investment"
        footer={null}
        centered
        open={isConfirmModalOpen}
        onCancel={() => {
          setIsConfirmModalOpen(false);
        }}>
        <Flex vertical gap={24}>
          <Text>
            Are you sure you want to cancel your investment? Upon cancellation, a penalty of 10% of the ELF you invested
            will be deducted, and the remaining 90% will be returned to you.
          </Text>
          <Flex className="mobile-flex-vertical-reverse" gap={16}>
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
              Cancel
            </Button>
          </Flex>
        </Flex>
      </Modal>
      <Modal
        className="common-modal"
        title="Cancel Investment"
        footer={null}
        centered
        open={isSubmitModalOpen}
        onCancel={() => {
          setIsSubmitModalOpen(false);
        }}>
        <Flex vertical gap={24}>
          <Text>Upon clicking "Confirm," ELF will be returned to the specified address.</Text>
          <Flex justify="space-between">
            <Text>My address</Text>
            <HashAddress
              className="hash-address-small"
              preLen={8}
              endLen={9}
              chain={DEFAULT_CHAIN_ID}
              address={wallet?.walletInfo.address || ''}
            />
          </Flex>
          <Flex className="modal-box-data-wrapper" justify="space-between">
            <Text fontWeight={FontWeightEnum.Medium}>Available</Text>
            <Flex gap={8} align="baseline">
              <Text fontWeight={FontWeightEnum.Medium}>
                {divDecimalsStr(revokeAmount, projectInfo?.toRaiseToken?.decimals)}{' '}
                {projectInfo?.toRaiseToken?.symbol ?? '--'}
              </Text>
              {renderTokenPrice({
                textProps: {
                  fontWeight: FontWeightEnum.Medium,
                  size: 'small',
                },
                amount: revokeAmount,
                decimals: projectInfo?.toRaiseToken?.decimals,
                tokenPrice,
              })}
            </Flex>
          </Flex>
          <Flex vertical gap={8}>
            <Flex justify="space-between">
              <Flex className="mobile-flex-vertical-gap-0" gap={3}>
                <Text>Estimated</Text>
                <Text>Transaction Fee</Text>
              </Flex>
              <Flex className="mobile-flex-vertical-end-gap-2" gap={8} align="baseline">
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
            <Flex justify="space-between">
              <Text>Amount to Be Received</Text>
              <Flex className="mobile-flex-vertical-end-gap-2" gap={8} align="baseline">
                <Text>
                  {divDecimalsStr(finalAmount, projectInfo?.toRaiseToken?.decimals)}{' '}
                  {projectInfo?.toRaiseToken?.symbol ?? '--'}
                </Text>
                {renderTokenPrice({
                  textProps: {
                    size: 'small',
                  },
                  amount: finalAmount,
                  decimals: projectInfo?.toRaiseToken?.decimals,
                  tokenPrice,
                })}
              </Flex>
            </Flex>
          </Flex>
          <Text
            className={clsx('error-text', 'text-center', { ['display-none']: !notEnoughTokens })}
            fontWeight={FontWeightEnum.Medium}>
            Insufficient balance to cover the transaction fee. Please transfer some ELF to this address before you try
            again.
          </Text>
          <Flex justify="center">
            <Button className="modal-single-button" type="primary" disabled={notEnoughTokens} onClick={handleSubmit}>
              Confirm
            </Button>
          </Flex>
        </Flex>
      </Modal>
      <SuccessModal
        modalProps={{
          title: 'Successfully Cancelled',
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
              amount: divDecimalsStr(revokeAmount, projectInfo?.toRaiseToken?.decimals),
              symbol: projectInfo?.toRaiseToken?.symbol || '--',
            },
          ],
          description: 'Congratulations! Your investment has been successfully cancelled.',
          boxData: {
            label: 'Transaction ID',
            value: transactionId,
          },
        }}
      />
    </>
  );
}

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
        Revoke Investment
      </Text>
      <Modal
        title="Revoke Investment"
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
              Revoke Investment
            </Button>
          </Flex>
        </Flex>
      </Modal>
      <Modal
        title="Revoke Investment"
        footer={null}
        centered
        open={isSubmitModalOpen}
        onCancel={() => {
          setIsSubmitModalOpen(false);
        }}>
        <Flex vertical gap={24}>
          <Text>After clicking “Submit”, EWELL transfer ELF to the designated account.</Text>
          <Flex justify="space-between">
            <Text>Address</Text>
            <HashAddress
              className="hash-address-small"
              preLen={8}
              endLen={9}
              chain={DEFAULT_CHAIN_ID}
              address={wallet?.walletInfo.address || ''}
            />
          </Flex>
          <Flex className="modal-box-data-wrapper" justify="space-between">
            <Text fontWeight={FontWeightEnum.Medium}>Revoke</Text>
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
            <Flex justify="space-between">
              <Text>Final</Text>
              <Flex gap={8} align="baseline">
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
            Not enough tokens to pay for the Gas!
          </Text>
          <Flex justify="center">
            <Button className="modal-single-button" type="primary" disabled={notEnoughTokens} onClick={handleSubmit}>
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
              amount: divDecimalsStr(revokeAmount, projectInfo?.toRaiseToken?.decimals),
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

import { useEffect, useMemo, useState } from 'react';
import BigNumber from 'bignumber.js';
import { useParams } from 'react-router-dom';
import { Flex, message } from 'antd';
import { Button, FontWeightEnum, HashAddress, Modal, Typography } from 'aelf-design';
import ProjectLogo from 'components/ProjectLogo';
import SuccessModal from '../SuccessModal';
import { wallet as walletIcon } from 'assets/images';
import { IProjectInfo } from 'types/project';
import { DEFAULT_CHAIN_ID, NETWORK_CONFIG } from 'constants/network';
import { divDecimals, divDecimalsStr } from 'utils/calculate';
import { getPriceDecimal } from 'utils';
import { useWallet } from 'contexts/useWallet/hooks';
import { emitLoading, emitSyncTipsModal } from 'utils/events';
import { timesDecimals } from 'utils/calculate';
import { useTokenPrice, useTxFee } from 'contexts/useAssets/hooks';
import { renderTokenPrice } from 'utils/project';
import { useBalance } from 'hooks/useBalance';
import { useViewContract } from 'contexts/useViewContract/hooks';
import './styles.less';

const { Title, Text } = Typography;

export interface IPurchaseButtonProps {
  buttonDisabled?: boolean;
  projectInfo?: IProjectInfo;
  purchaseAmount?: string;
}

export default function PurchaseButton({ buttonDisabled, projectInfo, purchaseAmount }: IPurchaseButtonProps) {
  const { projectId } = useParams();
  const { additionalInfo } = projectInfo || {};
  const { wallet, checkManagerSyncState } = useWallet();
  const { checkIsNeedApprove } = useViewContract();
  const { tokenPrice } = useTokenPrice();
  const { txFee } = useTxFee();
  const [messageApi, contextHolder] = message.useMessage();
  const { balance, updateBalance } = useBalance(projectInfo?.toRaiseToken?.symbol);

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    if (isSubmitModalOpen) {
      updateBalance();
    }
  }, [updateBalance, isSubmitModalOpen]);

  const allocationAmount = useMemo(() => {
    return timesDecimals(purchaseAmount, projectInfo?.toRaiseToken?.decimals);
  }, [projectInfo?.toRaiseToken?.decimals, purchaseAmount]);

  const totalAllocationAmount = useMemo(() => {
    return new BigNumber(projectInfo?.investAmount ?? 0).plus(allocationAmount);
  }, [allocationAmount, projectInfo?.investAmount]);

  const totalTxFee = useMemo(() => {
    return new BigNumber(txFee || 0).times(2);
  }, [txFee]);

  const totalAmount = useMemo(() => {
    return new BigNumber(purchaseAmount || 0).plus(totalTxFee);
  }, [purchaseAmount, totalTxFee]);

  const handleSubmit = async () => {
    setIsSubmitModalOpen(false);
    emitLoading(true, { text: 'Processing on the blockchain...' });
    const isManagerSynced = await checkManagerSyncState();
    if (!isManagerSynced) {
      emitLoading(false);
      emitSyncTipsModal(true);
      return;
    }

    const amount = allocationAmount.toString();
    let needApprove = false;
    try {
      needApprove = await checkIsNeedApprove({
        symbol: projectInfo?.toRaiseToken?.symbol || '',
        amount,
        owner: wallet?.walletInfo.address || '',
        spender: NETWORK_CONFIG.ewellContractAddress,
      });
      console.log('checkIsNeedApprove result', needApprove);
    } catch (error: any) {
      console.log('error', error);
      messageApi.open({
        type: 'error',
        content: error?.message || 'GetApproveAmount failed',
      });
      emitLoading(false);
      return;
    }

    if (needApprove) {
      try {
        const approveResult = await wallet?.callContract({
          contractAddress: NETWORK_CONFIG.sideChainInfo.tokenContractAddress,
          methodName: 'Approve',
          args: {
            spender: NETWORK_CONFIG.ewellContractAddress,
            symbol: projectInfo?.toRaiseToken?.symbol,
            amount,
          },
        });
        console.log('approveResult', approveResult);
      } catch (error: any) {
        console.log('error', error);
        messageApi.open({
          type: 'error',
          content: error?.message || 'Approve failed',
        });
        emitLoading(false);
        return;
      }
    }

    try {
      const result = await wallet?.callContract<any, any>({
        contractAddress: NETWORK_CONFIG.ewellContractAddress,
        methodName: 'Invest',
        args: {
          projectId,
          currency: 'ELF',
          investAmount: amount,
        },
      });
      console.log('Invest result', result);
      const { TransactionId } = result;
      setTransactionId(TransactionId);
      setIsSuccessModalOpen(true);
    } catch (error: any) {
      console.log('error', error);
      messageApi.open({
        type: 'error',
        content: error?.message || 'Invest failed',
      });
    } finally {
      emitLoading(false);
    }
  };

  return (
    <>
      {contextHolder}
      <Button
        type="primary"
        disabled={buttonDisabled}
        onClick={() => {
          setIsSubmitModalOpen(true);
        }}>
        Purchase with ELF
      </Button>
      <Modal
        wrapClassName="purchase-submit-modal-wrapper"
        title="Confirm Payment"
        footer={null}
        centered
        open={isSubmitModalOpen}
        onCancel={() => {
          setIsSubmitModalOpen(false);
        }}>
        <Flex vertical gap={24}>
          <Flex align="center" gap={12}>
            <ProjectLogo key={additionalInfo?.logoUrl} src={additionalInfo?.logoUrl} alt="logo" />
            <Title fontWeight={FontWeightEnum.Medium}>{additionalInfo?.projectName}</Title>
          </Flex>
          <Flex vertical gap={8}>
            <Flex justify="space-between">
              <Text>Contract Address</Text>
              <HashAddress
                className="hash-address-small"
                preLen={8}
                endLen={9}
                chain={DEFAULT_CHAIN_ID}
                address={NETWORK_CONFIG.ewellContractAddress}
              />
            </Flex>
            <Flex justify="space-between">
              <Text>My Allocation</Text>
              <Text>
                {divDecimalsStr(totalAllocationAmount, projectInfo?.toRaiseToken?.decimals ?? 8)}{' '}
                {projectInfo?.toRaiseToken?.symbol ?? '--'}
              </Text>
            </Flex>
            <Flex justify="space-between">
              <Text>To Receive</Text>
              <Text>
                {divDecimals(totalAllocationAmount, projectInfo?.toRaiseToken?.decimals)
                  .times(
                    divDecimals(
                      projectInfo?.preSalePrice ?? 0,
                      getPriceDecimal(projectInfo?.crowdFundingIssueToken, projectInfo?.toRaiseToken),
                    ),
                  )
                  .toFormat()}{' '}
                {projectInfo?.crowdFundingIssueToken?.symbol ?? '--'}
              </Text>
            </Flex>
          </Flex>
          <Flex className="modal-box-data-wrapper" justify="space-between">
            <Flex align="center" gap={8}>
              <img src={walletIcon} alt="wallet" />
              <Text fontWeight={FontWeightEnum.Medium}>Balance</Text>
            </Flex>
            <Text fontWeight={FontWeightEnum.Medium}>
              {divDecimalsStr(balance, projectInfo?.toRaiseToken?.decimals ?? 8)}{' '}
              {projectInfo?.toRaiseToken?.symbol ?? '--'}
            </Text>
          </Flex>
          <Flex vertical gap={8}>
            <Flex justify="space-between">
              <Text>Allocation</Text>
              <Flex gap={8} align="baseline">
                <Text>
                  {divDecimalsStr(purchaseAmount, 0)} {projectInfo?.toRaiseToken?.symbol ?? '--'}
                </Text>
                {renderTokenPrice({
                  textProps: {
                    size: 'small',
                  },
                  amount: purchaseAmount,
                  decimals: 0,
                  tokenPrice,
                })}
              </Flex>
            </Flex>
            <Flex justify="space-between">
              <Text>Estimated Transaction Fee</Text>
              <Flex gap={8} align="baseline">
                <Text>
                  {totalTxFee.toFixed()} {projectInfo?.toRaiseToken?.symbol ?? '--'}
                </Text>
                {renderTokenPrice({
                  textProps: {
                    size: 'small',
                  },
                  amount: totalTxFee,
                  decimals: 0,
                  tokenPrice,
                })}
              </Flex>
            </Flex>
            <Flex justify="space-between">
              <Text>Total</Text>
              <Flex gap={8} align="baseline">
                <Text fontWeight={FontWeightEnum.Medium}>
                  {totalAmount.toFormat()} {projectInfo?.toRaiseToken?.symbol ?? '--'}
                </Text>
                {renderTokenPrice({
                  textProps: {
                    size: 'small',
                    fontWeight: FontWeightEnum.Medium,
                  },
                  amount: totalAmount,
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
          title: 'Payment Success',
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
              amount: divDecimalsStr(purchaseAmount, 0),
              symbol: projectInfo?.toRaiseToken?.symbol ?? '--',
            },
          ],
          description: 'Congratulations, payment success!',
          boxData: {
            label: 'Transaction ID',
            value: transactionId,
          },
        }}
      />
    </>
  );
}

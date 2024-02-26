import React, { useCallback, useMemo, useState } from 'react';
import { useEffectOnce, useLocalStorage } from 'react-use';
import storages from '../storages';
import ButtonGroup from '../components/ButtonGroup';
import { CreateStepProps } from '../types';
import { ConfirmModal, SuccessModal } from './components/Modal';
import { ITradingParCard } from '../components/TradingPairList';
import { useTransfer } from './useTransfer';
import { emitLoading, emitSyncTipsModal } from 'utils/events';
import { message, Flex } from 'antd';
import { useNavigate } from 'react-router-dom';
import NewProjectInfo from 'pages/NewProjectInfo';
import { getInfo } from '../utils';
import { AELF_TOKEN_INFO } from 'constants/misc';
import { Typography, FontWeightEnum } from 'aelf-design';
import BigNumber from 'bignumber.js';
import { ProjectStatus } from 'types/project';
import { resetCreateProjectInfo } from '../utils';
import { timesDecimals } from 'utils/calculate';
import { useMobile } from 'contexts/useStore/hooks';

interface SuccessInfo {
  supply?: number;
  transactionId?: string;
  projectId?: string;
}

const { Title } = Typography;

const Transfer: React.FC<CreateStepProps> = ({ onPre }) => {
  const [tradingPair] = useLocalStorage<ITradingParCard>(storages.ConfirmTradingPair);
  const [additional] = useLocalStorage(storages.AdditionalInformation);
  const [idoInfo] = useLocalStorage<any>(storages.IDOInfo);
  const [openConfirmModal, setOpenConfirmModal] = useState(false);
  const [openSuccessModal, setOpenSuccessModal] = useState(false);
  const [successInfo, setSuccessInfo] = useState<SuccessInfo>();
  const [contractAddress, setContractAddress] = useState('');
  const navigate = useNavigate();
  const { register, checkManagerSyncState, isStartTimeBeforeNow, getProjectAddress } = useTransfer();

  const previewData = useMemo(() => {
    const { additionalInfo, ...data } = getInfo(tradingPair, idoInfo, additional);
    const { startTime, endTime, tokenReleaseTime, whitelistUrl } = idoInfo;
    return {
      ...data,
      startTime,
      endTime,
      contractAddress,
      tokenReleaseTime,
      additionalInfo: additionalInfo.data,
      toRaiseToken: AELF_TOKEN_INFO,
      crowdFundingIssueToken: tradingPair,
      unlockTime: tokenReleaseTime,
      status: ProjectStatus.UPCOMING,
      whitelistInfo: {
        url: whitelistUrl,
      },
      targetRaisedAmount: timesDecimals(
        new BigNumber(data.crowdFundingIssueAmount).div(data.preSalePrice),
        AELF_TOKEN_INFO.decimals,
      ).toString(),
    } as any;
  }, [additional, contractAddress, idoInfo, tradingPair]);

  const onTransfer = useCallback(async () => {
    try {
      setOpenConfirmModal(false);
      const isBefore = isStartTimeBeforeNow(idoInfo?.startTime);
      if (isBefore) {
        message.error('The sale start time has already passed. Please revise the sale information in step 3.');
        return;
      }
      emitLoading(true, { text: 'Synchronising data on the blockchain...' });
      const isSync = await checkManagerSyncState();
      if (!isSync) {
        emitLoading(false);
        emitSyncTipsModal(true);
        return;
      }

      const result: any = await register({ tradingPair, idoInfo, additional });
      console.log('createResult:', result);
      setSuccessInfo(result);
      resetCreateProjectInfo();
      setOpenSuccessModal(true);
    } catch (error: any) {
      console.log('register error', error);
      message.error(error?.message || 'register failed');
    } finally {
      emitLoading(false);
    }
  }, [additional, checkManagerSyncState, idoInfo, isStartTimeBeforeNow, register, tradingPair]);

  const gotoDetail = useCallback(() => {
    navigate(`/project/${successInfo?.projectId}`, { replace: true });
  }, [navigate, successInfo?.projectId]);

  const onNext = useCallback(() => {
    setOpenConfirmModal(true);
  }, []);

  const getContractAddress = useCallback(async () => {
    try {
      const contractAddress = await getProjectAddress();
      setContractAddress(contractAddress);
    } catch (error) {
      console.log('getContractAddress error', error);
    }
  }, [getProjectAddress]);

  useEffectOnce(() => {
    getContractAddress();
  });

  const isMobile = useMobile();
  const newProjectInfoMinHeight = useMemo(
    () => (isMobile ? 'calc(100vh - 64px - 120px - 188px - 96px)' : 'calc(100vh - 64px - 72px - 188px - 96px)'),
    [isMobile],
  );

  return (
    <div className="transfer-page">
      <Title
        level={6}
        fontWeight={FontWeightEnum.Medium}
        style={{
          padding: '48px 0',
        }}>
        Please review the sale details to ensure the accuracy of information. If everything is correct, you can finish
        the launch by clicking "Transfer" to send your tokens to an address.
      </Title>
      <NewProjectInfo
        previewData={previewData}
        style={{
          minHeight: newProjectInfoMinHeight,
          padding: 0,
        }}
      />
      <ButtonGroup onPre={onPre} onNext={onNext} nextText="Transfer" style={{ margin: '24px 0 48px 0' }} />
      <ConfirmModal
        info={previewData}
        open={openConfirmModal}
        onCancel={() => setOpenConfirmModal(false)}
        onOk={onTransfer}
      />
      <SuccessModal
        info={{
          transactionId: successInfo?.transactionId,
          supply: successInfo?.supply,
          tokenSymbol: tradingPair?.symbol,
        }}
        open={openSuccessModal}
        onCancel={() => {
          setOpenSuccessModal(false);
          gotoDetail();
        }}
        onOk={gotoDetail}
      />
    </div>
  );
};

export default Transfer;

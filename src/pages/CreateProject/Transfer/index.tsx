import React, { useCallback, useMemo, useState } from 'react';
import { useLocalStorage } from 'react-use';
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
import { useTokenPrice, useTxFee } from 'contexts/useAssets/hooks';

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
  const { register, checkManagerSyncState } = useTransfer();
  const navigate = useNavigate();

  const previewData = useMemo(() => {
    const { additionalInfo, ...data } = getInfo(tradingPair, idoInfo, additional);
    const { startTime, endTime, tokenReleaseTime, whitelistUrl } = idoInfo;
    return {
      ...data,
      startTime,
      endTime,
      tokenReleaseTime,
      additionalInfo: additionalInfo.data,
      toRaiseToken: AELF_TOKEN_INFO,
      crowdFundingIssueToken: tradingPair,
      unlockTime: tokenReleaseTime,
      status: ProjectStatus.UPCOMING,
      whitelistInfo: {
        url: whitelistUrl,
      },
      toRaisedAmount: timesDecimals(
        new BigNumber(data.crowdFundingIssueAmount).div(data.preSalePrice),
        AELF_TOKEN_INFO.decimals,
      ).toString(),
    } as any;
  }, [additional, idoInfo, tradingPair]);

  const onTransfer = useCallback(async () => {
    try {
      setOpenConfirmModal(false);
      emitLoading(true, { text: 'Processing on the blockchain...' });
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
  }, [additional, checkManagerSyncState, idoInfo, register, tradingPair]);

  const gotoDetail = useCallback(() => {
    navigate(`/project/${successInfo?.projectId}`, { replace: true });
  }, [navigate, successInfo?.projectId]);

  return (
    <div className="transfer-page">
      <Title
        level={6}
        fontWeight={FontWeightEnum.Medium}
        style={{
          padding: '48px 0',
        }}>
        You are previewing the project. Last Step: Transfer the Token to the smart contract to create the project.
      </Title>
      <NewProjectInfo
        previewData={previewData}
        style={{
          minHeight: 'calc(100vh - 64px - 72px - 188px - 96px)',
        }}
      />
      <ButtonGroup
        onPre={onPre}
        onNext={() => setOpenConfirmModal(true)}
        nextText="Transfer Now"
        style={{ marginTop: 24 }}
      />
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

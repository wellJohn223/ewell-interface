import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Flex } from 'antd';
import { Typography, Progress, FontWeightEnum } from 'aelf-design';
import communityLogo from 'assets/images/communityLogo';
import ProjectLogo from 'components/ProjectLogo';
import CommonCommunityLogoList, { COMMUNITY_LOGO_LIST } from 'components/CommonCommunityLogoList';
import CommonProjectStatusTag from 'components/CommonProjectStatusTag';
import { IProjectInfo } from './types';
import { ZERO } from 'constants/misc';
import { divDecimals } from 'utils/calculate';
import { ProjectStatus } from 'types/project';
import { useNavigate, useParams } from 'react-router-dom';
import { stringifyUrl } from 'query-string';
import { parseAdditionalInfo } from 'utils/project';
import dayjs from 'dayjs';
import { timeDuration } from 'utils/time';
import './styles.less';
import { pick } from 'utils';

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

export interface IProjectCard {
  id?: string;
  chainId?: string;
  creator?: string;
  crowdFundingType?: string;
  crowdFundingIssueAmount?: string;
  preSalePrice?: number;
  additionalInfo?: string[];
  startTime?: number;
  endTime?: number;
  unlockTime?: number;
  isCanceled?: boolean;
  cancelTime?: number;
  toRaisedAmount?: number;
  currentRaisedAmount?: number;
}

export interface ProjectCardProps {
  data: IProjectInfo;
}

const Close_Status = [ProjectStatus.CANCELED, ProjectStatus.ENDED];

const { Text, Title } = Typography;
const Card: React.FC<ProjectCardProps> = ({ data }) => {
  const {
    additionalInfo = '',
    preSalePrice,
    crowdFundingIssueToken,
    currentRaisedAmount,
    toRaisedAmount,
    toRaiseToken,
    status,
  } = data;
  const [remainderStr, setRemainderStr] = useState('');
  const _additionalInfo = useMemo(() => parseAdditionalInfo(additionalInfo), [additionalInfo]);

  const progressPercent = useMemo(() => {
    const percent = ZERO.plus(currentRaisedAmount ?? 0)
      .div(toRaisedAmount ?? 0)
      .times(1e2);
    return percent.isNaN() ? 0 : Number(percent.toFixed(2));
  }, [currentRaisedAmount, toRaisedAmount]);
  const navigate = useNavigate();

  const { type } = useParams();

  const jumpDetail = useCallback(() => {
    navigate(
      stringifyUrl({
        url: `/project/${data.id}`,
        query: {
          projectName: _additionalInfo?.projectName || '',
        },
      }),
      {
        state: {
          from: type,
        },
      },
    );
  }, [_additionalInfo?.projectName, data, navigate, type]);

  useEffect(() => {
    let str = '--';
    if (status === ProjectStatus.CANCELED) str = 'Cancelled on';
    if (status === ProjectStatus.ENDED) str = 'Ended on';
    if (status === ProjectStatus.UNLOCKED) str = 'Token Distribution Time';
    if ([ProjectStatus.UPCOMING, ProjectStatus.PARTICIPATORY].includes(status as ProjectStatus)) str = 'Ends in';

    setRemainderStr(str);
  }, [status]);

  const [remainderTimeStr, setRemainderTimeStr] = useState('');

  useEffect(() => {
    if (status === ProjectStatus.CANCELED) {
      setRemainderTimeStr(data?.cancelTime ? dayjs(data.cancelTime).format('DD MMM YYYY') : '--');
    }

    if (status === ProjectStatus.ENDED) {
      setRemainderTimeStr(data?.tokenReleaseTime ? dayjs(data.tokenReleaseTime).format('DD MMM YYYY') : '--');
    }
  }, [data.cancelTime, data.tokenReleaseTime, status]);

  useEffect(() => {
    if (Close_Status.includes(status || ProjectStatus.ENDED)) return;
    const timer = setInterval(() => {
      let timeValue = '0';
      if (status === ProjectStatus.UPCOMING) timeValue = data?.startTime ?? '0';
      if (status === ProjectStatus.PARTICIPATORY) timeValue = data?.endTime ?? '0';
      if (status === ProjectStatus.UNLOCKED) timeValue = data?.tokenReleaseTime ?? '0';
      const timestamp = dayjs(timeValue).valueOf();

      const remainingTime = timestamp - Date.now();
      let formatValue = '';
      if (remainingTime <= 0) {
        setRemainderTimeStr('00:00:00');
        console.log(timer, 'timer');
        clearInterval(timer);
        return;
      }
      if (remainingTime <= ONE_DAY_IN_MS) {
        formatValue = timeDuration(remainingTime);
      } else {
        formatValue = dayjs(timestamp).format('DD MMMM, YYYY');
      }
      setRemainderTimeStr(formatValue);
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [data?.endTime, data?.startTime, data?.tokenReleaseTime, status]);

  const ProgressStrokeColor = useMemo(() => (status === ProjectStatus.PARTICIPATORY ? '#131631' : '#C1C2C9'), [status]);

  const currentRaisedAmountStr = useMemo(
    () => divDecimals(currentRaisedAmount, toRaiseToken?.decimals).toFormat(),
    [currentRaisedAmount, toRaiseToken?.decimals],
  );

  const toRaisedAmountStr = useMemo(
    () => divDecimals(toRaisedAmount, toRaiseToken?.decimals).toFormat(),
    [toRaiseToken?.decimals, toRaisedAmount],
  );

  const preSalePriceStr = useMemo(
    () => divDecimals(preSalePrice, crowdFundingIssueToken?.decimals).toFixed(),
    [crowdFundingIssueToken?.decimals, preSalePrice],
  );

  const communityLogoList = useMemo(
    () =>
      Object.entries(additionalInfo || []).filter(([key]) => Object.keys(communityLogo).find((item) => item === key)),
    [additionalInfo],
  );

  const projectImageUrl = useMemo(
    () => _additionalInfo?.projectImgs?.split(',')[0] || '',
    [_additionalInfo?.projectImgs],
  );

  const projectLogoUrl = useMemo(() => _additionalInfo?.logoUrl || '', [_additionalInfo?.logoUrl]);

  return (
    <div className="project-card" onClick={jumpDetail}>
      <Flex vertical gap={12}>
        <ProjectLogo className="project-img" src={projectImageUrl} alt="img" />
        <Flex className="project-card-info">
          <ProjectLogo className="project-card-logo" src={projectLogoUrl} alt="logo" />
          <div className="project-name-wrap">
            <div className="project-name">{_additionalInfo?.projectName || '--'}</div>
            {!!status && <CommonProjectStatusTag className="project-status-tag" status={status} />}
          </div>
        </Flex>
        <Flex vertical gap={4}>
          <div className="project-summary">{_additionalInfo?.projectSummary}</div>
          <div className="project-community">
            <CommonCommunityLogoList
              gap={8}
              imgClassName="project-community-img"
              communityLink={pick(_additionalInfo || {}, COMMUNITY_LOGO_LIST)}
            />
          </div>
        </Flex>
        <Flex className="project-card-sale" vertical gap={4}>
          <Flex vertical>
            <Flex justify="space-between">
              <Text>Sale Price</Text>
              <Text>{remainderStr}</Text>
            </Flex>
            <Flex justify="space-between">
              <Text fontWeight={FontWeightEnum.Medium}>
                1 ELF = {`${preSalePriceStr} ${crowdFundingIssueToken?.symbol || ''}`}
              </Text>
              <Text>{remainderTimeStr}</Text>
            </Flex>
          </Flex>
          <Flex>
            <Progress
              size={['100%', 12]}
              percent={progressPercent}
              strokeColor={ProgressStrokeColor}
              trailColor="#F5F5F6"
            />
          </Flex>
          <Flex justify="space-between">
            <Text>{progressPercent}%</Text>
            <Text>
              {currentRaisedAmountStr}/{toRaisedAmountStr} ELF
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </div>
  );
};

export default Card;

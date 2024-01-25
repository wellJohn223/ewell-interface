import React, { useCallback, useMemo } from 'react';
import clsx from 'clsx';
import { Row, Col, Flex } from 'antd';
import { Typography, FontWeightEnum, Progress } from 'aelf-design';
import { getProjectStatus } from 'utils/project';
import communityLogo from 'assets/images/communityLogo';
import { IProjectInfo, IAdditionalInfo } from './types';
import { mockDetail } from './mock';
import { ZERO } from 'constants/misc';
import { divDecimals } from 'utils/calculate';
import { NumberFormat } from 'utils/format';
import { ProjectStatus } from 'types/project';
import { useNavigate, useParams } from 'react-router-dom';
import { stringifyUrl } from 'query-string';
import { parseAdditionalInfo } from 'utils/project';
import './styles.less';
import { PROJECT_STATUS_TEXT_MAP } from 'constants/project';
import dayjs from 'dayjs';
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

function ProjectStatusRow({ status }: { status: ProjectStatus }) {
  if (!status) return null;
  return (
    <div className={clsx('project-card-status-row', `project-card-status-row-${status}`)}>
      {PROJECT_STATUS_TEXT_MAP[status]}
    </div>
  );
}

const { Text } = Typography;
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

  const _additionalInfo = useMemo(() => parseAdditionalInfo(additionalInfo), [additionalInfo]);

  const progressPercent = useMemo(() => {
    const percent = ZERO.plus(currentRaisedAmount ?? 0)
      .div(toRaisedAmount ?? 0)
      .times(1e2);
    return percent.isNaN() ? ZERO : percent;
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

  const remainderStr = useMemo(() => {
    if (status === ProjectStatus.CANCELED) return 'Canceled Time';
    if (status === ProjectStatus.ENDED) return 'Ended Time';
    if ([ProjectStatus.UPCOMING, ProjectStatus.PARTICIPATORY, ProjectStatus.UNLOCKED].includes(status as ProjectStatus))
      return 'Unlock Time';
    return '--';
  }, [status]);
  const remainderTimeStr = useMemo(() => {
    if (status === ProjectStatus.CANCELED)
      return data?.cancelTime ? dayjs(data.cancelTime).format('DD MMM YYYY') : '--';
    if (status === ProjectStatus.ENDED)
      return data?.tokenReleaseTime ? dayjs(data.tokenReleaseTime).format('DD MMM YYYY') : '--';

    let timeValue = '0';
    if (status === ProjectStatus.UPCOMING) timeValue = data?.startTime ?? '0';
    if (status === ProjectStatus.PARTICIPATORY) timeValue = data?.endTime ?? '0';
    if (status === ProjectStatus.UNLOCKED) timeValue = data?.tokenReleaseTime ?? '0';
    const timestamp = dayjs(timeValue).valueOf();

    const remainingTime = timestamp - Date.now();
    let format;
    let formatValue = remainingTime;
    if (remainingTime <= ONE_DAY_IN_MS) {
      format = 'HH:mm:ss';
    } else {
      formatValue = timestamp;
      format = 'DD MMM YYYY';
    }
    return dayjs(formatValue).format(format);
  }, [data.cancelTime, data.endTime, data.startTime, data.tokenReleaseTime, status]);

  return (
    <div className="project-card" onClick={jumpDetail}>
      <img className="project-img" src={_additionalInfo?.projectImgs?.split(',')[0] || ''} />
      <Flex className="project-card-info">
        <img className="project-card-logo" src={_additionalInfo?.logoUrl?.split(',')[0] || ''} alt="" />
        <div className="project-name-wrap">
          <div className="project-name">{_additionalInfo?.projectName || '--'}</div>
          <ProjectStatusRow status={status || ProjectStatus.UPCOMING} />
        </div>
      </Flex>
      <div className="project-community">
        {Object.entries(additionalInfo || [])
          .filter(([key]) => Object.keys(communityLogo).find((item) => item === key))
          .map(([key, value], index) => (
            <img
              key={index}
              className="cursor-pointer"
              src={communityLogo[key]}
              alt="community"
              onClick={() => {
                window.open(value, '_blank');
              }}
            />
          ))}
      </div>
      <Flex className="project-card-sale" justify="space-between">
        <div className="text-left">
          <div>Sale Price</div>
          {/* TODO: calculate prePrice */}
          <div>
            1 ELF ={' '}
            {`${divDecimals(preSalePrice, crowdFundingIssueToken?.decimals).toFixed()} ${
              crowdFundingIssueToken?.symbol || ''
            }`}
          </div>
        </div>
        <div className="text-right">
          <div>{remainderStr}</div>
          <div>{remainderTimeStr}</div>
        </div>
      </Flex>
      <Progress
        size={['100%', 12]}
        percent={progressPercent.toNumber()}
        strokeColor={status === ProjectStatus.PARTICIPATORY ? '#131631' : '#C1C2C9'}
        trailColor="#F5F5F6"
      />
      <Flex className="project-progress" justify="space-between">
        <Text>{progressPercent.toNumber()}%</Text>
        <Text>
          {divDecimals(currentRaisedAmount, toRaiseToken?.decimals).toFixed()}/
          {divDecimals(toRaisedAmount, toRaiseToken?.decimals).toFixed()} ELF
        </Text>
      </Flex>
    </div>
  );
};

export default Card;

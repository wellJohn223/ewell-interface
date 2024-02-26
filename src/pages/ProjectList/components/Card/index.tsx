import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Flex } from 'antd';
import { Typography, FontWeightEnum } from 'aelf-design';
import ProjectLogo from 'components/ProjectLogo';
import CommonCommunityLogoList, { COMMUNITY_LOGO_LIST } from 'components/CommonCommunityLogoList';
import CommonProjectStatusTag from 'components/CommonProjectStatusTag';
import CommonProjectProgress from 'components/CommonProjectProgress';
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

export interface ProjectCardProps {
  data: IProjectInfo;
}

const Close_Status = [ProjectStatus.CANCELED, ProjectStatus.ENDED];

const { Text } = Typography;
const Card: React.FC<ProjectCardProps> = ({ data }) => {
  const {
    additionalInfo = '',
    preSalePrice,
    crowdFundingIssueToken,
    currentRaisedAmount,
    targetRaisedAmount,
    toRaiseToken,
    status,
  } = data;
  const [remainderStr, setRemainderStr] = useState('');
  const _additionalInfo = useMemo(() => parseAdditionalInfo(additionalInfo), [additionalInfo]);

  const progressPercent = useMemo(() => {
    const percent = ZERO.plus(currentRaisedAmount ?? 0)
      .div(targetRaisedAmount ?? 0)
      .times(1e2);
    return percent.isNaN() ? 0 : Number(percent.toFixed(2));
  }, [currentRaisedAmount, targetRaisedAmount]);
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
      setRemainderTimeStr(data?.cancelTime ? dayjs(data.cancelTime).format('DD MMMM, YYYY') : '--');
    }

    if (status === ProjectStatus.ENDED) {
      setRemainderTimeStr(data?.tokenReleaseTime ? dayjs(data.tokenReleaseTime).format('DD MMMM, YYYY') : '--');
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

  const currentRaisedAmountStr = useMemo(
    () => divDecimals(currentRaisedAmount, toRaiseToken?.decimals).toFormat(),
    [currentRaisedAmount, toRaiseToken?.decimals],
  );

  const targetRaisedAmountStr = useMemo(
    () => divDecimals(targetRaisedAmount, toRaiseToken?.decimals).toFormat(),
    [toRaiseToken?.decimals, targetRaisedAmount],
  );

  const preSalePriceStr = useMemo(
    () => divDecimals(preSalePrice, crowdFundingIssueToken?.decimals).toFixed(),
    [crowdFundingIssueToken?.decimals, preSalePrice],
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
            <Flex justify="space-between" gap={16}>
              <Flex gap={3}>
                <Text fontWeight={FontWeightEnum.Medium} style={{ flex: 'none' }}>
                  1 ELF =
                </Text>
                <Text ellipsis>{`${preSalePriceStr} ${crowdFundingIssueToken?.symbol || ''}`}</Text>
              </Flex>
              <Text ellipsis>{remainderTimeStr}</Text>
            </Flex>
          </Flex>
          <CommonProjectProgress
            wrapFlexGap={4}
            textProps={{ size: 'small' }}
            progressPercent={progressPercent}
            projectStatus={status}
            currentRaisedAmount={currentRaisedAmountStr}
            targetRaisedAmount={targetRaisedAmountStr}
            toRaiseTokenSymbol={toRaiseToken?.symbol}
          />
        </Flex>
      </Flex>
    </div>
  );
};

export default Card;

import { ZERO } from 'constants/misc';
import { IAdditionalInfo, ProjectItem } from 'types/project';
import { getLog } from './protoUtils';
import { unifySecond } from './time';
import { ITextProps, Typography } from 'aelf-design';
import { divDecimals } from './calculate';
import BigNumber from 'bignumber.js';

const { Text } = Typography;

export enum ProjectStatus {
  Canceled = 4,
  Ended = 3,
  'On-going' = 2,
  Upcoming = 1,
}
export function getProjectStatus(project?: ProjectItem): any {
  if (!project) return ProjectStatus.Upcoming;
  const nowTime = Math.floor(new Date().getTime() / 1000);
  if (project.isCanceled) return ProjectStatus.Canceled;
  if (ZERO.plus(project.endTime).lte(nowTime)) return ProjectStatus.Ended;
  if (!project.startTime || ZERO.plus(project.startTime).gt(nowTime)) return ProjectStatus.Upcoming;
  return ProjectStatus['On-going'];
}

export function unifyProjectToApi(project: any) {
  const startTime = unifySecond(project.startTime);
  const endTime = unifySecond(project.endTime);
  const unlockTime = unifySecond(project.unlockTime);
  return {
    ...project,
    startTime,
    endTime,
    unlockTime,
    hash: project.projectId,
    lastModificationTime: unifySecond(new Date().getTime()),
  };
}

export function unifyProject(Logs: any, info: any, params: any) {
  try {
    const { ProjectRegistered: p, NewWhitelistIdSet: whitelist } = getLog(Logs, [
      'ProjectRegistered',
      'NewWhitelistIdSet',
    ]);
    const project = unifyProjectToApi(p);
    return {
      ...params,
      ...project,
      ...whitelist,
      participantCount: 0,
      additionalInfo: info.additionalInfo.data,
    };
  } catch (error) {
    return false;
  }
}

export function unifyProjectFromInfo(info: any): any {
  try {
    const startTime = unifySecond(new Date(info.startTime).getTime());
    const endTime = unifySecond(new Date(info.endTime).getTime());
    return {
      ...info,
      participantCount: 0,
      additionalInfo: info.additionalInfo.data,
      startTime,
      endTime,
      totalPeriod: Number(info.totalPeriod),
    };
  } catch (error) {
    return undefined;
  }
}

export function renderTokenPrice({
  textProps,
  amount,
  decimals = 8,
  tokenPrice,
}: {
  textProps?: ITextProps;
  amount?: number | string | BigNumber;
  decimals?: number;
  tokenPrice?: string;
}) {
  return (
    !!tokenPrice &&
    new BigNumber(tokenPrice).gt(0) && (
      <Text {...textProps}>$ {divDecimals(amount, decimals).times(tokenPrice).toFixed(2)}</Text>
    )
  );
}

export const parseAdditionalInfo = (additionalInfoStr: any) => {
  try {
    const additionalInfo = JSON.parse(additionalInfoStr);
    return additionalInfo as IAdditionalInfo;
  } catch (error) {
    return undefined;
  }
};

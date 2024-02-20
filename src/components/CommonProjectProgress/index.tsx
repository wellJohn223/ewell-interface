import { ComponentProps } from 'react';
import { Flex } from 'antd';
import { Progress, Typography } from 'aelf-design';
import { ProjectStatus } from 'types/project';

const { Text } = Typography;

interface ICommonProjectProgressProps {
  wrapFlexGap?: number;
  textProps?: ComponentProps<typeof Text>;
  progressPercent: number;
  projectStatus?: ProjectStatus;
  currentRaisedAmount: string;
  toRaisedAmount: string;
  toRaiseTokenSymbol?: string;
}

export default function CommonProjectProgress({
  wrapFlexGap,
  textProps,
  progressPercent,
  projectStatus,
  currentRaisedAmount,
  toRaisedAmount,
  toRaiseTokenSymbol,
}: ICommonProjectProgressProps) {
  return (
    <Flex vertical gap={wrapFlexGap ?? 8}>
      <Progress
        size={['100%', 12]}
        percent={progressPercent}
        strokeColor={projectStatus === ProjectStatus.PARTICIPATORY ? '#131631' : '#C1C2C9'}
        trailColor="#F5F5F6"
      />
      <Flex gap={16} align="center" justify="space-between">
        <Text {...textProps}>{progressPercent.toFixed(0)}%</Text>
        <Text {...textProps}>
          {currentRaisedAmount}/{toRaisedAmount} {toRaiseTokenSymbol || '--'}
        </Text>
      </Flex>
    </Flex>
  );
}

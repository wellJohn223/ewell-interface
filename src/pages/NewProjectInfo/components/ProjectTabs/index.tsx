import dayjs from 'dayjs';
import { Tabs, TabsProps, Flex } from 'antd';
import { Typography, FontWeightEnum } from 'aelf-design';
import CommonCard from 'components/CommonCard';
import { IProjectInfo } from 'types/project';
import { getPriceDecimal } from 'utils';
import { divDecimalsStr } from 'utils/calculate';
import './styles.less';

const { Text } = Typography;

enum ProjectTabsLabel {
  DESCRIPTION = 'Description',
  IDO_INFORMATION = 'IDO Information',
}

interface IProjectTabsProps {
  projectInfo?: IProjectInfo;
}

type TIdoInformationData = {
  title: string;
  data: {
    label: string;
    value: string;
    isTime?: boolean;
  }[];
}[];

export default function ProjectTabs({ projectInfo }: IProjectTabsProps) {
  const idoInformationData: TIdoInformationData = [
    {
      title: 'Information',
      data: [
        {
          label: 'Sale Price',
          value: projectInfo?.preSalePrice
            ? `1 ${projectInfo?.toRaiseToken?.symbol ?? '--'} = ${
                divDecimalsStr(
                  projectInfo?.preSalePrice ?? 0,
                  getPriceDecimal(projectInfo?.crowdFundingIssueToken, projectInfo?.toRaiseToken),
                ) ?? '--'
              } ${projectInfo?.crowdFundingIssueToken?.symbol ?? '--'}`
            : '--',
        },
        {
          label: 'Supply',
          value: `${divDecimalsStr(
            projectInfo?.crowdFundingIssueAmount,
            projectInfo?.crowdFundingIssueToken?.decimals ?? 8,
          )} ${projectInfo?.crowdFundingIssueToken?.symbol ?? '--'}`,
        },
        {
          label: 'Goal',
          value: `${divDecimalsStr(projectInfo?.toRaisedAmount, projectInfo?.toRaiseToken?.decimals)} ${
            projectInfo?.toRaiseToken?.symbol || '--'
          }`,
        },
        {
          label: 'Token Unsold',
          value: projectInfo ? (projectInfo?.isBurnRestToken ? 'Burn' : 'Return') : '--',
        },
      ],
    },
    {
      title: 'Schedule',
      data: [
        {
          label: 'IDO Starts At',
          value: projectInfo?.startTime || '--',
          isTime: true,
        },
        {
          label: 'IDO Ends At',
          value: projectInfo?.endTime || '--',
          isTime: true,
        },
        {
          label: 'Token Distribution Time',
          value: projectInfo?.tokenReleaseTime || '--',
          isTime: true,
        },
      ],
    },
  ];

  const renderCardRow = ({
    key,
    label,
    value,
    isTime = false,
  }: {
    key: string | number;
    label: string;
    value: string;
    isTime?: boolean;
  }) => (
    <Flex key={key} className="card-row" justify="space-between" align="self-start" gap={16}>
      <Text>{label}</Text>
      <Text className="text-right white-space-pre-wrap" fontWeight={FontWeightEnum.Medium}>
        {isTime ? dayjs(value).format('DD-MM-YYYY\nH:mm [UTC] Z') : value}
      </Text>
    </Flex>
  );

  const items: TabsProps['items'] = [
    {
      key: ProjectTabsLabel.DESCRIPTION,
      label: ProjectTabsLabel.DESCRIPTION,
      children: <Text className="white-space-pre-wrap">{projectInfo?.additionalInfo?.projectDescription || '--'}</Text>,
    },
    {
      key: ProjectTabsLabel.IDO_INFORMATION,
      label: ProjectTabsLabel.IDO_INFORMATION,
      children: (
        <div className="tabs-ido-information-wrapper flex">
          {idoInformationData.map(({ title, data }, index) => (
            <CommonCard className="flex-1" key={index} title={title}>
              <div className="ido-information-card-content-wrapper">
                {data.map(({ label, value, isTime }, index) =>
                  renderCardRow({
                    key: index,
                    label,
                    value,
                    isTime,
                  }),
                )}
              </div>
            </CommonCard>
          ))}
        </div>
      ),
    },
  ];

  return <Tabs size="small" items={items} />;
}

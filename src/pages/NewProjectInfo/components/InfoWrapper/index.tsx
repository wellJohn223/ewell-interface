import { Flex } from 'antd';
import { Typography, FontWeightEnum, Carousel } from 'aelf-design';
import ProjectLogo from 'components/ProjectLogo';
import CommonCommunityLogoList, { COMMUNITY_LOGO_LIST } from 'components/CommonCommunityLogoList';
import ProjectTabs from '../ProjectTabs';
import { IProjectInfo } from 'types/project';
import { pick } from 'utils';
import './styles.less';

const { Title, Text } = Typography;

interface IInfoWrapperProps {
  projectInfo: IProjectInfo;
}

export default function InfoWrapper({ projectInfo }: IInfoWrapperProps) {
  const { additionalInfo } = projectInfo;
  const projectImgs = (additionalInfo?.projectImgs?.split(',') || []).map((item, index) => ({
    id: index,
    url: item,
  }));
  return (
    <div className="project-info-wrapper flex flex-1">
      <ProjectLogo src={additionalInfo?.logoUrl} alt="logo" />
      <div className="info-wrapper flex-1 flex-column">
        <div className="info-header flex-column">
          <Title level={5} fontWeight={FontWeightEnum.Medium}>
            {additionalInfo?.projectName || '--'}
          </Title>
          <CommonCommunityLogoList communityLink={pick(additionalInfo || {}, COMMUNITY_LOGO_LIST)} />
          {!!additionalInfo?.projectSummary && <Text>{additionalInfo?.projectSummary}</Text>}
        </div>
        {projectImgs.length > 0 && <Carousel className="carousel" data={projectImgs} />}
        <ProjectTabs projectInfo={projectInfo} />
      </div>
    </div>
  );
}

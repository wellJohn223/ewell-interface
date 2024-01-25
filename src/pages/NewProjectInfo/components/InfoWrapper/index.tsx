import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Flex } from 'antd';
import { Typography, FontWeightEnum, Carousel } from 'aelf-design';
import ProjectLogo from 'components/ProjectLogo';
import CommonCommunityLogoList, { COMMUNITY_LOGO_LIST } from 'components/CommonCommunityLogoList';
import EditButton from '../OperationComponents/EditButton';
import ProjectTabs from '../ProjectTabs';
import ActionCard from '../ActionCard';
import { IProjectInfo } from 'types/project';
import { pick } from 'utils';
import { useMobileMd } from 'contexts/useStore/hooks';
import { useWallet } from 'contexts/useWallet/hooks';
import './styles.less';

const { Title, Text } = Typography;

interface IInfoWrapperProps {
  projectInfo: IProjectInfo;
  isPreview?: boolean;
  handleRefresh?: () => void;
}

const MAX_THUMBS_SLIDES_PER_VIEW = 5;
const THUMBS_ITEM_WIDTH = 72;
const THUMBS_ITEM_GAP = 16;

export default function InfoWrapper({ projectInfo, isPreview, handleRefresh }: IInfoWrapperProps) {
  const isMobileMd = useMobileMd();
  const { projectId } = useParams();
  const { wallet } = useWallet();

  const { additionalInfo } = projectInfo;

  const isLogin = useMemo(() => !!wallet, [wallet]);

  const canEdit = useMemo(() => {
    return !!isLogin && projectInfo?.isCreator && !isPreview;
  }, [isLogin, isPreview, projectInfo?.isCreator]);

  const projectImgs = useMemo(() => {
    return (additionalInfo?.projectImgs?.split(',') || []).map((item, index) => ({
      id: index,
      url: item,
    }));
  }, [additionalInfo?.projectImgs]);

  const thumbsSlidesPerView = useMemo(() => {
    if (projectImgs.length > MAX_THUMBS_SLIDES_PER_VIEW) {
      return MAX_THUMBS_SLIDES_PER_VIEW;
    }
    return projectImgs.length;
  }, [projectImgs.length]);

  const thumbsSwiperWidth = useMemo(() => {
    return THUMBS_ITEM_WIDTH * thumbsSlidesPerView + THUMBS_ITEM_GAP * (thumbsSlidesPerView - 1);
  }, [thumbsSlidesPerView]);

  return (
    <div className="project-info-wrapper flex">
      <Flex justify="space-between" align="flex-start">
        <ProjectLogo src={additionalInfo?.logoUrl} alt="logo" />
        {canEdit && !isMobileMd && (
          <EditButton size="small" projectId={projectId}>
            Edit Project
          </EditButton>
        )}
      </Flex>
      <div className="info-wrapper flex-1 flex-column">
        <div className="info-header flex-column">
          <Title level={5} fontWeight={FontWeightEnum.Medium}>
            {additionalInfo?.projectName || '--'}
          </Title>
          <CommonCommunityLogoList communityLink={pick(additionalInfo || {}, COMMUNITY_LOGO_LIST)} />
          {!!additionalInfo?.projectSummary && <Text>{additionalInfo?.projectSummary}</Text>}
        </div>
        {projectImgs.length > 0 && (
          <Carousel
            className="carousel"
            thumbsSlidesPerView={thumbsSlidesPerView}
            thumbsSwiperWidth={thumbsSwiperWidth}
            data={projectImgs}
          />
        )}
        {isMobileMd && (
          <ActionCard
            projectInfo={projectInfo}
            isPreview={isPreview}
            isLogin={isLogin}
            canEdit={canEdit}
            handleRefresh={handleRefresh}
          />
        )}
        <ProjectTabs projectInfo={projectInfo} />
      </div>
    </div>
  );
}

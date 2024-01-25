import { useParams } from 'react-router-dom';
import { Flex } from 'antd';
import { Button } from 'aelf-design';
import EditButton from '../OperationComponents/EditButton';
import JoinCard from '../JoinCard';
import ProjectManagementCard from '../ProjectManagementCard';
import { login as loginIcon } from 'assets/images';
import { useWallet } from 'contexts/useWallet/hooks';
import { IProjectInfo } from 'types/project';
import { useMobileMd } from 'contexts/useStore/hooks';
import './styles.less';

interface IActionCardProps {
  projectInfo: IProjectInfo;
  isPreview: boolean;
  isLogin: boolean;
  canEdit: boolean;
  handleRefresh?: () => void;
}

export default function ActionCard({ projectInfo, isPreview, isLogin, canEdit, handleRefresh }: IActionCardProps) {
  const isMobileMd = useMobileMd();
  const { login } = useWallet();
  const { projectId } = useParams();

  return (
    <Flex className="action-card-wrapper" vertical gap={24}>
      {canEdit && !isMobileMd && (
        <EditButton className="edit-button" projectId={projectId}>
          Edit Project Information
        </EditButton>
      )}
      <JoinCard projectInfo={projectInfo} isPreview={isPreview} handleRefresh={handleRefresh} />
      {!isLogin && (
        <Button
          className="login-button"
          type="primary"
          icon={<img src={loginIcon} alt="login" />}
          onClick={() => login()}>
          Log in to view details
        </Button>
      )}
      {canEdit && <ProjectManagementCard projectInfo={projectInfo} />}
    </Flex>
  );
}

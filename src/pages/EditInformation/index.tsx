import { useCallback, useMemo } from 'react';
import { Form, message, Flex, Breadcrumb } from 'antd';
import { Button, Typography, FontWeightEnum } from 'aelf-design';
import { NavLink, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ProjectInfoFromJson } from 'pages/CreateProject/constants';
import { useTransfer } from 'pages/CreateProject/Transfer/useTransfer';
import { FormFields } from 'components/FormItem';
import { useEffectOnce } from 'react-use';
import CustomMark from 'pages/CreateProject/components/CustomMark';
import { urlString2FileList } from 'utils/format';
import { useUpdateAddition } from './useApi';
import { parseAdditionalInfo } from 'utils/project';
import './styles.less';
import { emitLoading } from 'utils/events';

const { Title } = Typography;

export default function EditInformation() {
  const [form] = Form.useForm();
  const { projectId } = useParams();
  const { getDetail } = useTransfer();
  const { updateAddition } = useUpdateAddition();
  const navigate = useNavigate();
  const location = useLocation();
  console.log('location', location);
  const { projectName } = useMemo(() => location.state as { projectName: string }, [location.state]);
  const breadList = useMemo(
    () => [
      {
        title: <NavLink to={'/projects/my'}>My Projects</NavLink>,
      },
      {
        title: <NavLink to={`/project/${projectId}`}>{projectName}</NavLink>,
      },
      {
        title: 'Update Project Information',
      },
    ],
    [projectId, projectName],
  );

  const onFinish = useCallback(
    async ({ logoUrl, projectImgs, ...value }: any) => {
      try {
        console.log('onUpdate-value', value);
        console.log('projectInfo', value);
        if (!logoUrl || logoUrl.length <= 0) {
          message.warning('Please upload logo image.');
          return;
        }

        if (!projectImgs || projectImgs.length < 3) {
          message.warning('Please upload 3 to 5 project images.');
          return;
        }

        if (!projectId) return message.error('projectId is needed.');

        emitLoading(true);
        const result = await updateAddition(projectId, {
          ...value,
          logoUrl: logoUrl.map((file) => file.url).join(),
          projectImgs: projectImgs.map((file) => file.url).join(),
        });
        emitLoading(false);

        if (result) {
          message.success('update success!');
          navigate(`/project/${projectId}`);
          return;
        }
      } catch (error: any) {
        emitLoading(false);
        message.error(error.message || 'update failed.');
      }
    },
    [navigate, projectId, updateAddition],
  );

  const getProjectInfo = useCallback(async () => {
    try {
      const result = await getDetail(projectId);
      const additional = parseAdditionalInfo(result.additionalInfo);

      additional &&
        form.setFieldsValue({
          ...additional,
          logoUrl: urlString2FileList(additional.logoUrl),
          projectImgs: urlString2FileList(additional.projectImgs),
        });
    } catch (error: any) {
      console.log('getProject-info-error', error);
      message.error(error?.message || 'ger project info failed');
    }
  }, [form, getDetail, projectId]);

  useEffectOnce(() => {
    getProjectInfo();
  });

  return (
    <div className=" common-page page-body edit-information">
      <Breadcrumb className="edit-breadcrumb" items={breadList} />
      <div className="edit-form">
        <Title level={5} fontWeight={FontWeightEnum.Medium}>
          Update Project Information
        </Title>
        <div className="project-info" style={{ margin: '48px 0 24px' }}>
          <Form
            layout="vertical"
            name="projectInfo"
            form={form}
            requiredMark={CustomMark}
            scrollToFirstError
            onFinish={onFinish}
            validateTrigger="onBlur">
            {FormFields(ProjectInfoFromJson)}
            <Form.Item>
              <Flex justify="center">
                <Button type="primary" htmlType="submit" style={{ width: 206 }}>
                  Update
                </Button>
              </Flex>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
}

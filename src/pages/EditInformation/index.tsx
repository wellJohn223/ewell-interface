import { useCallback, useMemo, useState } from 'react';
import { Form, message, Flex, Breadcrumb } from 'antd';
import { Button, Typography, FontWeightEnum } from 'aelf-design';
import { NavLink, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ProjectInfoFromJson } from 'pages/CreateProject/constants';
import { useTransfer } from 'pages/CreateProject/Transfer/useTransfer';
import { FormFields } from 'components/FormItem';
import { useEffectOnce, useSetState } from 'react-use';
import CustomMark from 'pages/CreateProject/components/CustomMark';
import { IAdditionalInfo, IProjectInfo } from 'pages/ProjectList/components/Card/types';
import { urlString2FileList } from 'utils/format';
import { useUpdateAddition } from './useApi';
import { parseAdditionalInfo } from 'utils/project';
import './styles.less';

const { Title, Text } = Typography;

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
        title: 'Edit Project Information',
      },
    ],
    [projectId, projectName],
  );

  const onFinish = useCallback(
    async ({ logoUrl, projectImgs, ...value }: any) => {
      console.log('onUpdate-value', value);

      const isSuccess = await updateAddition(projectId, {
        ...value,
        logoUrl: logoUrl.map((file) => file.url).join(),
        projectImgs: projectImgs.map((file) => file.url).join(),
      });

      if (isSuccess) {
        message.success('update success!');
        navigate(`/project/${projectId}`);
        return;
      }

      message.error('update failed');
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
          Edit Project Information
        </Title>
        <div className="project-info" style={{ margin: '48px 0 24px' }}>
          <Form
            layout="vertical"
            name="projectInfo"
            form={form}
            requiredMark={CustomMark}
            scrollToFirstError
            onFinish={onFinish}
            validateTrigger="onSubmit">
            {FormFields(ProjectInfoFromJson)}
            <Form.Item>
              <Flex justify="center">
                <Button type="primary" htmlType="submit" style={{ width: 206 }}>
                  Submit
                </Button>
              </Flex>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
}

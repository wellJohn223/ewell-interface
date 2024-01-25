import { useCallback } from 'react';
import { Form, message, Flex } from 'antd';
import { Button, Typography, FontWeightEnum } from 'aelf-design';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { ProjectInfoFromJson } from 'pages/CreateProject/constants';
import { useTransfer } from 'pages/CreateProject/Transfer/useTransfer';
import { FormFields } from 'components/FormItem';
import { useEffectOnce, useSetState } from 'react-use';
import CustomMark from 'pages/CreateProject/components/CustomMark';
import { IAdditionalInfo, IProjectInfo } from 'pages/ProjectList/components/Card/types';
import { urlString2FileList } from 'utils/format';
import { useUpdateAddition } from './useApi';
import { parseAdditionalInfo } from 'utils/project';
import Upload from 'components/Upload';
import './styles.less';

const { Title, Text } = Typography;

export default function EditInformation() {
  const { projectId } = useParams();
  const { getDetail } = useTransfer();
  const [form] = Form.useForm();
  const { updateAddition } = useUpdateAddition();
  const navigate = useNavigate();

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
    const result = await getDetail(projectId);

    if (result?.errMsg) {
      console.log('getProject-info-error', result.errMsg);
      return;
    }

    const additional = parseAdditionalInfo(result.additionalInfo);

    additional &&
      form.setFieldsValue({
        ...additional,
        logoUrl: urlString2FileList(additional.logoUrl),
        projectImgs: urlString2FileList(additional.projectImgs),
      });
  }, [form, getDetail, projectId]);

  useEffectOnce(() => {
    getProjectInfo();
  });

  return (
    <div className="common-page-1360 edit-information">
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
  );
}

import React, { useCallback, useEffect, useState } from 'react';
import { Upload, IUploadProps } from 'aelf-design';
import { GetProp, UploadFile, message } from 'antd';
import { emitLoading } from 'utils/events';
import { useAWSUploadService } from 'hooks/useAWSUploadService';

export type FileType = Parameters<GetProp<IUploadProps, 'beforeUpload'>>[0];

export interface IFUploadProps extends IUploadProps {
  maxFileCount?: number;
  fileLimit?: string;
  fileList?: UploadFile[];
}

const handleLimit = (limit: string) => {
  const unit_K = 1 * 1024;
  const unit_M = unit_K * 1024;

  if (limit.includes('M')) {
    return +limit.replace('M', '') * unit_M;
  }

  if (limit.includes('K')) {
    return +limit.replace('K', '') * unit_K;
  }

  return 10 * unit_M;
};
const FUpload: React.FC<IFUploadProps> = ({ fileList, maxFileCount, fileLimit = '10M', onChange, ...props }) => {
  const [showUploadBtn, setShowUploadBtn] = useState<boolean>(false);
  const [inFileList, setFileList] = useState<UploadFile[]>([]);
  const { awsUploadFile } = useAWSUploadService();

  useEffect(() => {
    if (!maxFileCount) return setShowUploadBtn(true);
    setShowUploadBtn(inFileList.length < maxFileCount);
  }, [inFileList, maxFileCount]);

  useEffect(() => {
    setFileList(fileList || []);
  }, [fileList]);

  const onFileChange: IFUploadProps['onChange'] = (info) => {
    const { fileList } = info;
    const newFileList = fileList.map((file) => {
      if (file.response) {
        file.url = file.response.url;
      }
      return file;
    });
    console.log('onFileChange', newFileList);
    onChange?.({ ...info, fileList: newFileList });
    setFileList(newFileList);
  };

  const onBeforeUpload = (file: FileType) => {
    const isLteLimit = file.size <= handleLimit(fileLimit);

    if (!isLteLimit) {
      message.error(`Image must smaller than ${fileLimit}B!`);
    }

    return isLteLimit;
  };

  const onCustomRequest: IUploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
    try {
      emitLoading(true, { text: 'uploading...' });
      const fileUrl = await awsUploadFile(file as File);
      emitLoading(false);
      console.log('awsUpload-success', fileUrl);
      onSuccess?.({ url: fileUrl });
    } catch (error) {
      onError?.(error as Error);
    }
  };

  return (
    <Upload
      {...props}
      fileList={inFileList}
      showUploadButton={showUploadBtn}
      customRequest={onCustomRequest}
      onChange={onFileChange}
      beforeUpload={onBeforeUpload}
    />
  );
};

export default FUpload;

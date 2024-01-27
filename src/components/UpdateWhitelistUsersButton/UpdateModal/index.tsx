import { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react';
import clsx from 'clsx';
import { Flex, Space } from 'antd';
import { Button, Upload, Input, Typography, FontWeightEnum } from 'aelf-design';
import { download } from 'assets/images';
import { UpdateType } from '../types';
import './styles.less';
import { parseWhitelistFile, parseWhitelistInput } from 'utils/parseWhiteList';
import CommonModalSwitchDrawer from 'components/CommonModalSwitchDrawer';

const { TextArea } = Input;
const { Text } = Typography;

interface IUpdateModalProps {
  updateType: UpdateType;
  modalOpen: boolean;
  onModalCancel: () => void;
  onModalSubmit: (params: string[]) => void;
}

enum UpdateWay {
  UPLOAD = 'upload',
  PASTE = 'paste',
}

export type UpdateModalInterface = {
  reset: () => void;
};

const UpdateModal = forwardRef(function (
  { updateType, modalOpen, onModalCancel, onModalSubmit }: IUpdateModalProps,
  ref,
) {
  const [currentUpdateWay, setCurrentUpdateWay] = useState<UpdateWay>(UpdateWay.UPLOAD);
  const [fileList, setFileList] = useState<any[]>([]);
  const [addressInput, setAddressInput] = useState<string>('');

  const file = useMemo(() => fileList?.[0]?.originFileObj, [fileList]);

  const handleUpload = useCallback(({ fileList }) => {
    setFileList(fileList);
  }, []);

  const onSubmit = useCallback(async () => {
    try {
      if (currentUpdateWay === UpdateWay.UPLOAD) {
        if (!file) return;
        const _uploadAddressList = await parseWhitelistFile(file);
        onModalSubmit(_uploadAddressList);
        return;
      }
      const _uploadAddressList = parseWhitelistInput(addressInput);
      onModalSubmit(_uploadAddressList);
    } catch (error) {
      // toast error
      console.log('UpdateModal error: ', error);
    }
  }, [addressInput, currentUpdateWay, file, onModalSubmit]);

  const isSubmitDisabled = useMemo(() => {
    if (currentUpdateWay === UpdateWay.UPLOAD) return !file;
    return addressInput.trim().length === 0;
  }, [addressInput, currentUpdateWay, file]);

  const handleAddressInputChange = useCallback((e) => {
    setAddressInput(e.target.value);
  }, []);

  const reset = useCallback(() => {
    setFileList([]);
    setAddressInput('');
  }, []);
  useImperativeHandle(ref, () => ({ reset }));

  return (
    <CommonModalSwitchDrawer
      className="update-whitelist-users"
      drawerClassName="update-whitelist-users-drawer"
      modalWidth={668}
      drawerHeight="100vh"
      title={updateType === UpdateType.ADD ? 'Add Users to Whitelist' : 'Remove Users from Whitelist'}
      open={modalOpen}
      onCancel={onModalCancel}>
      <Flex className="content-wrapper" vertical gap={24}>
        <Text>
          Please enter users' wallet addresses.
          <br />
          Batch input is supported, and you can separate addresses with special symbols such as "," or "|" and so on.
          <br />
          <br />
          If you have a list of addresses in CSV or EXCEL doc, you can import them via the "Upload" button.
          <br />
          Ewell also provides a template for you to fill in addresses and you can download it via the "Download
          Template" button.
          <Space className="download-template cursor-pointer" size={8} align="center">
            <img src={download} alt="download" />
            <Text className="purple-text" fontWeight={FontWeightEnum.Medium}>
              Download Template
            </Text>
          </Space>
        </Text>
        <Flex className="update-way-radio-wrapper cursor-pointer">
          <Flex
            className={clsx('radio-item', { 'radio-item-active': currentUpdateWay === UpdateWay.UPLOAD })}
            justify="center"
            align="center"
            onClick={() => setCurrentUpdateWay(UpdateWay.UPLOAD)}>
            <Text>Upload</Text>
          </Flex>
          <Flex
            className={clsx('radio-item', {
              'radio-item-active': currentUpdateWay === UpdateWay.PASTE,
            })}
            justify="center"
            align="center"
            onClick={() => setCurrentUpdateWay(UpdateWay.PASTE)}>
            <Text>Paste Address</Text>
          </Flex>
        </Flex>
        {currentUpdateWay === UpdateWay.UPLOAD && (
          <Upload
            className="address-upload"
            tips={
              <Flex className="address-upload-tips" vertical>
                <Text size="small">
                  Drag and drop or click to upload a list of addresses to{' '}
                  {updateType === UpdateType.ADD ? 'add' : 'remove'} in a batch.
                </Text>
                <Text size="small">Formats supported: CSV and EXCEL.</Text>
              </Flex>
            }
            showUploadButton={fileList.length === 0}
            accept=".csv, .xlsx, .xls"
            fileList={fileList}
            onChange={handleUpload}
          />
        )}
        {currentUpdateWay === UpdateWay.PASTE && (
          <TextArea
            value={addressInput}
            className="paste-address-textarea"
            placeholder="placeholder"
            onChange={handleAddressInputChange}
          />
        )}
        <Flex
          className={clsx('footer-wrapper', { ['flex-1']: currentUpdateWay === UpdateWay.UPLOAD })}
          gap={16}
          justify="center">
          <Button className="modal-footer-button" onClick={onModalCancel}>
            Cancel
          </Button>
          <Button className="modal-footer-button" type="primary" disabled={isSubmitDisabled} onClick={onSubmit}>
            Submit
          </Button>
        </Flex>
      </Flex>
    </CommonModalSwitchDrawer>
  );
});

export default UpdateModal;

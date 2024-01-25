import { useCallback, useMemo, useRef, useState } from 'react';
import { Flex } from 'antd';
import { Button, IButtonProps, Modal, Typography } from 'aelf-design';
import UpdateModal, { UpdateModalInterface } from './UpdateModal';
import AddressValidationModal from './AddressValidationModal';
import { emitLoading } from 'utils/events';
import { success } from 'assets/images';
import { UpdateType } from './types';
import './styles.less';
import Web3Button from 'components/Web3Button';
import { useViewContract } from 'contexts/useViewContract/hooks';
import {
  TWhitelistIdentifyItem,
  WhitelistAddressIdentifyStatusEnum,
  identifyWhitelistData,
} from 'utils/parseWhiteList';
import { useWallet } from 'contexts/useWallet/hooks';
import { NETWORK_CONFIG } from 'constants/network';

const { Text } = Typography;

interface IUpdateWhitelistUsersButtonProps {
  buttonProps: IButtonProps;
  updateType: UpdateType;
  whitelistId?: string;
  onSuccess?: () => void;
}

export default function UpdateWhitelistUsers({
  buttonProps,
  updateType,
  whitelistId,
  onSuccess,
}: IUpdateWhitelistUsersButtonProps) {
  const updateModalRef = useRef<UpdateModalInterface>();

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isAddressValidationModalOpen, setIsAddressValidationModalOpen] = useState(false);
  const [isUpdateSuccessModalOpen, setIsUpdateSuccessModalOpen] = useState(false);
  const [validationData, setValidationData] = useState<TWhitelistIdentifyItem[]>([]);
  const { wallet } = useWallet();
  const activeAddressList = useMemo(
    () =>
      validationData
        .filter((item) => item.status === WhitelistAddressIdentifyStatusEnum.active)
        .map((item) => item.address),
    [validationData],
  );

  const { getWhitelistUserList } = useViewContract();
  const onUpdateSubmit = useCallback(
    async (uploadAddressList: string[]) => {
      setIsUpdateModalOpen(false);

      emitLoading(true);
      try {
        const userList = await getWhitelistUserList(whitelistId || '');
        const userAddressList = userList.map((item) => item.address);

        const _validationData = await identifyWhitelistData({
          originData: userAddressList,
          identifyData: uploadAddressList,
          type: updateType,
        });
        setValidationData(_validationData);
      } catch (error) {
        // TODO: toast error
        console.log('onUpdateSubmit error', error);
      }
      emitLoading(false);

      setIsAddressValidationModalOpen(true);
    },
    [getWhitelistUserList, updateType, whitelistId],
  );

  const onValidationConfirm = useCallback(async () => {
    setIsAddressValidationModalOpen(false);
    emitLoading(true);
    try {
      const txResult = await wallet?.callContract({
        contractAddress: NETWORK_CONFIG.whitelistContractAddress,
        methodName:
          updateType === UpdateType.ADD ? 'AddAddressInfoListToWhitelist' : 'RemoveAddressInfoListFromWhitelist',
        args: {
          whitelistId,
          extraInfoIdList: {
            value: [
              {
                addressList: {
                  value: activeAddressList.map((item) => ({
                    address: item,
                  })),
                },
              },
            ],
          },
        },
      });
      console.log('txResult', txResult);

      setIsUpdateSuccessModalOpen(true);
      onSuccess?.();
    } catch (error) {
      // TODO: toast error
      console.log('onValidationConfirm error', error);
    }
    emitLoading(false);
  }, [activeAddressList, onSuccess, updateType, wallet, whitelistId]);

  const init = useCallback(() => {
    updateModalRef.current?.reset();
    setValidationData([]);
    setIsUpdateModalOpen(true);
  }, []);

  return (
    <>
      <Web3Button {...buttonProps} onClick={init} />
      <UpdateModal
        ref={updateModalRef}
        updateType={updateType}
        modalOpen={isUpdateModalOpen}
        onModalCancel={() => setIsUpdateModalOpen(false)}
        onModalSubmit={onUpdateSubmit}
      />
      <AddressValidationModal
        updateType={updateType}
        modalOpen={isAddressValidationModalOpen}
        validationData={validationData}
        onModalCancel={() => setIsAddressValidationModalOpen(false)}
        onModalConfirm={onValidationConfirm}
      />
      <Modal
        wrapClassName="whitelist-users-update-success-modal"
        title={`${updateType === UpdateType.ADD ? 'Added' : 'Removed'} Successfully`}
        footer={null}
        centered
        open={isUpdateSuccessModalOpen}>
        <Flex vertical gap={24} align="center">
          <Flex vertical gap={8} align="center">
            <img className="success-icon" src={success} alt="success" />
            <Text className="text-center">
              Successfully {updateType === UpdateType.ADD ? 'added' : 'removed'} {activeAddressList.length} users to the
              whitelist
            </Text>
          </Flex>
          <Button className="modal-single-button" type="primary" onClick={() => setIsUpdateSuccessModalOpen(false)}>
            OK
          </Button>
        </Flex>
      </Modal>
    </>
  );
}

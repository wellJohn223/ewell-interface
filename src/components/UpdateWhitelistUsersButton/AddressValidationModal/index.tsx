import { Flex } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Modal, Button, Typography, FontWeightEnum, Table, HashAddress } from 'aelf-design';
import { UpdateType } from '../types';
import './styles.less';
import { TWhitelistIdentifyItem, WhitelistAddressIdentifyStatusEnum } from 'utils/parseWhiteList';
import { useMemo } from 'react';
import { DEFAULT_CHAIN_ID } from 'constants/network';
import clsx from 'clsx';

interface IAddressValidationModalProps {
  updateType: UpdateType;
  modalOpen: boolean;
  onModalCancel: () => void;
  onModalConfirm: () => void;
  validationData: TWhitelistIdentifyItem[];
}

const { Text, Title } = Typography;
const ACTIVE_LABEL = 'Addable';
const columns: ColumnsType<any> = [
  {
    title: 'No.',
    dataIndex: 'order',
    key: 'order',
    width: 66,
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
    width: 236,
    render: (address) => (
      <HashAddress preLen={8} endLen={9} hasCopy={false} chain={DEFAULT_CHAIN_ID} address={address} />
    ),
  },
  {
    title: 'Results',
    dataIndex: 'result',
    key: 'result',
    width: 151,
    render: (result) => <Text className={clsx(result !== ACTIVE_LABEL && 'error-text')}>{result || '-'}</Text>,
  },
  {
    title: 'Reason',
    dataIndex: 'reason',
    key: 'reason',
    width: 167,
    render: (reason) => <Text>{reason || '-'}</Text>,
  },
];

const VALIDATION_STATUS_REASON_MAP = {
  [WhitelistAddressIdentifyStatusEnum.active]: '-',
  [WhitelistAddressIdentifyStatusEnum.exist]: 'Already Exist',
  [WhitelistAddressIdentifyStatusEnum.matchFail]: 'Match Fail',
  [WhitelistAddressIdentifyStatusEnum.notExist]: 'Not Exist',
  [WhitelistAddressIdentifyStatusEnum.repeat]: 'Duplicate Address',
};
export default function AddressValidationModal({
  updateType,
  modalOpen,
  onModalCancel,
  onModalConfirm,
  validationData,
}: IAddressValidationModalProps) {
  const data = useMemo(
    () =>
      validationData.map((item, idx) => ({
        key: `${idx + 1}`,
        order: `${idx + 1}`,
        address: item.address,
        result: item.status === WhitelistAddressIdentifyStatusEnum.active ? 'Addable' : 'Not Addable',
        reason: VALIDATION_STATUS_REASON_MAP[item.status],
      })),
    [validationData],
  );

  const attemptsNum = useMemo(() => validationData.length, [validationData]);
  const addableNum = useMemo(
    () => validationData.filter((item) => item.status === WhitelistAddressIdentifyStatusEnum.active).length,
    [validationData],
  );
  const nonAddableNum = useMemo(() => attemptsNum - addableNum, [attemptsNum, addableNum]);

  return (
    <Modal
      className="whitelist-users-address-validation-modal"
      title={`${updateType === UpdateType.ADD ? 'Add Allowlist' : 'Remove Whitelisted'} Users`}
      width={668}
      footer={null}
      centered
      open={modalOpen}
      onCancel={onModalCancel}>
      <Flex vertical gap={24}>
        <Flex vertical gap={8}>
          <Title fontWeight={FontWeightEnum.Medium}>Address validation results</Title>
          <Flex className="info-wrapper" vertical>
            <Flex className="info-row" justify="space-between" align="center">
              <Text>Total number of attempts to whitelist</Text>
              <Text fontWeight={FontWeightEnum.Medium}>{attemptsNum}</Text>
            </Flex>
            <Flex className="info-row" justify="space-between" align="center">
              <Text>
                Total number of whitelist users that can be {updateType === UpdateType.ADD ? 'added' : 'removed'}
              </Text>
              <Text fontWeight={FontWeightEnum.Medium}>{addableNum}</Text>
            </Flex>
            <Flex className="info-row" justify="space-between" align="center">
              <Text>
                Total number of non-{updateType === UpdateType.ADD ? 'addable' : 'removable'} whitelisted users
              </Text>
              <Text className="error-text" fontWeight={FontWeightEnum.Medium}>
                {nonAddableNum}
              </Text>
            </Flex>
          </Flex>
        </Flex>
        <Table scroll={{ y: 400 - 55 - 20 }} dataSource={data} columns={columns} />
        <Flex className="footer-wrapper" gap={16} justify="center">
          <Button onClick={onModalCancel}>Back</Button>
          <Button disabled={addableNum === 0} type="primary" onClick={onModalConfirm}>
            Confirmation
          </Button>
        </Flex>
      </Flex>
    </Modal>
  );
}

import { useState, useEffect, useCallback } from 'react';
import { Flex } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Button, Typography, FontWeightEnum, Table, HashAddress } from 'aelf-design';
import { UpdateType } from '../types';
import './styles.less';
import { TWhitelistIdentifyItem, WhitelistAddressIdentifyStatusEnum } from 'utils/parseWhiteList';
import { useMemo } from 'react';
import clsx from 'clsx';
import CommonModalSwitchDrawer from 'components/CommonModalSwitchDrawer';
import { useScreenSize } from 'contexts/useStore/hooks';
import { ScreenSize } from 'constants/theme';

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
    className: 'order-column',
    width: 66,
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
    className: 'address-column',
    width: 236,
    render: (address) => (
      <HashAddress ignorePrefixSuffix={true} preLen={8} endLen={9} hasCopy={false} address={address} />
    ),
  },
  {
    title: 'Results',
    dataIndex: 'result',
    key: 'result',
    className: 'result-column',
    width: 151,
    render: (result) => <Text className={clsx(result !== ACTIVE_LABEL && 'error-text')}>{result || '-'}</Text>,
  },
  {
    title: 'Reason',
    dataIndex: 'reason',
    key: 'reason',
    className: 'reason-column',
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

const WHITELIST_USERS_ADDRESS_VALIDATION_CONTENT_ID = 'whitelist-users-address-validation-content';
const DRAWER_CONTENT_TOTAL_PADDING = 24 * 2;
const TABLE_HEADER_HEIGHT = 48;
const MODAL_TABLE_HEIGHT = 400;

export default function AddressValidationModal({
  updateType,
  modalOpen,
  onModalCancel,
  onModalConfirm,
  validationData,
}: IAddressValidationModalProps) {
  const screenSize = useScreenSize();
  const isSwitchDrawer = useMemo(() => screenSize === ScreenSize.MINI || screenSize === ScreenSize.SMALL, [screenSize]);
  const [tableBodyHeight, setTableBodyHeight] = useState(0);

  const updateTableBodyHeight = useCallback(() => {
    const contentWrapper = document.querySelector(`#${WHITELIST_USERS_ADDRESS_VALIDATION_CONTENT_ID}`) as HTMLElement;
    const firstChild = contentWrapper?.firstChild as HTMLElement;
    const footer = contentWrapper?.lastChild as HTMLElement;
    if (contentWrapper && firstChild && footer) {
      const contentWrapperHeight = contentWrapper.offsetHeight;
      const firstChildHeight = firstChild.offsetHeight;
      const footerHeight = footer.offsetHeight;
      const newTableBodyHeight =
        contentWrapperHeight - firstChildHeight - footerHeight - DRAWER_CONTENT_TOTAL_PADDING - TABLE_HEADER_HEIGHT;
      setTableBodyHeight(newTableBodyHeight);
    }
  }, []);

  useEffect(() => {
    if (!isSwitchDrawer) {
      return;
    }
    updateTableBodyHeight();
    window.addEventListener('resize', updateTableBodyHeight);
    return () => {
      window.removeEventListener('resize', updateTableBodyHeight);
    };
  }, [updateTableBodyHeight, isSwitchDrawer]);

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
    <CommonModalSwitchDrawer
      className="whitelist-users-address-validation"
      drawerClassName="whitelist-users-address-validation-drawer"
      title={`${updateType === UpdateType.ADD ? 'Add Allowlist' : 'Remove Whitelisted'} Users`}
      modalWidth={668}
      drawerHeight="100vh"
      open={modalOpen}
      onCancel={onModalCancel}>
      <Flex id="whitelist-users-address-validation-content" className="content-wrapper" vertical gap={24}>
        <Flex vertical gap={8}>
          <Title fontWeight={FontWeightEnum.Medium}>Address validation results</Title>
          <Flex className="info-wrapper" vertical>
            <Flex className="info-row" justify="space-between" align="flex-start" gap={16}>
              <Text>Total number of attempts to whitelist</Text>
              <Text fontWeight={FontWeightEnum.Medium}>{attemptsNum}</Text>
            </Flex>
            <Flex className="info-row" justify="space-between" align="flex-start" gap={16}>
              <Text>
                Total number of whitelist users that can be {updateType === UpdateType.ADD ? 'added' : 'removed'}
              </Text>
              <Text fontWeight={FontWeightEnum.Medium}>{addableNum}</Text>
            </Flex>
            <Flex className="info-row" justify="space-between" align="flex-start" gap={16}>
              <Text>
                Total number of non-{updateType === UpdateType.ADD ? 'addable' : 'removable'} whitelisted users
              </Text>
              <Text className="error-text" fontWeight={FontWeightEnum.Medium}>
                {nonAddableNum}
              </Text>
            </Flex>
          </Flex>
        </Flex>
        <Table
          scroll={{
            x: 'max-content',
            y: isSwitchDrawer ? tableBodyHeight : MODAL_TABLE_HEIGHT - TABLE_HEADER_HEIGHT,
          }}
          dataSource={data}
          columns={columns}
        />
        <Flex className="footer-wrapper" gap={16} justify="center">
          <Button onClick={onModalCancel}>Back</Button>
          <Button disabled={addableNum === 0} type="primary" onClick={onModalConfirm}>
            Confirmation
          </Button>
        </Flex>
      </Flex>
    </CommonModalSwitchDrawer>
  );
}

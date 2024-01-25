import { useCallback, useMemo, useState } from 'react';
import { Flex, Breadcrumb } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { HashAddress, Search, Pagination, Typography, FontWeightEnum } from 'aelf-design';
import CommonTable from 'components/CommonTable';
import UpdateWhitelistUsersButton from 'components/UpdateWhitelistUsersButton';
import { UpdateType } from 'components/UpdateWhitelistUsersButton/types';
import { add, remove } from 'assets/images';
import './styles.less';
import { NavLink, useParams } from 'react-router-dom';
import { useEffectOnce } from 'react-use';
import { useViewContract } from 'contexts/useViewContract/hooks';
import { DEFAULT_CHAIN_ID } from 'constants/network';
import dayjs from 'dayjs';
import { useQuery } from 'hooks/useQuery';

const { Title, Text } = Typography;

const columns: ColumnsType<any> = [
  {
    title: 'No.',
    dataIndex: 'order',
    key: 'order',
  },
  {
    title: 'Address',
    dataIndex: 'address',
    key: 'address',
    render: (address) => <HashAddress address={address} chain={DEFAULT_CHAIN_ID} />,
  },
  {
    title: 'Add Time',
    dataIndex: 'time',
    key: 'time',
  },
];

const DEFAULT_PAGE_SIZE = 10;
type TAddressItem = {
  key: string;
  order: string;
  address: string;
  time: string;
};
export default function WhitelistUsers() {
  const [isTableLoading, setIsTableLoading] = useState(true);
  const { whitelistId = '' } = useParams();
  const { projectName = 'Project', projectId } = useQuery();
  const { getWhitelistUserList } = useViewContract();
  const [totalParticipants, setTotalParticipants] = useState<number>(0);

  const [pager, setPager] = useState({
    page: 1,
    total: 0,
  });
  const onPageChange = useCallback((page) => setPager((v) => ({ ...v, page })), []);
  const [totalAddressList, setTotalAddressList] = useState<TAddressItem[]>();

  const [searchAddress, setSearchAddress] = useState<string>('');
  const curAddressList = useMemo(() => {
    if (searchAddress) {
      return totalAddressList?.filter((item) => item.address === searchAddress) || [];
    }
    return totalAddressList?.slice((pager.page - 1) * DEFAULT_PAGE_SIZE, pager.page * DEFAULT_PAGE_SIZE) || [];
  }, [pager.page, searchAddress, totalAddressList]);

  const getWhitelistInfo = useCallback(async () => {
    setIsTableLoading(true);
    try {
      const addressList = await getWhitelistUserList(whitelistId);
      const userList: TAddressItem[] = addressList.map((item, idx) => ({
        key: `${idx + 1}`,
        order: `${idx + 1}`,
        address: item.address,
        time: dayjs(item.createTime ?? 0).format('HH:mm:ss DD/MM/YYYY'),
      }));

      setTotalAddressList(userList);
      setTotalParticipants(addressList.length);
      setPager({
        page: 1,
        total: addressList.length,
      });
    } catch (error) {
      console.log('getWhitelistInfo error', error);
    }
    setIsTableLoading(false);
  }, [getWhitelistUserList, whitelistId]);

  useEffectOnce(() => {
    getWhitelistInfo();
  });

  const onSearch = useCallback((e: any) => {
    const address = e.target.value.trim();
    if (address) {
      setSearchAddress(address);
    } else {
      setSearchAddress('');
    }
  }, []);

  const onClear = useCallback(() => {
    setSearchAddress('');
  }, []);

  const breadList = useMemo(
    () => [
      {
        title: <NavLink to={`/projects/my`}>My Projects</NavLink>,
      },
      {
        title: <NavLink to={`/project/${projectId}`}>{projectName}</NavLink>,
      },
      {
        title: 'Whitelist Users',
      },
    ],
    [projectName, projectId],
  );

  return (
    <div className="common-page page-body whitelist-users-wrapper">
      <Breadcrumb className="bread-wrap" items={breadList} />
      <Flex vertical gap={24}>
        <Title level={5} fontWeight={FontWeightEnum.Medium}>
          Whitelist Users
        </Title>
        <Flex justify="space-between" align="center">
          <Flex gap={16}>
            <UpdateWhitelistUsersButton
              buttonProps={{
                className: 'update-button',
                icon: <img src={add} alt="add" />,
                children: 'Add',
              }}
              updateType={UpdateType.ADD}
              whitelistId={whitelistId}
              onSuccess={getWhitelistInfo}
            />
            <UpdateWhitelistUsersButton
              buttonProps={{
                className: 'update-button',
                icon: <img src={remove} alt="remove" />,
                children: 'Remove',
              }}
              updateType={UpdateType.REMOVE}
              whitelistId={whitelistId}
              onSuccess={getWhitelistInfo}
            />
          </Flex>
          <Search inputClassName="address-search" placeholder="Address" onBlur={onSearch} onClear={onClear} />
        </Flex>

        <Flex vertical gap={16}>
          <CommonTable loading={isTableLoading} columns={columns} dataSource={curAddressList} />
          {!!pager.total && (
            <Flex justify="space-between" align="center">
              <Text size="small">
                Number of Participants Users:{' '}
                <Text size="small" fontWeight={FontWeightEnum.Medium}>
                  {totalParticipants}
                </Text>
              </Text>
              {!searchAddress && (
                <Pagination
                  current={pager.page}
                  total={pager.total}
                  showSizeChanger={false}
                  pageChange={onPageChange}
                  pageSize={DEFAULT_PAGE_SIZE}
                />
              )}
            </Flex>
          )}
        </Flex>
      </Flex>
    </div>
  );
}

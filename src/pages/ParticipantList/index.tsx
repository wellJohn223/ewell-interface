import { useCallback, useMemo, useRef, useState } from 'react';
import { Breadcrumb, Flex } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { HashAddress, Search, Pagination, Typography, FontWeightEnum } from 'aelf-design';
import CommonTable from 'components/CommonTable';
import './styles.less';
import { NavLink, useParams } from 'react-router-dom';
import { useEffectOnce } from 'react-use';
import { request } from 'api';
import { DEFAULT_CHAIN_ID } from 'constants/network';
import { divDecimalsStr } from 'utils/calculate';
import dayjs from 'dayjs';
import { useQuery } from 'hooks/useQuery';
import { stringifyUrl } from 'query-string';

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
    render: (address) => <HashAddress ignorePrefixSuffix={true} address={address} />,
  },
  {
    title: 'ELF',
    dataIndex: 'elfCount',
    key: 'elfCount',
  },
  {
    title: 'Time',
    dataIndex: 'time',
    key: 'time',
  },
];

type TParticipantItem = {
  key: string;
  order: string;
  address: string;
  elfCount: string;
  time: string;
};

const DEFAULT_PAGE_SIZE = 10;
export default function ParticipantList() {
  const [isTableLoading, setIsTableLoading] = useState(false);
  const { projectId = '' } = useParams();
  const [pager, setPager] = useState({
    page: 1,
    total: 0,
  });
  const [list, setList] = useState<TParticipantItem[]>([]);
  const [totalAmount, setTotalAmount] = useState<string>();
  const [totalUserCount, setTotalUserCount] = useState<number>(0);
  const isSearchRef = useRef<boolean>(false);
  const [isSearch, setIsSearch] = useState(false);

  const { projectName = 'Project' } = useQuery();

  const fetchTimeRef = useRef<number>();
  const getWhitelistInfo = useCallback(
    async (page = 1, address?: string) => {
      setIsTableLoading(true);
      try {
        let fetchTime = Date.now();
        fetchTimeRef.current = fetchTime;
        const skipCount = (page - 1) * DEFAULT_PAGE_SIZE;
        const { data } = await request.project.getProjectUserList({
          params: {
            chainId: DEFAULT_CHAIN_ID,
            projectId: projectId,
            skipCount: (page - 1) * DEFAULT_PAGE_SIZE,
            maxResultCount: DEFAULT_PAGE_SIZE,
            address: address,
          },
        });
        if (fetchTime < fetchTimeRef.current) return;
        console.log('data', data);
        isSearchRef.current = !!address;
        setIsSearch(!!address);
        const _list = data?.users?.map((item, idx) => ({
          key: `${skipCount + idx + 1}`,
          order: `${skipCount + idx + 1}`,
          address: item.address,
          elfCount: divDecimalsStr(item.investAmount, item.decimals || 8),
          time: dayjs(item.createTime ?? 0).format('HH:mm:ss DD/MM/YYYY'),
        }));
        setList(_list);
        setTotalAmount(divDecimalsStr(data?.totalAmount || ''));
        setTotalUserCount(data?.totalUser || 0);
        setPager({
          page,
          total: data.totalCount,
        });
      } catch (error) {
        console.log('getWhitelistInfo error', error);
      }
      setIsTableLoading(false);
    },
    [projectId],
  );

  useEffectOnce(() => {
    getWhitelistInfo();
  });

  const onPageChange = useCallback(
    (page) => {
      getWhitelistInfo(page);
    },
    [getWhitelistInfo],
  );

  const onSearch = useCallback(
    (e: any) => {
      const address = e.target.value.trim();
      if (address) {
        getWhitelistInfo(1, address);
      } else {
        getWhitelistInfo();
      }
    },
    [getWhitelistInfo],
  );

  const onClear = useCallback(() => {
    if (isSearchRef.current) {
      getWhitelistInfo();
    }
  }, [getWhitelistInfo]);

  const breadList = useMemo(
    () => [
      {
        title: <NavLink to={`/projects/my`}>My Projects</NavLink>,
      },
      {
        title: (
          <NavLink
            to={stringifyUrl({
              url: `/project/${projectId}`,
              query: {
                projectName,
              },
            })}>
            {projectName}
          </NavLink>
        ),
      },
      {
        title: 'Participants List',
      },
    ],
    [projectId, projectName],
  );

  return (
    <div className="common-page page-body participant-list-wrapper">
      <Breadcrumb className="bread-wrap" items={breadList}></Breadcrumb>
      <Flex className="participant-header" justify="space-between" align="flex-end">
        <Flex vertical>
          <Title level={5} fontWeight={FontWeightEnum.Medium}>
            Participants Users
          </Title>
          <Flex gap={8}>
            <Text>Contract Address: </Text>
            <HashAddress address="ELF_0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC_AELF" />
          </Flex>
        </Flex>
        <Search inputClassName="address-search" placeholder="Address" onBlur={onSearch} onClear={onClear} />
      </Flex>
      <CommonTable className="table" loading={isTableLoading} columns={columns} dataSource={list} />
      <Flex justify="space-between" align="center">
        <Flex gap={16}>
          <Text size="small">
            Number of Participants Users:{' '}
            <Text size="small" fontWeight={FontWeightEnum.Medium}>
              {totalUserCount}
            </Text>
          </Text>
          <Text size="small">
            Total ELF:{' '}
            <Text size="small" fontWeight={FontWeightEnum.Medium}>
              {totalAmount}
            </Text>
          </Text>
        </Flex>
        {!isSearch && (
          <Pagination
            current={pager.page}
            total={pager.total}
            pageSize={DEFAULT_PAGE_SIZE}
            showSizeChanger={false}
            pageChange={onPageChange}
          />
        )}
      </Flex>
    </div>
  );
}

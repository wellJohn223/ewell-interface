import React from 'react';
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useLocation, NavLink } from 'react-router-dom';
import { request } from 'api';
import { Breadcrumb, message } from 'antd';
import { Typography } from 'aelf-design';
import { WebLoginEvents, useWebLoginEvent } from 'aelf-web-login';
import ActionCard from './components/ActionCard';
import InfoWrapper from './components/InfoWrapper';
import { useMobile } from 'contexts/useStore/hooks';
import { useWallet } from 'contexts/useWallet/hooks';
import { useViewContract } from 'contexts/useViewContract/hooks';
import { DEFAULT_CHAIN_ID } from 'constants/network';
import { IProjectInfo, ProjectListType } from 'types/project';
import myEvents from 'utils/myEvent';
import { emitLoading } from 'utils/events';
import './styles.less';

interface IProjectInfoProps {
  previewData?: IProjectInfo;
  style?: React.CSSProperties;
}

const { Text } = Typography;

export default function ProjectInfo({ previewData, style }: IProjectInfoProps) {
  const isMobile = useMobile();
  const { wallet } = useWallet();
  const { projectId } = useParams();
  const location = useLocation();
  const { from = ProjectListType.ALL } = (location.state || {}) as { from?: ProjectListType };
  const { getWhitelistContract } = useViewContract();
  const isPreview = useMemo(() => !!previewData, [previewData]);
  const [messageApi, contextHolder] = message.useMessage();

  const [projectInfo, setProjectInfo] = useState<IProjectInfo>({});

  const addressRef = useRef<string>();
  addressRef.current = wallet?.walletInfo.address;

  const getProjectInfo = useCallback(async () => {
    emitLoading(true);
    try {
      const result = await request.project.getProjectList({
        params: {
          chainId: DEFAULT_CHAIN_ID,
          projectId,
        },
      });

      const detail = result?.data?.detail;
      console.log('detail: ', detail);
      const creator = detail?.creator;
      const isCreator = creator === addressRef.current;
      const whitelistId = detail?.whitelistId;

      console.log('isCreator', isCreator);
      let whitelistInfo;
      if (whitelistId) {
        const whitelistContract = await getWhitelistContract();
        whitelistInfo = await whitelistContract.GetWhitelist.call(whitelistId);
      }

      const whitelistAddressList =
        whitelistInfo?.extraInfoIdList?.value?.[0]?.addressList?.value
          ?.map((item) => item?.address)
          .filter((item) => !!item) || [];

      console.log('whitelistInfo', whitelistInfo);
      let newProjectInfo = {};
      if (detail) {
        newProjectInfo = {
          ...detail,
          additionalInfo: detail?.additionalInfo ? JSON.parse(detail.additionalInfo) : {},
          listMarketInfo: detail?.listMarketInfo ? JSON.parse(detail.listMarketInfo) : [],
          whitelistInfo,
          isCreator,
          isInWhitelist: whitelistAddressList.includes(addressRef.current),
        };
      }
      console.log('newProjectInfo: ', newProjectInfo);
      setProjectInfo(newProjectInfo);
    } catch (error: any) {
      console.log('getDetail error', error);
      messageApi.open({
        type: 'error',
        content: error?.message || 'Get detail failed',
      });
    } finally {
      emitLoading(false);
    }
  }, [getWhitelistContract, messageApi, projectId]);

  useEffect(() => {
    if (isPreview) {
      return;
    }
    getProjectInfo();
    const { remove } = myEvents.AuthToken.addListener(() => {
      console.log('login success');
      getProjectInfo();
    });
    return () => {
      remove();
    };
  }, [isPreview, getProjectInfo]);

  const info = useMemo(() => previewData || projectInfo, [previewData, projectInfo]);

  const showInfo = useMemo(() => !!Object.keys(info).length, [info]);

  const breadList = useMemo(
    () => [
      {
        title: <NavLink to={`/projects/${from}`}>{from === ProjectListType.MY && 'My '}Projects</NavLink>,
      },
      {
        title: projectInfo?.additionalInfo?.projectName || 'Project Info',
      },
    ],
    [projectInfo?.additionalInfo?.projectName, from],
  );

  const onLogout = useCallback(() => {
    console.log('onLogout');
    getProjectInfo();
  }, [getProjectInfo]);

  useWebLoginEvent(WebLoginEvents.LOGOUT, onLogout);

  return (
    <>
      {contextHolder}
      <div className="common-page page-body project-info-wrapper" style={style}>
        {!isPreview && <Breadcrumb className="bread-wrap" items={breadList} />}
        {showInfo && (
          <div className="flex project-info-content">
            <InfoWrapper projectInfo={info} />
            {!isMobile && <ActionCard projectInfo={info} isPreview={isPreview} handleRefresh={getProjectInfo} />}
          </div>
        )}
      </div>
    </>
  );
}

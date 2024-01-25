import { Button } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import './styles.less';
import { useWallet } from 'contexts/useWallet/hooks';
import Web3Button from 'components/Web3Button';
import { DEFAULT_CHAIN_ID, NETWORK_CONFIG } from 'constants/network';
import { getProtobufTime } from 'utils';
import { useViewContract } from 'contexts/useViewContract/hooks';
import { request } from 'api';
import myEvents from 'utils/myEvent';
import { WebLoginEvents, useWebLoginEvent } from 'aelf-web-login';
import { getLog } from 'utils/protoUtils';
import { mockCreateResult, walletAddressList } from './data';
import { ZERO } from 'constants/misc';
import { Input } from 'aelf-design';
import { useTokenPrice, useTxFee } from 'contexts/useAssets/hooks';
import { stringify } from 'query-string';
import { useLocation } from 'react-router-dom';

export default function Example() {
  const { login, logout, wallet, checkManagerSyncState } = useWallet();

  const { getTokenContract, getEwellContract, getWhitelistContract, checkIsNeedApprove } = useViewContract();
  const [projectId, setProjectId] = useState('15d556a57222ef06ea9a46a6fb9db416bffb98b8de60ccef6bcded8ca851f407');

  const { tokenPrice } = useTokenPrice();
  const { txFee } = useTxFee();
  useEffect(() => {
    console.log('tokenPrice', tokenPrice);
    console.log(
      'stringify(apiData)',
      stringify({
        projectName: '123',
      }),
    );
  }, [tokenPrice]);

  const { pathname } = useLocation();
  useEffect(() => {
    const _pathname = `${pathname}/`;
    console.log('pathname', pathname);
  }, [pathname]);

  const transfer = useCallback(async () => {
    try {
      const txResult: any = await wallet?.callContract({
        contractAddress: NETWORK_CONFIG.sideChainInfo.tokenContractAddress,
        methodName: 'Transfer',
        args: {
          symbol: 'LINHONG',
          to: '2R7QtJp7e1qUcfh2RYYJzti9tKpPheNoAGD7dTVFd4m9NaCh27',
          amount: '100',
          memo: '',
        },
      });

      console.log('txResult', txResult);
    } catch (error) {
      console.log('error', error);
    }
  }, [wallet]);

  const preCreate = useCallback(
    async (amount?: string) => {
      try {
        const ewellContract = await getEwellContract();
        const addressData = await ewellContract.GetPendingProjectAddress.call(wallet?.walletInfo.address);
        console.log('addressData', addressData);

        const txResult = await wallet?.callContract({
          contractAddress: NETWORK_CONFIG.sideChainInfo.tokenContractAddress,
          methodName: 'Transfer',
          args: {
            symbol: 'LINHONG',
            to: addressData,
            amount: amount || '10000',
            memo: '',
          },
        });

        console.log('txResult', txResult);
      } catch (error) {
        console.log('error', error);
      }
    },
    [getEwellContract, wallet],
  );

  const [endTime, setEndTime] = useState('');
  const create = useCallback(async () => {
    const endTimePb = getProtobufTime(Date.now() + (endTime === '' ? 40 * 60 : Number(endTime)) * 60 * 1000);
    const registerInput = {
      acceptedCurrency: 'ELF',
      projectCurrency: 'LINHONG',
      crowdFundingType: 'Sell at the set price',
      crowdFundingIssueAmount: '10000',
      preSalePrice: '1000',
      startTime: getProtobufTime(Date.now() + 60 * 1000),
      endTime: getProtobufTime(Date.now() + 60 * 1000 * 5),
      minSubscription: 1,
      maxSubscription: '10000',
      publicSalePrice: ZERO.plus('100000000').div(1.05).toFixed(), // preSalePrice / 1.05
      listMarketInfo: [], // fixed
      liquidityLockProportion: 0, // fixed
      unlockTime: getProtobufTime(Date.now() + 60 * 1000 * 6), // fixed
      tokenReleaseTime: getProtobufTime(Date.now() + 60 * 1000 * 6), // fixed
      isEnableWhitelist: true,
      isBurnRestToken: false,
      totalPeriod: 1, // fixed
      additionalInfo: {
        data: {
          projectName: 'Citizen Conflict',
          projectSummary:
            'The mobile game immerses players in a metaverse that bridges the virtual and physical worlds, DEFY fuses hyper casual code-breaking gameplay, with real world exploration and Augmented Reality (AR) adventures.',
          projectDescription:
            'The DEFY team believes that in order to make P&E sustainable for the long term, it is critical to wrap the earning mechanics in a fun, highly engaging game which is rewarding beyond just playing to earn. Using a rich narrative and introducing novel new features into the game, DEFY is built for the long term. Furthermore, the DEFY game economy has been built to harness the creativity of the community, via the upcoming creators platform which will allow users to burn $DEFY tokens in order to forge and create new NFT game assets which may be sold via a native marketplace. By doing this, DEFY is creating a platform that has the ability to absorb and distribute value in multiple ways. Location based play and earn game DEFY fuses hyper casual code breaking gameplay, real world exploration and AR adventures The mobile game immerses players in a metaverse that bridges the virtual and physical worlds, DEFY fuses hyper casual code-breaking gameplay, with real world exploration and Augmented Reality (AR) adventures. DEFY Labs is proud to announce the completion of their US$3.5m seed round led by Animoca Brands, liveXThe Spartan Group, GameFi Ventures, BIXIN, Polygon Studios, Unanimous Capital, PathDAO andPlay It Forward DAO DEFY’s in-game economy has been designed with scale and longevity in mind. A dual currency model is combined with an extensive set of customisable tradable game assets as well as multiple active and passive earning mechanisms that can be leveraged by the players. A creators platform will be added for content creators to collaborate with DEFY and bring NFTs into Augmented Reality. DEFY intends to bring PvP into DEFY which creates huge longevity.',
          x: 'https://www.google.com/',
          telegram: 'https://www.google.com/',
          medium: 'https://www.google.com/',
          logoUrl: '',
          projectImgs: 'url1,url2',
        },
      },
      firstDistributeProportion: '100000000', // fixed 100%
      restDistributeProportion: 0, // fixed
      periodDuration: 0, // fixed
    };
    console.log('registerInput', registerInput);

    try {
      const createResult = await wallet?.callContract<any, any>({
        contractAddress: NETWORK_CONFIG.ewellContractAddress,
        methodName: 'Register',
        args: registerInput,
      });
      console.log('create', createResult);
      const projectRegisteredInfo = getLog(createResult.Logs, 'ProjectRegistered');
      console.log('projectRegisteredInfo', projectRegisteredInfo);
      console.log('projectId', projectRegisteredInfo.ProjectRegistered.projectId);
    } catch (error) {
      console.log('error', error);
    }
  }, [endTime, wallet]);

  const getBalance = useCallback(async () => {
    const tokenContract = await getTokenContract();
    const result = await tokenContract.GetBalance.call({
      symbol: 'LINHONG',
      owner: 'vQfjcuW3RbGmkcL74YY4q3BX9UcH5rmwLmbQi3PsZxg8vE9Uk',
    });
    console.log('getBalance', result);
  }, [getTokenContract]);

  const getList = useCallback(async () => {
    try {
      const result = await request.project.getProjectList({
        params: { chainId: DEFAULT_CHAIN_ID, types: '1' },
      });
      console.log('getList', result);
    } catch (error) {
      console.log('error', error);
    }
  }, []);

  useEffect(() => {
    const { remove } = myEvents.AuthToken.addListener(() => {
      console.log('login success');
    });
    return () => {
      remove();
    };
  }, []);

  const onLogin = useCallback(() => {
    console.log('onLogin');
  }, []);
  useWebLoginEvent(WebLoginEvents.LOGINED, onLogin);

  const onLogout = useCallback(() => {
    console.log('onLogout');
  }, []);
  useWebLoginEvent(WebLoginEvents.LOGOUT, onLogout);

  const checkSync = useCallback(async () => {
    const isManagerSynced = await checkManagerSyncState();
    console.log('isManagerSynced', isManagerSynced);
  }, [checkManagerSyncState]);

  const getDetail = useCallback(async () => {
    try {
      const result = await request.project.getProjectList({
        params: {
          chainId: DEFAULT_CHAIN_ID,
          projectId,
        },
      });

      const detail = result?.data?.detail;
      const creator = detail?.creator;
      const isCreator = creator === wallet?.walletInfo.address;

      console.log('isCreator', isCreator);
      console.log('api detail', detail);

      const ewellContract = await getEwellContract();
      const projectInfo = await ewellContract.GetProjectInfo.call(projectId);
      console.log('contract detail', projectInfo);
    } catch (error) {
      console.log('getDetail error', error);
    }
  }, [getEwellContract, projectId, wallet?.walletInfo.address]);

  const invest = useCallback(async () => {
    const investAmount = '10000000';

    try {
      const approveResult = await wallet?.callContract({
        contractAddress: NETWORK_CONFIG.sideChainInfo.tokenContractAddress,
        methodName: 'Approve',
        args: {
          spender: NETWORK_CONFIG.ewellContractAddress,
          symbol: 'ELF',
          amount: investAmount,
        },
      });
      console.log('approveResult', approveResult);
    } catch (error) {
      console.log('error', error);
    }

    const times = 1;
    for (let i = 0; i < times; i++) {
      try {
        const investResult = await wallet?.callContract<any, any>({
          contractAddress: NETWORK_CONFIG.ewellContractAddress,
          methodName: 'Invest',
          args: {
            projectId,
            currency: 'ELF',
            investAmount: ZERO.plus(investAmount).div(times).toFixed(),
          },
        });
        console.log('investResult', investResult);
      } catch (error) {
        console.log('error', error);
      }
    }
  }, [projectId, wallet]);

  const getMockLog = useCallback(async () => {
    const projectRegisteredLog = getLog(mockCreateResult.Logs, 'ProjectRegistered');
    console.log('projectRegisteredLog', projectRegisteredLog);
  }, []);

  const getTokenList = useCallback(async () => {
    try {
      const result = await request.project.getTokenList({
        params: { chainId: DEFAULT_CHAIN_ID },
      });
      console.log('getTokenList', result);
    } catch (error) {
      console.log('error', error);
    }
  }, []);

  const getProjectUserList = useCallback(async () => {
    try {
      const result = await request.project.getProjectUserList({
        params: { chainId: DEFAULT_CHAIN_ID, projectId: projectId },
      });
      console.log('getProjectUserList', result);
    } catch (error) {
      console.log('error', error);
    }
  }, [projectId]);

  const openWhite = useCallback(async () => {
    try {
      const ewellContract = await getEwellContract();
      const whitelistId = await ewellContract.GetWhitelistId.call(projectId);
      console.log('whitelistId', whitelistId);

      const txResult = await wallet?.callContract({
        contractAddress: NETWORK_CONFIG.whitelistContractAddress,
        methodName: 'EnableWhitelist',
        // methodName: 'DisableWhitelist',
        args: whitelistId,
      });
      console.log('txResult', txResult);
    } catch (error) {
      console.log('openWhite', error);
    }
  }, [getEwellContract, projectId, wallet]);

  const getWhite = useCallback(async () => {
    try {
      const ewellContract = await getEwellContract();
      const whitelistId = await ewellContract.GetWhitelistId.call(projectId);
      console.log('whitelistId', whitelistId);
      const whitelistContract = await getWhitelistContract();
      const whitelistDetail = await whitelistContract.GetWhitelist.call(whitelistId);
      console.log('whitelistDetail', whitelistDetail);
    } catch (error) {
      console.log('getWhite', error);
    }
  }, [getEwellContract, getWhitelistContract, projectId]);

  const updateAddition = useCallback(async () => {
    try {
      const result = await wallet?.callContract<any, any>({
        contractAddress: NETWORK_CONFIG.ewellContractAddress,
        methodName: 'UpdateAdditionalInfo',
        args: {
          projectId: projectId,
          additionalInfo: {
            data: {
              name: `testName${Date.now()}`,
              value: `testValue${Date.now()}`,
            },
          },
        },
      });
      console.log('updateAddition result', result);
    } catch (error) {
      console.log('updateAddition error', error);
    }
  }, [projectId, wallet]);

  const addWhitelist = useCallback(async () => {
    const ewellContract = await getEwellContract();
    const whitelistId = await ewellContract.GetWhitelistId.call(projectId);
    const txResult = await wallet?.callContract({
      contractAddress: NETWORK_CONFIG.whitelistContractAddress,
      methodName: 'AddAddressInfoListToWhitelist',
      args: {
        whitelistId,
        extraInfoIdList: {
          value: [
            {
              addressList: {
                value: ['ELF_2R7QtJp7e1qUcfh2RYYJzti9tKpPheNoAGD7dTVFd4m9NaCh27_tDVV', ...walletAddressList].map(
                  (item) => ({
                    address: item,
                  }),
                ),
              },
            },
          ],
        },
      },
    });
    console.log('txResult', txResult);
  }, [getEwellContract, projectId, wallet]);

  const getWhitelistDetail = useCallback(async () => {
    const ewellContract = await getEwellContract();
    const whitelistId = await ewellContract.GetWhitelistId.call(projectId);
    console.log('whitelistId', whitelistId);
    const whitelistContract = await getWhitelistContract();
    console.log('whitelistContract', whitelistContract);
    const whitelistDetail = await whitelistContract.GetWhitelistDetail.call(whitelistId);
    console.log('getWhitelistDetail ', whitelistDetail);
  }, [getEwellContract, getWhitelistContract, projectId]);

  const shouldApproveLocal = useCallback(async () => {
    const result = await checkIsNeedApprove({
      symbol: 'ELF',
      owner: wallet?.walletInfo.address || '',
      amount: '1000000000',
      spender: NETWORK_CONFIG.ewellContractAddress,
    });
    console.log('shouldApproveLocal', result);
  }, [checkIsNeedApprove, wallet]);

  return (
    <div>
      <Web3Button
        onClick={() => {
          console.log('jump');
        }}>
        Launch with EWELL
      </Web3Button>
      <Input
        value={projectId}
        onChange={(e) => {
          setProjectId(e.target.value);
        }}></Input>
      <Input
        value={endTime}
        placeholder="endTime: min"
        onChange={(e) => {
          setEndTime(e.target.value);
        }}></Input>
      <div>
        <Button
          onClick={() => {
            preCreate();
          }}>
          preCreate
        </Button>
        <Button onClick={create}>create</Button>
        <Button onClick={getList}>getList</Button>
        <Button onClick={getDetail}>getDetail</Button>
        <Button onClick={invest}>invest</Button>
        <Button onClick={openWhite}>openWhite</Button>
        <Button onClick={getWhite}>getWhite</Button>
        <Button onClick={updateAddition}>updateAddition</Button>
      </div>
      <div>
        <Button onClick={transfer}>transfer</Button>
        <Button onClick={checkSync}>checkSync</Button>
        <Button type="primary" onClick={getBalance}>
          balance
        </Button>
        <Button type="primary" onClick={getMockLog}>
          getMockLog
        </Button>
        <Button type="primary" onClick={getTokenList}>
          getTokenList
        </Button>
        <Button type="primary" onClick={getProjectUserList}>
          getProjectUserList
        </Button>
        <Button type="primary" onClick={shouldApproveLocal}>
          checkIsNeedApprove
        </Button>
      </div>
      <div>
        <Button onClick={addWhitelist}>addWhitelist</Button>
        <Button onClick={getWhitelistDetail}>getWhitelistDetail</Button>
      </div>

      <Button
        type="primary"
        onClick={() => {
          login();
        }}>
        login
      </Button>
      <Button
        type="primary"
        onClick={() => {
          logout();
        }}>
        logout
      </Button>
    </div>
  );
}

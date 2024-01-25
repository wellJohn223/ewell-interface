import { DEFAULT_CHAIN_ID, NETWORK_CONFIG } from 'constants/network';
import { useWallet } from 'contexts/useWallet/hooks';
import { useCallback } from 'react';
import { getLog } from 'utils/protoUtils';
import { request } from 'api';
import { divDecimals } from 'utils/calculate';
import { getInfo } from '../utils';
import { handleLoopFetch } from 'utils';

export const useTransfer = () => {
  const { wallet } = useWallet();

  const preCreate = useCallback(
    async (params: { amount: string; symbol: string }) => {
      try {
        console.log('pre-create-txResult-params', params);
        const txResult = await wallet?.callContract({
          contractAddress: NETWORK_CONFIG.sideChainInfo.tokenContractAddress,
          methodName: 'Approve',
          args: {
            spender: NETWORK_CONFIG.ewellContractAddress,
            symbol: params.symbol,
            amount: params.amount,
          },
        });

        console.log('pre-create-txResult', txResult);
        return txResult;
      } catch (error: any) {
        console.log('preCreate error', error);
        return { errMsg: error?.message || error?.error.message };
      }
    },
    [wallet],
  );

  const create = useCallback(
    async (params: any) => {
      console.log('create-params', params);

      try {
        const createResult = await wallet?.callContract<any, any>({
          contractAddress: NETWORK_CONFIG.ewellContractAddress,
          methodName: 'Register',
          args: { ...params },
        });
        console.log('createResult', createResult);
        const projectRegisteredInfo = getLog(createResult.Logs, 'ProjectRegistered');
        console.log('projectRegisteredInfo', projectRegisteredInfo);
        console.log('projectId', projectRegisteredInfo.ProjectRegistered.projectId);
        return { projectId: projectRegisteredInfo.ProjectRegistered.projectId };
      } catch (error: any) {
        console.log('Create error', error);

        return { errMsg: error?.message || error?.error.message };
      }
    },
    [wallet],
  );

  const getDetail = useCallback(async (projectId) => {
    try {
      console.log('getDetail', projectId);
      const result = await request.project.getProjectList({
        params: {
          chainId: DEFAULT_CHAIN_ID,
          projectId,
        },
      });

      return result?.data?.detail || { errMsg: 'not get' };
    } catch (error: any) {
      return { errMsg: error?.message || error?.error.message };
    }
  }, []);

  const register = useCallback(
    async ({ tradingPair, idoInfo, additional }: { tradingPair: any; idoInfo: any; additional: any }) => {
      try {
        const info = getInfo(tradingPair, idoInfo, additional);
        console.log('create-params', info);
        const txResult: any = await preCreate({
          amount: info.crowdFundingIssueAmount,
          symbol: info.projectCurrency,
        });
        if (txResult?.errMsg) {
          return { errMsg: txResult.errMsg };
        }
        const { TransactionId: transactionId } = txResult;
        const createResult = await create(info);
        if (createResult?.errMsg) {
          return { errMsg: createResult.errMsg };
        }

        const projectId = createResult.projectId;
        const { errMsg, crowdFundingIssueToken, crowdFundingIssueAmount } = await handleLoopFetch({
          fetch: () => getDetail(projectId),
          times: 30,
          interval: 2000,
          checkIsContinue: (detail) => {
            return !!detail?.errMsg;
          },
        });
        if (errMsg) {
          return { errMsg };
        }

        return {
          projectId,
          transactionId,
          supply: divDecimals(crowdFundingIssueAmount, crowdFundingIssueToken.decimals).toFixed(),
        };
      } catch (error: any) {
        return { errMsg: error?.message || error?.error.message };
      }
    },
    [create, getDetail, preCreate],
  );

  return { register, preCreate, create, getDetail };
};

import { useWallet } from 'contexts/useWallet/hooks';
import { useCallback } from 'react';
import { NETWORK_CONFIG } from 'constants/network';
import { message } from 'antd';

export const useUpdateAddition = () => {
  const { wallet } = useWallet();

  const updateAddition = useCallback(
    async function (projectId?: string, data?: { [key: string]: string }) {
      try {
        if (!projectId) return;
        console.log('addition-data', data);
        const result = await wallet?.callContract<any, any>({
          contractAddress: NETWORK_CONFIG.ewellContractAddress,
          methodName: 'UpdateAdditionalInfo',
          args: {
            projectId: projectId,
            additionalInfo: {
              data: data || {},
            },
          },
        });
        console.log('update infomation', result);
        return true;
      } catch (error) {
        console.log('update infomation error', error);
        return false;
      }
    },
    [wallet],
  );

  return { updateAddition };
};

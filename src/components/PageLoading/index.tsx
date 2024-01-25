import { useState, useCallback, useEffect } from 'react';
import { eventBus } from 'aelf-web-login';
import { Flex } from 'antd';
import { Loading } from 'aelf-design';
import SandGlassLoading from 'components/SandGlassLoading';
import { SET_GLOBAL_LOADING } from 'constants/events';

export interface ILoadingInfo {
  isLoading: boolean;
  text: string;
}

const DEFAULT_LOADING_TEXT = 'Loading...';

export default function PageLoading() {
  const [loadingInfo, setLoadingInfo] = useState<ILoadingInfo>({
    isLoading: false,
    text: DEFAULT_LOADING_TEXT,
  });

  const setLoadingHandler = useCallback(({ isLoading, text }: ILoadingInfo) => {
    setLoadingInfo({
      isLoading,
      text: text ?? DEFAULT_LOADING_TEXT,
    });
  }, []);

  useEffect(() => {
    eventBus.addListener(SET_GLOBAL_LOADING, setLoadingHandler);
    return () => {
      eventBus.removeListener(SET_GLOBAL_LOADING, setLoadingHandler);
    };
  }, [setLoadingHandler]);

  return (
    <Loading
      open={loadingInfo.isLoading}
      content={
        <Flex gap={8}>
          <SandGlassLoading />
          {!!loadingInfo.text && <span>{loadingInfo.text}</span>}
        </Flex>
      }
    />
  );
}

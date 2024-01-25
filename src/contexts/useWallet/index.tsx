import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react';

import { TWalletContextState } from './types';
import {
  WebLoginProvider,
  WebLoginState,
  useWebLoginEvent,
  WebLoginEvents,
  setGlobalConfig,
  PortkeyProvider,
  useWebLoginContext,
  WebLoginContextType,
  useWebLogin,
} from 'aelf-web-login';
import Wallet from './Wallet';
import { IWallet } from './Wallet/types';
import { DEFAULT_CHAIN_ID, NETWORK_CONFIG } from 'constants/network';
import { authToken, clearLocalJWT } from './utils';
import myEvents from 'utils/myEvent';
import { useLocation } from 'react-use';
import { useNavigate } from 'react-router-dom';
import { checkPathExist } from 'utils/reg';

const APPNAME = 'explorer.aelf.io';

setGlobalConfig({
  appName: APPNAME,
  chainId: DEFAULT_CHAIN_ID,
  networkType: NETWORK_CONFIG.networkType as any,
  portkey: {
    useLocalStorage: true,
    graphQLUrl: NETWORK_CONFIG.webLoginGraphqlUrl,
    requestDefaults: {
      baseURL: NETWORK_CONFIG.webLoginRequestDefaultsUrl,
    },
    connectUrl: NETWORK_CONFIG.webLoginConnectUrl,
    // socialLogin: {
    //   Portkey: {
    //     websiteName: APPNAME,
    //     websiteIcon: WEBSITE_ICON,
    //   },
    // },
  } as any,
  aelfReact: {
    appName: APPNAME,
    nodes: {
      AELF: {
        chainId: 'AELF',
        rpcUrl: NETWORK_CONFIG.mainChainInfo.endPoint,
      },
      tDVW: {
        chainId: 'tDVW',
        rpcUrl: NETWORK_CONFIG.sideChainInfo.endPoint,
      },
      tDVV: {
        chainId: 'tDVV',
        rpcUrl: NETWORK_CONFIG.sideChainInfo.endPoint,
      },
    },
  },
  defaultRpcUrl: 'https://explorer.aelf.io/chain',
});

export const DESTROY = 'DESTROY';
const SET_WALLET = 'SET_WALLET';

const INITIAL_STATE = {};
const WalletContext = createContext<any>(INITIAL_STATE);

export function useWalletContext(): [TWalletContextState, React.Dispatch<any>] {
  return useContext(WalletContext);
}

//reducer
function reducer(state: any, { type, payload }: any) {
  switch (type) {
    case SET_WALLET: {
      return {
        ...state,
        wallet: payload,
      };
    }
    case DESTROY: {
      return {};
    }
    default: {
      return Object.assign({}, state, payload);
    }
  }
}

const LOGOUT_STAY_PATH = ['example', 'project', 'projects/all'];
export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const webLoginContext = useWebLoginContext();
  const webLoginContextRef = useRef<WebLoginContextType>(webLoginContext);
  webLoginContextRef.current = webLoginContext;
  const { logout } = useWebLogin();

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const { wallet } = state;
  if (webLoginContext.loginState === WebLoginState.logined && wallet && webLoginContext.callContract) {
    webLoginContext.callContract && (wallet as IWallet).setCallContract(webLoginContext.callContract);
    webLoginContext.getSignature && (wallet as IWallet).setGetSignature(webLoginContext.getSignature);
  }

  const onLogin = useCallback(() => {
    console.log('onLogin');
    const _webLoginContext = webLoginContextRef.current;
    const wallet = new Wallet({
      walletInfo: _webLoginContext.wallet,
      walletType: _webLoginContext.walletType,
      callContract: _webLoginContext.callContract,
      getSignature: _webLoginContext.getSignature,
    });
    dispatch({
      type: SET_WALLET,
      payload: wallet,
    });
    authToken(wallet);
  }, []);

  useWebLoginEvent(WebLoginEvents.LOGINED, onLogin);

  const onLogout = useCallback(() => {
    console.log('onLogout');
    dispatch({
      type: SET_WALLET,
      payload: undefined,
    });
    clearLocalJWT();

    const isStay = checkPathExist(LOGOUT_STAY_PATH, pathnameRef.current || '');
    if (!isStay) {
      navigate('/', { replace: true });
    }
  }, [navigate]);
  useWebLoginEvent(WebLoginEvents.LOGOUT, onLogout);

  // TODO: remove
  useEffect(() => {
    console.log('wallet state', state);
  }, [state]);

  const onAuthorizationExpired = useCallback(() => {
    if (webLoginContext.loginState !== WebLoginState.logined) {
      console.log('AuthorizationExpired: Not Logined');
      return;
    }
    clearLocalJWT();
    console.log('AuthorizationExpired');
    authToken(wallet);
  }, [wallet, webLoginContext.loginState]);
  const onAuthorizationExpiredRef = useRef(onAuthorizationExpired);
  onAuthorizationExpiredRef.current = onAuthorizationExpired;

  useEffect(() => {
    const { remove } = myEvents.AuthorizationExpired.addListener(() => {
      onAuthorizationExpiredRef.current?.();
    });
    return () => {
      remove();
    };
  }, [wallet]);

  return (
    <WalletContext.Provider value={useMemo(() => [state, dispatch], [state, dispatch])}>
      {children}
    </WalletContext.Provider>
  );
}

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <PortkeyProvider networkType={'MAIN'}>
      <WebLoginProvider
        nightElf={{
          connectEagerly: true,
        }}
        portkey={{
          autoShowUnlock: true,
          checkAccountInfoSync: true,
        }}
        discover={{
          autoRequestAccount: true,
          autoLogoutOnDisconnected: true,
          autoLogoutOnNetworkMismatch: true,
          autoLogoutOnAccountMismatch: true,
          autoLogoutOnChainMismatch: true,
          onPluginNotFound: (openStore) => {
            console.log('openStore:', openStore);
            openStore();
          },
        }}
        extraWallets={['discover', 'elf']}>
        <WalletProvider>{children}</WalletProvider>
      </WebLoginProvider>
    </PortkeyProvider>
  );
}

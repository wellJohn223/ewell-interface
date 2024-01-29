import { NetworkType } from '@portkey/did-ui-react';
import { ChainId } from '@portkey/types';

export type TNetworkConfig = {
  networkType: NetworkType;
  mainChainId: string;
  sideChainId: string;
  webLoginNetworkType: 'MAIN' | 'TESTNET';
  webLoginGraphqlUrl: string;
  webLoginRequestDefaultsUrl: string;
  webLoginConnectUrl: string;
  ewellContractAddress: string;
  whitelistContractAddress: string;
  symbolMarketUrl: string;
  mainChainInfo: {
    chainId: string;
    exploreUrl: string;
    endPoint: string;
    caContractAddress: string;
    tokenContractAddress: string;
  };
  sideChainInfo: {
    chainId: string;
    exploreUrl: string;
    endPoint: string;
    caContractAddress: string;
    tokenContractAddress: string;
  };
};

const NETWORK_CONFIG_LIST: Record<string, TNetworkConfig> = {
  mainnet: {
    networkType: 'MAINNET',
    mainChainId: 'AELF',
    sideChainId: 'tDVV',
    webLoginNetworkType: 'MAIN',
    webLoginGraphqlUrl: 'https://dapp-portkey.portkey.finance/Portkey_DID/PortKeyIndexerCASchema/graphql',
    webLoginRequestDefaultsUrl: 'https://did-portkey.portkey.finance',
    webLoginConnectUrl: 'https://auth-portkey.portkey.finance',
    ewellContractAddress: '',
    whitelistContractAddress: '',
    symbolMarketUrl: '',
    mainChainInfo: {
      chainId: 'AELF',
      exploreUrl: 'https://explorer.aelf.io/',
      endPoint: '',
      caContractAddress: '',
      tokenContractAddress: 'JRmBduh4nXWi1aXgdUsj5gJrzeZb2LxmrAbf7W99faZSvoAaE',
    },
    sideChainInfo: {
      chainId: 'tDVV',
      exploreUrl: 'https://tdvv-explorer.aelf.io/',
      endPoint: '',
      caContractAddress: '',
      tokenContractAddress: '',
    },
  },
  testnet: {
    networkType: 'TESTNET',
    mainChainId: 'AELF',
    sideChainId: 'tDVW',
    webLoginNetworkType: 'TESTNET',
    webLoginGraphqlUrl: 'https://dapp-portkey.portkey.finance/Portkey_DID/PortKeyIndexerCASchema/graphql',
    webLoginRequestDefaultsUrl: '',
    webLoginConnectUrl: 'https://auth-portkey-test.portkey.finance',
    ewellContractAddress: '',
    whitelistContractAddress: '',
    symbolMarketUrl: '',
    mainChainInfo: {
      chainId: 'AELF',
      exploreUrl: '',
      endPoint: '',
      caContractAddress: '',
      tokenContractAddress: '',
    },
    sideChainInfo: {
      chainId: 'tDVW',
      exploreUrl: '',
      endPoint: '',
      caContractAddress: '',
      tokenContractAddress: '',
    },
  },
  test3: {
    networkType: 'TESTNET',
    mainChainId: 'AELF',
    sideChainId: 'tDVV',
    webLoginNetworkType: 'TESTNET',
    webLoginGraphqlUrl: '/AElfIndexer_DApp/PortKeyIndexerCASchema/graphql',
    webLoginRequestDefaultsUrl: '/webLoginRequest',
    webLoginConnectUrl: '/webLoginConnect',
    ewellContractAddress: 'mhgUyGhd27YaoG8wgXTbwtbAiYx7E59n5GXEkmkTFKKQTvGnB',
    whitelistContractAddress: 'x4CTSuM8typUbpdfxRZDTqYVa42RdxrwwPkXX7WUJHeRmzE6k',
    symbolMarketUrl: 'http://192.168.67.124:3001/symbolmarket',
    mainChainInfo: {
      chainId: 'AELF',
      exploreUrl: 'http://192.168.66.3:8000/',
      endPoint: 'http://192.168.66.3:8000',
      caContractAddress: '2RpNgskXSDgzp3v9VVuciudQQo6ZxSgsXftot3TzN5ncKxs73k',
      tokenContractAddress: 'JRmBduh4nXWi1aXgdUsj5gJrzeZb2LxmrAbf7W99faZSvoAaE',
    },
    sideChainInfo: {
      chainId: 'tDVV',
      exploreUrl: 'http://192.168.66.241:8000/',
      endPoint: 'http://192.168.66.241:8000',
      caContractAddress: '2RpNgskXSDgzp3v9VVuciudQQo6ZxSgsXftot3TzN5ncKxs73k',
      tokenContractAddress: '7RzVGiuVWkvL4VfVHdZfQF2Tri3sgLe9U991bohHFfSRZXuGX',
    },
  },
};

export const NETWORK_CONFIG = NETWORK_CONFIG_LIST[process.env.REACT_APP_NETWORK_KEY || ''];

export const DEFAULT_CHAIN_ID = NETWORK_CONFIG_LIST['test3'].sideChainId as ChainId;

export const IS_OFFLINE_NETWORK = process.env.REACT_APP_NETWORK_KEY === 'test3';

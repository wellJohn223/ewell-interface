import { ChainId } from '@portkey/types';

const NETWORK_CONFIG_LIST = {
  mainnet: {
    networkType: 'MAIN',
    mainChainId: 'AELF',
    sideChainId: 'tDVV',
    webLoginGraphqlUrl: 'https://dapp-portkey.portkey.finance/Portkey_DID/PortKeyIndexerCASchema/graphql',
    webLoginRequestDefaultsUrl: 'https://did-portkey.portkey.finance',
    webLoginConnectUrl: 'https://auth-portkey.portkey.finance',
    ewellContractAddress: '',
    whitelistContractAddress: '',
    mainChainInfo: {
      chainId: 'AELF',
      exploreUrl: 'https://explorer.aelf.io/',
      endPoint: '',
      caContractAddress: '',
      tokenContractAddress: 'JRmBduh4nXWi1aXgdUsj5gJrzeZb2LxmrAbf7W99faZSvoAaE',
    },
    sideChainInfo: {
      chainId: 'tDVV',
      exploreUrl: '',
      endPoint: '',
      caContractAddress: '',
      tokenContractAddress: '',
    },
  },
  testnet: {
    networkType: 'TESTNET',
    mainChainId: 'AELF',
    sideChainId: 'tDVW',
    webLoginGraphqlUrl: 'https://dapp-portkey.portkey.finance/Portkey_DID/PortKeyIndexerCASchema/graphql',
    webLoginConnectUrl: 'https://auth-portkey-test.portkey.finance',
    ewellContractAddress: '',
    whitelistContractAddress: '',
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
    networkType: 'MAIN',
    mainChainId: 'AELF',
    sideChainId: 'tDVV',
    webLoginGraphqlUrl: '/AElfIndexer_DApp/PortKeyIndexerCASchema/graphql',
    webLoginRequestDefaultsUrl: '/webLoginRequest',
    webLoginConnectUrl: '/webLoginConnect',
    ewellContractAddress: 'mhgUyGhd27YaoG8wgXTbwtbAiYx7E59n5GXEkmkTFKKQTvGnB',
    whitelistContractAddress: 'x4CTSuM8typUbpdfxRZDTqYVa42RdxrwwPkXX7WUJHeRmzE6k',
    symbolMarket: 'http://192.168.67.124:3001/symbolmarket',
    mainChainInfo: {
      chainId: 'AELF',
      exploreUrl: 'http://192.168.67.156:8000',
      endPoint: 'http://192.168.66.3:8000',
      caContractAddress: '2LUmicHyH4RXrMjG4beDwuDsiWJESyLkgkwPdGTR8kahRzq5XS',
      tokenContractAddress: 'JRmBduh4nXWi1aXgdUsj5gJrzeZb2LxmrAbf7W99faZSvoAaE',
    },
    sideChainInfo: {
      chainId: 'tDVV',
      exploreUrl: 'http://192.168.66.113:8000',
      endPoint: 'http://192.168.66.241:8000',
      caContractAddress: 'RXcxgSXuagn8RrvhQAV81Z652EEYSwR6JLnqHYJ5UVpEptW8Y',
      tokenContractAddress: '7RzVGiuVWkvL4VfVHdZfQF2Tri3sgLe9U991bohHFfSRZXuGX',
    },
  },
};

export const NETWORK_CONFIG = NETWORK_CONFIG_LIST[process.env.REACT_APP_NETWORK_KEY || ''];

export const DEFAULT_CHAIN_ID = NETWORK_CONFIG_LIST['test3'].sideChainId as ChainId;

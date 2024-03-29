import { NetworkType } from '@portkey/did-ui-react';
import { ChainId } from '@portkey/types';

export type TNetworkConfig = {
  networkType: NetworkType;
  mainChainId: ChainId;
  sideChainId: ChainId;
  ewellRequestUrl: string;
  ewellConnectUrl: string;
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

const EWELL_CONTRACT_ADDRESS = process.env.REACT_APP_EWELL_CONTRACT_ADDRESS;
const WHITELIST_CONTRACT_ADDRESS = process.env.REACT_APP_WHITELIST_CONTRACT_ADDRESS;

const NETWORK_CONFIG_LIST: Record<string, TNetworkConfig> = {
  mainnet: {
    networkType: 'MAINNET',
    mainChainId: 'AELF',
    sideChainId: 'tDVV',
    ewellRequestUrl: 'https://ewell.finance',
    ewellConnectUrl: 'https://ewell.finance',
    webLoginNetworkType: 'MAIN',
    webLoginGraphqlUrl: 'https://dapp-aa-portkey.portkey.finance/Portkey_V2_DID/PortKeyIndexerCASchema/graphql',
    webLoginRequestDefaultsUrl: 'https://aa-portkey.portkey.finance',
    webLoginConnectUrl: 'https://auth-aa-portkey.portkey.finance',
    ewellContractAddress: EWELL_CONTRACT_ADDRESS || '',
    whitelistContractAddress: WHITELIST_CONTRACT_ADDRESS || '',
    symbolMarketUrl: 'https://www.eforest.finance/symbolmarket',
    mainChainInfo: {
      chainId: 'AELF',
      exploreUrl: 'https://explorer.aelf.io/',
      endPoint: 'https://aelf-public-node.aelf.io',
      caContractAddress: '2UthYi7AHRdfrqc1YCfeQnjdChDLaas65bW4WxESMGMojFiXj9',
      tokenContractAddress: 'JRmBduh4nXWi1aXgdUsj5gJrzeZb2LxmrAbf7W99faZSvoAaE',
    },
    sideChainInfo: {
      chainId: 'tDVV',
      exploreUrl: 'https://tdvv-explorer.aelf.io/',
      endPoint: 'https://tdvv-public-node.aelf.io',
      caContractAddress: '2UthYi7AHRdfrqc1YCfeQnjdChDLaas65bW4WxESMGMojFiXj9',
      tokenContractAddress: '7RzVGiuVWkvL4VfVHdZfQF2Tri3sgLe9U991bohHFfSRZXuGX',
    },
  },
  testnet: {
    networkType: 'TESTNET',
    mainChainId: 'AELF',
    sideChainId: 'tDVW',
    ewellRequestUrl: 'https://test.ewell.finance',
    ewellConnectUrl: 'https://test.ewell.finance',
    webLoginNetworkType: 'TESTNET',
    webLoginGraphqlUrl: 'https://dapp-aa-portkey-test.portkey.finance/Portkey_V2_DID/PortKeyIndexerCASchema/graphql',
    webLoginRequestDefaultsUrl: 'https://aa-portkey-test.portkey.finance',
    webLoginConnectUrl: 'https://auth-aa-portkey-test.portkey.finance',
    ewellContractAddress: EWELL_CONTRACT_ADDRESS || '2EbbUpZLds58keVZPJDLPRbPpxzUYCcjooq6LBiBoRXVTFZTiQ',
    whitelistContractAddress: WHITELIST_CONTRACT_ADDRESS || '25VDxYFNxujPnPzqzkHxveegoV9wYm5zY72Hv6L7utD1kKu2jZ',
    symbolMarketUrl: 'https://test.eforest.finance/symbolmarket',
    mainChainInfo: {
      chainId: 'AELF',
      exploreUrl: 'https://explorer-test.aelf.io/',
      endPoint: 'https://aelf-test-node.aelf.io',
      caContractAddress: '238X6iw1j8YKcHvkDYVtYVbuYk2gJnK8UoNpVCtssynSpVC8hb',
      tokenContractAddress: 'JRmBduh4nXWi1aXgdUsj5gJrzeZb2LxmrAbf7W99faZSvoAaE',
    },
    sideChainInfo: {
      chainId: 'tDVW',
      exploreUrl: 'https://explorer-test-side02.aelf.io/',
      endPoint: 'https://tdvw-test-node.aelf.io',
      caContractAddress: '238X6iw1j8YKcHvkDYVtYVbuYk2gJnK8UoNpVCtssynSpVC8hb',
      tokenContractAddress: 'ASh2Wt7nSEmYqnGxPPzp4pnVDU4uhj1XW9Se5VeZcX2UDdyjx',
    },
  },
  test3: {
    networkType: 'TESTNET',
    mainChainId: 'AELF',
    sideChainId: 'tDVV',
    ewellRequestUrl: '',
    ewellConnectUrl: '',
    webLoginNetworkType: 'TESTNET',
    webLoginGraphqlUrl: '/AElfIndexer_DApp/PortKeyIndexerCASchema/graphql',
    webLoginRequestDefaultsUrl: '/webLoginRequest',
    webLoginConnectUrl: '/webLoginConnect',
    ewellContractAddress: EWELL_CONTRACT_ADDRESS || 'mhgUyGhd27YaoG8wgXTbwtbAiYx7E59n5GXEkmkTFKKQTvGnB',
    whitelistContractAddress: WHITELIST_CONTRACT_ADDRESS || 'x4CTSuM8typUbpdfxRZDTqYVa42RdxrwwPkXX7WUJHeRmzE6k',
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
  test2: {
    networkType: 'TESTNET',
    mainChainId: 'AELF',
    sideChainId: 'tDVV',
    ewellRequestUrl: '',
    ewellConnectUrl: '',
    webLoginNetworkType: 'TESTNET',
    webLoginGraphqlUrl: '/AElfIndexer_DApp/PortKeyIndexerCASchema/graphql',
    webLoginRequestDefaultsUrl: '/webLoginRequest',
    webLoginConnectUrl: '/webLoginConnect',
    ewellContractAddress: EWELL_CONTRACT_ADDRESS || '2j6mjWwNgnX7zygPNT3UNwsizPb6bqa3JWk6PcQ5sd1Gbc37MJ',
    whitelistContractAddress: WHITELIST_CONTRACT_ADDRESS || '2LhQEonazAugHnS6VDZmGjcnsGcgD8RgSF9WKxYUvAgQTB8oSS',
    symbolMarketUrl: 'http://192.168.67.124:3001/symbolmarket',
    mainChainInfo: {
      chainId: 'AELF',
      exploreUrl: 'http://192.168.67.90:8000/',
      endPoint: 'http://192.168.67.90:8000',
      caContractAddress: '2LUmicHyH4RXrMjG4beDwuDsiWJESyLkgkwPdGTR8kahRzq5XS',
      tokenContractAddress: 'JRmBduh4nXWi1aXgdUsj5gJrzeZb2LxmrAbf7W99faZSvoAaE',
    },
    sideChainInfo: {
      chainId: 'tDVV',
      exploreUrl: 'http://192.168.67.69:8000/',
      endPoint: 'http://192.168.67.69:8000',
      caContractAddress: 'RXcxgSXuagn8RrvhQAV81Z652EEYSwR6JLnqHYJ5UVpEptW8Y',
      tokenContractAddress: '7RzVGiuVWkvL4VfVHdZfQF2Tri3sgLe9U991bohHFfSRZXuGX',
    },
  },
};

export const NETWORK_CONFIG = NETWORK_CONFIG_LIST[process.env.REACT_APP_NETWORK_KEY || ''];

export const DEFAULT_CHAIN_ID = NETWORK_CONFIG_LIST[process.env.REACT_APP_NETWORK_KEY || ''].sideChainId;

export const IS_OFFLINE_NETWORK = process.env.REACT_APP_NETWORK_KEY === 'test2';

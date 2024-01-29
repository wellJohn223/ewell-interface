import App from './App';
import { prefixCls } from 'constants/theme';
import WalletProvider from './contexts/useWallet';
import './assets/theme/antd.css';
import 'aelf-web-login/dist/assets/index.css';
import '@portkey/did-ui-react/dist/assets/index.css';
import './index.css';
import { ReactNode } from 'react';
import StoreProvider from './contexts/useStore';
import ViewContractProvider from 'contexts/useViewContract';
import { ConfigProvider } from 'antd';
import { AELFDProvider } from 'aelf-design';
import { AELFD_CUSTOM_TOKEN_CONFIG, AELFD_THEME_CONFIG, ANTD_THEME_CONFIG } from 'themTokenConfig';
import { BrowserRouter } from 'react-router-dom';
import 'aelf-design/css';
import AssetsProvider from 'contexts/useAssets';
import { createRoot } from 'react-dom/client';
import ReactDOM from 'react-dom';

ConfigProvider.config({
  prefixCls,
});

function ContextProviders({ children }: { children?: ReactNode }) {
  return (
    <BrowserRouter>
      <AELFDProvider customToken={AELFD_CUSTOM_TOKEN_CONFIG} prefixCls={prefixCls} theme={AELFD_THEME_CONFIG}>
        <ConfigProvider prefixCls={prefixCls} theme={ANTD_THEME_CONFIG}>
          <StoreProvider>
            <ViewContractProvider>
              <AssetsProvider>
                <WalletProvider>{children}</WalletProvider>
              </AssetsProvider>
            </ViewContractProvider>
          </StoreProvider>
        </ConfigProvider>
      </AELFDProvider>
    </BrowserRouter>
  );
}

// const container = document.getElementById('root') as HTMLElement;
// const root = createRoot(container);
// root.render(
//   <ContextProviders>
//     <App />
//   </ContextProviders>,
// );

ReactDOM.render(
  <ContextProviders>
    <App />
  </ContextProviders>,
  document.getElementById('root'),
);

/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_WS_URL: string;
  readonly VITE_MAPBOX_TOKEN: string;
  readonly VITE_MASCHAIN_RPC_URL: string;
  readonly VITE_MASCHAIN_NETWORK_ID: string;
  readonly VITE_MASCHAIN_CHAIN_ID: string;
  readonly VITE_ENABLE_DEVTOOLS: string;
  readonly VITE_LOG_LEVEL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export const config = {
  app: {
    name: import.meta.env.VITE_APP_NAME || 'GreenPOS Network',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
  },
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
    wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:3001',
  },
  mapbox: {
    token: import.meta.env.VITE_MAPBOX_TOKEN || '',
  },
  maschain: {
    rpcUrl: import.meta.env.VITE_MASCHAIN_RPC_URL || 'https://rpc.maschain.com',
    networkId: import.meta.env.VITE_MASCHAIN_NETWORK_ID || 698,
    chainId: import.meta.env.VITE_MASCHAIN_CHAIN_ID || '0x2ba',
  },
  features: {
    enableDevtools: import.meta.env.VITE_ENABLE_DEVTOOLS === 'true',
  },
} as const;

export type Config = typeof config;

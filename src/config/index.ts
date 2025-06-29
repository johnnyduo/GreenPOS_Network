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
    apiUrl: import.meta.env.VITE_MASCHAIN_API_URL || 'https://service-testnet.maschain.com',
    clientId: import.meta.env.VITE_MASCHAIN_CLIENT_ID || '',
    clientSecret: import.meta.env.VITE_MASCHAIN_CLIENT_SECRET || '',
    walletAddress: import.meta.env.VITE_MASCHAIN_WALLET_ADDRESS || '',
    contractAddress: import.meta.env.VITE_MASCHAIN_CONTRACT_ADDRESS || '',
    gpsTokenAddress: import.meta.env.VITE_GPS_TOKEN_ADDRESS || '',
    explorerUrl: import.meta.env.VITE_MASCHAIN_EXPLORER_URL || 'https://explorer-testnet.maschain.com',
    portalUrl: import.meta.env.VITE_MASCHAIN_PORTAL_URL || 'https://portal-testnet.maschain.com',
    rpcUrl: import.meta.env.VITE_MASCHAIN_RPC_URL || 'https://rpc.maschain.com',
    networkId: import.meta.env.VITE_MASCHAIN_NETWORK_ID || 698,
    chainId: import.meta.env.VITE_MASCHAIN_CHAIN_ID || '0x2ba',
  },
  features: {
    enableDevtools: import.meta.env.VITE_ENABLE_DEVTOOLS === 'true',
    logLevel: import.meta.env.VITE_LOG_LEVEL || 'info',
  },
} as const;

export type Config = typeof config;

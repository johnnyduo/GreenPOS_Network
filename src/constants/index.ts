// Application Constants
export const APP_CONSTANTS = {
  ROLES: {
    ADMIN: 'admin',
    INVESTOR: 'investor',
    SHOP_OWNER: 'shop-owner',
  } as const,
  
  TRANSACTION_TYPES: {
    SALE: 'sale',
    FUNDING: 'funding',
    RESTOCK: 'restock',
  } as const,
  
  SHOP_CATEGORIES: {
    ORGANIC_PRODUCE: 'Organic Produce',
    ECO_CRAFTS: 'Eco-Crafts',
    SOLAR_KIOSK: 'Solar Kiosk',
    WASTE_UPCYCLING: 'Waste Upcycling',
    AGRO_PROCESSING: 'Agro-Processing',
  } as const,
  
  STOCK_HEALTH_THRESHOLDS: {
    HIGH: 0.7,
    MEDIUM: 0.4,
    LOW: 0.2,
  } as const,
  
  REVENUE_THRESHOLDS: {
    HIGH: 3000,
    MEDIUM: 2000,
  } as const,
  
  UPDATE_INTERVALS: {
    TRANSACTIONS: 5000, // 5 seconds
    SHOPS: 10000, // 10 seconds
    REAL_TIME: 1000, // 1 second
  } as const,
  
  CURRENCIES: {
    THB: '฿',
    USD: '$',
    EUR: '€',
  } as const,
} as const;

// GreenPOS Network Constants
export const NETWORK_CONSTANTS = {
  HQ: {
    lat: 13.7563,
    lng: 100.5018,
    name: 'GreenPOS HQ',
    address: 'Bangkok, Thailand',
  },
  
  MAP_SETTINGS: {
    DEFAULT_ZOOM: 4,
    HQ_ZOOM: 6,
    SHOP_ZOOM: 12,
    PITCH: 30,
    BEARING: 0,
  },
  
  COLORS: {
    REVENUE: {
      HIGH: { primary: '#10B981', secondary: '#059669' },
      MEDIUM: { primary: '#F59E0B', secondary: '#D97706' },
      LOW: { primary: '#EF4444', secondary: '#DC2626' },
    },
    STOCK_HEALTH: {
      HIGH: '#059669',
      MEDIUM: '#D97706',
      LOW: '#DC2626',
    },
    HQ: {
      primary: '#FBBF24',
      secondary: '#F59E0B',
    },
  },
} as const;

// Type definitions for constants
export type UserRole = typeof APP_CONSTANTS.ROLES[keyof typeof APP_CONSTANTS.ROLES];
export type TransactionType = typeof APP_CONSTANTS.TRANSACTION_TYPES[keyof typeof APP_CONSTANTS.TRANSACTION_TYPES];
export type ShopCategory = typeof APP_CONSTANTS.SHOP_CATEGORIES[keyof typeof APP_CONSTANTS.SHOP_CATEGORIES];

// Smart Contract Aligned Types
export enum ShopCategory {
  OrganicProduce = 0,
  EcoCrafts = 1,
  SolarKiosk = 2,
  WasteUpcycling = 3,
  AgroProcessing = 4
}

export interface Shop {
  id: string | number; // Allow both string and number for compatibility
  owner: string;
  name: string;
  category: ShopCategory;
  location: {
    lat: number;
    lng: number;
  };
  revenue: number;
  fundingNeeded: number;
  totalFunded: number;
  sustainabilityScore: number; // 0-100
  isActive: boolean;
  registeredAt: number;
  lastSaleAt: number;
  // Additional UI fields for map display
  stockHealth: number;
  lastSale: Date;
  liveStream: string;
  country: string;
  inventory: InventoryItem[];
  // Optional fields for placeholder/error states
  isPlaceholder?: boolean;
  message?: string;
  // Flag to distinguish between on-chain data vs demo data
  isDemoData?: boolean;
}

export interface BlockchainShop {
  owner: string;
  name: string;
  category: ShopCategory;
  location: string; // Country/Region string
  revenue: number;
  fundingNeeded: number;
  totalFunded: number;
  sustainabilityScore: number;
  isActive: boolean;
  registeredAt: number;
  lastSaleAt: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  lowStockThreshold: number;
  category: string;
  image?: string;
  description?: string;
}

export interface Transaction {
  id: string;
  shopId: string;
  amount: number;
  type: 'sale' | 'funding' | 'restock';
  timestamp: Date;
  fromLocation?: { lat: number; lng: number };
  toLocation: { lat: number; lng: number };
}

export interface FundingTransaction {
  shopId: number;
  investor: string;
  amount: number;
  timestamp: number;
  purpose: string;
  isActive: boolean;
}

export interface Investor {
  id: string;
  name: string;
  totalInvested: number;
  activeInvestments: number;
  roi: number;
  walletAddress?: string;
  joinDate?: number;
}

export interface BlockchainInvestor {
  wallet: string;
  name: string;
  totalInvested: number;
  activeInvestments: number;
  fundedShops: number[];
  isRegistered: boolean;
}

export interface NetworkStats {
  totalShops: number;
  totalActiveShops: number;
  totalFunding: number;
  totalInvestors: number;
  averageSustainabilityScore: number;
  totalTransactions: number;
}

export interface MapViewState {
  latitude: number;
  longitude: number;
  zoom: number;
  bearing: number;
  pitch: number;
}

// Utility functions for shop categories
export const getCategoryName = (category: ShopCategory): string => {
  switch (category) {
    case ShopCategory.OrganicProduce: return "Organic Produce";
    case ShopCategory.EcoCrafts: return "Eco-Crafts";
    case ShopCategory.SolarKiosk: return "Solar Kiosk";
    case ShopCategory.WasteUpcycling: return "Waste Upcycling";
    case ShopCategory.AgroProcessing: return "Agro-Processing";
    default: return "Unknown";
  }
};

export const getCategoryFromString = (categoryStr: string): ShopCategory => {
  switch (categoryStr.toLowerCase()) {
    case "organic produce": return ShopCategory.OrganicProduce;
    case "eco-crafts": return ShopCategory.EcoCrafts;
    case "solar kiosk": return ShopCategory.SolarKiosk;
    case "waste upcycling": return ShopCategory.WasteUpcycling;
    case "agro-processing": return ShopCategory.AgroProcessing;
    default: return ShopCategory.OrganicProduce;
  }
};

export const getAllCategories = (): { value: ShopCategory; label: string }[] => [
  { value: ShopCategory.OrganicProduce, label: "Organic Produce" },
  { value: ShopCategory.EcoCrafts, label: "Eco-Crafts" },
  { value: ShopCategory.SolarKiosk, label: "Solar Kiosk" },
  { value: ShopCategory.WasteUpcycling, label: "Waste Upcycling" },
  { value: ShopCategory.AgroProcessing, label: "Agro-Processing" }
];

// Conversion functions for blockchain integration
export const convertBlockchainShopToShop = (blockchainShop: BlockchainShop, shopId: string): Shop => {
  // Mock location data for demo purposes - in production, this would come from a separate location service
  const mockLocations: Record<string, { lat: number; lng: number }> = {
    "Vietnam": { lat: 16.0544, lng: 108.2022 },
    "Thailand": { lat: 15.8700, lng: 100.9925 },
    "Indonesia": { lat: -0.7893, lng: 113.9213 },
    "Philippines": { lat: 12.8797, lng: 121.7740 },
    "Malaysia": { lat: 4.2105, lng: 101.9758 }
  };

  const location = mockLocations[blockchainShop.location] || { lat: 0, lng: 0 };

  return {
    id: shopId,
    owner: blockchainShop.owner,
    name: blockchainShop.name,
    category: blockchainShop.category,
    location,
    revenue: blockchainShop.revenue,
    fundingNeeded: blockchainShop.fundingNeeded,
    totalFunded: blockchainShop.totalFunded,
    sustainabilityScore: blockchainShop.sustainabilityScore,
    isActive: blockchainShop.isActive,
    registeredAt: blockchainShop.registeredAt,
    lastSaleAt: blockchainShop.lastSaleAt,
    // UI-specific fields with defaults
    stockHealth: 0.8, // Default 80%
    lastSale: new Date(blockchainShop.lastSaleAt * 1000),
    liveStream: '',
    country: blockchainShop.location,
    inventory: []
  };
};
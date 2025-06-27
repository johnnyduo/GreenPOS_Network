export interface Shop {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  revenue: number;
  stockHealth: number;
  lastSale: Date;
  liveStream: string;
  country: string;
  owner: string;
  category: string;
  inventory: InventoryItem[];
  fundingNeeded: number;
  totalFunded: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  lowStockThreshold: number;
  category: string;
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

export interface Investor {
  id: string;
  name: string;
  totalInvested: number;
  activeInvestments: number;
  roi: number;
}

export interface MapViewState {
  latitude: number;
  longitude: number;
  zoom: number;
  bearing: number;
  pitch: number;
}
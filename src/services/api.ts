import { config } from '../config';

// API Base Configuration
const API_BASE_URL = config.api.baseUrl;

// HTTP Client Utility
class ApiClient {
  private baseURL: string;
  
  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    const config: RequestInit = {
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  get<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  post<T>(
    endpoint: string, 
    data?: any, 
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      headers,
    });
  }

  put<T>(
    endpoint: string, 
    data?: any, 
    headers?: Record<string, string>
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers,
    });
  }

  delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }
}

// Create API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Shop API Services
export const shopApi = {
  getAll: () => apiClient.get<ApiResponse<Shop[]>>('/shops'),
  getById: (id: string) => apiClient.get<ApiResponse<Shop>>(`/shops/${id}`),
  create: (shop: Omit<Shop, 'id'>) => 
    apiClient.post<ApiResponse<Shop>>('/shops', shop),
  update: (id: string, updates: Partial<Shop>) =>
    apiClient.put<ApiResponse<Shop>>(`/shops/${id}`, updates),
  delete: (id: string) => apiClient.delete<ApiResponse<void>>(`/shops/${id}`),
  updateInventory: (id: string, inventory: InventoryItem[]) =>
    apiClient.put<ApiResponse<Shop>>(`/shops/${id}/inventory`, { inventory }),
};

// Transaction API Services
export const transactionApi = {
  getAll: (params?: { page?: number; limit?: number; shopId?: string }) =>
    apiClient.get<ApiResponse<PaginatedResponse<Transaction>>>(
      `/transactions?${new URLSearchParams(params as any).toString()}`
    ),
  getById: (id: string) => 
    apiClient.get<ApiResponse<Transaction>>(`/transactions/${id}`),
  create: (transaction: Omit<Transaction, 'id'>) =>
    apiClient.post<ApiResponse<Transaction>>('/transactions', transaction),
  getByShop: (shopId: string) =>
    apiClient.get<ApiResponse<Transaction[]>>(`/shops/${shopId}/transactions`),
};

// Investor API Services
export const investorApi = {
  getAll: () => apiClient.get<ApiResponse<Investor[]>>('/investors'),
  getById: (id: string) => 
    apiClient.get<ApiResponse<Investor>>(`/investors/${id}`),
  create: (investor: Omit<Investor, 'id'>) =>
    apiClient.post<ApiResponse<Investor>>('/investors', investor),
  update: (id: string, updates: Partial<Investor>) =>
    apiClient.put<ApiResponse<Investor>>(`/investors/${id}`, updates),
  getInvestments: (id: string) =>
    apiClient.get<ApiResponse<Investment[]>>(`/investors/${id}/investments`),
};

// Funding API Services
export const fundingApi = {
  createFunding: (data: {
    shopId: string;
    investorId: string;
    amount: number;
    message?: string;
  }) => apiClient.post<ApiResponse<FundingRecord>>('/funding', data),
  
  getFundingHistory: (shopId?: string, investorId?: string) => {
    const params = new URLSearchParams();
    if (shopId) params.append('shopId', shopId);
    if (investorId) params.append('investorId', investorId);
    
    return apiClient.get<ApiResponse<FundingRecord[]>>(
      `/funding?${params.toString()}`
    );
  },
};

// Analytics API Services
export const analyticsApi = {
  getShopAnalytics: (shopId: string, period: '7d' | '30d' | '90d' | '1y') =>
    apiClient.get<ApiResponse<ShopAnalytics>>(
      `/analytics/shops/${shopId}?period=${period}`
    ),
  
  getNetworkAnalytics: (period: '7d' | '30d' | '90d' | '1y') =>
    apiClient.get<ApiResponse<NetworkAnalytics>>(
      `/analytics/network?period=${period}`
    ),
  
  getInvestorAnalytics: (investorId: string, period: '7d' | '30d' | '90d' | '1y') =>
    apiClient.get<ApiResponse<InvestorAnalytics>>(
      `/analytics/investors/${investorId}?period=${period}`
    ),
};

// WebSocket Service for Real-time Updates
export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;

  connect(url: string = config.api.wsUrl): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(url);
        
        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          resolve();
        };
        
        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.handleReconnect(url);
        };
        
        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleReconnect(url: string): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect(url);
      }, this.reconnectInterval * this.reconnectAttempts);
    }
  }

  subscribe<T>(eventType: string, callback: (data: T) => void): () => void {
    if (!this.ws) {
      throw new Error('WebSocket not connected');
    }

    const handler = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === eventType) {
          callback(data.payload);
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    this.ws.addEventListener('message', handler);

    // Return unsubscribe function
    return () => {
      this.ws?.removeEventListener('message', handler);
    };
  }

  send(event: string, data: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected');
    }

    this.ws.send(JSON.stringify({ type: event, payload: data }));
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Export singleton instance
export const wsService = new WebSocketService();

// Type definitions for API responses
export interface Investment {
  id: string;
  investorId: string;
  shopId: string;
  amount: number;
  date: Date;
  roi: number;
  status: 'active' | 'completed' | 'withdrawn';
}

export interface FundingRecord {
  id: string;
  shopId: string;
  investorId: string;
  amount: number;
  message?: string;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
}

export interface ShopAnalytics {
  shopId: string;
  period: string;
  revenue: {
    total: number;
    growth: number;
    trend: number[];
  };
  transactions: {
    count: number;
    averageValue: number;
    trend: number[];
  };
  inventory: {
    turnover: number;
    stockHealth: number;
    lowStockItems: number;
  };
}

export interface NetworkAnalytics {
  period: string;
  totalRevenue: number;
  totalShops: number;
  totalInvestors: number;
  revenueGrowth: number;
  topPerformingShops: Array<{
    shopId: string;
    name: string;
    revenue: number;
  }>;
  revenueByCountry: Array<{
    country: string;
    revenue: number;
  }>;
}

export interface InvestorAnalytics {
  investorId: string;
  period: string;
  totalInvested: number;
  totalReturns: number;
  roi: number;
  activeInvestments: number;
  investmentsByShop: Array<{
    shopId: string;
    shopName: string;
    amount: number;
    returns: number;
    roi: number;
  }>;
}

// Import types from existing files
import { Shop, Transaction, InventoryItem, Investor } from '../types';

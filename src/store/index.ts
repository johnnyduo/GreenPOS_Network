import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { StateCreator } from 'zustand';
import { Shop, Transaction, InventoryItem } from '../types';
import { UserRole } from '../constants';

interface AppState {
  // UI State
  userRole: UserRole;
  showLanding: boolean;
  selectedShop: Shop | null;
  isPOSOpen: boolean;
  showMoneyFlow: boolean;
  isFundingModalOpen: boolean;
  isRestockModalOpen: boolean;
  
  // Data State
  shops: Shop[];
  transactions: Transaction[];
  shopToFund: Shop | null;
  shopToRestock: Shop | null;
  
  // Loading States
  isLoading: boolean;
  isTransactionsLoading: boolean;
  isShopsLoading: boolean;
  
  // Actions
  setUserRole: (role: UserRole) => void;
  setShowLanding: (show: boolean) => void;
  setSelectedShop: (shop: Shop | null) => void;
  setIsPOSOpen: (open: boolean) => void;
  setShowMoneyFlow: (show: boolean) => void;
  setFundingModal: (open: boolean, shop?: Shop | null) => void;
  setRestockModal: (open: boolean, shop?: Shop | null) => void;
  
  // Data Actions
  setShops: (shops: Shop[]) => void;
  setTransactions: (transactions: Transaction[]) => void;
  updateShop: (shopId: string, updates: Partial<Shop>) => void;
  addTransaction: (transaction: Transaction) => void;
  updateInventory: (shopId: string, inventory: InventoryItem[]) => void;
  
  // Business Logic Actions
  completeSale: (shopId: string, amount: number) => void;
  completeFunding: (shopId: string, amount: number) => void;
  completeRestock: (shopId: string, items: InventoryItem[]) => void;
  
  // Loading Actions
  setLoading: (loading: boolean) => void;
  setTransactionsLoading: (loading: boolean) => void;
  setShopsLoading: (loading: boolean) => void;
}

type AppStateCreator = StateCreator<AppState, [], [], AppState>;

const createAppState: AppStateCreator = (set, get) => ({
  // Initial UI State
  userRole: 'admin',
  showLanding: true,
  selectedShop: null,
  isPOSOpen: false,
  showMoneyFlow: false,
  isFundingModalOpen: false,
  isRestockModalOpen: false,
  
  // Initial Data State
  shops: [],
  transactions: [],
  shopToFund: null,
  shopToRestock: null,
  
  // Initial Loading States
  isLoading: false,
  isTransactionsLoading: false,
  isShopsLoading: false,
  
  // UI Actions
  setUserRole: (role: UserRole) => set({ userRole: role }),
  setShowLanding: (show: boolean) => set({ showLanding: show }),
  setSelectedShop: (shop: Shop | null) => set({ selectedShop: shop }),
  setIsPOSOpen: (open: boolean) => set({ isPOSOpen: open }),
  setShowMoneyFlow: (show: boolean) => set({ showMoneyFlow: show }),
  setFundingModal: (open: boolean, shop: Shop | null = null) => 
    set({ isFundingModalOpen: open, shopToFund: shop }),
  setRestockModal: (open: boolean, shop: Shop | null = null) => 
    set({ isRestockModalOpen: open, shopToRestock: shop }),
  
  // Data Actions
  setShops: (shops: Shop[]) => set({ shops }),
  setTransactions: (transactions: Transaction[]) => set({ transactions }),
  updateShop: (shopId: string, updates: Partial<Shop>) => 
    set((state) => ({
      shops: state.shops.map((shop) =>
        shop.id === shopId ? { ...shop, ...updates } : shop
      ),
    })),
  addTransaction: (transaction: Transaction) =>
    set((state) => ({
      transactions: [transaction, ...state.transactions].slice(0, 100), // Keep only last 100
    })),
  updateInventory: (shopId: string, inventory: InventoryItem[]) =>
    set((state) => ({
      shops: state.shops.map((shop) =>
        shop.id === shopId ? { ...shop, inventory } : shop
      ),
    })),
  
  // Business Logic Actions
  completeSale: (shopId: string, amount: number) => {
    const state = get();
    const shop = state.shops.find(s => s.id === shopId);
    if (!shop) return;
    
    state.updateShop(shopId, {
      revenue: shop.revenue + amount,
      lastSale: new Date(),
    });
    
    state.addTransaction({
      id: `sale_${Date.now()}`,
      shopId,
      amount,
      type: 'sale',
      timestamp: new Date(),
      fromLocation: shop.location,
      toLocation: { lat: 13.7563, lng: 100.5018 }, // HQ location
    });
  },
  
  completeFunding: (shopId: string, amount: number) => {
    const state = get();
    const shop = state.shops.find(s => s.id === shopId);
    if (!shop) return;
    
    state.updateShop(shopId, {
      totalFunded: shop.totalFunded + amount,
    });
    
    state.addTransaction({
      id: `funding_${Date.now()}`,
      shopId,
      amount,
      type: 'funding',
      timestamp: new Date(),
      toLocation: shop.location,
    });
    
    state.setFundingModal(false);
  },
  
  completeRestock: (shopId: string, items: InventoryItem[]) => {
    const state = get();
    const shop = state.shops.find(s => s.id === shopId);
    
    if (shop) {
      const updatedInventory = shop.inventory.map(inv => {
        const restockItem = items.find(item => item.id === inv.id);
        return restockItem ? { ...inv, quantity: inv.quantity + restockItem.quantity } : inv;
      });
      
      state.updateShop(shopId, {
        inventory: updatedInventory,
        stockHealth: Math.min(1, shop.stockHealth + 0.2),
      });
      
      const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      state.addTransaction({
        id: `restock_${Date.now()}`,
        shopId,
        amount: totalAmount,
        type: 'restock',
        timestamp: new Date(),
        toLocation: shop.location,
      });
    }
    
    state.setRestockModal(false);
  },
  
  // Loading Actions
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setTransactionsLoading: (loading: boolean) => set({ isTransactionsLoading: loading }),
  setShopsLoading: (loading: boolean) => set({ isShopsLoading: loading }),
});

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      createAppState,
      {
        name: 'greenpos-storage',
        partialize: (state) => ({
          userRole: state.userRole,
          showLanding: state.showLanding,
        }),
      }
    ),
    {
      name: 'greenpos-store',
    }
  )
);

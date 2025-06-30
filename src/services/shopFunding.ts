import { Shop } from '../types';
import { smartContractService } from './smartContractLite';

class ShopFundingService {
  private shopFundingCache: Map<string, number> = new Map();
  private listeners: Set<(shopId: string, newFunding: number) => void> = new Set();

  constructor() {
    // Listen for funding events from smart contract service
    window.addEventListener('shopFunded', this.handleFundingEvent.bind(this) as EventListener);
    this.loadFundingCache();
  }

  private loadFundingCache() {
    try {
      const stored = localStorage.getItem('greenpos_shop_funding_cache');
      if (stored) {
        const data = JSON.parse(stored);
        this.shopFundingCache = new Map(Object.entries(data));
      }
    } catch (error) {
      console.warn('Failed to load shop funding cache:', error);
    }
  }

  private saveFundingCache() {
    try {
      const data = Object.fromEntries(this.shopFundingCache);
      localStorage.setItem('greenpos_shop_funding_cache', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save shop funding cache:', error);
    }
  }

  private handleFundingEvent(event: Event) {
    const customEvent = event as CustomEvent;
    const { shopId, amount } = customEvent.detail;
    const shopIdStr = shopId.toString();
    
    // Update funding cache
    const currentFunding = this.shopFundingCache.get(shopIdStr) || 0;
    const newFunding = currentFunding + amount;
    this.shopFundingCache.set(shopIdStr, newFunding);
    
    // Save to localStorage
    this.saveFundingCache();
    
    // Notify listeners
    this.listeners.forEach(listener => listener(shopIdStr, newFunding));
    
    console.log(`📈 Shop ${shopId} funding updated: +${amount} GPS (Total: ${newFunding} GPS)`);
  }

  getShopFunding(shopId: string): number {
    const contractFunding = smartContractService.getTotalFundedForShop(shopId);
    const cacheFunding = this.shopFundingCache.get(shopId) || 0;
    return Math.max(contractFunding, cacheFunding);
  }

  getUpdatedShop(originalShop: Shop): Shop {
    const additionalFunding = this.getShopFunding(originalShop.id);
    return {
      ...originalShop,
      totalFunded: originalShop.totalFunded + additionalFunding
    };
  }

  getUpdatedShops(originalShops: Shop[]): Shop[] {
    return originalShops.map(shop => this.getUpdatedShop(shop));
  }

  onFundingUpdate(callback: (shopId: string, newFunding: number) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  // Clear all cached funding data - for production use only if needed
  clearCache() {
    this.shopFundingCache.clear();
    localStorage.removeItem('greenpos_shop_funding_cache');
    console.log('🔄 Shop funding cache cleared');
  }
}

export const shopFundingService = new ShopFundingService();

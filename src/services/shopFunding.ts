import { Shop } from '../types';

// Use dynamic import to avoid circular dependency issues
let smartContractService: any = null;

class ShopFundingService {
  private shopFundingCache: Map<string, number> = new Map();
  private listeners: Set<(shopId: string, newFunding: number) => void> = new Set();

  constructor() {
    // Listen for funding events from smart contract service
    window.addEventListener('shopFunded', this.handleFundingEvent.bind(this) as EventListener);
    
    // Initialize smart contract service lazily
    this.initSmartContractService();
    
    // CRITICAL FIX: Clear existing funding cache to prevent double counting issues
    console.log('🔄 Clearing shop funding cache to prevent double counting...');
    localStorage.removeItem('greenpos_shop_funding_cache');
    this.shopFundingCache.clear();
    
    // Don't load existing funding cache - start fresh to fix double funding issue
    // this.loadFundingCache();
  }

  private async initSmartContractService() {
    if (!smartContractService) {
      try {
        const module = await import('./smartContractLite');
        smartContractService = module.smartContractService;
      } catch (error) {
        console.error('Failed to load smartContractService:', error);
      }
    }
  }

  // Temporarily disabled to prevent double funding issues
  // private loadFundingCache() {
  //   try {
  //     const stored = localStorage.getItem('greenpos_shop_funding_cache');
  //     if (stored) {
  //       const data = JSON.parse(stored);
  //       this.shopFundingCache = new Map(Object.entries(data));
  //     }
  //   } catch (error) {
  //     console.warn('Failed to load shop funding cache:', error);
  //   }
  // }

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
    
    // CRITICAL FIX: For numeric shop IDs (on-chain shops), don't accumulate in cache
    // The blockchain already handles the funding amount correctly
    if (typeof shopId === 'number' || /^\d+$/.test(shopIdStr)) {
      console.log(`🔗 On-chain shop ${shopId} funded with ${amount} GPS - blockchain handles this automatically`);
      return; // Don't add to cache for on-chain shops
    }
    
    // Only track funding for demo shops in cache
    const currentFunding = this.shopFundingCache.get(shopIdStr) || 0;
    const newFunding = currentFunding + amount;
    this.shopFundingCache.set(shopIdStr, newFunding);
    
    // Save to localStorage
    this.saveFundingCache();
    
    // Notify listeners
    this.listeners.forEach(listener => listener(shopIdStr, newFunding));
    
    console.log(`📈 Demo shop ${shopId} funding updated: +${amount} GPS (Total: ${newFunding} GPS)`);
  }

  getShopFunding(shopId: string): number {
    // Use contract funding if available, otherwise use cache
    const contractFunding = smartContractService?.getTotalFundedForShop?.(shopId) || 0;
    const cacheFunding = this.shopFundingCache.get(shopId) || 0;
    return Math.max(contractFunding, cacheFunding);
  }

  getUpdatedShop(originalShop: Shop): Shop {
    // CRITICAL FIX: Don't double-add funding if shop data comes from blockchain 
    // (blockchain data already includes all funding)
    if (originalShop.isDemoData === false) {
      // This is on-chain data - blockchain already includes all funding, don't add cache
      console.log(`🔗 Shop ${originalShop.id} is on-chain data - using blockchain funding only: ${originalShop.totalFunded} GPS`);
      return originalShop;
    }
    
    // For demo shops only, add cached funding amounts
    const additionalFunding = this.getShopFunding(originalShop.id.toString());
    console.log(`🏪 Demo shop ${originalShop.id} - adding cached funding: ${originalShop.totalFunded} + ${additionalFunding} = ${originalShop.totalFunded + additionalFunding} GPS`);
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

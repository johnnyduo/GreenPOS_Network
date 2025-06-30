/**
 * Virtual Shop Mapping Service
 * Maps mock shop IDs to blockchain-compatible IDs using pre-registered shops
 * This bypasses registration issues and allows immediate funding
 */
/**
 * Virtual Shop Mapping Service
 * Dynamically discovers and maps existing shops in the contract
 */
export class VirtualShopMappingService {
  private shopMapping: Map<string, number> = new Map();
  private initialized: boolean = false;

  constructor() {
    this.initializeStaticMapping();
  }

  /**
   * Initialize static mapping using pre-existing shop IDs in the contract
   * This is a fallback - we'll discover real shops when wallet connects
   */
  private initializeStaticMapping() {
    // Map to shop IDs that should already exist in the contract
    const staticMappings = [
      { mockId: 'shop_001', blockchainId: 0 },
      { mockId: 'shop_002', blockchainId: 1 },
      { mockId: 'shop_003', blockchainId: 2 },
      { mockId: 'shop_004', blockchainId: 3 },
      { mockId: 'shop_005', blockchainId: 4 }
    ];

    staticMappings.forEach(({ mockId, blockchainId }) => {
      this.shopMapping.set(mockId, blockchainId);
    });

    this.initialized = true;
    console.log('✅ Static shop mapping initialized (fallback):', {
      totalMappings: this.shopMapping.size,
      mappings: Object.fromEntries(this.shopMapping)
    });
  }

  /**
   * Discover actual shops in the contract and create dynamic mapping
   */
  async discoverContractShops(smartContractService: any): Promise<void> {
    try {
      console.log('🔍 Discovering shops in contract...');
      
      // Get shop count from contract
      const shopCount = await smartContractService.getShopCount();
      console.log(`📊 Contract has ${shopCount} shops`);

      if (shopCount === 0) {
        console.log('⚠️ No shops found in contract - using static mapping');
        return;
      }

      // Get all shops and create new mapping
      const contractShops = await smartContractService.getAllShops();
      
      if (contractShops.length > 0) {
        // Clear static mapping and create dynamic mapping
        this.shopMapping.clear();
        
        contractShops.forEach((shop: any, index: number) => {
          const mockShopId = `shop_${String(index + 1).padStart(3, '0')}`;
          this.shopMapping.set(mockShopId, shop.id);
          console.log(`🔗 Mapped ${mockShopId} → Contract Shop ${shop.id}:`, shop.data?.name || 'Unknown');
        });

        console.log('✅ Dynamic shop mapping created:', {
          totalMappings: this.shopMapping.size,
          mappings: Object.fromEntries(this.shopMapping)
        });
      }

    } catch (error: any) {
      console.error('❌ Failed to discover contract shops:', error);
      console.log('🔄 Falling back to static mapping');
    }
  }

  /**
   * Get blockchain shop ID for a mock shop ID
   */
  getBlockchainShopId(mockShopId: string): number {
    if (!this.initialized) {
      throw new Error('Virtual shop mapping not initialized. Please connect wallet first.');
    }
    
    const blockchainId = this.shopMapping.get(mockShopId);
    if (blockchainId === undefined) {
      throw new Error(`No blockchain mapping found for shop ID: ${mockShopId}. Available shops: ${Array.from(this.shopMapping.keys()).join(', ')}`);
    }
    return blockchainId;
  }

  /**
   * Check if a shop ID is valid for funding
   */
  isValidShopId(mockShopId: string): boolean {
    return this.initialized && this.shopMapping.has(mockShopId);
  }

  /**
   * Get all mapped shop IDs
   */
  getAllMappings(): { mockId: string; blockchainId: number }[] {
    return Array.from(this.shopMapping.entries()).map(([mockId, blockchainId]) => ({
      mockId,
      blockchainId
    }));
  }

  /**
   * Check if the service is ready
   */
  isReady(): boolean {
    return this.initialized;
  }

  /**
   * Get status information
   */
  getStatus(): {
    ready: boolean;
    totalShops: number;
    mappingStrategy: 'static';
  } {
    return {
      ready: this.initialized,
      totalShops: this.shopMapping.size,
      mappingStrategy: 'static'
    };
  }
}

export const virtualShopMapping = new VirtualShopMappingService();

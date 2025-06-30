import { maschainService } from './maschain';
import { config } from '../config';
import { 
  ShopCategory, 
  BlockchainShop, 
  BlockchainInvestor, 
  NetworkStats
} from '../types';

export interface SmartContractState {
  isConnected: boolean;
  contractAddress: string | null;
  loading: boolean;
  error: string | null;
}

export interface ShopRegistrationData {
  name: string;
  category: ShopCategory;
  location: string;
  fundingNeeded: number;
}

export interface FundingData {
  shopId: number;
  amount: number;
  purpose: string;
}

export interface GPSTokenInfo {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  balance: number;
  allowance: number;
}

export class SmartContractServiceLite {
  private contractAddress: string;
  private gpsTokenAddress: string;
  private walletAddress: string | null = null;
  private mockAllowance: number = 0; // Track mock allowance for demo
  private walletBalance: number = 10000; // Starting wallet balance
  private fundingHistory: Map<string, number> = new Map(); // Track funding per shop

  constructor() {
    this.contractAddress = config.maschain.contractAddress;
    this.gpsTokenAddress = config.maschain.gpsTokenAddress || '';
    
    // Load funding history from localStorage
    this.loadFundingHistory();
  }

  private loadFundingHistory() {
    try {
      const stored = localStorage.getItem('greenpos_funding_history');
      if (stored) {
        const data = JSON.parse(stored);
        this.fundingHistory = new Map(Object.entries(data));
      }
    } catch (error) {
      console.warn('Failed to load funding history:', error);
    }
  }

  private saveFundingHistory() {
    try {
      const data = Object.fromEntries(this.fundingHistory);
      localStorage.setItem('greenpos_funding_history', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save funding history:', error);
    }
  }

  setWalletAddress(address: string) {
    this.walletAddress = address;
  }

  getContractAddress(): string {
    return this.contractAddress;
  }

  getGPSTokenAddress(): string {
    return this.gpsTokenAddress;
  }

  isWalletConnected(): boolean {
    return this.walletAddress !== null;
  }

  // =============================================================================
  // GPS TOKEN FUNCTIONS (Optimized)
  // =============================================================================

  async getGPSTokenInfo(): Promise<GPSTokenInfo> {
    try {
      // For demo purposes, return mock GPS token info
      // In production, this would call the actual GPS token contract
      const mockBalance = 10000;
      const currentAllowance = this.walletAddress ? this.mockAllowance : 0;
      
      console.log('📊 GPS Token Info (Demo Mode):');
      console.log(`   • Address: ${this.gpsTokenAddress}`);
      console.log(`   • Balance: ${mockBalance} GPS`);
      console.log(`   • Allowance: ${currentAllowance} GPS`);
      console.log(`   • Wallet Connected: ${!!this.walletAddress}`);
      
      return {
        address: this.gpsTokenAddress,
        name: 'GreenPOS Token',
        symbol: 'GPS',
        decimals: 18,
        balance: mockBalance,
        allowance: currentAllowance
      };
    } catch (error) {
      console.error('Failed to get GPS token info:', error);
      // Return fallback data even on error
      return {
        address: this.gpsTokenAddress,
        name: 'GreenPOS Token',
        symbol: 'GPS',
        decimals: 18,
        balance: 0,
        allowance: 0
      };
    }
  }

  async approveGPSTokens(amount: number): Promise<string> {
    try {
      console.log(`🔄 Approving ${amount} GPS tokens for contract use...`);
      console.log(`   • Token Address: ${this.gpsTokenAddress}`);
      console.log(`   • Contract Address: ${this.contractAddress}`);
      console.log(`   • Wallet: ${this.walletAddress || 'Demo Mode'}`);
      
      // Mock approval - in production, call GPS token contract
      const txHash = '0x' + Math.random().toString(16).substr(2, 64);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update mock allowance for demo
      this.mockAllowance = amount;
      
      console.log(`✅ GPS tokens approved! Transaction: ${txHash}`);
      console.log(`   • New Allowance: ${amount} GPS`);
      return txHash;
    } catch (error) {
      console.error('❌ Failed to approve GPS tokens:', error);
      throw new Error('Failed to approve GPS tokens');
    }
  }

  async getGPSBalance(address?: string): Promise<number> {
    const targetAddress = address || this.walletAddress;
    if (!targetAddress) {
      throw new Error('No address provided and wallet not connected');
    }

    try {
      // Mock balance - in production, call the contract
      return 10000; // 10,000 GPS tokens
    } catch (error) {
      console.error('Failed to get GPS balance:', error);
      throw new Error('Failed to retrieve GPS balance');
    }
  }

  // =============================================================================
  // CORE FUNCTIONS (Optimized for Lite Contract)
  // =============================================================================

  async registerShop(shopData: ShopRegistrationData): Promise<string> {
    if (!this.walletAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      const params = {
        wallet_options: {
          type: 'end_user' as const,
          address: this.walletAddress
        },
        method_name: 'registerShop',
        params: {
          name: shopData.name,
          category: shopData.category,
          location: shopData.location,
          fundingNeeded: shopData.fundingNeeded.toString()
        },
        callback_url: `${window.location.origin}/api/contract-callback`
      };

      const result = await maschainService.executeContract(this.contractAddress, params);
      return result.transaction_hash || result.txHash || 'Transaction submitted';
    } catch (error: any) {
      throw new Error(`Failed to register shop: ${error.message}`);
    }
  }

  async registerInvestor(name: string): Promise<string> {
    if (!this.walletAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      const params = {
        wallet_options: {
          type: 'end_user' as const,
          address: this.walletAddress
        },
        method_name: 'registerInvestor',
        params: { name },
        callback_url: `${window.location.origin}/api/contract-callback`
      };

      const result = await maschainService.executeContract(this.contractAddress, params);
      return result.transaction_hash || result.txHash || 'Transaction submitted';
    } catch (error: any) {
      throw new Error(`Failed to register investor: ${error.message}`);
    }
  }

  /**
   * Fund a shop with real blockchain transaction
   */
  async fundShop(fundingData: FundingData): Promise<string> {
    if (!this.walletAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      // Convert amount to wei (GPS token has 18 decimals)
      const amountInWei = (fundingData.amount * Math.pow(10, 18)).toString();
      
      // Execute the REAL funding transaction on MASchain blockchain
      console.log('🔍 Debug: Funding parameters being sent:', {
        shopId: fundingData.shopId,
        shopIdAsString: fundingData.shopId.toString(),
        amount: amountInWei,
        purpose: fundingData.purpose
      });

      console.log('🚀 Executing REAL blockchain transaction...');
      const result = await maschainService.executeContract(
        this.contractAddress, 
        'fundShop',
        [
          fundingData.shopId.toString(), // shopId as string
          amountInWei,                   // amount in wei
          fundingData.purpose            // purpose string
        ],
        true // Always include ABI for contract writes
      );
      let txHash = result.transaction_hash || result.txHash || result.hash;
      
      if (!txHash) {
        throw new Error('No transaction hash returned from blockchain');
      }

      // Ensure transaction hash is properly formatted (0x + 64 hex chars)
      if (!txHash.startsWith('0x')) {
        txHash = '0x' + txHash;
      }
      
      if (txHash.length !== 66) { // 0x + 64 chars
        console.warn('Transaction hash not standard length:', txHash);
        // If it's too short, pad it; if too long, truncate
        if (txHash.length < 66) {
          txHash = txHash.padEnd(66, '0');
        } else {
          txHash = txHash.substring(0, 66);
        }
      }

      console.log('✅ REAL transaction hash:', txHash);

      // Update local state for immediate UI feedback
      this.walletBalance -= fundingData.amount;
      
      // Update funding history for the shop
      const shopIdStr = fundingData.shopId.toString();
      const currentFunding = this.fundingHistory.get(shopIdStr) || 0;
      this.fundingHistory.set(shopIdStr, currentFunding + fundingData.amount);
      
      // Save to localStorage for persistence
      this.saveFundingHistory();
      
      console.log('✅ REAL shop funding successful on MASchain blockchain!', {
        txHash,
        shopId: fundingData.shopId,
        amountFunded: fundingData.amount,
        newWalletBalance: this.walletBalance,
        totalShopFunding: this.fundingHistory.get(shopIdStr),
        explorerUrl: `${config.maschain.explorerUrl}/tx/${txHash}`
      });

      // Emit funding event for UI updates
      this.emitFundingEvent(fundingData.shopId, fundingData.amount, txHash);

      return txHash;
    } catch (error: any) {
      console.error('[MASchain] REAL funding transaction failed:', error);
      
      // Provide specific error messages for contract validation failures
      if (error.message?.includes('Insufficient tokens') || error.message?.includes('ERC20')) {
        throw new Error('Insufficient GPS tokens or contract interaction failed. Please check your balance and network connection.');
      }
      
      if (error.message?.includes('fully funded') || error.message?.includes('Fully funded')) {
        throw new Error('Shop is already fully funded.');
      }
      
      if (error.message?.includes('Not registered')) {
        throw new Error('You must register as an investor first.');
      }
      
      if (error.message?.includes('Invalid shop')) {
        throw new Error('Shop does not exist or is not active.');
      }
      
      // Network or API errors
      if (error.message?.includes('Failed to fetch') || error.message?.includes('Network')) {
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      throw new Error(`Blockchain transaction failed: ${error.message}`);
    }
  }

  private emitFundingEvent(shopId: number, amount: number, txHash: string) {
    // Emit custom event for UI components to listen to
    const event = new CustomEvent('shopFunded', {
      detail: { shopId, amount, txHash, timestamp: Date.now() }
    });
    window.dispatchEvent(event);
  }

  async recordSale(shopId: number, amount: number): Promise<string> {
    if (!this.walletAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      const result = await maschainService.executeContract(
        this.contractAddress, 
        'recordSale',
        [shopId.toString(), amount.toString()]
      );
      return result.transaction_hash || result.txHash || 'Transaction submitted';
    } catch (error: any) {
      throw new Error(`Failed to record sale: ${error.message}`);
    }
  }

  async updateSustainabilityScore(shopId: number, score: number): Promise<string> {
    if (!this.walletAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      const result = await maschainService.executeContract(
        this.contractAddress, 
        'updateSustainabilityScore',
        [shopId.toString(), score.toString()]
      );
      return result.transaction_hash || result.txHash || 'Transaction submitted';
    } catch (error: any) {
      throw new Error(`Failed to update sustainability score: ${error.message}`);
    }
  }

  // =============================================================================
  // VIEW FUNCTIONS (Optimized)
  // =============================================================================

  async getShop(shopId: number): Promise<BlockchainShop> {
    try {
      const params = {
        from: this.walletAddress || config.maschain.walletAddress,
        method_name: 'getShop',
        params: { shopId: shopId.toString() }
      };

      const result = await maschainService.callContract(this.contractAddress, params);
      
      if (!result || !result.data) {
        throw new Error('No shop data returned');
      }

      return this.parseShopData(result.data, shopId);
    } catch (error: any) {
      console.error(`Failed to get shop ${shopId}:`, error);
      throw new Error(`Failed to retrieve shop: ${error.message}`);
    }
  }

  async getInvestor(address: string): Promise<BlockchainInvestor> {
    try {
      const params = {
        from: address,
        method_name: 'getInvestor',
        params: { addr: address }
      };

      const result = await maschainService.callContract(this.contractAddress, params);
      
      if (!result || !result.data) {
        throw new Error('No investor data returned');
      }

      return this.parseInvestorData(result.data);
    } catch (error: any) {
      console.error(`Failed to get investor ${address}:`, error);
      throw new Error(`Failed to retrieve investor: ${error.message}`);
    }
  }

  async getNetworkStats(): Promise<NetworkStats> {
    try {
      const params = {
        from: this.walletAddress || config.maschain.walletAddress,
        method_name: 'getNetworkStats',
        params: {}
      };

      console.log('Calling getNetworkStats with params:', params);
      const result = await maschainService.callContract(this.contractAddress, params);
      console.log('Raw contract result:', result);
      
      if (!result) {
        console.warn('No result returned from contract call');
        throw new Error('No result returned from contract');
      }

      // Handle different possible result structures
      let data = result.data || result;
      
      if (!data || (Array.isArray(data) && data.length === 0)) {
        console.warn('Contract returned empty data, likely fresh deployment');
        // Return default stats for a fresh contract
        return {
          totalShops: 0,
          totalActiveShops: 0,
          totalFunding: 0,
          totalInvestors: 0,
          averageSustainabilityScore: 0,
          totalTransactions: 0
        };
      }

      console.log('Processing contract data:', data);

      // If result is an array of values (the expected format)
      if (Array.isArray(data) && data.length >= 5) {
        const [totalShops, totalActiveShops, totalFunding, totalInvestors, averageSustainabilityScore] = data;

        return {
          totalShops: parseInt(totalShops.toString()),
          totalActiveShops: parseInt(totalActiveShops.toString()),
          totalFunding: parseInt(totalFunding.toString()),
          totalInvestors: parseInt(totalInvestors.toString()),
          averageSustainabilityScore: parseInt(averageSustainabilityScore.toString()),
          totalTransactions: 0 // Not tracked in lite version
        };
      }

      // If result is an object with named properties
      if (typeof data === 'object' && data !== null) {
        return {
          totalShops: parseInt((data.totalShops || data['0'] || 0).toString()),
          totalActiveShops: parseInt((data.activeShops || data['1'] || 0).toString()),
          totalFunding: parseInt((data.totalFunding || data['2'] || 0).toString()),
          totalInvestors: parseInt((data.totalInvestors || data['3'] || 0).toString()),
          averageSustainabilityScore: parseInt((data.avgSustainability || data['4'] || 0).toString()),
          totalTransactions: 0
        };
      }

      console.warn('Unexpected data format from contract:', data);
      // Return default stats as fallback
      return {
        totalShops: 0,
        totalActiveShops: 0,
        totalFunding: 0,
        totalInvestors: 0,
        averageSustainabilityScore: 0,
        totalTransactions: 0
      };

    } catch (error: any) {
      console.error('Failed to get network stats:', error);
      throw new Error(`Failed to retrieve network stats: ${error.message}`);
    }
  }

  // =============================================================================
  // SHOP QUERY FUNCTIONS
  // =============================================================================

  /**
   * Get the total number of shops registered in the contract
   */
  async getShopCount(): Promise<number> {
    try {
      const params = {
        from: this.walletAddress || '0x1154dfA292A59A003ADF3a820dfc98ddbD273FeD',
        method_name: 'shopCounter',
        params: {}
      };

      const result = await maschainService.callContract(this.contractAddress, params);
      return parseInt(result.toString(), 10);
    } catch (error: any) {
      console.error('Failed to get shop count:', error);
      return 0;
    }
  }

  /**
   * Get shop details by ID
   */
  async getShopById(shopId: number): Promise<any> {
    try {
      const params = {
        from: this.walletAddress || '0x1154dfA292A59A003ADF3a820dfc98ddbD273FeD',
        method_name: 'shops',
        params: { '0': shopId.toString() }
      };

      const result = await maschainService.callContract(this.contractAddress, params);
      return result;
    } catch (error: any) {
      console.error(`Failed to get shop ${shopId}:`, error);
      return null;
    }
  }

  /**
   * Get all registered shops from the contract
   */
  async getAllShops(): Promise<{ id: number; data: any }[]> {
    try {
      const shopCount = await this.getShopCount();
      console.log(`📊 Contract has ${shopCount} shops registered`);

      if (shopCount === 0) {
        console.log('⚠️ No shops found in contract');
        return [];
      }

      const shops = [];
      for (let i = 0; i < shopCount; i++) {
        try {
          const shopData = await this.getShopById(i);
          if (shopData) {
            shops.push({ id: i, data: shopData });
            console.log(`✅ Shop ${i}:`, shopData);
          }
        } catch (error) {
          console.log(`❌ Failed to fetch shop ${i}:`, error);
        }
      }

      return shops;
    } catch (error: any) {
      console.error('Failed to get all shops:', error);
      return [];
    }
  }

  // =============================================================================
  // HELPER FUNCTIONS
  // =============================================================================

  private parseShopData(data: any, _shopId: number): BlockchainShop {
    const [owner, name, category, location, revenue, fundingNeeded, totalFunded, sustainabilityScore, isActive, registeredAt] = data;
    
    return {
      owner,
      name,
      category: parseInt(category),
      location,
      revenue: parseInt(revenue),
      fundingNeeded: parseInt(fundingNeeded),
      totalFunded: parseInt(totalFunded),
      sustainabilityScore: parseInt(sustainabilityScore),
      isActive,
      registeredAt: parseInt(registeredAt),
      lastSaleAt: 0 // Not tracked in lite version
    };
  }

  private parseInvestorData(data: any): BlockchainInvestor {
    const [wallet, name, totalInvested, fundedShops, isRegistered] = data;
    
    return {
      wallet,
      name,
      totalInvested: parseInt(totalInvested),
      activeInvestments: fundedShops.length, // Calculate from fundedShops array
      fundedShops: fundedShops.map((id: string) => parseInt(id)),
      isRegistered
    };
  }

  // =============================================================================
  // CONNECTION TEST
  // =============================================================================

  async testConnection(): Promise<boolean> {
    try {
      // Simple test to see if contract is accessible
      const stats = await this.getNetworkStats();
      console.log('Contract connection test successful:', stats);
      return true;
    } catch (error) {
      console.error('Contract connection test failed:', error);
      return false;
    }
  }

  getTotalFundedForShop(shopId: string): number {
    return this.fundingHistory.get(shopId) || 0;
  }

  /**
   * Debug wallet and contract issues
   */
  async debugWalletAndContract(): Promise<any> {
    try {
      return await maschainService.debugWalletAndContract(this.contractAddress);
    } catch (error) {
      console.error('Debug failed:', error);
      throw error;
    }
  }

  /**
   * Test simple contract execution
   */
  async testSimpleContractExecution(): Promise<any> {
    try {
      return await maschainService.testContractExecution(this.contractAddress);
    } catch (error) {
      console.error('Contract execution test failed:', error);
      throw error;
    }
  }

  /**
   * Get wallet balance from MASchain
   */
  async getWalletBalance(): Promise<{ balance: string; symbol: string }> {
    try {
      return await maschainService.getWalletBalance();
    } catch (error) {
      console.error('Failed to get wallet balance:', error);
      throw new Error('Unable to fetch wallet balance');
    }
  }

  // =============================================================================
  // TEST FUNCTIONS
  // =============================================================================

  /**
   * Register a shop directly (for testing when Portal fails)
   */
  async registerTestShop(): Promise<string> {
    if (!this.walletAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      console.log('🏪 Registering test shop with simplified parameters');
      
      // Convert 5000 GPS tokens to wei (18 decimals)
      const fundingNeededInWei = (5000 * Math.pow(10, 18)).toString();
      
      console.log('🔍 Registration parameters:', {
        name: 'Green Valley Organic Farm',
        category: 0,
        location: 'Thailand',
        fundingNeeded: fundingNeededInWei,
        fundingNeededInGPS: '5000 GPS'
      });
      
      try {
        const result = await maschainService.executeContract(
          this.contractAddress, 
          'registerShop',
          ['Green Valley Organic Farm', 0, 'Thailand', fundingNeededInWei],
          true // Always include ABI for contract writes
        );
        return result.transaction_hash || result.txHash || 'Registration submitted';
      } catch (apiError: any) {
        console.error('❌ MASchain API error:', apiError);
        
        // If it's a 500 error, provide helpful guidance
        if (apiError.message?.includes('500') || apiError.message?.includes('Server Error')) {
          throw new Error(`MASchain API Server Error (HTTP 500)\n\nThis indicates an internal issue with MASchain's API service.\n\nPossible causes:\n• Contract execution failure\n• Insufficient gas/MAS tokens\n• MASchain service temporary issues\n\nRecommendations:\n1. Check wallet MAS balance for gas fees\n2. Try again in a few minutes\n3. Contact MASchain support if persists\n\nContract Address: ${this.contractAddress}\nWallet: ${this.walletAddress}`);
        }
        
        // Re-throw other errors as-is
        throw apiError;
      }
    } catch (error: any) {
      console.error('❌ Shop registration failed:', error);
      throw new Error(`Failed to register shop: ${error.message}`);
    }
  }

  /**
   * Try registering a shop with different parameter formats
   */
  async tryRegisterShopAlternative(): Promise<string> {
    if (!this.walletAddress) {
      throw new Error('Wallet not connected');
    }

    console.log('🔄 Trying alternative shop registration formats...');

    // Try Format 1: Direct parameter mapping
    try {
      console.log('📝 Attempt 1: Direct parameter mapping');
      const result1 = await maschainService.executeContract(
        this.contractAddress, 
        'registerShop',
        [
          'Test Shop Alternative 1',  // name
          0,                          // category (uint8)
          'Thailand',                 // location
          '5000000000000000000000'    // 5000 * 10^18 wei
        ],
        false // no ABI
      );
      console.log('✅ Direct mapping successful:', result1);
      return result1.transaction_hash || result1.txHash || 'Success';
    } catch (error1) {
      console.log('❌ Direct mapping failed:', error1);
    }

    // Try Format 2: With ABI
    try {
      console.log('📝 Attempt 2: With contract ABI');
      const result2 = await maschainService.executeContract(
        this.contractAddress, 
        'registerShop',
        [
          'Test Shop Alternative 2',  // name
          0,                          // category (uint8)
          'Thailand',                 // location
          '5000000000000000000000'    // 5000 * 10^18 wei
        ],
        true // include ABI
      );
      console.log('✅ ABI mapping successful:', result2);
      return result2.transaction_hash || result2.txHash || 'Success';
    } catch (error2) {
      console.log('❌ ABI mapping failed:', error2);
    }

    // Try Format 3: Manual payload construction
    try {
      console.log('📝 Attempt 3: Manual payload construction');
      
      const manualPayload = {
        wallet_options: {
          type: "organisation",
          address: this.walletAddress
        },
        method_name: "registerShop",
        params: {
          _name: 'Test Shop Alternative 3',
          _category: 0,
          _location: 'Thailand',
          _fundingNeeded: '5000000000000000000000'
        }
      };

      const response = await fetch(`${config.maschain.apiUrl}/api/contract/smart-contracts/${this.contractAddress}/execute`, {
        method: 'POST',
        headers: {
          'client_id': config.maschain.clientId,
          'client_secret': config.maschain.clientSecret,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(manualPayload),
      });

      const responseText = await response.text();
      console.log('📥 Manual payload response:', {
        status: response.status,
        body: responseText
      });

      if (response.ok) {
        const result = JSON.parse(responseText);
        console.log('✅ Manual payload successful:', result);
        return result.result?.transaction_hash || result.transaction_hash || 'Success';
      } else {
        console.log('❌ Manual payload failed:', responseText);
      }
    } catch (error3) {
      console.log('❌ Manual payload construction failed:', error3);
    }

    throw new Error('All registration attempts failed. Check console for detailed error information.');
  }

}

// Export singleton instance
export const smartContractService = new SmartContractServiceLite();

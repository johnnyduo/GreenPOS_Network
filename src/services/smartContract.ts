import { maschainService } from './maschain';
import { config } from '../config';
import { 
  ShopCategory, 
  getCategoryName 
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

export class SmartContractService {
  private contractAddress: string;
  private gpsTokenAddress: string;
  private walletAddress: string | null = null;

  constructor() {
    this.contractAddress = config.maschain.contractAddress;
    this.gpsTokenAddress = config.maschain.gpsTokenAddress || '';
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
  // GPS TOKEN FUNCTIONS
  // =============================================================================

  async getGPSTokenInfo(): Promise<GPSTokenInfo> {
    if (!this.walletAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      // Mock GPS token info for now - replace with actual contract calls
      return {
        address: this.gpsTokenAddress,
        name: 'GreenPOS Token',
        symbol: 'GPS',
        decimals: 18,
        balance: 10000, // Mock balance
        allowance: 5000  // Mock allowance
      };
    } catch (error) {
      console.error('Failed to get GPS token info:', error);
      throw new Error('Failed to retrieve GPS token information');
    }
  }

  async approveGPSTokens(amount: number): Promise<string> {
    if (!this.walletAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      console.log(`Approving ${amount} GPS tokens for contract use...`);
      
      // Mock approval transaction
      const txHash = '0x' + Math.random().toString(16).substr(2, 64);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log(`GPS tokens approved! Transaction: ${txHash}`);
      return txHash;
    } catch (error) {
      console.error('Failed to approve GPS tokens:', error);
      throw new Error('Failed to approve GPS tokens');
    }
  }

  async getGPSBalance(address?: string): Promise<number> {
    const targetAddress = address || this.walletAddress;
    if (!targetAddress) {
      throw new Error('No address provided and wallet not connected');
    }

    try {
      // Mock balance - replace with actual contract call
      return 10000; // 10,000 GPS tokens
    } catch (error) {
      console.error('Failed to get GPS balance:', error);
      throw new Error('Failed to retrieve GPS balance');
    }
  }

  /**
   * Register a new shop on the blockchain
   */
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
          fundingNeeded: shopData.fundingNeeded
        },
        callback_url: `${window.location.origin}/api/contract-callback`
      };

      const result = await maschainService.executeContract(this.contractAddress, params);
      return result.transaction_hash || result.txHash || 'Transaction submitted';
    } catch (error: any) {
      throw new Error(`Failed to register shop: ${error.message}`);
    }
  }

  /**
   * Register as an investor on the blockchain
   */
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
   * Fund a shop on the blockchain
   */
  async fundShop(fundingData: FundingData): Promise<string> {
    if (!this.walletAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      // First check if user has enough GPS tokens
      const balance = await this.getGPSBalance();
      if (balance < fundingData.amount) {
        throw new Error(`Insufficient GPS balance. Required: ${fundingData.amount}, Available: ${balance}`);
      }

      // Check if contract has enough allowance
      const tokenInfo = await this.getGPSTokenInfo();
      if (tokenInfo.allowance < fundingData.amount) {
        throw new Error(`Insufficient GPS token allowance. Please approve ${fundingData.amount} GPS tokens first.`);
      }

      // Call the contract with GPS token amount
      const params = {
        wallet_options: {
          type: 'end_user' as const,
          address: this.walletAddress
        },
        method_name: 'fundShop',
        params: {
          shopId: fundingData.shopId,
          amount: fundingData.amount.toString(), // GPS token amount
          purpose: fundingData.purpose
        },
        callback_url: `${window.location.origin}/api/contract-callback`
      };

      console.log(`Funding shop ${fundingData.shopId} with ${fundingData.amount} GPS tokens...`);
      
      const result = await maschainService.executeContract(this.contractAddress, params);
      
      console.log('Shop funding successful!', result);
      return result.transaction_hash || result.txHash || 'Transaction submitted';
    } catch (error: any) {
      console.error('Failed to fund shop:', error);
      throw new Error(`Failed to fund shop: ${error.message}`);
    }
  }

  /**
   * Record a sale for a shop
   */
  async recordSale(shopId: number, amount: number): Promise<string> {
    if (!this.walletAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      const params = {
        wallet_options: {
          type: 'end_user' as const,
          address: this.walletAddress
        },
        method_name: 'recordSale',
        params: {
          shopId,
          amount
        },
        callback_url: `${window.location.origin}/api/contract-callback`
      };

      const result = await maschainService.executeContract(this.contractAddress, params);
      return result.transaction_hash || result.txHash || 'Transaction submitted';
    } catch (error: any) {
      throw new Error(`Failed to record sale: ${error.message}`);
    }
  }

  /**
   * Update sustainability score for a shop
   */
  async updateSustainabilityScore(shopId: number, score: number): Promise<string> {
    if (!this.walletAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      const params = {
        wallet_options: {
          type: 'end_user' as const,
          address: this.walletAddress
        },
        method_name: 'updateSustainabilityScore',
        params: {
          shopId,
          score
        },
        callback_url: `${window.location.origin}/api/contract-callback`
      };

      const result = await maschainService.executeContract(this.contractAddress, params);
      return result.transaction_hash || result.txHash || 'Transaction submitted';
    } catch (error: any) {
      throw new Error(`Failed to update sustainability score: ${error.message}`);
    }
  }

  /**
   * Get shop details from blockchain
   */
  async getShop(shopId: number): Promise<any> {
    try {
      const params = {
        from: this.walletAddress || config.maschain.walletAddress,
        method_name: 'getShop',
        params: { shopId }
      };

      const result = await maschainService.callContract(this.contractAddress, params);
      return result.data || result.result;
    } catch (error: any) {
      throw new Error(`Failed to get shop details: ${error.message}`);
    }
  }

  /**
   * Get network statistics from blockchain
   */
  async getNetworkStats(): Promise<any> {
    try {
      const params = {
        from: this.walletAddress || config.maschain.walletAddress,
        method_name: 'getNetworkStats',
        params: {}
      };

      const result = await maschainService.callContract(this.contractAddress, params);
      return result.data || result.result;
    } catch (error: any) {
      throw new Error(`Failed to get network stats: ${error.message}`);
    }
  }

  /**
   * Get funding history for a shop
   */
  async getFundingHistory(shopId: number): Promise<any[]> {
    try {
      const params = {
        from: this.walletAddress || config.maschain.walletAddress,
        method_name: 'getFundingHistory',
        params: { shopId }
      };

      const result = await maschainService.callContract(this.contractAddress, params);
      return result.data || result.result || [];
    } catch (error: any) {
      throw new Error(`Failed to get funding history: ${error.message}`);
    }
  }

  /**
   * Check if a shop is fully funded
   */
  async isShopFullyFunded(shopId: number): Promise<boolean> {
    try {
      const params = {
        from: this.walletAddress || config.maschain.walletAddress,
        method_name: 'isShopFullyFunded',
        params: { shopId }
      };

      const result = await maschainService.callContract(this.contractAddress, params);
      return result.data || result.result || false;
    } catch (error: any) {
      throw new Error(`Failed to check funding status: ${error.message}`);
    }
  }

  /**
   * Get funding progress percentage for a shop
   */
  async getFundingProgress(shopId: number): Promise<number> {
    try {
      const params = {
        from: this.walletAddress || config.maschain.walletAddress,
        method_name: 'getFundingProgress',
        params: { shopId }
      };

      const result = await maschainService.callContract(this.contractAddress, params);
      return result.data || result.result || 0;
    } catch (error: any) {
      throw new Error(`Failed to get funding progress: ${error.message}`);
    }
  }

  /**
   * Get active shops with pagination
   */
  async getActiveShops(offset: number = 0, limit: number = 50): Promise<number[]> {
    try {
      const params = {
        from: this.walletAddress || config.maschain.walletAddress,
        method_name: 'getActiveShops',
        params: { offset, limit }
      };

      const result = await maschainService.callContract(this.contractAddress, params);
      return result.data || result.result || [];
    } catch (error: any) {
      throw new Error(`Failed to get active shops: ${error.message}`);
    }
  }

  /**
   * Get investor details
   */
  async getInvestor(investorAddress: string): Promise<any> {
    try {
      const params = {
        from: this.walletAddress || config.maschain.walletAddress,
        method_name: 'getInvestor',
        params: { investorAddress }
      };

      const result = await maschainService.callContract(this.contractAddress, params);
      return result.data || result.result;
    } catch (error: any) {
      throw new Error(`Failed to get investor details: ${error.message}`);
    }
  }

  /**
   * Get shops funded by an investor
   */
  async getInvestorShops(investorAddress: string): Promise<number[]> {
    try {
      const params = {
        from: this.walletAddress || config.maschain.walletAddress,
        method_name: 'getInvestorShops',
        params: { investorAddress }
      };

      const result = await maschainService.callContract(this.contractAddress, params);
      return result.data || result.result || [];
    } catch (error: any) {
      throw new Error(`Failed to get investor shops: ${error.message}`);
    }
  }

  /**
   * Get category name from enum value
   */
  async getCategoryName(category: ShopCategory): Promise<string> {
    try {
      const params = {
        from: this.walletAddress || config.maschain.walletAddress,
        method_name: 'getCategoryName',
        params: { category }
      };

      const result = await maschainService.callContract(this.contractAddress, params);
      return result.data || result.result || 'Unknown';
    } catch (error: any) {
      // Fallback to local implementation
      return getCategoryName(category);
    }
  }

  /**
   * Get the contract explorer URL
   */
  getContractExplorerUrl(): string {
    return `${config.maschain.explorerUrl}/${this.contractAddress}`;
  }

  /**
   * Get transaction explorer URL
   */
  getTransactionExplorerUrl(txHash: string): string {
    return `${config.maschain.explorerUrl}/${txHash}`;
  }
}

// Export a singleton instance
export const smartContractService = new SmartContractService();

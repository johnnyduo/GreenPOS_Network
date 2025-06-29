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
  // GPS TOKEN FUNCTIONS (Optimized)
  // =============================================================================

  async getGPSTokenInfo(): Promise<GPSTokenInfo> {
    if (!this.walletAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      // Mock GPS token info - in production, call the actual contract
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
      
      // Mock approval - in production, call GPS token contract
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

  async fundShop(fundingData: FundingData): Promise<string> {
    if (!this.walletAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      // Check GPS token balance
      const balance = await this.getGPSBalance();
      if (balance < fundingData.amount) {
        throw new Error(`Insufficient GPS balance. Required: ${fundingData.amount}, Available: ${balance}`);
      }

      // Check allowance
      const tokenInfo = await this.getGPSTokenInfo();
      if (tokenInfo.allowance < fundingData.amount) {
        throw new Error(`Insufficient GPS token allowance. Please approve ${fundingData.amount} GPS tokens first.`);
      }

      const params = {
        wallet_options: {
          type: 'end_user' as const,
          address: this.walletAddress
        },
        method_name: 'fundShop',
        params: {
          shopId: fundingData.shopId.toString(),
          amount: fundingData.amount.toString(),
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
          shopId: shopId.toString(),
          amount: amount.toString()
        },
        callback_url: `${window.location.origin}/api/contract-callback`
      };

      const result = await maschainService.executeContract(this.contractAddress, params);
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
      const params = {
        wallet_options: {
          type: 'end_user' as const,
          address: this.walletAddress
        },
        method_name: 'updateSustainabilityScore',
        params: {
          shopId: shopId.toString(),
          score: score.toString()
        },
        callback_url: `${window.location.origin}/api/contract-callback`
      };

      const result = await maschainService.executeContract(this.contractAddress, params);
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

      const result = await maschainService.callContract(this.contractAddress, params);
      
      if (!result || !result.data) {
        throw new Error('No network stats returned');
      }

      // Parse the returned tuple: (totalShops, activeShops, totalFunding, totalInvestors, avgSustainability)
      const [totalShops, totalActiveShops, totalFunding, totalInvestors, averageSustainabilityScore] = result.data;

      return {
        totalShops: parseInt(totalShops),
        totalActiveShops: parseInt(totalActiveShops),
        totalFunding: parseInt(totalFunding),
        totalInvestors: parseInt(totalInvestors),
        averageSustainabilityScore: parseInt(averageSustainabilityScore),
        totalTransactions: 0 // Not tracked in lite version
      };
    } catch (error: any) {
      console.error('Failed to get network stats:', error);
      throw new Error(`Failed to retrieve network stats: ${error.message}`);
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
}

// Export singleton instance
export const smartContractService = new SmartContractServiceLite();

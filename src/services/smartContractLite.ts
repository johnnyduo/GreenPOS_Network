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

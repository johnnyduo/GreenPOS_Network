import { config } from '../config';

export interface MASChainConfig {
  apiUrl: string;
  clientId: string;
  clientSecret: string;
  walletAddress: string;
  explorerUrl: string;
  portalUrl: string;
}

export interface ContractCallParams {
  from: string;
  method_name: string;
  params?: Record<string, any>;
  contract_abi?: any[];
}

export interface ContractExecuteParams {
  wallet_options: {
    type: 'organisation' | 'end_user';
    address: string;
  };
  method_name: string;
  params?: Record<string, any>;
  contract_abi?: any[];
  callback_url?: string;
}

export interface NetworkStats {
  totalShops: number;
  totalActiveShops: number;
  totalFunding: number;
  totalInvestors: number;
  averageSustainabilityScore: number;
  totalTransactions: number;
}

export interface Shop {
  owner: string;
  name: string;
  category: number;
  location: string;
  revenue: number;
  fundingNeeded: number;
  totalFunded: number;
  sustainabilityScore: number;
  isActive: boolean;
  registeredAt: number;
  lastSaleAt: number;
}

export interface FundingTransaction {
  shopId: number;
  investor: string;
  amount: number;
  timestamp: number;
  purpose: string;
  isActive: boolean;
}

export class MASChainService {
  private config: MASChainConfig;
  private contractAddress: string = '';
  private lastRequestTime: number = 0;
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue: boolean = false;
  private readonly MIN_REQUEST_INTERVAL = 1000; // 1 second between requests
  private failureCount: number = 0;
  private lastFailureTime: number = 0;
  private readonly MAX_FAILURES = 3;
  private readonly CIRCUIT_BREAKER_TIMEOUT = 30000; // 30 seconds

  constructor() {
    this.config = {
      apiUrl: config.maschain.apiUrl,
      clientId: config.maschain.clientId,
      clientSecret: config.maschain.clientSecret,
      walletAddress: config.maschain.walletAddress,
      explorerUrl: config.maschain.explorerUrl,
      portalUrl: config.maschain.portalUrl,
    };
    
    // Set the deployed contract address from config
    this.contractAddress = config.maschain.contractAddress || null;
  }

  /**
   * Get request headers for MASchain API
   */
  private getHeaders(): Record<string, string> {
    return {
      'client_id': this.config.clientId,
      'client_secret': this.config.clientSecret,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Set the deployed contract address
   */
  setContractAddress(address: string): void {
    this.contractAddress = address;
  }

  /**
   * Get the current contract address
   */
  getContractAddress(): string | null {
    return this.contractAddress;
  }

  /**
   * List all deployed smart contracts
   */
  async listContracts(): Promise<any> {
    try {
      const response = await fetch(`${this.config.apiUrl}/api/contract/smart-contracts`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error listing contracts:', error);
      throw error;
    }
  }

  /**
   * Get contract details by address
   */
  async getContractDetails(address: string): Promise<any> {
    try {
      const response = await fetch(`${this.config.apiUrl}/api/contract/smart-contracts/${address}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting contract details:', error);
      throw error;
    }
  }

  /**
   * Call a smart contract function (read-only)
   */
  async callContract(address: string, params: ContractCallParams): Promise<any> {
    if (!this.shouldAllowRequest()) {
      throw new Error('Service temporarily unavailable (circuit breaker active)');
    }

    return this.throttleRequest(async () => {
      try {
        console.log(`🔗 Calling contract ${address} method: ${params.method_name}`);
        console.log('📝 Contract call params:', params);
        
        const response = await fetch(`${this.config.apiUrl}/api/contract/smart-contracts/${address}/call`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(params),
        });

        if (!response.ok) {
          this.recordFailure();
          const errorText = await response.text();
          console.error(`❌ Contract call failed: ${response.status} - ${errorText}`);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log('✅ Contract call result:', result);
        this.recordSuccess();
        return result.result;
      } catch (error) {
        this.recordFailure();
        console.error('❌ Error calling contract:', error);
        throw error;
      }
    });
  }

  /**
   * Execute a smart contract function (write) - Updated to match MASchain API docs
   */
  async executeContract(contractAddress: string, methodName: string, args: any[] = [], includeABI: boolean = true): Promise<any> {
    try {
      // Map parameters based on the specific method being called
      const params = this.mapContractParameters(methodName, args);

      const payload: any = {
        wallet_options: {
          type: "organisation", // Using custodial wallet
          address: this.config.walletAddress
        },
        method_name: methodName,
        params: params
      };

      // Include contract ABI if requested (may help with execution issues)
      if (includeABI) {
        try {
          const { CONTRACT_ABI } = await import('./contractABI');
          payload.contract_abi = CONTRACT_ABI;
          console.log('📋 Including contract ABI in request');
        } catch (error) {
          console.warn('⚠️ Could not load contract ABI:', error);
          // Don't throw error, but log that ABI is missing
          console.warn('⚠️ Continuing without ABI - this may cause the request to fail');
        }
      }

      console.log('⚡ Smart Contract Write Call:', {
        contractAddress,
        methodName,
        args,
        payload: { ...payload, contract_abi: payload.contract_abi ? '[ABI_INCLUDED]' : undefined }
      });

      const response = await fetch(`${this.config.apiUrl}/api/contract/smart-contracts/${contractAddress}/execute`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      let responseBody;
      try {
        responseBody = await response.text();
        console.log('📥 MASchain response:', {
          status: response.status,
          statusText: response.statusText,
          body: responseBody
        });
      } catch (e) {
        console.error('Could not read response body');
      }

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        if (responseBody) {
          try {
            const errorData = JSON.parse(responseBody);
            errorMessage += ` - ${errorData.message || errorData.error || 'Unknown error'}`;
            if (errorData.details) {
              errorMessage += ` Details: ${JSON.stringify(errorData.details)}`;
            }
          } catch (e) {
            errorMessage += ` - ${responseBody}`;
          }
        }
        throw new Error(errorMessage);
      }

      let result;
      if (responseBody) {
        try {
          result = JSON.parse(responseBody);
          
          // Ensure transaction hash is properly formatted if present
          if (result.result && result.result.transaction_hash) {
            let txHash = result.result.transaction_hash;
            if (!txHash.startsWith('0x')) {
              txHash = '0x' + txHash;
            }
            if (txHash.length !== 66) { // 0x + 64 chars
              console.warn('MASchain returned non-standard transaction hash:', txHash);
            }
            result.result.transaction_hash = txHash;
          }
          
        } catch (e) {
          throw new Error(`Invalid JSON response: ${responseBody}`);
        }
      } else {
        throw new Error('Empty response body');
      }

      console.log('📝 Smart Contract Write Response:', result);
      return result.result || result;
    } catch (error) {
      console.error('Failed to execute contract (write):', error);
      throw error;
    }
  }

  // Helper function to map contract parameters based on method name
  private mapContractParameters(methodName: string, args: any[]): { [key: string]: any } | undefined {
    console.log('🔧 Mapping contract parameters:', { methodName, args });

    // Special cases for methods with no parameters
    if (methodName === 'registrationFee' || methodName === 'getTotalShops' || methodName === 'shopCount') {
      return undefined;
    }

    if (!args || args.length === 0) {
      console.warn('No arguments provided for method:', methodName);
      return undefined;
    }

    switch (methodName) {
      case 'registerShop':
        return {
          '_name': args[0],
          '_category': args[1], 
          '_location': args[2],
          '_fundingNeeded': args[3]
        };
      
      case 'fundShop':
        return {
          '_shopId': args[0],
          '_amount': args[1],
          '_purpose': args[2]
        };
      
      case 'registerInvestor':
        return {
          '_name': args[0]
        };
      
      case 'getShop':
        return { '_shopId': args[0] };
      
      case 'getShopsByOwner':
        return { '_owner': args[0] };
      
      case 'getShopsByCategory':
        return { '_category': args[0] };
      
      case 'approve':
        return {
          'spender': args[0],
          'value': args[1]
        };
      
      case 'allowance':
        return {
          'owner': args[0],
          'spender': args[1]
        };
        
      case 'transfer':
        return {
          'to': args[0],
          'value': args[1]
        };
      
      default:
        // Fallback to generic parameter mapping
        const params: { [key: string]: any } = {};
        args.forEach((arg, index) => {
          params[`param${index}`] = arg;
        });
        console.log('🔄 Generic params mapping:', params);
        return params;
    }
  }

  /**
   * Get wallet balance (native MAS tokens) - Using POST format as per MASchain docs
   */
  async getWalletBalance(): Promise<{ balance: string; symbol: string }> {
    try {
      const response = await fetch(`${this.config.apiUrl}/api/wallet/balance`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          wallet_address: this.config.walletAddress
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return {
        balance: result.balance || '0',
        symbol: result.symbol || 'MAS'
      };
    } catch (error) {
      console.error('Failed to get wallet balance:', error);
      throw error;
    }
  }

  /**
   * Get transaction details
   */
  async getTransaction(hash: string): Promise<any> {
    try {
      const response = await fetch(`${this.config.apiUrl}/api/contract/transactions/${hash}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting transaction:', error);
      throw error;
    }
  }

  /**
   * Get transaction receipt
   */
  async getTransactionReceipt(hash: string): Promise<any> {
    try {
      const response = await fetch(`${this.config.apiUrl}/api/contract/transactions/${hash}/receipt`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting transaction receipt:', error);
      throw error;
    }
  }

  /**
   * Get account nonce
   */
  async getAccountNonce(address: string): Promise<number> {
    try {
      const response = await fetch(`${this.config.apiUrl}/api/contract/accounts/${address}/nonce`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.result;
    } catch (error) {
      console.error('Error getting account nonce:', error);
      throw error;
    }
  }

  // =============================================================================
  // GREENPOS SPECIFIC FUNCTIONS
  // =============================================================================

  /**
   * Register a new shop
   */
  async registerShop(name: string, category: number, location: string, fundingNeeded: number): Promise<string> {
    if (!this.contractAddress) {
      throw new Error('Contract address not set');
    }

    const result = await this.executeContract(
      this.contractAddress, 
      'registerShop',
      [name, category, location, fundingNeeded.toString()],
      true // Always include ABI since it's required for success
    );
    return result.transaction_hash;
  }

  /**
   * Register as an investor
   */
  async registerInvestor(name: string): Promise<string> {
    if (!this.contractAddress) {
      throw new Error('Contract address not set');
    }

    const result = await this.executeContract(
      this.contractAddress, 
      'registerInvestor',
      [name],
      true // Always include ABI since it's required for success
    );
    return result.transaction_hash;
  }

  /**
   * Fund a shop
   * Note: Amount is sent as msg.value in the transaction, not as a parameter
   */
  async fundShop(shopId: number, _amount: number, purpose: string): Promise<string> {
    if (!this.contractAddress) {
      throw new Error('Contract address not set');
    }

    const result = await this.executeContract(
      this.contractAddress, 
      'fundShop',
      [shopId.toString(), _amount.toString(), purpose],
      true // Always include ABI since it's required for success
    );
    return result.transaction_hash;
  }

  /**
   * Record a sale
   */
  async recordSale(shopId: number, amount: number): Promise<string> {
    if (!this.contractAddress) {
      throw new Error('Contract address not set');
    }

    const result = await this.executeContract(
      this.contractAddress, 
      'recordSale',
      [shopId.toString(), amount.toString()]
    );
    return result.transaction_hash;
  }

  /**
   * Update sustainability score
   */
  async updateSustainabilityScore(shopId: number, score: number): Promise<string> {
    if (!this.contractAddress) {
      throw new Error('Contract address not set');
    }

    const result = await this.executeContract(
      this.contractAddress, 
      'updateSustainabilityScore',
      [shopId.toString(), score.toString()]
    );
    return result.transaction_hash;
  }

  /**
   * Get shop details
   */
  async getShop(shopId: number): Promise<Shop> {
    if (!this.contractAddress) {
      throw new Error('Contract address not set');
    }

    const params: ContractCallParams = {
      from: this.config.walletAddress,
      method_name: 'getShop',
      params: {
        _shopId: shopId.toString(),
      },
    };

    const result = await this.callContract(this.contractAddress, params);
    return result as Shop;
  }

  /**
   * Get network statistics
   */
  async getNetworkStats(): Promise<NetworkStats> {
    if (!this.contractAddress) {
      throw new Error('Contract address not set');
    }

    const params: ContractCallParams = {
      from: this.config.walletAddress,
      method_name: 'getNetworkStats',
    };

    const result = await this.callContract(this.contractAddress, params);
    return result as NetworkStats;
  }

  /**
   * Get funding history for a shop
   */
  async getFundingHistory(shopId: number): Promise<FundingTransaction[]> {
    if (!this.contractAddress) {
      throw new Error('Contract address not set');
    }

    const params: ContractCallParams = {
      from: this.config.walletAddress,
      method_name: 'getFundingHistory',
      params: {
        shopId: shopId.toString(),
      },
    };

    const result = await this.callContract(this.contractAddress, params);
    return result as FundingTransaction[];
  }

  /**
   * Get active shops with pagination
   */
  async getActiveShops(offset: number = 0, limit: number = 10): Promise<number[]> {
    if (!this.contractAddress) {
      throw new Error('Contract address not set');
    }

    const params: ContractCallParams = {
      from: this.config.walletAddress,
      method_name: 'getActiveShops',
      params: {
        offset: offset.toString(),
        limit: limit.toString(),
      },
    };

    const result = await this.callContract(this.contractAddress, params);
    return result as number[];
  }

  /**
   * Check if shop is fully funded
   */
  async isShopFullyFunded(shopId: number): Promise<boolean> {
    if (!this.contractAddress) {
      throw new Error('Contract address not set');
    }

    const params: ContractCallParams = {
      from: this.config.walletAddress,
      method_name: 'isShopFullyFunded',
      params: {
        shopId: shopId.toString(),
      },
    };

    const result = await this.callContract(this.contractAddress, params);
    return result as boolean;
  }

  /**
   * Get funding progress percentage
   */
  async getFundingProgress(shopId: number): Promise<number> {
    if (!this.contractAddress) {
      throw new Error('Contract address not set');
    }

    const params: ContractCallParams = {
      from: this.config.walletAddress,
      method_name: 'getFundingProgress',
      params: {
        shopId: shopId.toString(),
      },
    };

    const result = await this.callContract(this.contractAddress, params);
    return result as number;
  }

  /**
   * Get category name from enum value
   */
  async getCategoryName(category: number): Promise<string> {
    if (!this.contractAddress) {
      throw new Error('Contract address not set');
    }

    const params: ContractCallParams = {
      from: this.config.walletAddress,
      method_name: 'getCategoryName',
      params: {
        category: category.toString(),
      },
    };

    const result = await this.callContract(this.contractAddress, params);
    return result as string;
  }

  /**
   * Get explorer URL for transaction
   */
  getTransactionUrl(hash: string): string {
    return `${this.config.explorerUrl}/tx/${hash}`;
  }

  /**
   * Get explorer URL for contract
   */
  getContractUrl(address: string): string {
    return `${this.config.explorerUrl}/address/${address}`;
  }

  /**
   * Get MASchain portal URL
   */
  getPortalUrl(): string {
    return this.config.portalUrl;
  }

  /**
   * Throttle requests to prevent API overload
   */
  private async throttleRequest<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const now = Date.now();
          const timeSinceLastRequest = now - this.lastRequestTime;
          
          if (timeSinceLastRequest < this.MIN_REQUEST_INTERVAL) {
            const delay = this.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
            await new Promise(resolve => setTimeout(resolve, delay));
          }
          
          this.lastRequestTime = Date.now();
          const result = await requestFn();
          this.recordSuccess();
          resolve(result);
        } catch (error) {
          this.recordFailure();
          reject(error);
        }
      });
      
      this.processQueue();
    });
  }

  /**
   * Circuit breaker pattern to prevent hammering a failing service
   */
  private shouldAllowRequest(): boolean {
    const now = Date.now();
    
    // If we haven't had recent failures, allow the request
    if (this.failureCount < this.MAX_FAILURES) {
      return true;
    }
    
    // If circuit breaker timeout has passed, allow a test request
    if (now - this.lastFailureTime > this.CIRCUIT_BREAKER_TIMEOUT) {
      this.failureCount = 0; // Reset failure count
      return true;
    }
    
    return false;
  }

  private recordFailure() {
    this.failureCount++;
    this.lastFailureTime = Date.now();
  }

  private recordSuccess() {
    this.failureCount = 0;
  }

  private async processQueue() {
    if (this.isProcessingQueue || this.requestQueue.length === 0) {
      return;
    }
    
    this.isProcessingQueue = true;
    
    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift();
      if (request) {
        try {
          await request();
        } catch (error) {
          console.error('Request failed in queue:', error);
        }
      }
    }
    
    this.isProcessingQueue = false;
  }

  /**
   * Debug wallet and contract issues
   */
  async debugWalletAndContract(contractAddress: string): Promise<any> {
    const debug: any = {
      timestamp: new Date().toISOString(),
      wallet: {
        address: this.config.walletAddress,
        balance: null,
        error: null
      },
      contract: {
        address: contractAddress,
        exists: false,
        details: null,
        error: null,
        readTest: null
      },
      maschain: {
        apiUrl: this.config.apiUrl,
        credentials: {
          hasClientId: !!this.config.clientId,
          hasClientSecret: !!this.config.clientSecret,
          clientIdPrefix: this.config.clientId?.substring(0, 10) + '...'
        }
      }
    };

    console.log('🔍 Starting wallet and contract debug...');

    // Test 1: Check wallet balance
    try {
      const balance = await this.getWalletBalance();
      debug.wallet.balance = balance;
      console.log('✅ Wallet balance:', balance);
    } catch (error: any) {
      debug.wallet.error = error.message;
      console.error('❌ Wallet balance check failed:', error);
    }

    // Test 2: Check contract existence
    try {
      const contractDetails = await this.getContractDetails(contractAddress);
      debug.contract.exists = true;
      debug.contract.details = contractDetails;
      console.log('✅ Contract exists:', contractDetails);
    } catch (error: any) {
      debug.contract.error = error.message;
      console.error('❌ Contract check failed:', error);
    }

    // Test 3: Try a simple contract read
    try {
      const readResult = await this.callContract(contractAddress, {
        from: this.config.walletAddress,
        method_name: 'shopCounter',
        params: {}
      });
      debug.contract.readTest = { success: true, result: readResult };
      console.log('✅ Contract read test passed:', readResult);
    } catch (error: any) {
      debug.contract.readTest = { success: false, error: error.message };
      console.error('❌ Contract read test failed:', error);
    }

    console.log('🔍 Debug report:', debug);
    return debug;
  }

  /**
   * Test contract execution with minimal parameters
   */
  async testContractExecution(contractAddress: string): Promise<any> {
    console.log('🧪 Testing contract execution with minimal parameters...');
    
    try {
      // Try the simplest possible write operation first
      const result = await this.executeContract(contractAddress, 'registerInvestor', ['Test Investor'], false);
      console.log('✅ Simple contract execution successful:', result);
      return { success: true, result };
    } catch (error: any) {
      console.error('❌ Simple contract execution failed:', error);
      
      // Now try with ABI included
      try {
        console.log('🔄 Retrying with contract ABI...');
        const resultWithAbi = await this.executeContract(contractAddress, 'registerInvestor', ['Test Investor'], true);
        console.log('✅ Contract execution with ABI successful:', resultWithAbi);
        return { success: true, result: resultWithAbi, usedAbi: true };
      } catch (abiError: any) {
        console.error('❌ Contract execution with ABI also failed:', abiError);
        return { success: false, error: error.message, abiError: abiError.message };
      }
    }
  }
}

// Create a singleton instance
export const maschainService = new MASChainService();

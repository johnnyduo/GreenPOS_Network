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
        const response = await fetch(`${this.config.apiUrl}/api/contract/smart-contracts/${address}/call`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(params),
        });

        if (!response.ok) {
          this.recordFailure();
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        this.recordSuccess();
        return result.result;
      } catch (error) {
        this.recordFailure();
        console.error('Error calling contract:', error);
        throw error;
      }
    });
  }

  /**
   * Execute a smart contract function (write)
   */
  async executeContract(address: string, params: ContractExecuteParams): Promise<any> {
    try {
      const response = await fetch(`${this.config.apiUrl}/api/contract/smart-contracts/${address}/execute`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.result;
    } catch (error) {
      console.error('Error executing contract:', error);
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

    const params: ContractExecuteParams = {
      wallet_options: {
        type: 'organisation',
        address: this.config.walletAddress,
      },
      method_name: 'registerShop',
      params: {
        name,
        category,
        location,
        fundingNeeded: fundingNeeded.toString(),
      },
    };

    const result = await this.executeContract(this.contractAddress, params);
    return result.transaction_hash;
  }

  /**
   * Register as an investor
   */
  async registerInvestor(name: string): Promise<string> {
    if (!this.contractAddress) {
      throw new Error('Contract address not set');
    }

    const params: ContractExecuteParams = {
      wallet_options: {
        type: 'organisation',
        address: this.config.walletAddress,
      },
      method_name: 'registerInvestor',
      params: {
        name,
      },
    };

    const result = await this.executeContract(this.contractAddress, params);
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

    const params: ContractExecuteParams = {
      wallet_options: {
        type: 'organisation',
        address: this.config.walletAddress,
      },
      method_name: 'fundShop',
      params: {
        shopId: shopId.toString(),
        purpose,
      },
    };

    const result = await this.executeContract(this.contractAddress, params);
    return result.transaction_hash;
  }

  /**
   * Record a sale
   */
  async recordSale(shopId: number, amount: number): Promise<string> {
    if (!this.contractAddress) {
      throw new Error('Contract address not set');
    }

    const params: ContractExecuteParams = {
      wallet_options: {
        type: 'organisation',
        address: this.config.walletAddress,
      },
      method_name: 'recordSale',
      params: {
        shopId: shopId.toString(),
        amount: amount.toString(),
      },
    };

    const result = await this.executeContract(this.contractAddress, params);
    return result.transaction_hash;
  }

  /**
   * Update sustainability score
   */
  async updateSustainabilityScore(shopId: number, score: number): Promise<string> {
    if (!this.contractAddress) {
      throw new Error('Contract address not set');
    }

    const params: ContractExecuteParams = {
      wallet_options: {
        type: 'organisation',
        address: this.config.walletAddress,
      },
      method_name: 'updateSustainabilityScore',
      params: {
        shopId: shopId.toString(),
        score: score.toString(),
      },
    };

    const result = await this.executeContract(this.contractAddress, params);
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
        shopId: shopId.toString(),
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
}

// Create a singleton instance
export const maschainService = new MASChainService();

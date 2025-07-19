import { config } from '../config';

/**
 * IMPORTANT: The GreenPOSNetworkEnhanced smart contract requires:
 * - MIN_FUNDING: 100 * 10^18 wei (100 GPS tokens minimum)
 * - MAX_FUNDING: 1,000,000 * 10^18 wei (1M GPS tokens maximum)
 * Any shop registration with fundingNeeded below 100 tokens will fail with "Invalid funding"
 */

export interface MASChainConfig {
  apiUrl: string;
  clientId: string;
  clientSecret: string;
  walletAddress: string;
  explorerUrl: string;
  portalUrl: string;
  gpsTokenAddress: string;
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

  constructor() {
    this.config = {
      apiUrl: config.maschain.apiUrl,
      clientId: config.maschain.clientId,
      clientSecret: config.maschain.clientSecret,
      walletAddress: config.maschain.walletAddress,
      explorerUrl: config.maschain.explorerUrl,
      portalUrl: config.maschain.portalUrl,
      gpsTokenAddress: config.maschain.gpsTokenAddress,
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
   * Call a smart contract function (read-only) with enhanced error handling
   */
  async callContract(address: string, params: ContractCallParams): Promise<any> {
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
          const errorText = await response.text();
          console.error(`❌ Contract call failed: ${response.status} - ${errorText}`);
          
          // Enhanced error handling for common issues
          if (response.status === 401) {
            throw new Error(`Authentication failed: Invalid API credentials. Please check your MASchain client_id and client_secret.`);
          } else if (response.status === 404) {
            throw new Error(`Endpoint not found: The MASchain API endpoint may be incorrect. Current: ${this.config.apiUrl}`);
          } else if (response.status >= 500) {
            throw new Error(`MASchain server error (${response.status}): The service may be temporarily unavailable.`);
          }
          
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const result = await response.json();
        console.log('✅ Contract call result:', result);
        return result.result;
      } catch (error) {
        console.error('❌ Error calling contract:', error);
        
        // Add specific handling for network errors
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          throw new Error(`Network error: Unable to connect to MASchain API at ${this.config.apiUrl}. Please check your internet connection and API endpoint.`);
        }
        
        throw error;
      }
    });
  }

  /**
   * Execute a smart contract function (write) - Updated to match MASchain API docs
   */
  async executeContract(contractAddress: string, methodName: string, args: any[] = [], includeABI: boolean = true): Promise<any> {
    return this.throttleRequest(async () => {
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
            // Use different ABI based on contract address
            let abi;
            if (contractAddress.toLowerCase() === config.maschain.gpsTokenAddress.toLowerCase()) {
              // Use GPS Token ABI for GPS token contract calls
              const { GPS_TOKEN_ABI } = await import('./contractABI');
              abi = GPS_TOKEN_ABI;
              console.log('📋 Including GPS Token ABI in request');
            } else {
              // Use main contract ABI for main contract calls
              const { CONTRACT_ABI } = await import('./contractABI');
              abi = CONTRACT_ABI;
              console.log('📋 Including main contract ABI in request');
            }
            payload.contract_abi = abi;
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
    });
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

    // Try multiple parameter mapping strategies
    let mappedParams: { [key: string]: any };

    switch (methodName) {
      case 'registerShop':
        // MASchain API expects parameters matching the ABI parameter names
        mappedParams = {
          'name': args[0],
          'category': parseInt(args[1].toString()),
          'location': args[2], 
          'fundingNeeded': args[3].toString()
        };
        break;
      
      case 'fundShop':
        mappedParams = {
          '_shopId': parseInt(args[0].toString()),
          '_amount': args[1].toString(),
          '_purpose': args[2]
        };
        break;
      
      case 'approve':
        // ERC20 approve method for GPS token contract
        mappedParams = {
          'spender': args[0],  // Contract address that will be approved to spend
          'amount': args[1].toString()  // Amount to approve in wei
        };
        break;
      
      case 'allowance':
        // ERC20 allowance method for GPS token contract - READ operation
        mappedParams = {
          'owner': args[0],    // Owner address
          'spender': args[1]   // Spender address (contract)
        };
        break;
      
      case 'registerInvestor':
        mappedParams = {
          'name': args[0] // Changed from '_name' to 'name' based on API error
        };
        break;
      
      case 'getShop':
        mappedParams = { 'shopId': parseInt(args[0].toString()) };
        break;
      
      case 'recordSale':
        mappedParams = {
          'shopId': parseInt(args[0].toString()),
          'amount': args[1].toString()
        };
        break;
      
      case 'updateSustainabilityScore':
        mappedParams = {
          'shopId': parseInt(args[0].toString()),
          'score': parseInt(args[1].toString())
        };
        break;
      
      default:
        // Fallback to generic parameter mapping with proper types
        mappedParams = {};
        args.forEach((arg, index) => {
          // Try to convert numbers properly
          if (typeof arg === 'number' || !isNaN(Number(arg))) {
            mappedParams[`param${index}`] = parseInt(arg.toString());
          } else {
            mappedParams[`param${index}`] = arg;
          }
        });
        break;
    }

    console.log('✅ Mapped parameters:', mappedParams);
    return mappedParams;
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

    console.log('🏪 Registering shop with MASchain API...', {
      name, category, location, fundingNeeded
    });

    // Use the standard executeContract method
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
   */
  async fundShop(shopId: number, amount: number, purpose: string): Promise<string> {
    if (!this.contractAddress) {
      throw new Error('Contract address not set');
    }

    console.log('💰 Funding shop with MASchain API...', {
      shopId, amount, purpose
    });

    // Use the standard executeContract method
    const result = await this.executeContract(
      this.contractAddress, 
      'fundShop',
      [shopId.toString(), amount.toString(), purpose],
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
   * Transfer GPS tokens (ERC20 transfer)
   */
  async transferGPS(toAddress: string, amount: number): Promise<string> {
    if (!this.config.gpsTokenAddress) {
      throw new Error('GPS token address not configured');
    }

    // Convert amount to wei (assuming 18 decimals for GPS token)
    const amountInWei = (amount * Math.pow(10, 18)).toString();

    const result = await this.executeContract(
      this.config.gpsTokenAddress, 
      'transfer',
      [toAddress, amountInWei]
    );
    return result.transaction_hash;
  }

  /**
   * Process a sale transaction with GPS payment
   */
  async processSaleWithGPS(shopId: number, saleAmount: number, gpsAmount: number = 10): Promise<{ txHash: string; explorerUrl: string }> {
    try {
      console.log(`🔄 Processing sale for shop ${shopId} with ${gpsAmount} GPS payment...`);
      
      // Transfer fixed 10 GPS tokens to our own wallet (mock payment)
      const txHash = await this.transferGPS(this.config.walletAddress, gpsAmount);
      
      // Record the sale on the main contract
      await this.recordSale(shopId, saleAmount);
      
      const explorerUrl = `${this.config.explorerUrl}/tx/${txHash}`;
      
      console.log(`✅ Sale processed successfully! TX: ${txHash}`);
      
      return {
        txHash,
        explorerUrl
      };
    } catch (error) {
      console.error('❌ Failed to process sale with GPS:', error);
      throw error;
    }
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
   * Get shop details FROM BLOCKCHAIN - THIS IS THE REAL DATA
   */
  async getShop(shopId: number): Promise<Shop> {
    if (!this.contractAddress) {
      throw new Error('Contract address not set');
    }

    console.log(`🔍 Getting REAL on-chain data for shop ID: ${shopId}`);

    const params: ContractCallParams = {
      from: this.config.walletAddress,
      method_name: 'getShop',
      params: {
        _shopId: shopId.toString(),
      },
    };

    try {
      const result = await this.callContract(this.contractAddress, params);
      console.log('✅ Real on-chain shop data:', result);
      return result as Shop;
    } catch (error) {
      console.error('❌ Failed to get on-chain shop data:', error);
      throw error;
    }
  }

  /**
   * Get network statistics FROM BLOCKCHAIN
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
   * Get funding history for a shop FROM BLOCKCHAIN
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
   * Get active shops with pagination FROM BLOCKCHAIN
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
   * Check if shop is fully funded FROM BLOCKCHAIN
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
   * Get funding progress percentage FROM BLOCKCHAIN
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
   * Get category name from enum value FROM BLOCKCHAIN
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
    return `${this.config.explorerUrl}/${hash}`;
  }

  /**
   * Get explorer URL for contract
   */
  getContractUrl(address: string): string {
    return `${this.config.explorerUrl}/${address}`;
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
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      this.processQueue();
    });
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
   * Get token balance for a specific wallet and contract
   */
  async getTokenBalance(contractAddress: string, walletAddress?: string): Promise<{ balance: string; symbol: string }> {
    try {
      const address = walletAddress || this.config.walletAddress;
      
      // Validate required parameters
      if (!address) {
        throw new Error('Wallet address is required');
      }
      if (!contractAddress) {
        throw new Error('Contract address is required');
      }
      
      const payload = {
        wallet_address: address,
        contract_address: contractAddress
      };

      console.log('🔍 Checking token balance via MASchain API:', {
        wallet: address,
        contract: contractAddress,
        endpoint: '/api/token/balance'
      });

      const response = await fetch(`${this.config.apiUrl}/api/token/balance`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Token balance API error: ${response.status} - ${errorText}`);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log('📊 Token balance response:', result);
      
      // Try multiple possible response formats
      let balance = '0';
      let symbol = 'GPS';
      
      // Check various possible response structures
      if (result.result !== undefined) {
        balance = String(result.result);
      } else if (result.balance !== undefined) {
        balance = String(result.balance);
      } else if (result.data && result.data.balance !== undefined) {
        balance = String(result.data.balance);
      } else if (result.data && result.data.result !== undefined) {
        balance = String(result.data.result);
      } else if (result.amount !== undefined) {
        balance = String(result.amount);
      }
      
      // Get symbol if available
      if (result.symbol) {
        symbol = result.symbol;
      } else if (result.tokenSymbol) {
        symbol = result.tokenSymbol;
      } else if (result.data && result.data.symbol) {
        symbol = result.data.symbol;
      }
      
      console.log(`📊 Extracted balance: ${balance} ${symbol}`);
      
      return {
        balance: balance,
        symbol: symbol
      };
    } catch (error) {
      console.error('Failed to get token balance:', error);
      // Return zero balance instead of throwing to prevent app crashes
      return { balance: '0', symbol: 'GPS' };
    }
  }

  /**
   * Mint tokens using MASchain API (based on working TokenManager example)
   * Uses the dedicated /api/token/mint endpoint with simpler payload structure
   */
  async mintTokens(params: {
    to: string;
    amount: string;
    contractAddress: string;
    callbackUrl?: string;
  }): Promise<{
    transactionHash?: string;
    explorerUrl?: string;
    success: boolean;
    message: string;
  }> {
    return this.throttleRequest(async () => {
      try {
        console.log('🪙 Mint Token Request:', {
          wallet_address: this.config.walletAddress,
          to: params.to,
          amount: params.amount,
          contract_address: params.contractAddress,
          endpoint: '/api/token/mint'
        });

        // Use the same payload structure as the working example
        const payload = {
          wallet_address: this.config.walletAddress,
          to: params.to,
          amount: params.amount,
          contract_address: params.contractAddress,
          callback_url: params.callbackUrl || `${this.config.portalUrl}/api/webhook`
        };

        const response = await fetch(`${this.config.apiUrl}/api/token/mint`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(payload),
        });

        let responseBody;
        try {
          responseBody = await response.text();
          console.log('📥 Mint Token Response:', {
            status: response.status,
            statusText: response.statusText,
            body: responseBody
          });
        } catch (e) {
          console.error('Could not read mint response body');
        }

        if (!response.ok) {
          let errorMessage = `HTTP error! status: ${response.status}`;
          if (responseBody) {
            try {
              const errorData = JSON.parse(responseBody);
              errorMessage += ` - ${errorData.message || errorData.error || 'Unknown error'}`;
            } catch (e) {
              errorMessage += ` - ${responseBody}`;
            }
          }
          
          // Provide more specific error messages like the example
          if (errorMessage.includes('total supply reached')) {
            throw new Error('Token total supply limit reached. Cannot mint more tokens.');
          } else if (errorMessage.includes('400')) {
            throw new Error('Invalid mint request. Check contract address and amount.');
          } else {
            throw new Error(errorMessage);
          }
        }

        let result;
        if (responseBody) {
          try {
            result = JSON.parse(responseBody);
            console.log('✅ Mint Token Response:', result);
            
            // Extract transaction hash using multiple possible field names
            const txHash = result.result?.transactionHash || 
                          result.transactionHash || 
                          result.result?.hash || 
                          result.hash ||
                          result.result?.transaction_hash ||
                          result.transaction_hash;
            
            if (txHash) {
              // Ensure proper formatting
              let formattedTxHash = txHash;
              if (!formattedTxHash.startsWith('0x')) {
                formattedTxHash = '0x' + formattedTxHash;
              }
              
              const explorerUrl = `${this.config.explorerUrl}/${formattedTxHash}`;
              
              console.log('🔗 Transaction Hash:', formattedTxHash);
              console.log('🌐 Explorer Link:', explorerUrl);
              
              return {
                transactionHash: formattedTxHash,
                explorerUrl: explorerUrl,
                success: true,
                message: `Successfully minted ${params.amount} tokens to ${params.to}`
              };
            } else {
              console.warn('⚠️ No transaction hash in mint response');
              return {
                success: true,
                message: `Mint transaction submitted (${params.amount} tokens to ${params.to})`
              };
            }
          } catch (e) {
            throw new Error(`Invalid JSON response: ${responseBody}`);
          }
        } else {
          throw new Error('Empty response body from mint request');
        }
      } catch (error) {
        console.error('❌ Failed to mint tokens:', error);
        throw error;
      }
    });
  }

  /**
   * Get token balance with retry logic for fresh transactions
   * Useful after minting or transferring tokens when balance might not be immediately updated
   */
  async getTokenBalanceWithRetry(
    contractAddress: string, 
    walletAddress?: string, 
    maxRetries: number = 3,
    delayBetweenRetries: number = 2000
  ): Promise<{ balance: string; symbol: string }> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Attempt ${attempt}/${maxRetries} - Fetching token balance...`);
        
        const result = await this.getTokenBalance(contractAddress, walletAddress);
        
        // If we got a valid balance (not just "0"), return it
        if (result.balance && result.balance !== '0') {
          console.log(`✅ Token balance fetched successfully on attempt ${attempt}:`, result);
          return result;
        }
        
        // If balance is still 0 and we have more attempts, wait and try again
        if (attempt < maxRetries) {
          console.log(`⏳ Balance still 0, waiting ${delayBetweenRetries}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delayBetweenRetries));
        } else {
          console.log('⚠️ All attempts completed, balance is still 0');
          return result; // Return the last result even if it's 0
        }
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`❌ Attempt ${attempt} failed:`, lastError.message);
        
        // If this is the last attempt, throw the error
        if (attempt === maxRetries) {
          throw lastError;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delayBetweenRetries));
      }
    }
    
    // This should never be reached, but just in case
    throw lastError || new Error('Failed to fetch token balance after all retries');
  }

  /**
   * Debug method to check token balance fetching in detail
   * This will help us understand why balance is showing as zero
   */
  async debugTokenBalance(contractAddress: string, walletAddress?: string): Promise<any> {
    try {
      const address = walletAddress || this.config.walletAddress;
      
      console.log('🔍 DEBUG: Token Balance Check Started');
      console.log(`   • Wallet Address: ${address}`);
      console.log(`   • Token Contract: ${contractAddress}`);
      console.log(`   • API Endpoint: ${this.config.apiUrl}/api/token/balance`);
      console.log(`   • Client ID: ${this.config.clientId ? '✅ Set' : '❌ Missing'}`);
      console.log(`   • Client Secret: ${this.config.clientSecret ? '✅ Set' : '❌ Missing'}`);
      
      const payload = {
        wallet_address: address,
        contract_address: contractAddress
      };
      
      console.log('📝 Request payload:', payload);
      
      const response = await fetch(`${this.config.apiUrl}/api/token/balance`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });
      
      console.log(`📥 Response status: ${response.status}`);
      console.log(`📥 Response headers:`, Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log(`📥 Raw response body: ${responseText}`);
      
      if (!response.ok) {
        console.error(`❌ API Error: ${response.status} - ${responseText}`);
        return {
          error: true,
          status: response.status,
          message: responseText,
          debug: {
            endpoint: `${this.config.apiUrl}/api/token/balance`,
            payload,
            headers: this.getHeaders()
          }
        };
      }
      
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(responseText);
        console.log('📊 Parsed response:', JSON.stringify(parsedResponse, null, 2));
      } catch (e) {
        console.error('❌ Failed to parse JSON response:', e);
        return {
          error: true,
          message: 'Invalid JSON response',
          rawResponse: responseText
        };
      }
      
      // Check all possible balance fields
      const possibleBalanceFields = [
        'result',
        'balance', 
        'data.balance',
        'data.result',
        'result.balance',
        'tokenBalance',
        'amount'
      ];
      
      console.log('🔍 Checking balance fields:');
      possibleBalanceFields.forEach(field => {
        const value = this.getNestedValue(parsedResponse, field);
        console.log(`   • ${field}: ${value || 'undefined'}`);
      });
      
      // Return full debug info
      return {
        success: true,
        rawResponse: parsedResponse,
        detectedBalance: parsedResponse.result || parsedResponse.balance || '0',
        symbol: parsedResponse.symbol || 'GPS',
        debug: {
          endpoint: `${this.config.apiUrl}/api/token/balance`,
          payload,
          allFields: possibleBalanceFields.map(field => ({
            field,
            value: this.getNestedValue(parsedResponse, field)
          }))
        }
      };
      
    } catch (error) {
      console.error('❌ Debug token balance failed:', error);
      return {
        error: true,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      };
    }
  }
  
  /**
   * Helper method to get nested object values
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Debug method to check all configuration values and token setup
   */
  async debugConfiguration(): Promise<any> {
    try {
      console.log('🔍 DEBUG: Configuration Check');
      console.log('========================');
      
      // Check basic config
      const configDebug = {
        apiUrl: this.config.apiUrl,
        clientId: this.config.clientId ? '✅ Set' : '❌ Missing',
        clientSecret: this.config.clientSecret ? '✅ Set' : '❌ Missing',
        walletAddress: this.config.walletAddress || '❌ Missing',
        contractAddress: this.contractAddress || '❌ Missing',
        explorerUrl: this.config.explorerUrl,
        portalUrl: this.config.portalUrl
      };
      
      console.log('📊 MASchain Configuration:', configDebug);
      
      // Check GPS token address from config
      const gpsTokenAddress = (config as any).maschain?.gpsTokenAddress;
      console.log(`🪙 GPS Token Address: ${gpsTokenAddress || '❌ Missing'}`);
      
      // Test API connectivity
      console.log('🔌 Testing API connectivity...');
      try {
        const testResponse = await fetch(`${this.config.apiUrl}/api/wallet/balance`, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ wallet_address: this.config.walletAddress })
        });
        
        console.log(`✅ API Test Response: ${testResponse.status}`);
        
        if (testResponse.ok) {
          const walletBalance = await testResponse.json();
          console.log('💰 Wallet Balance:', walletBalance);
        }
      } catch (apiError) {
        console.error('❌ API Test Failed:', apiError);
      }
      
      // Test token balance if GPS token address is available
      if (gpsTokenAddress && this.config.walletAddress) {
        console.log('🪙 Testing GPS token balance...');
        const tokenDebug = await this.debugTokenBalance(gpsTokenAddress, this.config.walletAddress);
        console.log('📊 Token Balance Debug Result:', tokenDebug);
        
        return {
          config: configDebug,
          gpsTokenAddress: gpsTokenAddress || null,
          walletBalance: 'tested above',
          tokenBalance: tokenDebug
        };
      } else {
        console.warn('⚠️ Cannot test token balance - missing GPS token address or wallet address');
        return {
          config: configDebug,
          gpsTokenAddress: gpsTokenAddress || null,
          issue: 'Missing GPS token address or wallet address'
        };
      }
      
    } catch (error) {
      console.error('❌ Configuration debug failed:', error);
      return {
        error: true,
        message: error instanceof Error ? error.message : String(error)
      };
    }
  }
}

// Create a singleton instance
export const maschainService = new MASChainService();

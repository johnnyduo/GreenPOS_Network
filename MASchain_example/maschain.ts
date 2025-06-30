// MASChain API service for gasless transactions
export class MASChainService {
  private apiUrl: string;
  private apiKey: string; // Using client_id as API key
  private clientSecret: string;
  private walletAddress: string;

  constructor() {
    this.apiUrl = import.meta.env.VITE_MASCHAIN_API_URL;
    this.apiKey = import.meta.env.VITE_MASCHAIN_CLIENT_ID; // API key is same as client_id
    this.clientSecret = import.meta.env.VITE_MASCHAIN_CLIENT_SECRET;
    this.walletAddress = import.meta.env.VITE_MASCHAIN_WALLET_ADDRESS;

    // Validate configuration on construction
    this.validateConfiguration();
  }

  private validateConfiguration() {
    const missing = [];
    if (!this.apiUrl) missing.push('VITE_MASCHAIN_API_URL');
    if (!this.apiKey) missing.push('VITE_MASCHAIN_CLIENT_ID');
    if (!this.clientSecret) missing.push('VITE_MASCHAIN_CLIENT_SECRET');
    if (!this.walletAddress) missing.push('VITE_MASCHAIN_WALLET_ADDRESS');

    if (missing.length > 0) {
      console.error('Missing MASChain environment variables:', missing);
      console.error('Please set the following environment variables:');
      missing.forEach(env => console.error(`- ${env}`));
    }
  }

  // Base API request method
  private async makeRequest(endpoint: string, method: 'GET' | 'POST' = 'GET', body?: any) {
    const url = `${this.apiUrl}${endpoint}`;
    
    // Debug configuration
    console.log('MASChain API Request:', {
      url,
      method,
      hasCredentials: !!(this.apiKey || this.clientSecret),
      apiKeyPrefix: this.apiKey?.substring(0, 10) + '...',
      body: body ? JSON.stringify(body).substring(0, 100) + '...' : undefined
    });
    
    try {
      const headers: any = {
        'Content-Type': 'application/json',
      };

      // Add MASChain authentication headers exactly as documented
      if (this.apiKey) {
        headers['client_id'] = this.apiKey;
      }
      if (this.clientSecret) {
        headers['client_secret'] = this.clientSecret;
      }

      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      console.log('MASChain API Response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('MASChain API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText
        });
        throw new Error(`MASChain API Error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('MASChain API Request Failed:', error);
      throw error;
    }
  }

  // Get wallet balance (native MAS tokens)
  async getWalletBalance(): Promise<{ balance: string; symbol: string }> {
    try {
      // For native MAS balance, we might need a different endpoint
      // Let's try the wallet info endpoint first
      const response = await this.makeRequest(`/api/wallet/balance`, 'POST', {
        wallet_address: this.walletAddress
      });
      return {
        balance: response.balance || '0',
        symbol: response.symbol || 'MAS'
      };
    } catch (error) {
      console.error('Failed to get wallet balance:', error);
      // Return default values if API fails
      return { balance: '0', symbol: 'MAS' };
    }
  }

  // Token balance checking is sufficient for our needs
  // Transaction history functionality removed as it's not essential

  // Create a gasless transaction
  async createGaslessTransaction(to: string, value: string, data?: string): Promise<any> {
    try {
      const payload = {
        from: this.walletAddress,
        to,
        value,
        data: data || '0x',
        gasless: true
      };

      const response = await this.makeRequest('/api/transaction/create', 'POST', payload);
      return response;
    } catch (error) {
      console.error('Failed to create gasless transaction:', error);
      throw error;
    }
  }

  // Get network status (simplified - no API call needed)
  async getNetworkStatus(): Promise<{ connected: boolean; blockNumber?: number; chainId?: number }> {
    // Since there's no documented network status API, just return connected status
    // The fact that we can make other API calls means we're connected
    return { 
      connected: true,
      blockNumber: undefined, // Don't show block number without real API
      chainId: 1337 // MASChain testnet ID
    };
  }

  // Deploy smart contract (gasless)
  async deployContract(bytecode: string, constructorArgs?: any[]): Promise<any> {
    try {
      const payload = {
        from: this.walletAddress,
        bytecode,
        constructorArgs: constructorArgs || [],
        gasless: true
      };

      const response = await this.makeRequest('/api/contract/deploy', 'POST', payload);
      return response;
    } catch (error) {
      console.error('Failed to deploy contract:', error);
      throw error;
    }
  }

  // Call smart contract method (read operations)
  async callContract(contractAddress: string, methodName: string, args: any[] = []): Promise<any> {
    try {
      // Map parameters based on the specific method being called
      const params = this.mapContractParameters(methodName, args);

      const payload = {
        from: this.walletAddress,
        method_name: methodName,
        params: params
      };

      console.log('🔍 Smart Contract Read Call:', {
        contractAddress,
        methodName,
        args,
        payload,
        walletAddress: this.walletAddress
      });

      // Validate that required parameters are present
      if (methodName === 'getUserAssets' && (!params || !params.user)) {
        throw new Error(`Missing required parameter user for getUserAssets. Args: ${JSON.stringify(args)}, Params: ${JSON.stringify(params)}`);
      }
      
      if (methodName === 'getAsset' && (!params || !params.id)) {
        throw new Error(`Missing required parameter id for getAsset. Args: ${JSON.stringify(args)}, Params: ${JSON.stringify(params)}`);
      }

      const response = await this.makeRequest(`/api/contract/smart-contracts/${contractAddress}/call`, 'POST', payload);
      
      console.log('📊 Smart Contract Read Response:', response);
      return response.result || response;
    } catch (error) {
      console.error('Failed to call contract (read):', error);
      throw error;
    }
  }

  // Execute smart contract method (write operations)
  async executeContract(contractAddress: string, methodName: string, args: any[] = []): Promise<any> {
    try {
      // Map parameters based on the specific method being called
      const params = this.mapContractParameters(methodName, args);

      const payload = {
        wallet_options: {
          type: "organisation", // Using custodial wallet
          address: this.walletAddress
        },
        method_name: methodName,
        params: params,
        callback_url: `${window.location.origin}/api/webhook` // Optional callback
      };

      console.log('⚡ Smart Contract Write Call:', {
        contractAddress,
        methodName,
        args,
        payload
      });

      const response = await this.makeRequest(`/api/contract/smart-contracts/${contractAddress}/execute`, 'POST', payload);
      
      console.log('📝 Smart Contract Write Response:', response);
      return response.result || response;
    } catch (error) {
      console.error('Failed to execute contract (write):', error);
      throw error;
    }
  }

  // Helper function to map contract parameters based on method name
  private mapContractParameters(methodName: string, args: any[]): { [key: string]: any } | undefined {
    console.log('🔧 Mapping contract parameters:', { methodName, args });

    // Special cases for methods with no parameters
    if (methodName === 'registrationFee' || methodName === 'getTotalAssets') {
      return undefined;
    }

    if (!args || args.length === 0) {
      console.warn('No arguments provided for method:', methodName);
      return undefined;
    }

    switch (methodName) {
      case 'getUserAssets':
        const userParam = { 'user': args[0] };
        console.log('📋 getUserAssets params:', userParam);
        return userParam;
      
      case 'getAsset':
        console.log('🔍 getAsset mapping - args[0]:', args[0], 'type:', typeof args[0]);
        
        // Check if args[0] is an array (this shouldn't happen)
        if (Array.isArray(args[0])) {
          console.error('❌ getAsset called with array instead of ID:', args[0]);
          return undefined; // Let validation catch this
        }
        
        if (args[0] === undefined || args[0] === null) {
          console.error('❌ getAsset called with undefined/null ID:', args[0]);
          return undefined; // Let validation catch this
        }
        return { 'id': args[0] }; // Match SolarRegistryWithNFT.sol parameter
      
      case 'getAssetCapacity':
        return { 'tokenId': args[0] }; // Match SolarRegistryWithNFT.sol parameter
      
      case 'getAssetType':
        return { 'tokenId': args[0] }; // Match SolarRegistryWithNFT.sol parameter
      
      case 'registerAsset':
        return {
          'assetName': args[0],
          'assetLocation': args[1],
          'assetLatitude': args[2],
          'assetLongitude': args[3],
          'assetCapacity': args[4],
          'assetType': args[5]
        };
      
      case 'approve':
        return {
          'spender': args[0],
          'value': args[1] // Changed from 'amount' to 'value' as required by API
        };
      
      case 'allowance':
        return {
          'owner': args[0],
          'spender': args[1]
        };
      
      case 'getAssetTokenId':
        return { 'assetId': args[0] }; // Updated to match potential contract parameter
      
      case 'tokenURI':
        return { 'tokenId': args[0] }; // Updated to match ERC721 standard
      
      case 'ownerOf':
        return { 'tokenId': args[0] }; // Standard ERC721 parameter
      
      case 'balanceOf':
        return { 'tokenOwner': args[0] }; // Match SolarRegistryWithNFT.sol parameter
      
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

  // Token Operations

  // Check token balance for wallet
  async getTokenBalance(contractAddress: string, walletAddress?: string): Promise<{ balance: string; symbol: string }> {
    try {
      const address = walletAddress || this.walletAddress;
      const payload = {
        wallet_address: address,
        contract_address: contractAddress
      };

      console.log('🔍 Checking token balance for:', {
        wallet: address,
        contract: contractAddress,
        payload
      });

      const response = await this.makeRequest('/api/token/balance', 'POST', payload);
      
      console.log('📊 Token balance response:', response);
      
      return {
        balance: response.result || response.balance || '0',
        symbol: response.symbol || 'TOKEN'
      };
    } catch (error) {
      console.error('Failed to get token balance:', error);
      return { balance: '0', symbol: 'TOKEN' };
    }
  }

  // Mint tokens (for contract owner)
  async mintTokens(params: {
    to: string;
    amount: string;
    contractAddress: string;
    callbackUrl?: string;
  }): Promise<any> {
    try {
      console.log('🪙 Mint Token Request:', {
        wallet_address: this.walletAddress,
        to: params.to,
        amount: params.amount,
        contract_address: params.contractAddress,
        endpoint: '/api/token/mint'
      });

      const payload = {
        wallet_address: this.walletAddress,
        to: params.to,
        amount: params.amount,
        contract_address: params.contractAddress,
        callback_url: params.callbackUrl || `${window.location.origin}/api/webhook`
      };

      const response = await this.makeRequest('/api/token/mint', 'POST', payload);
      console.log('✅ Mint Token Response:', response);
      
      // Extract transaction hash and provide explorer link
      const txHash = response.result?.transactionHash || response.transactionHash || response.result?.hash || response.hash;
      if (txHash) {
        const explorerUrl = `${import.meta.env.VITE_MASCHAIN_EXPLORER_URL}/${txHash}`;
        console.log('🔗 Transaction Hash:', txHash);
        console.log('🌐 Explorer Link:', explorerUrl);
        
        // Add explorer link to response
        response.explorerUrl = explorerUrl;
        response.transactionHash = txHash;
      }
      
      return response;
    } catch (error) {
      console.error('❌ Failed to mint tokens:', error);
      
      // Provide more specific error messages
      if (error.toString().includes('total supply reached')) {
        throw new Error('Token total supply limit reached. Cannot mint more tokens.');
      } else if (error.toString().includes('400')) {
        throw new Error('Invalid mint request. Check contract address and amount.');
      } else {
        throw error;
      }
    }
  }

  // Transfer tokens between addresses
  async transferTokens(params: {
    to: string;
    amount: string;
    contractAddress: string;
    callbackUrl?: string;
  }): Promise<any> {
    try {
      const payload = {
        from: this.walletAddress,
        to: params.to,
        amount: params.amount,
        contract_address: params.contractAddress,
        callback_url: params.callbackUrl || `${window.location.origin}/api/webhook`
      };

      const response = await this.makeRequest('/api/token/transfer', 'POST', payload);
      return response;
    } catch (error) {
      console.error('Failed to transfer tokens:', error);
      throw error;
    }
  }

  // Deploy a new token contract
  async deployTokenContract(params: {
    name: string;
    symbol: string;
    totalSupply: string;
    decimals?: number;
    callbackUrl?: string;
  }): Promise<any> {
    try {
      const payload = {
        wallet_address: this.walletAddress,
        name: params.name,
        symbol: params.symbol,
        total_supply: params.totalSupply,
        decimals: params.decimals || 18,
        callback_url: params.callbackUrl || `${window.location.origin}/api/webhook`
      };

      const response = await this.makeRequest('/api/contract/token/deploy', 'POST', payload);
      return response;
    } catch (error) {
      console.error('Failed to deploy token contract:', error);
      throw error;
    }
  }

  // Get wallet info
  getWalletInfo() {
    return {
      address: this.walletAddress,
      explorerUrl: `${import.meta.env.VITE_MASCHAIN_EXPLORER_URL}/address/${this.walletAddress}`,
      portalUrl: import.meta.env.VITE_MASCHAIN_PORTAL_URL
    };
  }

  // Test API connection (simplified - no health endpoint available)
  async testConnection(): Promise<{ success: boolean; message: string }> {
    // Since there's no documented health endpoint, just check if we have valid configuration
    if (!this.apiUrl || !this.apiKey || !this.walletAddress) {
      return { success: false, message: 'MASChain configuration incomplete' };
    }
    
    // If we have all required config, assume connection is good
    return { success: true, message: 'MASChain API configured successfully' };
  }

  // Test method: Get entity list (temporary for testing)
  async getEntityList(): Promise<any> {
    try {
      console.log('🔍 Getting entity list...');
      console.log('🔧 API URL:', `${this.apiUrl}/api/wallet/entity`);
      console.log('🔧 Headers will include:', {
        'client_id': this.apiKey?.substring(0, 10) + '...',
        'client_secret': this.clientSecret?.substring(0, 10) + '...',
        'Content-Type': 'application/json'
      });
      
      const response = await this.makeRequest('/api/wallet/entity', 'GET');
      console.log('📋 Entity List Raw Response:', response);
      
      // Validate response format against documentation
      if (response && typeof response === 'object') {
        console.log('✅ Response is object');
        console.log('🔍 Response status:', response.status);
        console.log('🔍 Response result type:', typeof response.result);
        console.log('🔍 Response result is array:', Array.isArray(response.result));
        
        if (response.status === 200 && Array.isArray(response.result)) {
          console.log('✅ Response format matches MASChain documentation');
        } else {
          console.log('⚠️ Response format differs from MASChain documentation');
          console.log('Expected: { status: 200, result: [...] }');
          console.log('Received:', { status: response.status, resultType: typeof response.result });
        }
      }
      
      return response;
    } catch (error) {
      console.error('Failed to get entity list:', error);
      throw error;
    }
  }

  // SolarAssetRegistry Contract Functions
  
  /**
   * Register a new solar asset (requires 1 RET token approval first)
   */
  async registerSolarAsset(assetData: {
    name: string;
    location: string;
    latitude: number;
    longitude: number;
    capacity: number;
    assetType: 0 | 1 | 2; // 0: Residential, 1: Commercial, 2: Utility
    totalShares: number;
    pricePerShare: string; // in wei
  }) {
    const contractAddress = import.meta.env.VITE_SOLAR_ASSET_REGISTRY_ADDRESS;
    if (!contractAddress) {
      throw new Error('SolarAssetRegistry contract address not configured');
    }

    // Convert latitude and longitude to scaled integers (multiply by 1e6)
    const scaledLatitude = Math.floor(assetData.latitude * 1000000);
    const scaledLongitude = Math.floor(assetData.longitude * 1000000);

    // Call registerAsset function
    return this.callContract(contractAddress, 'registerAsset', [
      assetData.name,
      assetData.location,
      scaledLatitude,
      scaledLongitude,
      assetData.capacity,
      assetData.assetType,
      assetData.totalShares,
      assetData.pricePerShare
    ]);
  }

  /**
   * Approve RET token spending for asset registration
   */
  async approveRETForRegistration(amount?: string) {
    const retContractAddress = import.meta.env.VITE_RET_CONTRACT_ADDRESS;
    const registryContractAddress = import.meta.env.VITE_SOLAR_ASSET_REGISTRY_ADDRESS;
    
    if (!retContractAddress || !registryContractAddress) {
      throw new Error('RET or SolarAssetRegistry contract address not configured');
    }

    // Default to 1 RET token (assuming 18 decimals)
    const approvalAmount = amount || '1000000000000000000'; // 1 RET

    return this.callContract(retContractAddress, 'approve', [
      registryContractAddress,
      approvalAmount
    ]);
  }

  /**
   * Get asset information by ID
   */
  async getSolarAsset(assetId: number) {
    const contractAddress = import.meta.env.VITE_SOLAR_ASSET_REGISTRY_ADDRESS;
    if (!contractAddress) {
      throw new Error('SolarAssetRegistry contract address not configured');
    }

    return this.callContract(contractAddress, 'getAsset', [assetId]);
  }

  /**
   * Get user's solar assets
   */
  async getUserSolarAssets(userAddress?: string) {
    const contractAddress = import.meta.env.VITE_SOLAR_ASSET_REGISTRY_ADDRESS;
    if (!contractAddress) {
      throw new Error('SolarAssetRegistry contract address not configured');
    }

    const address = userAddress || this.walletAddress;
    return this.callContract(contractAddress, 'getUserAssets', [address]);
  }

  /**
   * Get contract statistics
   */
  async getSolarRegistryStats() {
    const contractAddress = import.meta.env.VITE_SOLAR_ASSET_REGISTRY_ADDRESS;
    if (!contractAddress) {
      throw new Error('SolarAssetRegistry contract address not configured');
    }

    return this.callContract(contractAddress, 'getContractStats', []);
  }

  /**
   * Get current registration fee
   */
  async getRegistrationFee() {
    const contractAddress = import.meta.env.VITE_SOLAR_ASSET_REGISTRY_ADDRESS;
    if (!contractAddress) {
      throw new Error('SolarAssetRegistry contract address not configured');
    }

    return this.callContract(contractAddress, 'registrationFee', []);
  }

  /**
   * Purchase shares of an asset
   */
  async purchaseAssetShares(assetId: number, shares: number, totalPrice: string) {
    const contractAddress = import.meta.env.VITE_SOLAR_ASSET_REGISTRY_ADDRESS;
    if (!contractAddress) {
      throw new Error('SolarAssetRegistry contract address not configured');
    }

    return this.createGaslessTransaction(contractAddress, totalPrice, 
      this.encodeContractCall('purchaseShares', [assetId, shares]));
  }

  /**
   * Transfer shares to another user
   */
  async transferAssetShares(assetId: number, toAddress: string, shares: number) {
    const contractAddress = import.meta.env.VITE_SOLAR_ASSET_REGISTRY_ADDRESS;
    if (!contractAddress) {
      throw new Error('SolarAssetRegistry contract address not configured');
    }

    return this.callContract(contractAddress, 'transferShares', [assetId, toAddress, shares]);
  }

  /**
   * Get user's shareholding in an asset
   */
  async getUserAssetShares(assetId: number, userAddress?: string) {
    const contractAddress = import.meta.env.VITE_SOLAR_ASSET_REGISTRY_ADDRESS;
    if (!contractAddress) {
      throw new Error('SolarAssetRegistry contract address not configured');
    }

    const address = userAddress || this.walletAddress;
    return this.callContract(contractAddress, 'getUserShares', [assetId, address]);
  }

  /**
   * Helper function to map contract function calls
   */
  private encodeContractCall(functionName: string, args: any[]): string {
    // This is a placeholder - in a real implementation, you'd use proper ABI encoding
    // For now, return a simple encoded string that the API can understand
    return JSON.stringify({ function: functionName, args });
  }

  // === SimpleSolarRegistry Contract Functions ===

  /**
   * Register a solar asset using SimpleSolarRegistry (WRITE operation)
   */
  async registerSimpleSolarAsset(assetData: {
    name: string;
    location: string;
    latitude: number;
    longitude: number;
    capacity: number;
    assetType: number; // 0=Residential, 1=Commercial, 2=Utility
  }) {
    const contractAddress = import.meta.env.VITE_SIMPLE_SOLAR_REGISTRY_ADDRESS;
    if (!contractAddress) {
      throw new Error('SimpleSolarRegistry contract address not configured');
    }

    // Convert latitude and longitude to scaled integers (multiply by 1e6)
    const scaledLatitude = Math.floor(assetData.latitude * 1000000);
    const scaledLongitude = Math.floor(assetData.longitude * 1000000);

    console.log('🌟 Registering Solar Asset:', {
      ...assetData,
      scaledLatitude,
      scaledLongitude,
      contractAddress
    });

    // Use executeContract for write operations
    return this.executeContract(contractAddress, 'registerAsset', [
      assetData.name,
      assetData.location,
      scaledLatitude,
      scaledLongitude,
      assetData.capacity,
      assetData.assetType
    ]);
  }

  /**
   * Get simple solar asset information by ID (READ operation)
   */
  async getSimpleSolarAsset(assetId: number) {
    const contractAddress = import.meta.env.VITE_SIMPLE_SOLAR_REGISTRY_ADDRESS;
    if (!contractAddress) {
      throw new Error('SimpleSolarRegistry contract address not configured');
    }

    console.log('🔍 Getting Solar Asset:', { assetId, contractAddress });

    // Use callContract for read operations
    return this.callContract(contractAddress, 'getAsset', [assetId]);
  }

  /**
   * Get simple solar asset information by ID with robust parsing (READ operation)
   */
  async getSimpleSolarAssetParsed(assetId: number) {
    try {
      const response = await this.getSimpleSolarAsset(assetId);
      return this.parseAssetData(response, assetId);
    } catch (error) {
      console.error('Failed to get and parse simple solar asset:', error);
      throw error;
    }
  }

  /**
   * Get solar asset information by ID from NFT registry (READ operation)
   */
  async getSolarAssetWithNFT(assetId: number) {
    const contractAddress = import.meta.env.VITE_SOLAR_REGISTRY_WITH_NFT_ADDRESS;
    if (!contractAddress) {
      throw new Error('SolarRegistryWithNFT contract address not configured');
    }

    console.log('🔍 Getting Solar Asset with NFT:', { assetId, contractAddress });

    // Use callContract for read operations
    return this.callContract(contractAddress, 'getAsset', [assetId]);
  }

  /**
   * Get solar asset information by ID from NFT registry with robust parsing (READ operation)
   */
  async getSolarAssetWithNFTParsed(assetId: number) {
    try {
      const response = await this.getSolarAssetWithNFT(assetId);
      return this.parseAssetData(response, assetId);
    } catch (error) {
      console.error('Failed to get and parse NFT solar asset:', error);
      throw error;
    }
  }

  /**
   * Get user's solar assets from NFT registry (READ operation)
   */
  async getUserSolarAssetsWithNFT(userAddress?: string) {
    const contractAddress = import.meta.env.VITE_SOLAR_REGISTRY_WITH_NFT_ADDRESS;
    if (!contractAddress) {
      throw new Error('SolarRegistryWithNFT contract address not configured');
    }

    const address = userAddress || this.walletAddress;
    console.log('🔍 Getting User Solar Assets with NFT:', { 
      address, 
      contractAddress,
      walletAddressFromEnv: this.walletAddress,
      providedUserAddress: userAddress
    });

    if (!address) {
      throw new Error('No wallet address available for getUserAssets');
    }

    try {
      // Use callContract for read operations
      const response = await this.callContract(contractAddress, 'getUserAssets', [address]);
      
      // Parse the response using our helper method
      const assetIds = this.parseUserAssetsResponse(response);
      
      return {
        result: assetIds,
        message: 'Success',
        raw_response: response
      };
    } catch (error) {
      console.error('Failed to get user assets with NFT:', error);
      throw error;
    }
  }

  /**
   * Get total count of solar assets in NFT registry (READ operation)
   */
  async getSolarAssetWithNFTCount() {
    const contractAddress = import.meta.env.VITE_SOLAR_REGISTRY_WITH_NFT_ADDRESS;
    if (!contractAddress) {
      throw new Error('SolarRegistryWithNFT contract address not configured');
    }

    console.log('🔍 Getting Total Solar Asset Count (NFT Registry):', { contractAddress });

    // Use callContract for read operations
    return this.callContract(contractAddress, 'getTotalAssets', []);
  }

  /**
   * Get registration fee for NFT registry (READ operation)
   */
  async getNFTRegistrationFee() {
    const contractAddress = import.meta.env.VITE_SOLAR_REGISTRY_WITH_NFT_ADDRESS;
    if (!contractAddress) {
      throw new Error('SolarRegistryWithNFT contract address not configured');
    }

    console.log('🔍 Getting NFT Registration Fee:', { contractAddress });

    // Use callContract for read operations
    return this.callContract(contractAddress, 'registrationFee', []);
  }

  /**
   * Approve RET token spending for NFT asset registration (WRITE operation)
   */
  async approveRETForNFTRegistration(amount?: string) {
    const retContractAddress = import.meta.env.VITE_RET_CONTRACT_ADDRESS;
    const registryContractAddress = import.meta.env.VITE_SOLAR_REGISTRY_WITH_NFT_ADDRESS;
    
    if (!retContractAddress || !registryContractAddress) {
      throw new Error('RET or SolarRegistryWithNFT contract address not configured');
    }

    // Default to 1 RET token (assuming 18 decimals)
    const approvalAmount = amount || '1000000000000000000'; // 1 RET

    console.log('💰 Approving RET for NFT Registration:', {
      retContractAddress,
      registryContractAddress,
      approvalAmount,
      walletAddress: this.walletAddress
    });

    try {
      // Use executeContract for write operations
      const result = await this.executeContract(retContractAddress, 'approve', [
        registryContractAddress,
        approvalAmount
      ]);
      
      console.log('✅ RET approval for NFT registration result:', result);
      return result;
    } catch (error) {
      console.error('❌ RET approval for NFT registration failed:', error);
      
      // Provide more specific error messages
      if (error.toString().includes('insufficient balance')) {
        throw new Error('Insufficient RET balance for NFT registration approval');
      } else if (error.toString().includes('400')) {
        throw new Error('Invalid NFT approval request. Check contract addresses and amount.');
      } else if (error.toString().includes('VM revert')) {
        throw new Error('Contract execution failed. This might be due to insufficient balance or contract issues.');
      } else {
        throw error;
      }
    }
  }

  /**
   * Check current RET token allowance for the NFT registry contract (READ operation)
   */
  async getRETAllowanceForNFTRegistry(owner?: string): Promise<string> {
    const retContractAddress = import.meta.env.VITE_RET_CONTRACT_ADDRESS;
    const registryContractAddress = import.meta.env.VITE_SOLAR_REGISTRY_WITH_NFT_ADDRESS;
    
    if (!retContractAddress || !registryContractAddress) {
      throw new Error('RET or SolarRegistryWithNFT contract address not configured');
    }

    const ownerAddress = owner || this.walletAddress;

    console.log('🔍 Checking RET allowance for NFT registry:', {
      retContractAddress,
      ownerAddress,
      spender: registryContractAddress
    });

    try {
      // Use callContract for read operations - allowance(owner, spender)
      const result = await this.callContract(retContractAddress, 'allowance', [
        ownerAddress,
        registryContractAddress
      ]);
      
      console.log('📊 Current RET allowance for NFT registry:', result);
      return result?.allowance || result || '0';
    } catch (error) {
      console.error('❌ Failed to check RET allowance for NFT registry:', error);
      return '0';
    }
  }

  /**
   * Get NFT token ID for a specific asset (in this contract, asset ID = token ID)
   */
  async getAssetNFTTokenId(assetId: number): Promise<number | null> {
    // In SolarRegistryWithNFT, the asset ID is the same as the NFT token ID
    // No need to call the contract since this is a direct mapping
    console.log('🎨 NFT Token ID for asset:', assetId, '(asset ID = token ID)');
    return assetId;
  }

  /**
   * Get NFT metadata URI for a specific asset
   */
  async getAssetNFTMetadata(tokenId: number): Promise<string | null> {
    const contractAddress = import.meta.env.VITE_SOLAR_REGISTRY_WITH_NFT_ADDRESS;
    if (!contractAddress) {
      throw new Error('SolarRegistryWithNFT contract address not configured');
    }

    try {
      console.log('🖼️ Getting NFT Metadata URI for token:', { tokenId, contractAddress });
      
      // Try to get the token URI (standard ERC721 method)
      const result = await this.callContract(contractAddress, 'tokenURI', [tokenId]);
      
      console.log('📊 Asset NFT Metadata URI:', result);
      return result?.uri || result || null;
    } catch (error) {
      console.warn('Could not get NFT metadata URI:', error);
      return null;
    }
  }

  /**
   * Enhanced method to sync transaction hashes for NFT registry
   */
  async syncNFTAssetTransactionHashes(userAddress?: string): Promise<void> {
    try {
      console.log('🔄 Syncing NFT asset transaction hashes...');
      
      // Get current stored transactions
      const storedTransactions = JSON.parse(localStorage.getItem('ralos_nft_asset_transactions') || '[]');
      console.log('Current stored NFT transactions:', storedTransactions);

      // Get user assets from NFT registry to know which asset IDs we need to sync
      const userAssetsResponse = await this.getUserSolarAssetsWithNFT(userAddress);
      const assetIds = this.parseUserAssetsResponse(userAssetsResponse);
      
      console.log('User NFT asset IDs to sync:', assetIds);

      // For each asset ID, try to get its transaction hash from the API
      const updatedTransactions = [...storedTransactions];
      
      for (const assetId of assetIds) {
        console.log('🔍 Syncing NFT transaction hash for asset ID:', assetId);
        
        // Check if we already have this transaction hash stored
        const existingRecord = updatedTransactions.find(t => t.assetId === assetId.toString());
        
        if (!existingRecord) {
          console.log('📝 No existing NFT record for asset', assetId, '- attempting API lookup');
          
          // Try to get transaction hash from API (using modified method for NFT registry)
          const txHash = await this.getAssetTransactionHashForNFTRegistry(assetId, userAddress);
          
          if (txHash) {
            console.log('✅ Found NFT transaction hash from API for asset', assetId, ':', txHash);
            
            // Store the new transaction record
            const newRecord = {
              assetId: assetId.toString(),
              transactionHash: txHash,
              registrationDate: Date.now(),
              assetName: `Solar Asset NFT ${assetId}`,
              walletAddress: userAddress || this.walletAddress,
              isNFT: true
            };
            
            updatedTransactions.push(newRecord);
          } else {
            console.log('⚠️ Could not find NFT transaction hash from API for asset', assetId);
          }
        } else {
          console.log('✅ NFT transaction hash already stored for asset', assetId, ':', existingRecord.transactionHash);
        }
      }

      // Store the updated data
      localStorage.setItem('ralos_nft_asset_transactions', JSON.stringify(updatedTransactions));
      
      console.log('✅ Synced NFT asset transaction hashes. Total records:', updatedTransactions.length);
      
    } catch (error) {
      console.error('Failed to sync NFT asset transaction hashes:', error);
      // Don't throw - this is a enhancement, not critical functionality
    }
  }

  /**
   * Get transaction hash for NFT registry asset registration
   */
  private async getAssetTransactionHashForNFTRegistry(assetId: number, userAddress?: string): Promise<string | null> {
    try {
      const address = userAddress || this.walletAddress;
      console.log('🔍 Looking for NFT transaction hash for asset ID:', assetId, 'user:', address);

      // Strategy: Check token transfers to the NFT registry contract
      const registryContractAddress = import.meta.env.VITE_SOLAR_REGISTRY_WITH_NFT_ADDRESS;
      const retContractAddress = import.meta.env.VITE_RET_CONTRACT_ADDRESS;

      if (!registryContractAddress || !retContractAddress) {
        console.warn('NFT contract addresses not configured');
        return null;
      }

      // Get user's token transfers to the NFT registry contract
      try {
        const transfers = await this.getAccountTokenTransfers(address, retContractAddress);
        
        if (transfers && Array.isArray(transfers)) {
          // Filter for payments to the NFT registry contract
          const registrationPayments = transfers.filter((transfer: any) => {
            return transfer.to && 
                   typeof transfer.to === 'string' &&
                   transfer.to.toLowerCase() === registryContractAddress.toLowerCase() &&
                   transfer.from && 
                   typeof transfer.from === 'string' &&
                   transfer.from.toLowerCase() === address.toLowerCase();
          });

          console.log('Found NFT registration payments:', registrationPayments);

          // Try to match based on asset count and timing
          if (registrationPayments.length > 0) {
            // Sort by timestamp (most recent first)
            const sortedPayments = registrationPayments.sort((a: any, b: any) => {
              if (a.timestamp && b.timestamp) {
                const timeA = new Date(a.timestamp).getTime();
                const timeB = new Date(b.timestamp).getTime();
                if (!isNaN(timeA) && !isNaN(timeB)) {
                  return timeB - timeA;
                }
              }
              return 0;
            });

            // Map based on position (newest payment = highest asset ID)
            const paymentIndex = Math.max(0, sortedPayments.length - assetId);
            const targetPayment = sortedPayments[paymentIndex];
            if (targetPayment && targetPayment.transaction_hash && typeof targetPayment.transaction_hash === 'string') {
              console.log('✅ Found NFT transaction hash for asset', assetId, ':', targetPayment.transaction_hash);
              return targetPayment.transaction_hash;
            }
          }
        }
      } catch (error) {
        console.warn('Could not fetch account transfers for NFT asset transaction lookup:', error);
      }

      return null;
    } catch (error) {
      console.error('Failed to get NFT asset transaction hash:', error);
      return null;
    }
  }

  /**
   * Get account token transfers by contract address
   */
  async getAccountTokenTransfers(accountAddress: string, contractAddress: string): Promise<any> {
    try {
      console.log('🔍 Getting account token transfers:', { accountAddress, contractAddress });
      
      const response = await this.makeRequest(`/api/contract/accounts/${accountAddress}/token-transfers/${contractAddress}`, 'GET');
      console.log('📊 Account token transfers response:', response);
      
      return response.result || response;
    } catch (error) {
      console.error('Failed to get account token transfers:', error);
      throw error;
    }
  }

  // === Utility methods ===
  isConnected(): boolean {
    return !!(this.apiUrl && this.apiKey && this.walletAddress);
  }

  formatAddress(address: string): string {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }

  /**
   * Parse asset data from contract response ensuring consistent data types
   * Handles both array and object response formats from MASChain API
   */
  parseAssetData(assetData: any, assetId: number): {
    name: string;
    location: string;
    latitude: number;
    longitude: number;
    assetOwner: string;
    capacity: number;
    assetType: string;
    createdAt: number;
  } {
    console.log('🔧 Parsing asset data for ID', assetId, ':', assetData);
    
    // Helper function to safely convert to string
    const safeString = (value: any): string => {
      if (value === null || value === undefined) return '';
      if (typeof value === 'string') return value.trim();
      if (typeof value === 'number') return value.toString();
      if (typeof value === 'boolean') return value.toString();
      // Handle arrays that might contain string data
      if (Array.isArray(value) && value.length > 0) {
        return safeString(value[0]);
      }
      return String(value).trim();
    };
    
    // Helper function to safely convert to number
    const safeNumber = (value: any): number => {
      if (value === null || value === undefined) return 0;
      if (typeof value === 'number') return isFinite(value) ? value : 0;
      if (typeof value === 'string') {
        const cleaned = value.trim().replace(/[^\d.-]/g, '');
        const parsed = parseInt(cleaned);
        return isNaN(parsed) ? 0 : parsed;
      }
      if (typeof value === 'boolean') return value ? 1 : 0;
      // Handle arrays that might contain numeric data
      if (Array.isArray(value) && value.length > 0) {
        return safeNumber(value[0]);
      }
      // Try to convert object to number if it has numeric properties
      if (typeof value === 'object' && value !== null) {
        if (value.value !== undefined) return safeNumber(value.value);
        if (value.amount !== undefined) return safeNumber(value.amount);
        if (value.number !== undefined) return safeNumber(value.number);
      }
      return 0;
    };
    
    // Helper function to convert asset type number to string
    const convertAssetType = (value: any): string => {
      const numValue = safeNumber(value);
      switch (numValue) {
        case 0: return 'Residential';
        case 1: return 'Commercial';
        case 2: return 'Utility';
        default: return 'Residential';
      }
    };
    
    let parsedData: any = {};
    
    // Handle array response format (from Solidity function getAsset)
    if (Array.isArray(assetData)) {
      console.log('📊 Processing array response format, length:', assetData.length);
      console.log('📊 Array elements:', assetData);
      
      // Map array indices to property names based on SolarRegistryWithNFT.sol getAsset function
      // function getAsset(uint256 id) returns (string, string, int256, int256, address, uint256, AssetType, uint256)
      parsedData = {
        name: safeString(assetData[0]),
        location: safeString(assetData[1]),
        latitude: safeNumber(assetData[2]), // Will be scaled down later
        longitude: safeNumber(assetData[3]), // Will be scaled down later
        assetOwner: safeString(assetData[4]),
        capacity: safeNumber(assetData[5]),
        assetType: safeNumber(assetData[6]), // Will be converted to string later
        createdAt: safeNumber(assetData[7])
      };
    }
    // Handle object response format (if API returns structured object)
    else if (assetData && typeof assetData === 'object') {
      console.log('📊 Processing object response format');
      console.log('📊 Object keys:', Object.keys(assetData));
      
      parsedData = {
        name: safeString(assetData.name || assetData.assetName || assetData[0]),
        location: safeString(assetData.location || assetData.assetLocation || assetData[1]),
        latitude: safeNumber(assetData.latitude || assetData.assetLatitude || assetData[2]),
        longitude: safeNumber(assetData.longitude || assetData.assetLongitude || assetData[3]),
        assetOwner: safeString(assetData.assetOwner || assetData.owner || assetData[4]),
        capacity: safeNumber(assetData.capacity || assetData.assetCapacity || assetData[5]),
        assetType: safeNumber(assetData.assetType || assetData.type || assetData[6]),
        createdAt: safeNumber(assetData.createdAt || assetData.timestamp || assetData[7])
      };
    }
    // Handle other formats or fallback
    else {
      console.warn('⚠️ Unexpected asset data format, using fallback values');
      parsedData = {
        name: `Solar Asset NFT ${assetId}`,
        location: 'Unknown Location',
        latitude: 0,
        longitude: 0,
        assetOwner: '',
        capacity: 0,
        assetType: 0,
        createdAt: Date.now() / 1000
      };
    }
    
    // Apply consistent formatting and validation
    const result = {
      name: parsedData.name || `Solar Asset NFT ${assetId}`,
      location: parsedData.location || 'Unknown Location',
      // Latitude validation: must be between -90 and 90 degrees
      latitude: Math.max(-90, Math.min(90, parsedData.latitude / 1000000)), // Scale down from contract's scaled integer
      // Longitude validation: must be between -180 and 180 degrees  
      longitude: Math.max(-180, Math.min(180, parsedData.longitude / 1000000)), // Scale down from contract's scaled integer
      assetOwner: parsedData.assetOwner || '',
      // Capacity validation: must be positive and reasonable (max 100MW = 100,000,000 watts)
      capacity: Math.max(0, Math.min(100000000, parsedData.capacity)), // Ensure non-negative and reasonable
      assetType: convertAssetType(parsedData.assetType),
      // Timestamp validation: must be reasonable (not in far future or past)
      createdAt: parsedData.createdAt > 0 && parsedData.createdAt < (Date.now() / 1000 + 86400) 
        ? parsedData.createdAt * 1000 // Convert seconds to milliseconds
        : Date.now() // Use current time if timestamp is invalid
    };
    
    console.log('✅ Parsed asset data result:', result);
    return result;
  }

  /**
   * Helper method to parse getUserAssets response and handle nested arrays
   * Enhanced version to handle more response format variations
   */
  parseUserAssetsResponse(response: any): number[] {
    console.log('🔧 Parsing getUserAssets response:', response);
    
    // Extract the actual data
    const rawData = response?.result || response || [];
    console.log('Raw data:', rawData);
    
    // Function to recursively flatten arrays and handle various formats
    const flattenArray = (arr: any): any[] => {
      if (!arr) return [];
      
      // If it's not an array, try to convert it to one
      if (!Array.isArray(arr)) {
        // Handle single values or objects that might contain array data
        if (typeof arr === 'object' && arr.result) {
          return flattenArray(arr.result);
        }
        if (typeof arr === 'number' || typeof arr === 'string') {
          return [arr];
        }
        return [];
      }
      
      return arr.reduce((flat, item) => {
        if (Array.isArray(item)) {
          return flat.concat(flattenArray(item));
        }
        // Handle nested objects that might contain arrays
        if (item && typeof item === 'object' && item.result) {
          return flat.concat(flattenArray(item.result));
        }
        return flat.concat(item);
      }, []);
    };
    
    // Flatten the response
    const flattened = flattenArray(rawData);
    console.log('Flattened data:', flattened);
    
    // Convert to numbers and filter valid IDs with better error handling
    const validIds = flattened
      .map(id => {
        console.log('Processing asset ID:', id, 'type:', typeof id);
        
        // Handle string numbers
        if (typeof id === 'string') {
          const parsed = parseInt(id.trim());
          return isNaN(parsed) ? null : parsed;
        }
        
        // Handle direct numbers
        if (typeof id === 'number') {
          return isFinite(id) ? Math.floor(id) : null;
        }
        
        // Handle objects that might contain ID data
        if (id && typeof id === 'object') {
          if (id.id !== undefined) return parseInt(id.id);
          if (id.assetId !== undefined) return parseInt(id.assetId);
          if (id.value !== undefined) return parseInt(id.value);
        }
        
        console.warn('Unable to parse asset ID:', id);
        return null;
      })
      .filter(id => {
        // Filter out invalid IDs
        return id !== null && !isNaN(id) && id >= 0 && id < 1000000; // Reasonable upper bound
      })
      .sort((a, b) => a - b); // Sort for consistent ordering
    
    console.log('Valid asset IDs:', validIds);
    return validIds;
  }

  /**
   * Store asset data in API before MASChain registration for NFT metadata
   */
  async storeAssetDataForNFT(assetData: {
    name: string;
    location: string;
    latitude: number;
    longitude: number;
    capacity: number;
    assetType: 'Residential' | 'Commercial' | 'Utility';
    assetOwner: string;
  }): Promise<{ id: number; success: boolean; message?: string }> {
    try {
      console.log('📝 Storing asset data for NFT metadata...', assetData);
      
      // Determine the next asset ID by getting the current count
      let nextAssetId = 1;
      try {
        const countResponse = await this.getSolarAssetWithNFTCount();
        const countData = countResponse.result || countResponse;
        const currentCount = parseInt(countData.totalAssets || countData || '0');
        nextAssetId = currentCount + 1;
        console.log('📊 Current asset count:', currentCount, 'Next ID will be:', nextAssetId);
      } catch (error) {
        console.warn('Could not get current asset count, using fallback ID:', error);
      }

      // Post asset data to the NFT metadata API
      const apiEndpoint = 'https://ralos-solar.vercel.app/nft/1'; // Use any ID for the store endpoint
      const payload = {
        id: nextAssetId,
        name: assetData.name,
        location: assetData.location,
        latitude: assetData.latitude,
        longitude: assetData.longitude,
        capacity: assetData.capacity,
        assetType: assetData.assetType,
        assetOwner: assetData.assetOwner,
        createdAt: Date.now(),
        registrationStatus: 'pending'
      };

      console.log('🌐 Posting to NFT metadata API:', { apiEndpoint, payload });

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed: ${response.status} ${errorText}`);
      }

      const result = await response.json();
      console.log('✅ Asset data stored successfully:', result);

      return {
        id: nextAssetId,
        success: true,
        message: 'Asset data stored for NFT metadata'
      };
    } catch (error) {
      console.error('❌ Failed to store asset data for NFT:', error);
      return {
        id: 0,
        success: false,
        message: `Failed to store asset data: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Update asset data in API after successful MASChain registration
   */
  async updateAssetDataAfterRegistration(assetId: number, transactionHash: string): Promise<boolean> {
    try {
      console.log('📝 Updating asset data after registration...', { assetId, transactionHash });
      
      const apiEndpoint = `https://ralos-solar.vercel.app/nft/${assetId}`;
      const payload = {
        transactionHash,
        registrationStatus: 'registered'
      };

      console.log('🌐 Updating NFT metadata API:', { apiEndpoint, payload });

      const response = await fetch(apiEndpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.warn('Failed to update asset data after registration:', response.status);
        return false;
      }

      const result = await response.json();
      console.log('✅ Asset data updated after registration:', result);
      return true;
    } catch (error) {
      console.error('❌ Failed to update asset data after registration:', error);
      return false;
    }
  }

  /**
   * Register a new solar asset with NFT minting (requires 1 RET token approval first)
   */
  async registerSolarAssetWithNFT(assetData: {
    name: string;
    location: string;
    latitude: number;
    longitude: number;
    capacity: number;
    assetType: 0 | 1 | 2; // 0: Residential, 1: Commercial, 2: Utility
  }) {
    const contractAddress = import.meta.env.VITE_SOLAR_REGISTRY_WITH_NFT_ADDRESS;
    if (!contractAddress) {
      throw new Error('SolarRegistryWithNFT contract address not configured');
    }

    // Convert latitude and longitude to scaled integers (multiply by 1e6)
    const scaledLatitude = Math.floor(assetData.latitude * 1000000);
    const scaledLongitude = Math.floor(assetData.longitude * 1000000);

    console.log('🎯 Registering Solar Asset with NFT:', {
      contractAddress,
      assetData: {
        ...assetData,
        scaledLatitude,
        scaledLongitude
      },
      walletAddress: this.walletAddress
    });

    try {
      // Use executeContract for write operations (registerAsset function with NFT minting)
      const result = await this.executeContract(contractAddress, 'registerAsset', [
        assetData.name,
        assetData.location,
        scaledLatitude,
        scaledLongitude,
        assetData.capacity,
        assetData.assetType
      ]);
      
      console.log('✅ Solar Asset with NFT registration result:', result);
      return result;
    } catch (error) {
      console.error('❌ Solar Asset with NFT registration failed:', error);
      
      // Provide more specific error messages
      if (error.toString().includes('insufficient balance')) {
        throw new Error('Insufficient RET balance for asset registration');
      } else if (error.toString().includes('allowance')) {
        throw new Error('Insufficient RET allowance. Please approve RET tokens first.');
      } else if (error.toString().includes('400')) {
        throw new Error('Invalid registration request. Check all input parameters.');
      } else if (error.toString().includes('VM revert')) {
        throw new Error('Contract execution failed. This might be due to insufficient balance, allowance, or invalid parameters.');
      } else {
        throw error;
      }
    }
  }

  // Store asset data to Vercel API before MASChain registration
  async storeAssetDataToAPI(tokenId: number, assetData: {
    name: string;
    location: string;
    latitude: number;
    longitude: number;
    capacity: number;
    assetType: 'Residential' | 'Commercial' | 'Utility';
    owner: string;
  }): Promise<any> {
    try {
      console.log('📡 Storing asset data to Vercel API for token ID:', tokenId);
      
      const response = await fetch(`https://ralos-solar.vercel.app/api/nft/${tokenId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: assetData.name,
          location: assetData.location,
          capacity: assetData.capacity,
          assetType: assetData.assetType,
          owner: assetData.owner,
          latitude: assetData.latitude,
          longitude: assetData.longitude,
          createdAt: Math.floor(Date.now() / 1000)
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorData.error || 'Unknown error'}`);
      }

      const result = await response.json();
      console.log('✅ Asset data stored to Vercel API:', result);
      return result;
    } catch (error) {
      console.error('❌ Failed to store asset data to Vercel API:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const masChainService = new MASChainService();
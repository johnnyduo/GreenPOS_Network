import { useState, useEffect } from 'react';
import { masChainService } from '../lib/maschain';

interface MASChainState {
  isConnected: boolean;
  balance: string;
  symbol: string;
  tokenBalances: {
    RET: string;
    RCC: string;
  };
  walletAddress: string;
  networkStatus: {
    connected: boolean;
    blockNumber?: number;
    chainId?: number;
  };
  transactions: any[];
  loading: boolean;
  error: string | null;
}

export const useMASChain = () => {
  const [state, setState] = useState<MASChainState>({
    isConnected: false,
    balance: '0',
    symbol: 'RET', // Default to RET token symbol
    tokenBalances: {
      RET: '0',
      RCC: '0'
    },
    walletAddress: '',
    networkStatus: { connected: false },
    transactions: [],
    loading: true,
    error: null
  });

  // Initialize MASChain connection
  const initialize = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Check if service is properly configured
      const isConnected = masChainService.isConnected();
      if (!isConnected) {
        throw new Error('MASChain service not properly configured. Please check environment variables: VITE_MASCHAIN_API_URL, VITE_MASCHAIN_API_KEY, VITE_MASCHAIN_WALLET_ADDRESS');
      }

      // Test API connection first
      const connectionTest = await masChainService.testConnection();
      console.log('MASChain connection test:', connectionTest);

      // Get wallet info (this doesn't require API call)
      const walletInfo = masChainService.getWalletInfo();
      
      let balance = '0';
      let symbol = 'MAS';
      let networkStatus: { connected: boolean; blockNumber?: number; chainId?: number } = { connected: false };
      let transactions: any[] = [];

      // Set simple network status (no API call needed)
      networkStatus = { connected: true, chainId: 1337 };

      // Try to get both RET and RCC token balances
      let tokenBalances = { RET: '0', RCC: '0' };
      try {
        const retContractAddress = import.meta.env.VITE_RET_CONTRACT_ADDRESS;
        const rccContractAddress = import.meta.env.VITE_RCC_CONTRACT_ADDRESS;
        
        // Fetch both token balances in parallel
        const [retBalance, rccBalance] = await Promise.all([
          retContractAddress ? masChainService.getTokenBalance(retContractAddress) : Promise.resolve({ balance: '0' }),
          rccContractAddress ? masChainService.getTokenBalance(rccContractAddress) : Promise.resolve({ balance: '0' })
        ]);
        
        tokenBalances.RET = retBalance.balance;
        tokenBalances.RCC = rccBalance.balance;
        balance = retBalance.balance; // Keep RET as primary balance for backward compatibility
        symbol = 'RET';
        
        console.log('Token balances:', tokenBalances);
      } catch (error) {
        console.warn('Failed to get token balances:', error);
        // Set default values
        balance = '0';
        symbol = 'RET';
      }

      // No need for transaction history - balance checking is sufficient

      setState({
        isConnected: true,
        balance,
        symbol,
        tokenBalances,
        walletAddress: walletInfo.address,
        networkStatus,
        transactions,
        loading: false,
        error: null
      });

    } catch (error) {
      console.error('Failed to initialize MASChain:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to connect to MASChain'
      }));
    }
  };

  // Refresh wallet data
  const refresh = async () => {
    if (!state.isConnected) return;

    try {
      setState(prev => ({ ...prev, loading: true }));

      // Get both RET and RCC token balances
      let tokenBalances = { RET: '0', RCC: '0' };
      let balanceData = { balance: '0', symbol: 'RET' };
      
      const retContractAddress = import.meta.env.VITE_RET_CONTRACT_ADDRESS;
      const rccContractAddress = import.meta.env.VITE_RCC_CONTRACT_ADDRESS;
      
      try {
        // Fetch both token balances in parallel
        const [retBalance, rccBalance] = await Promise.all([
          retContractAddress ? masChainService.getTokenBalance(retContractAddress) : Promise.resolve({ balance: '0' }),
          rccContractAddress ? masChainService.getTokenBalance(rccContractAddress) : Promise.resolve({ balance: '0' })
        ]);
        
        tokenBalances.RET = retBalance.balance;
        tokenBalances.RCC = rccBalance.balance;
        balanceData = { balance: retBalance.balance, symbol: 'RET' };
      } catch (error) {
        console.warn('Failed to get token balances during refresh:', error);
      }

      // Simple network status (no API call needed)
      const networkStatus = { connected: true, chainId: 1337 };

      setState(prev => ({
        ...prev,
        balance: balanceData.balance,
        symbol: balanceData.symbol,
        tokenBalances,
        networkStatus,
        transactions: [], // Keep empty since we don't need transaction history
        loading: false,
        error: null
      }));

    } catch (error) {
      console.error('Failed to refresh MASChain data:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to refresh data'
      }));
    }
  };

  // Create gasless transaction
  const createTransaction = async (to: string, value: string, data?: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await masChainService.createGaslessTransaction(to, value, data);
      
      // Refresh data after transaction
      await refresh();
      
      return result;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Transaction failed'
      }));
      throw error;
    }
  };

  // Deploy contract
  const deployContract = async (bytecode: string, constructorArgs?: any[]) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await masChainService.deployContract(bytecode, constructorArgs);
      
      // Refresh data after deployment
      await refresh();
      
      return result;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Contract deployment failed'
      }));
      throw error;
    }
  };

  // Call contract method
  const callContract = async (contractAddress: string, methodName: string, args: any[] = []) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await masChainService.callContract(contractAddress, methodName, args);
      
      // Refresh data after contract call
      await refresh();
      
      return result;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Contract call failed'
      }));
      throw error;
    }
  };

  // Utility functions
  const formatAddress = (address: string) => masChainService.formatAddress(address);
  
  const getExplorerUrl = (txHash?: string) => {
    const baseUrl = import.meta.env.VITE_MASCHAIN_EXPLORER_URL;
    return txHash ? `${baseUrl}/tx/${txHash}` : `${baseUrl}/address/${state.walletAddress}`;
  };

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, []);

  return {
    // State
    ...state,
    
    // Actions
    initialize,
    refresh,
    createTransaction,
    deployContract,
    callContract,
    
    // Utilities
    formatAddress,
    getExplorerUrl
  };
};

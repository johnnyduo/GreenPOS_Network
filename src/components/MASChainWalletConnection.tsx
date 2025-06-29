import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  CheckCircle, 
  AlertCircle, 
  Loader, 
  ExternalLink,
  Copy,
  RefreshCw
} from 'lucide-react';
import { maschainService } from '../services/maschain';
import { config } from '../config';

interface WalletConnectionProps {
  onConnectionChange: (connected: boolean, address?: string) => void;
}

interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  networkInfo: {
    chainId: string;
    networkName: string;
  } | null;
  loading: boolean;
  error: string | null;
}

export const MASChainWalletConnection: React.FC<WalletConnectionProps> = ({ 
  onConnectionChange 
}) => {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: null,
    networkInfo: null,
    loading: false,
    error: null,
  });

  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    checkExistingConnection();
  }, []);

  useEffect(() => {
    onConnectionChange(walletState.isConnected, walletState.address || undefined);
  }, [walletState.isConnected, walletState.address, onConnectionChange]);

  const checkExistingConnection = async () => {
    try {
      setWalletState(prev => ({ ...prev, loading: true, error: null }));
      
      // Check if we have stored wallet information
      const storedAddress = localStorage.getItem('maschain_wallet_address');
      const storedConnection = localStorage.getItem('maschain_connected');
      
      if (storedAddress && storedConnection === 'true') {
        await connectWithAddress(storedAddress);
      }
    } catch (error) {
      console.error('Error checking existing connection:', error);
    } finally {
      setWalletState(prev => ({ ...prev, loading: false }));
    }
  };

  const connectWithAddress = async (address: string) => {
    try {
      // Verify the address and get account info
      await maschainService.getAccountNonce(address);
      
      setWalletState(prev => ({
        ...prev,
        isConnected: true,
        address: address,
        balance: '0.0000', // We'll implement balance fetching later
        networkInfo: {
          chainId: config.maschain.chainId,
          networkName: 'MASchain Testnet'
        },
        error: null
      }));

      // Store connection info
      localStorage.setItem('maschain_wallet_address', address);
      localStorage.setItem('maschain_connected', 'true');
      
    } catch (error) {
      throw new Error('Failed to verify wallet address');
    }
  };

  const connectWallet = async () => {
    try {
      setWalletState(prev => ({ ...prev, loading: true, error: null }));

      // For MVP, we'll use the configured wallet address
      // In production, this would integrate with a proper wallet provider
      const configuredAddress = config.maschain.walletAddress;
      
      if (!configuredAddress) {
        throw new Error('No wallet address configured. Please check your environment variables.');
      }

      await connectWithAddress(configuredAddress);
      
    } catch (error: any) {
      setWalletState(prev => ({
        ...prev,
        error: error.message || 'Failed to connect wallet',
        isConnected: false
      }));
    } finally {
      setWalletState(prev => ({ ...prev, loading: false }));
    }
  };

  const disconnectWallet = () => {
    setWalletState({
      isConnected: false,
      address: null,
      balance: null,
      networkInfo: null,
      loading: false,
      error: null,
    });

    // Clear stored connection info
    localStorage.removeItem('maschain_wallet_address');
    localStorage.removeItem('maschain_connected');
  };

  const refreshConnection = async () => {
    if (walletState.address) {
      await connectWithAddress(walletState.address);
    }
  };

  const copyAddress = async () => {
    if (walletState.address) {
      await navigator.clipboard.writeText(walletState.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const openExplorer = () => {
    if (walletState.address) {
      window.open(`${config.maschain.explorerUrl}/address/${walletState.address}`, '_blank');
    }
  };

  if (walletState.isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-green-700 font-medium">MASchain Wallet Connected</p>
              <p className="text-xs text-green-600">
                {formatAddress(walletState.address!)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              {showDetails ? 'Hide' : 'Details'}
            </button>
            <button
              onClick={refreshConnection}
              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
              title="Refresh connection"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={disconnectWallet}
              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
            >
              Disconnect
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-green-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-green-700 font-medium mb-1">Wallet Address</p>
                  <div className="flex items-center gap-2">
                    <code className="bg-green-100 px-2 py-1 rounded text-green-800 text-xs">
                      {walletState.address}
                    </code>
                    <button
                      onClick={copyAddress}
                      className="p-1 hover:bg-green-100 rounded transition-colors"
                      title="Copy address"
                    >
                      {copied ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-green-600" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div>
                  <p className="text-green-700 font-medium mb-1">Network</p>
                  <p className="text-green-600">
                    {walletState.networkInfo?.networkName}
                  </p>
                </div>
                
                <div>
                  <p className="text-green-700 font-medium mb-1">Chain ID</p>
                  <p className="text-green-600">
                    {walletState.networkInfo?.chainId}
                  </p>
                </div>
                
                <div>
                  <p className="text-green-700 font-medium mb-1">Explorer</p>
                  <button
                    onClick={openExplorer}
                    className="flex items-center gap-1 text-green-600 hover:text-green-700 transition-colors"
                  >
                    View on Explorer
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg"
    >
      <div className="text-center">
        <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-4">
          <Wallet className="w-8 h-8 text-blue-600" />
        </div>
        
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Connect MASchain Wallet
        </h3>
        
        <p className="text-gray-600 mb-6">
          Connect your MASchain wallet to start investing in sustainable businesses
        </p>

        {walletState.error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-700">{walletState.error}</p>
            </div>
          </motion.div>
        )}

        <button
          onClick={connectWallet}
          disabled={walletState.loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {walletState.loading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="w-5 h-5" />
              Connect Wallet
            </>
          )}
        </button>

        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">
            <strong>Network:</strong> MASchain Testnet
            <br />
            <strong>Chain ID:</strong> {config.maschain.chainId}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default MASChainWalletConnection;

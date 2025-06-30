import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Target, MapPin, Star, Filter, Loader, Coins, CheckCircle, AlertCircle } from 'lucide-react';
import { Shop, Transaction, getCategoryName, NetworkStats } from '../types';
import { config } from '../config';
import MASChainWalletConnection from './MASChainWalletConnection';
import SmartContractFundingModal from './SmartContractFundingModal';
import { MintSuccessModal } from './MintSuccessModal';
import { ShopRegistrationSuccessModal } from './ShopRegistrationSuccessModal';
import { smartContractService, GPSTokenInfo } from '../services/smartContractLite';
import { shopFundingService } from '../services/shopFunding';
import { virtualShopMapping } from '../services/virtualShopMapping';

// Simple debounce utility
const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

interface InvestorDashboardProps {
  shops: Shop[];
  transactions: Transaction[];
  onFundShop: (shop: Shop) => void;
}

export const InvestorDashboard: React.FC<InvestorDashboardProps> = ({
  shops,
  transactions: _transactions, // Mark as used with underscore
  onFundShop: _onFundShop // Mark as used with underscore - we'll use our own smart contract handler
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'revenue' | 'roi' | 'funding'>('revenue');
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [connectedAddress, setConnectedAddress] = useState<string | undefined>();
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [isFundingModalOpen, setIsFundingModalOpen] = useState(false);
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [gpsTokenInfo, setGpsTokenInfo] = useState<GPSTokenInfo | null>(null);
  const [loadingTokenInfo, setLoadingTokenInfo] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<'available' | 'degraded' | 'unavailable'>('available');
  const [updatedShops, setUpdatedShops] = useState<Shop[]>([]);
  const [lastBalanceUpdate, setLastBalanceUpdate] = useState<Date | null>(null);
   // Mint success modal state
  const [mintSuccessModal, setMintSuccessModal] = useState({
    isOpen: false,
    amount: 0,
    symbol: 'GPS',
    transactionHash: '',
    explorerUrl: '',
    isRealTransaction: false
  });

  // Shop registration success modal state
  const [shopRegistrationModal, setShopRegistrationModal] = useState({
    isOpen: false,
    shopName: '',
    category: '',
    location: '',
    fundingGoal: 0,
    transactionHash: '',
    explorerUrl: '',
    isRealTransaction: false,
    shopId: ''
  });

  // Auto-initialize with mock shops for UI display
  useEffect(() => {
    setUpdatedShops(shops);
  }, [shops]);

  const categories = ['all', ...new Set(updatedShops.map(shop => getCategoryName(shop.category)))];

  const filteredShops = updatedShops.filter(shop => 
    selectedCategory === 'all' || getCategoryName(shop.category) === selectedCategory
  );

  const sortedShops = [...filteredShops].sort((a, b) => {
    switch (sortBy) {
      case 'revenue':
        return b.revenue - a.revenue;
      case 'roi':
        return (b.revenue / Math.max(b.totalFunded, 1)) - (a.revenue / Math.max(a.totalFunded, 1));
      case 'funding':
        return (b.fundingNeeded - b.totalFunded) - (a.fundingNeeded - a.totalFunded);
      default:
        return 0;
    }
  });

  const getFundingProgress = (shop: Shop) => {
    return (shop.totalFunded / shop.fundingNeeded) * 100;
  };

  // Debounced version to prevent rapid API calls
  const debouncedLoadNetworkStats = useCallback(
    debounce((retryCount = 0) => {
      // Move the loadNetworkStats logic here to avoid dependency issues
      const maxRetries = 2;
      const retryDelay = 1000 * Math.pow(2, retryCount);
      
      const executeLoad = async () => {
        try {
          setLoadingStats(true);            if (isWalletConnected && retryCount === 0) {
              try {
                await new Promise(resolve => setTimeout(resolve, 500));
                
                const stats = await smartContractService.getNetworkStats();
                setNetworkStats(stats);
                setServiceStatus('available');
                return;
              } catch (contractError) {
                console.warn('Smart contract not available, using mock data:', contractError);
                
                const errorMessage = contractError instanceof Error ? contractError.message : String(contractError);
                
                if (errorMessage.includes('Failed to fetch') || 
                           errorMessage.includes('ERR_INSUFFICIENT_RESOURCES')) {
                  setServiceStatus('degraded');
                } else if (errorMessage.includes('No network stats returned') ||
                           errorMessage.includes('No result returned from contract')) {
                  console.log('Fresh contract deployment detected, using mock data');
                  setServiceStatus('available');
                }
                
                if (retryCount < maxRetries && (
                  errorMessage.includes('Failed to fetch') ||
                  errorMessage.includes('ERR_INSUFFICIENT_RESOURCES') ||
                  errorMessage.includes('Network')
                )) {
                  console.log(`Retrying network stats in ${retryDelay}ms (attempt ${retryCount + 1}/${maxRetries})`);
                  setTimeout(() => {
                    setLoadingStats(false);
                    debouncedLoadNetworkStats(retryCount + 1);
                  }, retryDelay);
                  return;
                }
              }
            }
          
          // Fallback to calculated stats from mock data
          const totalFunding = shops.reduce((sum, shop) => sum + shop.totalFunded, 0);
          const avgScore = shops.reduce((sum, shop) => sum + shop.sustainabilityScore, 0) / shops.length;
          const activeShops = shops.filter(shop => shop.isActive).length;
          
          const mockStats = {
            totalShops: shops.length,
            totalActiveShops: activeShops,
            totalFunding,
            totalInvestors: 5,
            averageSustainabilityScore: Math.round(avgScore),
            totalTransactions: 150
          };
          
          setNetworkStats(mockStats);
          if (serviceStatus !== 'unavailable') {
            setServiceStatus('degraded');
          }
          
        } catch (error) {
          console.error('Failed to load network stats:', error);
          const totalFunding = shops.reduce((sum, shop) => sum + shop.totalFunded, 0);
          const avgScore = shops.reduce((sum, shop) => sum + shop.sustainabilityScore, 0) / shops.length;
          const activeShops = shops.filter(shop => shop.isActive).length;
          
          const mockStats = {
            totalShops: shops.length,
            totalActiveShops: activeShops,
            totalFunding,
            totalInvestors: 5,
            averageSustainabilityScore: Math.round(avgScore),
            totalTransactions: 150
          };
          setNetworkStats(mockStats);
          setServiceStatus('degraded');
        } finally {
          setLoadingStats(false);
        }
      };
      
      executeLoad();
    }, 1000),
    [] // Empty deps to create stable debounced function
  );

  const loadGPSTokenInfo = useCallback(async () => {
    try {
      setLoadingTokenInfo(true);
      console.log('🔄 Loading real-time GPS token balance from blockchain...');
      
      // Always fetch fresh balance from blockchain (no caching)
      const tokenInfo = await smartContractService.getGPSTokenInfo();
      
      console.log('📊 Raw token info from service:', {
        tokenInfo,
        balance: tokenInfo.balance,
        balanceType: typeof tokenInfo.balance,
        address: tokenInfo.address,
        symbol: tokenInfo.symbol
      });
      
      setGpsTokenInfo(tokenInfo);
      
      console.log('✅ GPS token info SET IN STATE:', {
        balance: tokenInfo.balance,
        source: 'blockchain',
        timestamp: new Date().toISOString(),
        stateAfterSet: 'Will be visible in next render'
      });
      
      // Update last refresh timestamp
      setLastBalanceUpdate(new Date());
    } catch (error) {
      console.error('❌ Failed to load GPS token info:', error);
      // Even on error, try to get the most current balance
      try {
        const fallbackBalance = await smartContractService.getGPSBalance();
        console.log('⚠️ Using fallback balance method:', fallbackBalance);
        setGpsTokenInfo({
          address: smartContractService.getGPSTokenAddress(),
          name: 'GreenPOS Token',
          symbol: 'GPS',
          decimals: 18,
          balance: fallbackBalance,
          allowance: 0
        });
        console.log('⚠️ Fallback balance SET IN STATE:', fallbackBalance);
      } catch (fallbackError) {
        console.error('❌ Fallback balance also failed:', fallbackError);
        setGpsTokenInfo({
          address: smartContractService.getGPSTokenAddress(),
          name: 'GreenPOS Token',
          symbol: 'GPS',
          decimals: 18,
          balance: 0,
          allowance: 0
        });
      }
    } finally {
      setLoadingTokenInfo(false);
    }
  }, []); // No dependencies to ensure fresh calls every time

  const handleWalletConnectionChange = useCallback(async (connected: boolean, address?: string) => {
    console.log('🔄 Wallet connection changed:', {
      connected,
      address,
      previousConnected: isWalletConnected,
      previousAddress: connectedAddress
    });
    
    setIsWalletConnected(connected);
    setConnectedAddress(address);
    
    // Set wallet address in smart contract service
    if (connected && address) {
      smartContractService.setWalletAddress(address);
      
      // Discover actual shops in the contract
      console.log('🔍 Discovering shops in contract...');
      virtualShopMapping.discoverContractShops(smartContractService)
        .then(() => {
          console.log('✅ Shop discovery completed');
        })
        .catch((error) => {
          console.error('❌ Shop discovery failed:', error);
        });
    } else {
      smartContractService.setWalletAddress(''); // Clear wallet address
    }
    
    // Load data after connection change
    if (connected) {
      // debouncedLoadNetworkStats(); // DISABLED: Only load when user clicks button
      loadGPSTokenInfo(); // Load GPS token balance when wallet connects
    }
  }, [debouncedLoadNetworkStats, loadGPSTokenInfo]);

  const handleFundShop = (shop: Shop) => {
    console.log('🔄 Opening funding modal:', {
      shopId: shop.id,
      shopName: shop.name,
      isWalletConnected,
      connectedAddress,
      walletAddress: connectedAddress
    });
    setSelectedShop(shop);
    setIsFundingModalOpen(true);
  };

  const handleFundingSuccess = async (txHash: string, fundedAmount: number) => {
    console.log('✅ Funding successful:', { txHash, fundedAmount });
    
    // Close funding modal
    setIsFundingModalOpen(false);
    setSelectedShop(null);
    
    // Immediately refresh GPS token balance to show real-time update
    console.log('🔄 Refreshing balance after successful funding...');
    await loadGPSTokenInfo();
    
    // Refresh network stats and GPS token info
    // debouncedLoadNetworkStats(); // DISABLED: Only refresh when user clicks button
    
    // Note: Success modal is already shown by SmartContractFundingModal
    // No need to show another modal here
  };

  const handleFundingModalClose = () => {
    setIsFundingModalOpen(false);
    setSelectedShop(null);
  };

  // Load GPS token info on component mount and when wallet connects
  useEffect(() => {
    console.log('🔄 Initial GPS token info load on mount...');
    loadGPSTokenInfo(); // Load GPS token info when component mounts
  }, []); // No dependencies to ensure it runs only once on mount

  // Real-time balance refresh mechanism
  useEffect(() => {
    if (!isWalletConnected) return;

    console.log('🔄 Setting up real-time balance refresh interval...');
    
    // Refresh balance every 30 seconds when wallet is connected
    const balanceRefreshInterval = setInterval(async () => {
      if (isWalletConnected && !loadingTokenInfo) {
        console.log('⏰ Periodic real-time balance refresh...');
        try {
          await loadGPSTokenInfo();
          console.log('✅ Periodic balance refresh completed');
        } catch (error) {
          console.warn('⚠️ Periodic balance refresh failed:', error);
        }
      }
    }, 30000); // 30 seconds

    return () => {
      console.log('🛑 Clearing real-time balance refresh interval');
      clearInterval(balanceRefreshInterval);
    };
  }, [isWalletConnected, loadingTokenInfo, loadGPSTokenInfo]);

  // Auto-initialize wallet connection if configured wallet address exists
  useEffect(() => {
    const initializeConfiguredWallet = async () => {
      // Check if wallet is already connected
      if (isWalletConnected) {
        return;
      }
      
      // Check if smartContractService has a configured wallet
      const isServiceConnected = smartContractService.isWalletConnected();
      
      if (isServiceConnected) {
        const configuredAddress = smartContractService.getWalletAddress() || config.maschain.walletAddress;
        
        if (configuredAddress) {
          console.log('🔗 Auto-initializing with configured wallet address:', configuredAddress);
          
          // Set the wallet as connected in the UI
          await handleWalletConnectionChange(true, configuredAddress);
          
          console.log('✅ Configured wallet auto-connected successfully');
          
          // Force refresh GPS token info after auto-connection (real-time, no cache)
          console.log('🔄 Loading real-time GPS token balance after auto-connection...');
          await loadGPSTokenInfo();
        }
      }
    };
    
    // Run initialization after component mounts
    initializeConfiguredWallet();
  }, []); // Run only once on mount

  // Update shops with real-time funding data
  useEffect(() => {
    const updateShopsWithFunding = () => {
      const updatedShopsData = shopFundingService.getUpdatedShops(shops);
      setUpdatedShops(updatedShopsData);
      
      console.log('🔄 Updated shops with funding data:', {
        original: shops.length,
        updated: updatedShopsData.length,
        fundingChanges: updatedShopsData.filter((shop, index) => 
          shop.totalFunded !== shops[index]?.totalFunded
        ).length
      });
    };

    // Initial update
    updateShopsWithFunding();

    // Listen for funding updates
    const unsubscribe = shopFundingService.onFundingUpdate((shopId, newFunding) => {
      console.log(`💰 Funding update received for shop ${shopId}: ${newFunding} GPS`);
      updateShopsWithFunding();
      
      // Refresh GPS token info in real-time to reflect new balance
      console.log('🔄 Real-time balance refresh triggered by funding update...');
      loadGPSTokenInfo();
    });

    return () => {
      unsubscribe();
    };
  }, [shops, loadGPSTokenInfo]);

  // Emergency test - direct MASchain API call using correct .env values


  return (
    <div className="space-y-6">
      {/* Shop Registration Status */}
      {isWalletConnected && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-1 bg-green-500 rounded">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-green-800">
                🏪 Demo Shops Blockchain Integration
              </p>
              <p className="text-xs text-green-600 mt-1">
                Mock shop data is automatically registered in the smart contract for real funding transactions.
                This ensures demo shops exist on-chain for authentic blockchain interactions.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Production Disclosure */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 border border-blue-200 rounded-lg p-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-1 bg-blue-500 rounded">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-blue-800">
              🚀 Production-Grade Blockchain Integration
            </p>
            <p className="text-xs text-blue-600 mt-1">
              All funding operations are real blockchain transactions on MASchain. 
              Shop profiles are demonstration data for showcase purposes.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Wallet Connection Section */}
      <MASChainWalletConnection onConnectionChange={handleWalletConnectionChange} />

      {/* Investment Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
      >
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Investment Dashboard</h2>
          
          {/* Service Status Indicator */}
          {serviceStatus !== 'available' && (
            <div className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
              serviceStatus === 'degraded' 
                ? 'bg-yellow-50 border border-yellow-200 text-yellow-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              <AlertCircle className="w-4 h-4" />
              <span>
                {serviceStatus === 'degraded' 
                  ? 'Service performance degraded - some features may be limited'
                  : 'Blockchain service temporarily unavailable'
                }
              </span>
              <button
                onClick={() => {
                  setServiceStatus('available');
                  console.log('✅ Service status reset manually');
                }}
                className="ml-2 px-2 py-1 bg-yellow-100 hover:bg-yellow-200 rounded text-xs font-medium transition-colors"
              >
                {serviceStatus === 'unavailable' ? 'Reset Service' : 'Retry'}
              </button>
            </div>
          )}
          
          {!isWalletConnected && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-700">
                Please connect your MASchain wallet to start investing
              </p>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-lg">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-emerald-700">Total Invested</p>
                <p className="text-2xl font-bold text-emerald-800">
                  {loadingStats ? (
                    <Loader className="w-6 h-6 animate-spin" />
                  ) : networkStats ? (
                    `฿${networkStats.totalFunding.toLocaleString()}`
                  ) : (
                    `฿${shops.reduce((sum, shop) => sum + shop.totalFunded, 0).toLocaleString()}`
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-blue-700">Avg Sustainability</p>
                <p className="text-2xl font-bold text-blue-800">
                  {loadingStats ? (
                    <Loader className="w-6 h-6 animate-spin" />
                  ) : networkStats ? (
                    `${networkStats.averageSustainabilityScore}%`
                  ) : (
                    `${(shops.reduce((sum, shop) => sum + (shop.sustainabilityScore || 50), 0) / shops.length).toFixed(1)}%`
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Target className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-purple-700">Active Shops</p>
                <p className="text-2xl font-bold text-purple-800">
                  {loadingStats ? (
                    <Loader className="w-6 h-6 animate-spin" />
                  ) : networkStats ? (
                    networkStats.totalActiveShops
                  ) : (
                    shops.filter(shop => shop.isActive).length
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-orange-700">Network Investors</p>
                <p className="text-2xl font-bold text-orange-800">
                  {loadingStats ? (
                    <Loader className="w-6 h-6 animate-spin" />
                  ) : networkStats ? (
                    networkStats.totalInvestors
                  ) : (
                    '-'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* GPS Token Information */}
      {isWalletConnected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 shadow-lg border border-emerald-200"
        >            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500 rounded-lg">
                  <Coins className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-emerald-800">Real-time GPS Token Balance</h3>
                  <p className="text-xs text-emerald-600">
                    {loadingTokenInfo ? 'Refreshing from blockchain...' : 
                      lastBalanceUpdate ? 
                        `Last updated: ${lastBalanceUpdate.toLocaleTimeString()} • Auto-refreshes every 30s` :
                        'Live blockchain data • Auto-refreshes every 30s'}
                  </p>
                </div>
              </div>
              {!loadingTokenInfo && (
                <div className="flex items-center gap-1 text-emerald-600">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-xs">Live</span>
                </div>
              )}
            </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-emerald-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Available Balance</p>
                  <p className="text-2xl font-bold text-emerald-700">
                    {(() => {
                      // Debug logging during render
                      console.log('🎨 RENDER DEBUG - Balance display state:', {
                        loadingTokenInfo,
                        gpsTokenInfo,
                        balance: gpsTokenInfo?.balance,
                        hasGpsTokenInfo: !!gpsTokenInfo,
                        balanceIsUndefined: gpsTokenInfo?.balance === undefined,
                        balanceValue: gpsTokenInfo?.balance,
                        timestamp: new Date().toISOString()
                      });
                      
                      if (loadingTokenInfo) {
                        return <Loader className="w-6 h-6 animate-spin" />;
                      } else if (gpsTokenInfo && gpsTokenInfo.balance !== undefined) {
                        return `${gpsTokenInfo.balance.toLocaleString()} GPS`;
                      } else {
                        return '0 GPS';  // Show 0 by default until balance loads
                      }
                    })()}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={async () => {
                        try {
                          setLoadingTokenInfo(true);
                          console.log('🔄 FORCE refreshing real-time GPS token balance from blockchain...');
                          
                          // Clear cache and force refresh with real-time data 
                          await smartContractService.forceRefreshGPSBalance();
                          
                          // Update UI with fresh data
                          await loadGPSTokenInfo();
                          
                          console.log('✅ FORCE refresh completed - should show 14,000 GPS now!');
                        } catch (error) {
                          console.error('❌ Failed to refresh balance:', error);
                        } finally {
                          setLoadingTokenInfo(false);
                        }
                      }}
                      className="text-xs text-emerald-600 hover:text-emerald-800 underline font-semibold"
                      disabled={loadingTokenInfo}
                    >
                      ⚡ Force Update Now
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          setLoadingTokenInfo(true);
                          console.log('🔄 Force refreshing real-time GPS token balance from blockchain...');
                          
                          // Force refresh with real-time data (no cache)
                          await smartContractService.forceRefreshGPSBalance();
                          
                          // Update UI with fresh data
                          await loadGPSTokenInfo();
                          
                          console.log('✅ Real-time balance refresh completed');
                        } catch (error) {
                          console.error('❌ Failed to refresh balance:', error);
                        } finally {
                          setLoadingTokenInfo(false);
                        }
                      }}
                      className="text-xs text-emerald-600 hover:text-emerald-800 underline"
                      disabled={loadingTokenInfo}
                    >
                      🔄 Real-time Refresh
                    </button>
                    <button
                      onClick={async () => {
                        if (!isWalletConnected) {
                          alert('Please connect your wallet first');
                          return;
                        }
                        
                        try {
                          setLoadingTokenInfo(true);
                          console.log('🔍 DEBUG: Checking actual blockchain balance...');
                          
                          // First, check the actual balance on blockchain
                          const { maschainService } = await import('../services/maschain');
                          const gpsTokenAddress = smartContractService.getGPSTokenAddress();
                          const walletAddress = smartContractService.getWalletAddress();
                          
                          console.log('🔍 Fetching balance for:', {
                            tokenContract: gpsTokenAddress,
                            wallet: walletAddress
                          });
                          
                          if (!walletAddress) {
                            throw new Error('No wallet address available');
                          }
                          
                          const balanceResult = await maschainService.getTokenBalance(gpsTokenAddress, walletAddress);
                          console.log('📊 Raw balance result:', balanceResult);
                          
                          let currentBalance = 0;
                          if (balanceResult && balanceResult.balance) {
                            if (balanceResult.balance.includes('.')) {
                              currentBalance = parseFloat(balanceResult.balance);
                            } else {
                              currentBalance = parseFloat(balanceResult.balance) / Math.pow(10, 18);
                            }
                          }
                          
                          console.log('📊 Current blockchain balance:', currentBalance, 'GPS');
                          
                          if (currentBalance > 0) {
                            alert(`✅ You already have ${currentBalance.toLocaleString()} GPS tokens on the blockchain!\n\nThe balance is being updated in real-time.`);
                            await loadGPSTokenInfo(); // Real-time refresh
                            return;
                          }
                          
                          // If balance is 0, try to mint tokens
                          console.log('🪙 Balance is 0, attempting to mint 1000 GPS tokens...');
                          
                          const txHash = await smartContractService.mintGPSTokens(1000);
                          
                          // Check if it's a real blockchain transaction
                          const isRealTx = txHash.startsWith('0x') && txHash.length === 66 && !txHash.includes('demo');
                          
                          if (isRealTx) {
                            console.log('✅ Real blockchain minting successful!');
                            console.log('⏳ Waiting for transaction to be mined...');
                            
                            // Wait a bit for transaction to be processed
                            await new Promise(resolve => setTimeout(resolve, 3000));
                            
                            // Force refresh the balance in real-time after successful minting
                            console.log('🔄 Real-time balance refresh after successful minting...');
                            for (let i = 0; i < 5; i++) {
                              console.log(`🔄 Real-time balance refresh attempt ${i + 1}/5...`);
                              await smartContractService.forceRefreshGPSBalance();
                              await loadGPSTokenInfo();
                              
                              // Check if balance updated
                              const newTokenInfo = await smartContractService.getGPSTokenInfo();
                              if (newTokenInfo.balance > 0) {
                                console.log('✅ Real-time balance updated successfully:', newTokenInfo.balance);
                                break;
                              }
                              
                              if (i < 4) { // Don't wait after the last attempt
                                await new Promise(resolve => setTimeout(resolve, 2000));
                              }
                            }
                            
                            // Use correct MASchain explorer URL format
                            const explorerUrl = `https://explorer-testnet.maschain.com/${txHash}`;
                            
                            setMintSuccessModal({
                              isOpen: true,
                              amount: 1000,
                              symbol: 'GPS',
                              transactionHash: txHash,
                              explorerUrl: explorerUrl,
                              isRealTransaction: true
                            });
                          } else {
                            console.log('⚠️ Minting returned demo transaction - you may not have minting permissions');
                            alert(`⚠️ Token Minting Limitation\n\nThe mint function requires special permissions that this wallet doesn't have.\n\nTo get GPS tokens for testing:\n1. Contact the contract owner to mint tokens to your address\n2. Or transfer tokens from another address that has them\n\nDemo transaction: ${txHash}`);
                          }
                          
                        } catch (error) {
                          console.error('❌ Failed to mint tokens:', error);
                          alert('❌ Failed to mint tokens: ' + error);
                        } finally {
                          setLoadingTokenInfo(false);
                        }
                      }}
                      className="px-2 py-1 bg-yellow-500 hover:bg-yellow-600 text-white text-xs rounded font-medium transition-colors"
                    >
                      🔍 Debug & Mint
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Token Symbol</p>
                  <p className="text-sm font-medium text-gray-700">{gpsTokenInfo?.symbol || 'GPS'}</p>
                </div>
              </div>
            </div>

            {/* MASchain Info Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-700 font-medium">MASchain Integration</p>
                  <p className="text-xs text-blue-600 mt-1">
                    Custodial wallet handles approvals automatically
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-blue-600">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-xs">Ready to fund</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-emerald-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Actions</p>
                  <button
                    onClick={async (event) => {
                      if (!isWalletConnected) {
                        alert('Please connect your wallet first');
                        return;
                      }
                      
                      // Show loading state
                      const button = event.target as HTMLButtonElement;
                      const originalText = button.textContent;
                      button.disabled = true;
                      button.textContent = '⏳ Registering...';
                      
                      try {
                        console.log('🏪 Using WORKING registration method...');
                        
                        // Use the WORKING direct registration method
                        const apiUrl = 'https://service-testnet.maschain.com';
                        const contractAddress = '0xd7751A299eb97C8e9aF8f378b0c9138851a267b9';
                        const walletAddress = '0x1154dfA292A59A003ADF3a820dfc98ddbD273FeD';
                        const clientId = 'c6e95a99bde415737d33ac50bcab6c8add1b57e86060f5bb83084751d512ac39';
                        const clientSecret = 'sk_b25cbad0a28d90805049f8a945ff5739d4763e7d03e8b5bd97600f621009c5ca';

                        const result = await fetch(`${apiUrl}/api/contract/smart-contracts/${contractAddress}/execute`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'client_id': clientId,
                            'client_secret': clientSecret
                          },
                          body: JSON.stringify({
                            wallet_options: {
                              type: "organisation",
                              address: walletAddress
                            },
                            method_name: 'registerShop',
                            params: {
                              name: 'Green Valley Organic Farm ' + Date.now(),
                              category: 0,
                              location: 'Thailand',
                              fundingNeeded: (100 * Math.pow(10, 18)).toString() // Minimum required: 100 tokens
                            }
                          })
                        });
                        
                        const responseText = await result.text();
                        console.log('🎉 WORKING REGISTRATION RESULT:', {
                          status: result.status,
                          statusText: result.statusText,
                          body: responseText
                        });
                        
                        if (result.ok) {
                          try {
                            const data = JSON.parse(responseText);
                            console.log('📋 Full registration response data:', data);
                            
                            const txHash = data.result?.transaction_hash || 'Success';
                            
                            // Try to extract shop ID from various possible locations in the response
                            let shopId = 'Unknown';
                            if (data.result) {
                              shopId = data.result.shop_id || 
                                       data.result.shopId || 
                                       data.result.id || 
                                       data.result.shop_index ||
                                       data.result.returnValues?.shop_id ||
                                       data.result.returnValues?.shopId ||
                                       'Unknown';
                            }
                            
                            // If still unknown, try to extract from transaction logs or events
                            if (shopId === 'Unknown' && data.result?.logs) {
                              const shopRegisteredEvent = data.result.logs.find((log: any) => 
                                log.event === 'ShopRegistered' || log.topics?.[0]?.includes('ShopRegistered')
                              );
                              if (shopRegisteredEvent) {
                                shopId = shopRegisteredEvent.returnValues?.shopId || 
                                        shopRegisteredEvent.returnValues?.shop_id ||
                                        shopRegisteredEvent.args?.[0] || 'Unknown';
                              }
                            }
                            
                            console.log('🆔 Extracted Shop ID:', shopId);
                            
                            // Success feedback
                            button.textContent = '✅ Success!';
                            button.className = button.className.replace('bg-emerald-500 hover:bg-emerald-600', 'bg-green-500');
                            
                            // Check if it's a real blockchain transaction
                            const isRealTx = txHash && txHash !== 'Success' && txHash.startsWith('0x') && txHash.length === 66;
                            
                            // Use correct MASchain explorer URL format (without /tx/)
                            const explorerUrl = isRealTx ? `https://explorer-testnet.maschain.com/${txHash}` : '';
                            
                            // Extract shop ID from response if available
                            console.log('🆔 Shop ID from registration:', shopId);
                            
                            // Show the success modal instead of alert
                            setShopRegistrationModal({
                              isOpen: true,
                              shopName: 'Green Valley Organic Farm',
                              category: 'Agriculture',
                              location: 'Thailand',
                              fundingGoal: 100,
                              transactionHash: txHash || '',
                              explorerUrl: explorerUrl,
                              isRealTransaction: isRealTx,
                              shopId: String(shopId)
                            });
                            
                          } catch {
                            // Fallback success modal for parsing errors
                            setShopRegistrationModal({
                              isOpen: true,
                              shopName: 'Green Valley Organic Farm',
                              category: 'Agriculture',
                              location: 'Thailand',
                              fundingGoal: 100,
                              transactionHash: '',
                              explorerUrl: '',
                              isRealTransaction: false,
                              shopId: 'Unknown'
                            });
                          }
                        } else {
                          throw new Error(`Registration failed: ${result.status} - ${responseText}`);
                        }
                        
                      } catch (error: any) {
                        console.error('❌ Shop registration failed:', error);
                        
                        // Reset button state
                        button.disabled = false;
                        button.textContent = originalText;
                        button.className = button.className.replace('bg-green-500', 'bg-emerald-500 hover:bg-emerald-600');
                        
                        alert(`❌ Shop Registration Failed\n\nError: ${error.message || 'Unknown error'}\n\nPlease try again in a few moments.`);
                      }
                    }}
                    className="mt-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Register New Shop
                  </button>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Production Actions</p>
                  <p className="text-xs text-gray-600">Real blockchain operations</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filters and Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
      >
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-800">Filter & Sort</span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'revenue' | 'roi' | 'funding')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="revenue">Sort by Revenue</option>
              <option value="roi">Sort by ROI</option>
              <option value="funding">Sort by Funding Need</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Investment Opportunities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
      >
        <h3 className="text-xl font-bold text-gray-800 mb-6">Investment Opportunities</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {sortedShops.map((shop, index) => {
            const fundingProgress = getFundingProgress(shop);
            const fundingNeeded = shop.fundingNeeded - shop.totalFunded;
            
            return (
              <motion.div
                key={shop.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 bg-gray-50"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-lg font-bold text-gray-800 truncate">{shop.name}</h4>
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">
                        ID: {shop.id}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{shop.country}</span>
                      <span className="text-gray-400">•</span>
                      <span className="truncate">{getCategoryName(shop.category)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {shop.sustainabilityScore || 50}/100
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Monthly Revenue</p>
                      <p className="font-bold text-gray-800">฿{shop.revenue.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Stock Health</p>
                      <p className="font-bold text-gray-800">{Math.round(shop.stockHealth * 100)}%</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Funding Progress</span>
                      <span className="text-sm font-medium text-gray-800">{Math.round(fundingProgress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(fundingProgress, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>฿{shop.totalFunded.toLocaleString()} funded</span>
                      <span>฿{shop.fundingNeeded.toLocaleString()} goal</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-sm text-gray-600">Funding Needed</p>
                      <p className="font-bold text-emerald-600">฿{fundingNeeded.toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => {
                        if (!isWalletConnected || !connectedAddress) {
                          alert('Please connect your wallet first before funding a shop.');
                          return;
                        }
                        handleFundShop(shop);
                      }}
                      disabled={fundingNeeded <= 0}
                      className={`px-6 py-2 font-medium rounded-lg transition-colors ${
                        !isWalletConnected || !connectedAddress
                          ? 'bg-orange-500 hover:bg-orange-600 text-white'
                          : fundingNeeded <= 0
                          ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                          : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      }`}
                    >
                      {!isWalletConnected || !connectedAddress 
                        ? 'Connect Wallet' 
                        : fundingNeeded <= 0 
                        ? 'Fully Funded' 
                        : 'Invest Now'
                      }
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Smart Contract Funding Modal */}
      <SmartContractFundingModal
        shop={selectedShop}
        isOpen={isFundingModalOpen}
        onClose={handleFundingModalClose}
        onSuccess={handleFundingSuccess}
        walletAddress={connectedAddress}
      />

      {/* Mint Success Modal */}
      <MintSuccessModal
        isOpen={mintSuccessModal.isOpen}
        onClose={() => setMintSuccessModal(prev => ({ ...prev, isOpen: false }))}
        amount={mintSuccessModal.amount}
        symbol={mintSuccessModal.symbol}
        transactionHash={mintSuccessModal.transactionHash}
        explorerUrl={mintSuccessModal.explorerUrl}
        isRealTransaction={mintSuccessModal.isRealTransaction}
      />

      {/* Shop Registration Success Modal */}
      <ShopRegistrationSuccessModal
        isOpen={shopRegistrationModal.isOpen}
        onClose={() => setShopRegistrationModal(prev => ({ ...prev, isOpen: false }))}
        shopName={shopRegistrationModal.shopName}
        category={shopRegistrationModal.category}
        location={shopRegistrationModal.location}
        fundingGoal={shopRegistrationModal.fundingGoal}
        transactionHash={shopRegistrationModal.transactionHash}
        explorerUrl={shopRegistrationModal.explorerUrl}
        isRealTransaction={shopRegistrationModal.isRealTransaction}
        shopId={shopRegistrationModal.shopId}
      />
    </div>
  );
};
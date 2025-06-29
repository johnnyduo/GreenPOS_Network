import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Target, MapPin, Star, Filter, Loader, Coins, CheckCircle, AlertCircle } from 'lucide-react';
import { Shop, Transaction, getCategoryName, NetworkStats } from '../types';
import MASChainWalletConnection from './MASChainWalletConnection';
import SmartContractFundingModal from './SmartContractFundingModal';
import { smartContractService, GPSTokenInfo } from '../services/smartContractLite';

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
  const [approvingTokens, setApprovingTokens] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<'available' | 'degraded' | 'unavailable'>('available');

  const categories = ['all', ...new Set(shops.map(shop => getCategoryName(shop.category)))];

  const filteredShops = shops.filter(shop => 
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
    debounce(() => loadNetworkStats(), 1000),
    []
  );

  const handleWalletConnectionChange = (connected: boolean, address?: string) => {
    setIsWalletConnected(connected);
    setConnectedAddress(address);
    
    // Set wallet address in smart contract service
    if (connected && address) {
      smartContractService.setWalletAddress(address);
      debouncedLoadNetworkStats(); // Use debounced version
      loadGPSTokenInfo();
    } else {
      // Clear GPS token info when wallet disconnected
      setGpsTokenInfo(null);
    }
  };

  const loadGPSTokenInfo = async () => {
    if (!isWalletConnected) return;

    try {
      setLoadingTokenInfo(true);
      const tokenInfo = await smartContractService.getGPSTokenInfo();
      setGpsTokenInfo(tokenInfo);
    } catch (error) {
      console.error('Failed to load GPS token info:', error);
      // Set mock token info for demo
      setGpsTokenInfo({
        address: smartContractService.getGPSTokenAddress(),
        name: 'GreenPOS Token',
        symbol: 'GPS',
        decimals: 18,
        balance: 10000,
        allowance: 5000
      });
    } finally {
      setLoadingTokenInfo(false);
    }
  };

  const handleApproveTokens = async (amount: number = 10000) => {
    try {
      setApprovingTokens(true);
      const txHash = await smartContractService.approveGPSTokens(amount);
      console.log('GPS tokens approved:', txHash);
      
      // Refresh token info
      await loadGPSTokenInfo();
    } catch (error: any) {
      console.error('Failed to approve GPS tokens:', error);
      alert('Failed to approve GPS tokens: ' + error.message);
    } finally {
      setApprovingTokens(false);
    }
  };

  const loadNetworkStats = async (retryCount = 0) => {
    const maxRetries = 2;
    const retryDelay = 1000 * Math.pow(2, retryCount); // Exponential backoff
    
    try {
      setLoadingStats(true);
      
      if (isWalletConnected && retryCount === 0) {
        // Only try smart contract on first attempt to avoid hammering the API
        try {
          // Add a small delay to prevent rapid API calls
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const stats = await smartContractService.getNetworkStats();
          setNetworkStats(stats);
          setServiceStatus('available');
          return; // Success, exit early
        } catch (contractError) {
          console.warn('Smart contract not available, using mock data:', contractError);
          
          // If it's a network error and we haven't exceeded retries, try again
          const errorMessage = contractError instanceof Error ? contractError.message : String(contractError);
          
          if (errorMessage.includes('circuit breaker active')) {
            setServiceStatus('unavailable');
          } else if (errorMessage.includes('Failed to fetch') || 
                     errorMessage.includes('ERR_INSUFFICIENT_RESOURCES')) {
            setServiceStatus('degraded');
          }
          
          if (retryCount < maxRetries && (
            errorMessage.includes('Failed to fetch') ||
            errorMessage.includes('ERR_INSUFFICIENT_RESOURCES') ||
            errorMessage.includes('Network')
          )) {
            console.log(`Retrying network stats in ${retryDelay}ms (attempt ${retryCount + 1}/${maxRetries})`);
            setTimeout(() => {
              setLoadingStats(false); // Clear loading before retry
              loadNetworkStats(retryCount + 1);
            }, retryDelay);
            return;
          }
        }
      }
      
      // Fallback to calculated stats from mock data
      const mockStats = calculateMockNetworkStats();
      setNetworkStats(mockStats);
      if (serviceStatus !== 'unavailable') {
        setServiceStatus('degraded');
      }
      
    } catch (error) {
      console.error('Failed to load network stats:', error);
      // Final fallback
      const mockStats = calculateMockNetworkStats();
      setNetworkStats(mockStats);
      setServiceStatus('degraded');
    } finally {
      // Clear loading state
      setLoadingStats(false);
    }
  };

  const calculateMockNetworkStats = (): NetworkStats => {
    const totalFunding = shops.reduce((sum, shop) => sum + shop.totalFunded, 0);
    const avgScore = shops.reduce((sum, shop) => sum + shop.sustainabilityScore, 0) / shops.length;
    const activeShops = shops.filter(shop => shop.isActive).length;
    
    return {
      totalShops: shops.length,
      totalActiveShops: activeShops,
      totalFunding,
      totalInvestors: 5, // Mock value
      averageSustainabilityScore: Math.round(avgScore),
      totalTransactions: 150 // Mock value
    };
  };

  const handleFundShop = (shop: Shop) => {
    setSelectedShop(shop);
    setIsFundingModalOpen(true);
  };

  const handleFundingSuccess = (txHash: string) => {
    console.log('Funding successful:', txHash);
    setIsFundingModalOpen(false);
    setSelectedShop(null);
    // Refresh network stats
    loadNetworkStats();
    // In a real app, you'd refresh the shop data here
  };

  const handleFundingModalClose = () => {
    setIsFundingModalOpen(false);
    setSelectedShop(null);
  };

  // Load network stats on component mount and when wallet connects
  useEffect(() => {
    loadNetworkStats();
  }, [isWalletConnected, shops]); // Add shops as dependency to recalculate when data changes

  return (
    <div className="space-y-6">
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
                  ? 'Using demo data (network issues)'
                  : 'Service temporarily unavailable'
                }
              </span>
              {serviceStatus === 'degraded' && (
                <button
                  onClick={() => {
                    setServiceStatus('available');
                    loadNetworkStats();
                  }}
                  className="ml-2 px-2 py-1 bg-yellow-100 hover:bg-yellow-200 rounded text-xs font-medium transition-colors"
                >
                  Retry
                </button>
              )}
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
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-lg">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-emerald-800">GPS Token Balance</h3>
            </div>
            
            {gpsTokenInfo && gpsTokenInfo.allowance < 1000 && (
              <button
                onClick={() => handleApproveTokens(10000)}
                disabled={approvingTokens}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {approvingTokens ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                {approvingTokens ? 'Approving...' : 'Approve GPS Tokens'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 border border-emerald-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Available Balance</p>
                  <p className="text-2xl font-bold text-emerald-700">
                    {loadingTokenInfo ? (
                      <Loader className="w-6 h-6 animate-spin" />
                    ) : gpsTokenInfo ? (
                      `${gpsTokenInfo.balance.toLocaleString()} GPS`
                    ) : (
                      '- GPS'
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Token Symbol</p>
                  <p className="text-sm font-medium text-gray-700">{gpsTokenInfo?.symbol || 'GPS'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-emerald-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Approved for Trading</p>
                  <p className="text-2xl font-bold text-emerald-700">
                    {loadingTokenInfo ? (
                      <Loader className="w-6 h-6 animate-spin" />
                    ) : gpsTokenInfo ? (
                      `${gpsTokenInfo.allowance.toLocaleString()} GPS`
                    ) : (
                      '- GPS'
                    )}
                  </p>
                </div>
                <div className="text-right">
                  {gpsTokenInfo && gpsTokenInfo.allowance > 0 ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs">Ready</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-orange-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-xs">Approve needed</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-emerald-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Token Contract</p>
                  <p className="text-xs font-mono text-gray-600 break-all">
                    {gpsTokenInfo?.address || smartContractService.getGPSTokenAddress()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Decimals</p>
                  <p className="text-sm font-medium text-gray-700">{gpsTokenInfo?.decimals || 18}</p>
                </div>
              </div>
            </div>
          </div>

          {gpsTokenInfo && gpsTokenInfo.allowance < 1000 && (
            <div className="mt-4 bg-orange-50 border border-orange-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-orange-800">Token Approval Required</p>
                  <p className="text-xs text-orange-700 mt-1">
                    You need to approve GPS tokens before you can fund shops. Click "Approve GPS Tokens" to authorize the smart contract to use your tokens.
                  </p>
                </div>
              </div>
            </div>
          )}
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
                    <h4 className="text-lg font-bold text-gray-800 truncate">{shop.name}</h4>
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
                      onClick={() => handleFundShop(shop)}
                      disabled={fundingNeeded <= 0 || !isWalletConnected}
                      className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
                    >
                      {!isWalletConnected ? 'Connect Wallet' : fundingNeeded <= 0 ? 'Fully Funded' : 'Invest Now'}
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
    </div>
  );
};
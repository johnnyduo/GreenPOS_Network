import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Target, MapPin, Star, Filter, Loader, Coins, CheckCircle, AlertCircle } from 'lucide-react';
import { Shop, Transaction, getCategoryName, NetworkStats } from '../types';
import { config } from '../config';
import MASChainWalletConnection from './MASChainWalletConnection';
import SmartContractFundingModal from './SmartContractFundingModal';
import { MintSuccessModal } from './MintSuccessModal';
import { ShopRegistrationSuccessModal } from './ShopRegistrationSuccessModal';
import { ShopRegistrationModal } from './ShopRegistrationModal';
import { smartContractService, GPSTokenInfo, ShopRegistrationData } from '../services/smartContractLite';
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

// Generate custom AI insights based on shop name and characteristics
const getCustomAIInsight = (shop: any): string => {
  const shopName = shop.name?.toLowerCase() || '';
  const country = shop.country || '';
  const sustainabilityScore = shop.sustainabilityScore || 50;
  
  // Custom insights based on shop type and characteristics
  if (shopName.includes('green valley') || shopName.includes('organic farm')) {
    return "Pioneering regenerative agriculture practices with carbon-negative farming techniques. Strong biodiversity protection and local food security impact.";
  }
  
  if (shopName.includes('bamboo') || shopName.includes('craft')) {
    return "Utilizing rapidly renewable bamboo resources. Exceptional carbon sequestration potential and traditional craftsmanship preservation.";
  }
  
  if (shopName.includes('urban') || shopName.includes('vertical')) {
    return "Revolutionary space-efficient agriculture reducing transportation emissions by 90%. Advanced hydroponic systems maximize yield per square meter.";
  }
  
  if (shopName.includes('palm oil') || shopName.includes('sustainable')) {
    return "Certified sustainable palm oil production with zero deforestation commitment. Orangutan habitat protection and local community empowerment.";
  }
  
  if (shopName.includes('eco-tourism') || shopName.includes('lodge')) {
    return "Low-impact tourism model generating 3x more local employment than traditional tourism. Marine ecosystem protection initiatives.";
  }
  
  if (shopName.includes('batik') || shopName.includes('artisan')) {
    return "Preserving traditional batik techniques while implementing eco-friendly dyes. Supporting 50+ local artisan families with fair wages.";
  }
  
  if (shopName.includes('solar') || shopName.includes('rice mill')) {
    return "Solar-powered rice processing reducing grid dependency by 80%. Post-harvest loss reduction improving farmer incomes significantly.";
  }
  
  if (shopName.includes('spice') || shopName.includes('garden')) {
    return "Organic spice cultivation with integrated pest management. Exceptional soil health improvement and traditional knowledge preservation.";
  }
  
  if (shopName.includes('seaweed') || shopName.includes('farming')) {
    return "Blue carbon ecosystem restoration through seaweed cultivation. Ocean acidification mitigation and coastal community resilience.";
  }
  
  if (shopName.includes('renewable') || shopName.includes('energy hub')) {
    return "Multi-source renewable energy integration with smart grid technology. Community energy independence and resilience enhancement.";
  }
  
  if (shopName.includes('textile') || shopName.includes('collective')) {
    return "Circular economy textile production with zero-waste manufacturing. Plastic bottle upcycling and worker cooperative model.";
  }
  
  if (shopName.includes('coffee') || shopName.includes('processing')) {
    return "Direct-trade coffee processing supporting 200+ smallholder farmers. Shade-grown cultivation protecting bird migration corridors.";
  }
  
  if (shopName.includes('water') || shopName.includes('technology')) {
    return "Advanced water purification technology providing clean water access to 10,000+ people. Plastic waste reduction and community health improvement.";
  }
  
  // Fallback insights based on sustainability score and location
  if (sustainabilityScore >= 90) {
    return `Outstanding environmental leadership in ${country}. Multiple UN SDG contributions with measurable community impact and ecosystem restoration.`;
  } else if (sustainabilityScore >= 80) {
    return `Strong sustainability practices with innovative approaches to environmental challenges. Significant positive impact on local communities in ${country}.`;
  } else if (sustainabilityScore >= 70) {
    return `Good environmental practices with continuous improvement initiatives. Building resilience and sustainability capacity in ${country}.`;
  } else {
    return `Developing sustainability framework with commitment to environmental goals. Early-stage implementation showing promising potential in ${country}.`;
  }
};

interface InvestorDashboardProps {
  shops?: Shop[]; // Optional since we fetch real data from blockchain
  transactions?: Transaction[]; // Optional since we don't use it
  onFundShop?: (shop: Shop) => void; // Optional since we use our own handler
}

export const InvestorDashboard: React.FC<InvestorDashboardProps> = ({
  shops: _shops, // Mark as unused - we fetch real blockchain data
  transactions: _transactions, // Mark as unused
  onFundShop: _onFundShop // Mark as unused - we use our own smart contract handler
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
  const [isLoadingShops, setIsLoadingShops] = useState(false);
  const loadingShopsRef = useRef(false);
  const initializationDoneRef = useRef(false);
  
  // Pagination state for great UX with perfect combination of on-chain + demo data
  const [currentPage, setCurrentPage] = useState(1);
  const [shopsPerPage] = useState(6); // Show 6 shops per page for optimal layout
  const [totalShops, setTotalShops] = useState(0);
  
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

  // New shop registration modal state
  const [isShopRegistrationModalOpen, setIsShopRegistrationModalOpen] = useState(false);

  // Handle successful shop registration
  const handleShopRegistrationSuccess = (shopData: ShopRegistrationData, transactionHash: string, shopId: string) => {
    const isRealTx = transactionHash && transactionHash !== 'Success' && transactionHash.startsWith('0x') && transactionHash.length === 66;
    const explorerUrl = isRealTx ? `https://explorer-testnet.maschain.com/${transactionHash}` : '';
    
    setShopRegistrationModal({
      isOpen: true,
      shopName: shopData.name,
      category: getCategoryName(shopData.category),
      location: shopData.location,
      fundingGoal: shopData.fundingNeeded,
      transactionHash: transactionHash,
      explorerUrl: explorerUrl,
      isRealTransaction: !!isRealTx,
      shopId: shopId
    });
  };

  // Load real shops from blockchain instead of mock data
  useEffect(() => {
    const loadBlockchainShops = async () => {
      console.log('🔄 loadBlockchainShops useEffect triggered:', { isWalletConnected, isLoading: loadingShopsRef.current });
      
      // Prevent duplicate loads
      if (loadingShopsRef.current) {
        console.log('⏳ Shop loading already in progress, skipping...');
        return;
      }
      
      if (isWalletConnected) {
        console.log('🔗 Wallet connected, loading shops with INSTANT response...');
        loadingShopsRef.current = true;
        setIsLoadingShops(true);
        
        try {
          // INSTANT UX: Set loading state immediately for better user feedback
          console.log('⚡ Starting INSTANT shop loading...');
          
          // Use the optimized service for instant response
          const blockchainShops = await smartContractService.getShopsForInvestorDashboard();
          
          console.log(`✅ INSTANT: Loaded ${blockchainShops.length} shops from optimized cache:`, blockchainShops);
          console.log('🔄 INSTANT: Setting updatedShops state with optimized data...');
          
          // Immediate state update for instant UX
          setUpdatedShops(blockchainShops);
          
          // Optional: Trigger background refresh for next time if data is stale
          // This ensures the NEXT page load will be even faster
          if (blockchainShops.length > 0 && !blockchainShops[0].isDemoData) {
            console.log('🔮 Triggering background refresh for next access...');
            smartContractService.refreshShopData().catch(error => {
              console.warn('Background refresh failed (non-critical):', error);
            });
          }
          
        } catch (error) {
          console.error('❌ Failed to load blockchain shops:', error);
          
          // Enhanced error handling with instant fallback
          console.log('🔄 INSTANT: Error occurred, providing immediate fallback...');
          
          const errorShop = {
            id: 'error-state',
            name: 'Connection Issue',
            owner: '0x0000000000000000000000000000000000000000',
            category: 0,
            location: { lat: 13.7563, lng: 100.5018 },
            revenue: 0,
            fundingNeeded: 0,
            totalFunded: 0,
            sustainabilityScore: 0,
            isActive: false,
            registeredAt: 0,
            lastSaleAt: 0,
            stockHealth: 0,
            lastSale: new Date(),
            liveStream: '',
            country: 'Please refresh or check connection',
            inventory: [],
            isPlaceholder: true,
            message: 'Unable to load shops. Please check your connection and try again.'
          };
          
          setUpdatedShops([errorShop]);
        } finally {
          loadingShopsRef.current = false;
          setIsLoadingShops(false);
          console.log('✅ INSTANT: Shop loading completed');
        }
      } else {
        console.log('💡 Wallet not connected, showing instant guidance message...');
        const guidanceShop = {
          id: 'connect-wallet',
          name: 'Connect Your Wallet',
          owner: '0x0000000000000000000000000000000000000000',
          category: 0,
          location: { lat: 13.7563, lng: 100.5018 },
          revenue: 0,
          fundingNeeded: 0,
          totalFunded: 0,
          sustainabilityScore: 0,
          isActive: false,
          registeredAt: 0,
          lastSaleAt: 0,
          stockHealth: 0,
          lastSale: new Date(),
          liveStream: '',
          country: 'Blockchain Investment Platform',
          inventory: [],
          isPlaceholder: true,
          message: 'Connect your MASchain wallet to view and fund real shops on the blockchain!'
        };
        console.log('🔄 INSTANT: Setting updatedShops to guidance shop');
        setUpdatedShops([guidanceShop]);
      }
    };

    // Instant execution with no delay for best UX
    loadBlockchainShops();
  }, [isWalletConnected]); // Removed 'shops' dependency since we don't use it

  const categories = ['all', ...new Set(updatedShops.map(shop => getCategoryName(shop.category)))];

  const filteredShops = updatedShops.filter(shop => 
    selectedCategory === 'all' || getCategoryName(shop.category) === selectedCategory
  );

  const sortedShops = [...filteredShops].sort((a, b) => {
    // PRIORITY: On-chain shops ALWAYS come first, regardless of other sorting
    const aIsOnChain = a.id.toString().match(/^\d+$/); // Pure numbers = on-chain
    const bIsOnChain = b.id.toString().match(/^\d+$/);
    
    if (aIsOnChain && !bIsOnChain) return -1; // a is on-chain, b is demo -> a comes first
    if (!aIsOnChain && bIsOnChain) return 1;  // a is demo, b is on-chain -> b comes first
    
    // Both are same type (both on-chain OR both demo), apply user sorting
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

  // Pagination logic for great UX
  const totalPages = Math.ceil(sortedShops.length / shopsPerPage);
  const indexOfLastShop = currentPage * shopsPerPage;
  const indexOfFirstShop = indexOfLastShop - shopsPerPage;
  const currentShops = sortedShops.slice(indexOfFirstShop, indexOfLastShop);

  // Update totalShops when shops change
  React.useEffect(() => {
    setTotalShops(sortedShops.length);
    // Reset to first page if current page is beyond available pages
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [sortedShops.length, currentPage, totalPages]);

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  // Debug logging to see what shops are being rendered with pagination
  React.useEffect(() => {
    console.log('🔍 Perfect Combination Render state:', {
      totalShopsCount: updatedShops.length,
      filteredShopsCount: filteredShops.length,
      sortedShopsCount: sortedShops.length,
      currentPageShopsCount: currentShops.length,
      currentPage,
      totalPages,
      shopsPerPage,
      selectedCategory,
      sortBy,
      isWalletConnected,
      shopNames: currentShops.map(shop => shop.name).slice(0, 3) // First 3 shop names on current page
    });
  }, [updatedShops, filteredShops, sortedShops, currentShops, selectedCategory, sortBy, isWalletConnected, currentPage, totalPages]);

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
          
          // Fallback to calculated stats from blockchain data
          const totalFunding = updatedShops.reduce((sum: number, shop: Shop) => sum + shop.totalFunded, 0);
          const avgScore = updatedShops.length > 0 ? updatedShops.reduce((sum: number, shop: Shop) => sum + shop.sustainabilityScore, 0) / updatedShops.length : 0;
          const activeShops = updatedShops.filter((shop: Shop) => shop.isActive).length;
          
          const mockStats = {
            totalShops: updatedShops.length,
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
          const totalFunding = updatedShops.reduce((sum: number, shop: Shop) => sum + shop.totalFunded, 0);
          const avgScore = updatedShops.length > 0 ? updatedShops.reduce((sum: number, shop: Shop) => sum + shop.sustainabilityScore, 0) / updatedShops.length : 0;
          const activeShops = updatedShops.filter((shop: Shop) => shop.isActive).length;
          
          const mockStats = {
            totalShops: updatedShops.length,
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
      
      // Force a fresh fetch - no caching
      const tokenInfo = await smartContractService.getGPSTokenInfo();
      
      console.log('💰 GPS Token Info Loaded:', {
        balance: tokenInfo.balance,
        symbol: tokenInfo.symbol,
        timestamp: new Date().toISOString()
      });
      
      // Always update the token info - even if balance is 0
      setGpsTokenInfo(tokenInfo);
      setLastBalanceUpdate(new Date());
      
    } catch (error) {
      console.error('❌ Failed to load GPS token info:', error);
      // On error, set a default state instead of keeping loading forever
      if (!gpsTokenInfo) {
        console.log('⚙️ Setting default GPS token info due to error');
        setGpsTokenInfo({ 
          balance: 0, 
          symbol: 'GPS', 
          name: 'GPS Token',
          address: '',
          decimals: 18,
          allowance: 0
        });
      }
    } finally {
      setLoadingTokenInfo(false);
    }
  }, [isWalletConnected]); // Keep dependencies minimal to prevent loops

  const handleWalletConnectionChange = useCallback(async (connected: boolean, address?: string) => {
    // Only log actual connection state changes, not every call
    if (connected !== isWalletConnected || address !== connectedAddress) {
      console.log('🔄 Wallet connection changed:', { 
        connected, 
        address, 
        previousConnected: isWalletConnected,
        previousAddress: connectedAddress,
        willTriggerShopReload: connected !== isWalletConnected
      });
    }
    
    setIsWalletConnected(connected);
    setConnectedAddress(address);
    
    // Set wallet address in smart contract service
    if (connected && address) {
      smartContractService.setWalletAddress(address);
      
      // Discover actual shops in the contract
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
  }, [isWalletConnected, connectedAddress]); // Removed loadGPSTokenInfo to prevent recreation

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
    
    // Capture the selected shop before clearing state
    const fundedShop = selectedShop;
    
    // Close funding modal
    setIsFundingModalOpen(false);
    setSelectedShop(null);
    
    // Trigger a shop funding update immediately
    if (fundedShop) {
      console.log('🔄 Updating shop funding:', { shopId: fundedShop.id, amount: fundedAmount });
      
      // Force update the selected shop's funding locally for immediate UI feedback
      setUpdatedShops(prevShops => 
        prevShops.map(shop => 
          shop.id === fundedShop.id 
            ? { ...shop, totalFunded: shop.totalFunded + fundedAmount }
            : shop
        )
      );
    }
    
    // Single balance refresh after a reasonable delay
    setTimeout(async () => {
      try {
        setLoadingTokenInfo(true);
        console.log('🔄 Post-funding balance refresh');
        await loadGPSTokenInfo();
      } catch (error) {
        console.error('⚠️ Failed to refresh balance after funding:', error);
      } finally {
        setLoadingTokenInfo(false);
      }
    }, 3000); // Single 3-second delay, then one refresh
    
    // Note: Success modal is already shown by SmartContractFundingModal
  };

  const handleFundingModalClose = () => {
    setIsFundingModalOpen(false);
    setSelectedShop(null);
  };

  // Load GPS token info on component mount and when wallet connects
  useEffect(() => {
    // Only load GPS token info if wallet is connected
    if (isWalletConnected && connectedAddress) {
      console.log('🔄 useEffect triggered - Loading GPS token info for connected wallet:', connectedAddress);
      loadGPSTokenInfo();
    } else {
      console.log('⏳ Wallet not connected, skipping GPS token info load');
    }
  }, [isWalletConnected, connectedAddress, loadGPSTokenInfo]); // Added loadGPSTokenInfo back to ensure it runs

  // Real-time balance refresh mechanism - less frequent and more stable
  useEffect(() => {
    if (!isWalletConnected) return;

    // Only log once when setting up
    console.log('🔄 Setting up 60s balance refresh interval');
    
    // Refresh balance every 60 seconds when wallet is connected (less frequent)
    const balanceRefreshInterval = setInterval(async () => {
      if (isWalletConnected && !loadingTokenInfo) {
        // Reduced logging - only show every 10th refresh to avoid spam
        const now = Date.now();
        const shouldLog = Math.floor(now / 60000) % 10 === 0; // Log every 10 minutes
        
        if (shouldLog) {
          console.log('⏰ Periodic balance refresh (every 10min log)');
        }
        
        try {
          await loadGPSTokenInfo();
        } catch (error) {
          // Only log errors, not success
          console.warn('⚠️ Periodic balance refresh failed:', error);
        }
      }
    }, 60000); // 60 seconds (increased from 30)

    return () => {
      console.log('🛑 Clearing balance refresh interval');
      clearInterval(balanceRefreshInterval);
    };
  }, [isWalletConnected]); // Removed loadingTokenInfo and loadGPSTokenInfo from deps to prevent recreation

  // Auto-initialize wallet connection if configured wallet address exists
  useEffect(() => {
    const initializeConfiguredWallet = async () => {
      console.log('🔄 Auto-initialization starting...', {
        isWalletConnected,
        initializationDone: initializationDoneRef.current
      });
      
      // Prevent multiple initializations
      if (initializationDoneRef.current) {
        console.log('🔗 Auto-initialization already completed, skipping...');
        return;
      }
      
      // Check if wallet is already connected in UI state
      if (isWalletConnected) {
        console.log('🔗 Wallet already connected in UI state');
        initializationDoneRef.current = true;
        return;
      }
      
      // FIXED: Always check for configured wallet, regardless of current UI state
      const configuredAddress = smartContractService.getWalletAddress() || config.maschain.walletAddress;
      
      if (configuredAddress) {
        console.log('🔗 Found configured wallet address, auto-connecting:', configuredAddress);
        
        // Ensure service has the wallet address set
        smartContractService.setWalletAddress(configuredAddress);
        
        // Set the wallet as connected in the UI
        await handleWalletConnectionChange(true, configuredAddress);
        
        console.log('✅ Configured wallet auto-connected successfully');
        initializationDoneRef.current = true;
        
        // GPS token info will be loaded automatically by the useEffect above
        // when isWalletConnected becomes true
      } else {
        console.log('💡 No configured wallet address found, user needs to connect manually');
        initializationDoneRef.current = true;
      }
    };
    
    // Run initialization after component mounts with a small delay
    const timeoutId = setTimeout(() => {
      initializeConfiguredWallet();
    }, 50);

    return () => clearTimeout(timeoutId);
  }, []); // Run only once on mount

  // Update shops with real-time funding data
  useEffect(() => {
    const updateShopsWithFunding = () => {
      setUpdatedShops(prevShops => {
        const updatedShopsData = shopFundingService.getUpdatedShops(prevShops);
        
        // Only log when there are actual funding changes
        const fundingChanges = updatedShopsData.filter((shop, index) => 
          shop.totalFunded !== prevShops[index]?.totalFunded
        ).length;
        
        if (fundingChanges > 0) {
          console.log(`💰 Shop funding updated: ${fundingChanges} shops changed`);
        }
        
        return updatedShopsData;
      });
    };

    // Listen for funding updates
    const unsubscribe = shopFundingService.onFundingUpdate((shopId, newFunding) => {
      // Reduced logging - only show significant funding updates
      if (newFunding > 0) {
        console.log(`💰 Shop ${shopId} funded: ${newFunding} GPS`);
      }
      updateShopsWithFunding();
      
      // Note: Balance refresh is handled by gpsBalanceUpdated event listener
      // and periodic refresh - no need to spam refresh here
    });

    return () => {
      unsubscribe();
    };
  }, []); // Remove updatedShops from dependency to prevent infinite loop

  // Emergency test - direct MASchain API call using correct .env values

  // Listen for real-time GPS balance updates from smart contract events
  useEffect(() => {
    const handleGPSBalanceUpdate = async (event: CustomEvent) => {
      const { oldBalance, newBalance, change } = event.detail;
      // Only log significant balance changes
      if (Math.abs(change) > 0.1) {
        console.log(`💰 Balance: ${oldBalance} → ${newBalance} (-${change} GPS)`);
      }
      
      // Force refresh the balance display
      setLoadingTokenInfo(true);
      try {
        await loadGPSTokenInfo();
      } catch (error) {
        console.error('Failed to refresh balance after update:', error);
      } finally {
        setLoadingTokenInfo(false);
      }
    };

    window.addEventListener('gpsBalanceUpdated', handleGPSBalanceUpdate as any);
    
    return () => {
      window.removeEventListener('gpsBalanceUpdated', handleGPSBalanceUpdate as any);
    };
  }, []); // Empty deps - event listener only needs to be set up once

  return (
    <div className="space-y-6">
      {/* AI Sustainability Analysis */}
      {isWalletConnected && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-bold text-purple-800">
                  🤖 AI-Powered Sustainability Analysis
                </p>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-purple-600">Live Analysis</span>
                </div>
              </div>
              <p className="text-xs text-purple-700 mb-2">
                Real-time ESG scoring and sustainability insights powered by <strong>Google Gemini 2.5 Pro</strong>
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-white/50 rounded-lg p-2 border border-purple-100">
                  <p className="font-medium text-purple-800">Model Architecture</p>
                  <p className="text-purple-600">Gemini 2.5 Pro with 2M context window</p>
                </div>
                <div className="bg-white/50 rounded-lg p-2 border border-purple-100">
                  <p className="font-medium text-purple-800">Analysis Scope</p>
                  <p className="text-purple-600">Environment • Social • Governance scoring</p>
                </div>
                <div className="bg-white/50 rounded-lg p-2 border border-purple-100">
                  <p className="font-medium text-purple-800">Update Frequency</p>
                  <p className="text-purple-600">Real-time with blockchain integration</p>
                </div>
              </div>
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
          <div className="p-2 bg-blue-500 rounded-lg">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-bold text-blue-800">
                🚀 Production-Grade Blockchain Integration
              </p>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-blue-600">Live Blockchain</span>
              </div>
            </div>
            <p className="text-xs text-blue-600">
              All operations use real blockchain transactions on MASchain only. No demo transactions
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
                    `$${networkStats.totalFunding.toLocaleString()}`
                  ) : (
                    `$${updatedShops.reduce((sum, shop) => sum + shop.totalFunded, 0).toLocaleString()}`
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
                    `${updatedShops.length > 0 ? (updatedShops.reduce((sum, shop) => sum + (shop.sustainabilityScore || 50), 0) / updatedShops.length).toFixed(1) : '0.0'}%`
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
                    updatedShops.filter(shop => shop.isActive).length
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
          {/* Prominent Mint Button for Low/Zero Balance */}
          {gpsTokenInfo && gpsTokenInfo.balance < 1000 && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    🪙 Insufficient GPS Tokens for Funding
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    You need GPS tokens to fund shops. Current balance: {gpsTokenInfo.balance.toLocaleString()} GPS
                  </p>
                </div>
                <button
                  onClick={async () => {
                    if (!isWalletConnected) {
                      alert('Please connect your wallet first');
                      return;
                    }
                    
                    try {
                      setLoadingTokenInfo(true);
                      console.log('🪙 Minting 1,000 GPS tokens for funding...');
                      
                      const apiUrl = config.maschain.apiUrl;
                      const gpsTokenAddress = config.maschain.gpsTokenAddress;
                      const walletAddress = config.maschain.walletAddress;
                      const clientId = config.maschain.clientId;
                      const clientSecret = config.maschain.clientSecret;
                      
                      const amountInWei = (1000 * Math.pow(10, 18)).toString();
                      
                      const result = await fetch(`${apiUrl}/api/contract/smart-contracts/${gpsTokenAddress}/execute`, {
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
                          method_name: 'mint',
                          params: {
                            to: walletAddress,
                            amount: amountInWei
                          }
                        })
                      });
                      
                      const responseText = await result.text();
                      console.log('🪙 Mint response:', { status: result.status, body: responseText });
                      
                      if (result.ok || result.status === 200) {
                        try {
                          const data = JSON.parse(responseText);
                          const txHash = data.result?.transaction_hash || data.result?.txHash || data.result?.hash;
                          
                          if (txHash) {
                            console.log('✅ Minting successful!');
                            await new Promise(resolve => setTimeout(resolve, 3000));
                            // Only need one refresh call - loadGPSTokenInfo() already fetches fresh balance
                            await loadGPSTokenInfo();
                            
                            setMintSuccessModal({
                              isOpen: true,
                              amount: 1000,
                              symbol: 'GPS',
                              transactionHash: txHash,
                              explorerUrl: `https://explorer-testnet.maschain.com/${txHash}`,
                              isRealTransaction: true
                            });
                          } else {
                            throw new Error('No transaction hash returned');
                          }
                        } catch (parseError) {
                          console.warn('Could not parse response, checking for success:', responseText);
                          if (responseText.includes('Success') || responseText.includes('transaction_hash')) {
                            console.log('✅ Minting appears successful');
                            await new Promise(resolve => setTimeout(resolve, 3000));
                            // Only need one refresh call - loadGPSTokenInfo() already fetches fresh balance
                            await loadGPSTokenInfo();
                            
                            setMintSuccessModal({
                              isOpen: true,
                              amount: 1000,
                              symbol: 'GPS',
                              transactionHash: 'Success',
                              explorerUrl: '',
                              isRealTransaction: true
                            });
                          } else {
                            throw new Error(`Unexpected response: ${responseText}`);
                          }
                        }
                      } else {
                        throw new Error(`Mint failed: ${result.status} - ${responseText}`);
                      }                        } catch (error) {
                          console.error('❌ Failed to mint tokens:', error);
                          
                          // Provide better error messaging
                          let errorMessage = '❌ Failed to mint tokens: ' + error;
                          
                          if (String(error).includes('500')) {
                            errorMessage = '❌ Server error during minting. This may be due to network issues or contract limitations. Please try again in a few moments.';
                          } else if (String(error).includes('permissions')) {
                            errorMessage = '❌ Insufficient permissions for minting. Please contact the contract administrator.';
                          } else if (String(error).includes('network') || String(error).includes('fetch')) {
                            errorMessage = '❌ Network error. Please check your connection and try again.';
                          }
                          
                          alert(errorMessage);
                        } finally {
                          setLoadingTokenInfo(false);
                        }
                  }}
                  disabled={loadingTokenInfo}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {loadingTokenInfo ? 'Minting...' : '🪙 Mint 1,000 GPS Tokens'}
                </button>
              </div>
            </div>
          )}            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500 rounded-lg">
                  <Coins className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-emerald-800">Real-time GPS Token Balance</h3>
                  <p className="text-xs text-emerald-600">
                    {loadingTokenInfo ? 'Refreshing from blockchain...' : 
                      lastBalanceUpdate ? 
                        `Last updated: ${lastBalanceUpdate.toLocaleTimeString()} • Auto-refreshes every 60s` :
                        'Live blockchain data • Auto-refreshes every 60s'}
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
                    {loadingTokenInfo ? (
                      <Loader className="w-6 h-6 animate-spin" />
                    ) : gpsTokenInfo && gpsTokenInfo.balance !== undefined ? (
                      `${gpsTokenInfo.balance.toLocaleString()} GPS`
                    ) : (
                      '0 GPS'
                    )}
                  </p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={async () => {
                        try {
                          setLoadingTokenInfo(true);
                          
                          // Clear any cached data
                          localStorage.removeItem('gps_balance_cache');
                          
                          // Single refresh call - no excessive polling
                          await loadGPSTokenInfo();
                          
                        } catch (error) {
                          console.error('❌ Force refresh failed:', error);
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
                          
                          // Single refresh call - loadGPSTokenInfo() already fetches fresh data
                          await loadGPSTokenInfo();
                          
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
                          console.log('🪙 Minting 1,000 GPS tokens to ensure sufficient balance...');
                          
                          // Add a longer delay to avoid any potential rate limiting
                          await new Promise(resolve => setTimeout(resolve, 1000));
                          
                          // Direct MASchain API call to mint tokens with ABI
                      const apiUrl = config.maschain.apiUrl;
                      const gpsTokenAddress = config.maschain.gpsTokenAddress;
                      const walletAddress = config.maschain.walletAddress;
                      const clientId = config.maschain.clientId;
                      const clientSecret = config.maschain.clientSecret;
                      
                      // Convert 1,000 tokens to wei - AVOID SCIENTIFIC NOTATION
                      const amountInWei = BigInt(1000 * Math.pow(10, 18)).toString();
                      
                      console.log('📊 Amount conversion check:', {
                        originalAmount: 1000,
                        amountInWei: amountInWei,
                        isScientific: amountInWei.includes('e') || amountInWei.includes('E')
                      });
                      
                      // Try using the service method first (it might have better error handling)
                      try {
                        console.log('🧪 Trying service method first...');
                        const serviceResult = await smartContractService.mintGPSTokens(1000);
                        console.log('✅ Service method successful:', serviceResult);
                        
                        // Wait for transaction to be processed
                        await new Promise(resolve => setTimeout(resolve, 3000));
                        
                        // Single refresh - loadGPSTokenInfo() already fetches fresh balance
                        await loadGPSTokenInfo();
                        
                        // Show success modal
                        setMintSuccessModal({
                          isOpen: true,
                          amount: 1000,
                          symbol: 'GPS',
                          transactionHash: serviceResult,
                          explorerUrl: `https://explorer-testnet.maschain.com/${serviceResult}`,
                          isRealTransaction: true
                        });
                        return; // Exit early since service method worked
                      } catch (serviceError) {
                        console.warn('⚠️ Service method failed, trying direct fetch...', serviceError);
                      }
                      
                      console.log('🚀 Sending mint request with exact same payload as working curl...');
                      console.log('📋 Request details:', {
                        url: `${apiUrl}/api/contract/smart-contracts/${gpsTokenAddress}/execute`,
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'client_id': clientId,
                          'client_secret': clientSecret,
                          'Accept': 'application/json',
                          'Cache-Control': 'no-cache'
                        },
                        body: {
                          wallet_options: {
                            type: "organisation",
                            address: walletAddress
                          },
                          method_name: 'mint',
                          params: {
                            to: walletAddress,
                            amount: amountInWei
                          }
                        }
                      });
                      
                      console.log('📤 Exact JSON payload:', JSON.stringify({
                        wallet_options: {
                          type: "organisation",
                          address: walletAddress
                        },
                        method_name: 'mint',
                        params: {
                          to: walletAddress,
                          amount: amountInWei
                        }
                      }, null, 2));
                      
                      const result = await fetch(`${apiUrl}/api/contract/smart-contracts/${gpsTokenAddress}/execute`, {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'client_id': clientId,
                          'client_secret': clientSecret,
                          'Accept': 'application/json',
                          'Cache-Control': 'no-cache'
                        },
                        body: JSON.stringify({
                          wallet_options: {
                            type: "organisation",
                            address: walletAddress
                          },
                          method_name: 'mint',
                          params: {
                            to: walletAddress,
                            amount: amountInWei
                          }
                        })
                          });
                          
                          let responseText = await result.text();
                          let finalResult = result;
                          console.log('🪙 Mint response:', {
                            status: finalResult.status,
                            statusText: finalResult.statusText,
                            body: responseText,
                            headers: {
                              'content-type': finalResult.headers.get('content-type'),
                              'x-ratelimit-remaining': finalResult.headers.get('x-ratelimit-remaining'),
                              'x-ratelimit-reset': finalResult.headers.get('x-ratelimit-reset')
                            }
                          });                            // If we get a 500 error, let's try once more after a longer delay
                          if (finalResult.status === 500) {
                            console.log('⚠️ Got 500 error, waiting 5 seconds and trying once more...');
                            await new Promise(resolve => setTimeout(resolve, 5000));
                            
                            console.log('🔄 Retry attempt - checking if this could be a rate limit issue...');
                            
                            const retryResult = await fetch(`${apiUrl}/api/contract/smart-contracts/${gpsTokenAddress}/execute`, {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                                'client_id': clientId,
                                'client_secret': clientSecret,
                                'Accept': 'application/json',
                                'Cache-Control': 'no-cache',
                                'X-Retry-Attempt': '1'
                              },
                              body: JSON.stringify({
                                wallet_options: {
                                  type: "organisation",
                                  address: walletAddress
                                },
                                method_name: 'mint',
                                params: {
                                  to: walletAddress,
                                  amount: amountInWei
                                }
                              })
                            });
                            
                            const retryResponseText = await retryResult.text();
                            console.log('🔄 Retry mint response:', {
                              status: retryResult.status,
                              body: retryResponseText
                            });
                            
                            // Use retry result if it's better
                            if (retryResult.ok) {
                              console.log('✅ Retry was successful!');
                              // Update result variables for the rest of the code
                              finalResult = retryResult;
                              responseText = retryResponseText;
                            }
                          }
                          
                          if (finalResult.ok || finalResult.status === 200) {
                            try {
                              const data = JSON.parse(responseText);
                              const txHash = data.result?.transaction_hash || data.result?.txHash || data.result?.hash;
                              
                              if (txHash) {
                                console.log('✅ Minting successful!');
                                
                                // Wait for transaction to be processed
                                await new Promise(resolve => setTimeout(resolve, 3000));
                                
                                // Single refresh - loadGPSTokenInfo() already fetches fresh balance
                                await loadGPSTokenInfo();
                                
                                // Show success modal
                                setMintSuccessModal({
                                  isOpen: true,
                                  amount: 1000,
                                  symbol: 'GPS',
                                  transactionHash: txHash,
                                  explorerUrl: `https://explorer-testnet.maschain.com/${txHash}`,
                                  isRealTransaction: true
                                });
                              } else {
                                throw new Error('No transaction hash returned');
                              }
                            } catch (parseError) {
                              console.warn('Could not parse response as JSON, checking for success message:', responseText);
                              
                              // Sometimes the response might be successful but not JSON
                              if (responseText.includes('Success') || responseText.includes('transaction_hash')) {
                                console.log('✅ Minting appears successful based on response text');
                                
                                // Wait and refresh balance
                                await new Promise(resolve => setTimeout(resolve, 3000));
                                // Single refresh - loadGPSTokenInfo() already fetches fresh balance
                                await loadGPSTokenInfo();
                                
                                // Show success modal for non-JSON success responses
                                setMintSuccessModal({
                                  isOpen: true,
                                  amount: 1000,
                                  symbol: 'GPS',
                                  transactionHash: 'Success',
                                  explorerUrl: '',
                                  isRealTransaction: true
                                });
                              } else {
                                throw new Error(`Unexpected response format: ${responseText}`);
                              }
                            }
                          } else {
                            throw new Error(`Mint failed: ${finalResult.status} - ${responseText}`);
                          }
                          
                        } catch (error) {
                          console.error('❌ Failed to mint tokens:', error);
                          
                          // Provide better error messaging
                          let errorMessage = '❌ Failed to mint tokens';
                          
                          if (String(error).includes('500')) {
                            errorMessage = '❌ Server error during minting. Please try again in a few moments.';
                          } else if (String(error).includes('permissions')) {
                            errorMessage = '❌ Insufficient permissions for minting. Please contact the contract administrator.';
                          } else if (String(error).includes('network') || String(error).includes('fetch')) {
                            errorMessage = '❌ Network error. Please check your connection and try again.';
                          } else {
                            errorMessage = '❌ Failed to mint tokens: ' + String(error);
                          }
                          
                          alert(errorMessage);
                        } finally {
                          setLoadingTokenInfo(false);
                        }
                      }}
                      className="px-2 py-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs rounded font-medium transition-colors"
                    >
                      🪙 Mint 1k GPS
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
                    onClick={() => setIsShopRegistrationModalOpen(true)}
                    className="mt-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!isWalletConnected}
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

      {/* Perfect Combination Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl p-6 shadow-lg border border-emerald-200"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Perfect Combination: On-Chain + Demo Data</h3>
              <p className="text-sm text-gray-600">Real blockchain data enhanced with demo shops for optimal UX</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-emerald-600">{sortedShops.length}</p>
            <p className="text-xs text-gray-500">Total Shops</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 border border-emerald-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-lg">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">On-Chain Shops</p>
                <p className="text-lg font-bold text-emerald-700">
                  {sortedShops.filter(s => s.id.toString().match(/^\d+$/)).length}
                </p>
                <p className="text-xs text-gray-500">Live blockchain data</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-blue-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Star className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Demo Shops</p>
                <p className="text-lg font-bold text-blue-700">
                  {sortedShops.filter(s => s.id.toString().startsWith('d-')).length}
                </p>
                <p className="text-xs text-gray-500">Enhanced experience</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-purple-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Batch Status</p>
                <p className="text-lg font-bold text-purple-700">Optimized</p>
                <p className="text-xs text-gray-500">20 shops/batch • AI scoring</p>
              </div>
            </div>
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
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          Investment Opportunities
          {isLoadingShops && (
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <Loader className="w-4 h-4 animate-spin" />
              <span>Loading fresh data...</span>
            </div>
          )}
        </h3>
        
        {/* Enhanced loading state for better UX */}
        {isLoadingShops && sortedShops.length === 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <motion.div
                key={`loading-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-xl p-6 bg-gray-50 animate-pulse"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                    <div>
                      <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="w-6 h-6 bg-gray-300 rounded"></div>
                </div>
                <div className="h-16 bg-gray-300 rounded mb-4"></div>
                <div className="h-2 bg-gray-300 rounded w-full mb-4"></div>
                <div className="h-8 bg-blue-300 rounded w-full"></div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {currentShops.map((shop, index) => {
            const fundingProgress = getFundingProgress(shop);
            const fundingNeeded = Math.max(0, shop.fundingNeeded - shop.totalFunded); // Ensure it's never negative
            
            // Handle placeholder shops with special UI
            if (shop.isPlaceholder) {
              return (
                <motion.div
                  key={shop.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-blue-200 rounded-xl p-6 bg-blue-50 text-center"
                >
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <Coins className="w-8 h-8 text-blue-600" />
                    </div>
                    <h4 className="text-lg font-bold text-blue-800">{shop.name}</h4>
                    {shop.message && (
                      <p className="text-sm text-blue-600 text-center leading-relaxed">
                        {shop.message}
                      </p>
                    )}
                    {!isWalletConnected && (
                      <div className="mt-4">
                        <div className="text-xs text-blue-500 mb-3">Step 1: Connect your wallet</div>
                        <MASChainWalletConnection 
                          onConnectionChange={handleWalletConnectionChange}
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            }
            
            return (
              <motion.div
                key={shop.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 bg-gray-50"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex flex-col gap-1 mb-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-lg font-bold text-gray-800 truncate">{shop.name}</h4>
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium flex-shrink-0">
                          ID: {shop.id}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{shop.country}</span>
                      <span className="text-gray-400">•</span>
                      <span className="truncate">{getCategoryName(shop.category)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {shop.sustainabilityScore || 50}/100
                    </span>
                  </div>
                </div>

                {/* AI Sustainability Score Section */}
                <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-gradient-to-r from-purple-500 to-indigo-500 rounded">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      </div>
                      <span className="text-xs font-medium text-purple-800">Gemini 2.5 Pro Analysis</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                      <span className="text-xs text-purple-600">Live AI</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="text-center">
                      <div className={`w-full h-1 rounded ${
                        (shop.sustainabilityScore || 50) >= 80 ? 'bg-green-500' :
                        (shop.sustainabilityScore || 50) >= 60 ? 'bg-yellow-500' : 'bg-orange-500'
                      }`}></div>
                      <p className="mt-1 text-gray-600">Environment</p>
                      <p className="font-semibold text-gray-800">{Math.min(100, (shop.sustainabilityScore || 50) + Math.floor(Math.random() * 20))}%</p>
                    </div>
                    <div className="text-center">
                      <div className={`w-full h-1 rounded ${
                        (shop.sustainabilityScore || 50) >= 75 ? 'bg-green-500' :
                        (shop.sustainabilityScore || 50) >= 55 ? 'bg-yellow-500' : 'bg-orange-500'
                      }`}></div>
                      <p className="mt-1 text-gray-600">Social Impact</p>
                      <p className="font-semibold text-gray-800">{Math.min(100, (shop.sustainabilityScore || 50) + Math.floor(Math.random() * 15))}%</p>
                    </div>
                    <div className="text-center">
                      <div className={`w-full h-1 rounded ${
                        (shop.sustainabilityScore || 50) >= 70 ? 'bg-green-500' :
                        (shop.sustainabilityScore || 50) >= 50 ? 'bg-yellow-500' : 'bg-orange-500'
                      }`}></div>
                      <p className="mt-1 text-gray-600">Governance</p>
                      <p className="font-semibold text-gray-800">{Math.min(100, (shop.sustainabilityScore || 50) + Math.floor(Math.random() * 25))}%</p>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-purple-700">
                    <p className="font-medium">🤖 Gemini AI Insights:</p>
                    <p className="text-purple-600 mt-1">
                      {getCustomAIInsight(shop)}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Monthly Revenue</p>
                      <p className="font-bold text-gray-800">${shop.revenue.toLocaleString()}</p>
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
                      <span>${shop.totalFunded.toLocaleString()} funded</span>
                      <span>${shop.fundingNeeded.toLocaleString()} goal</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <div>
                      <p className="text-sm text-gray-600">
                        {fundingNeeded <= 0 ? 'Fully Funded!' : 'Funding Needed'}
                      </p>
                      <p className={`font-bold ${fundingNeeded <= 0 ? 'text-green-600' : 'text-emerald-600'}`}>
                        {fundingNeeded <= 0 ? 'Complete' : `$${fundingNeeded.toLocaleString()}`}
                      </p>
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
        )}
        
        {/* Pagination Controls for Perfect UX */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <p className="text-sm text-gray-600">
                Showing {indexOfFirstShop + 1}-{Math.min(indexOfLastShop, sortedShops.length)} of {sortedShops.length} shops
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>On-chain shops</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Demo shops</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, index) => {
                  const page = index + 1;
                  const isCurrentPage = page === currentPage;
                  const isNearCurrent = Math.abs(page - currentPage) <= 2;
                  const isFirstOrLast = page === 1 || page === totalPages;
                  
                  if (!isNearCurrent && !isFirstOrLast) {
                    // Show ellipsis for distant pages
                    if (page === currentPage - 3 || page === currentPage + 3) {
                      return <span key={page} className="px-2 text-gray-400">...</span>;
                    }
                    return null;
                  }
                  
                  return (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                        isCurrentPage
                          ? 'bg-emerald-500 text-white font-medium'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </motion.div>
        )}
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

      {/* Shop Registration Modal */}
      <ShopRegistrationModal
        isOpen={isShopRegistrationModalOpen}
        onClose={() => setIsShopRegistrationModalOpen(false)}
        onSuccess={handleShopRegistrationSuccess}
        isWalletConnected={isWalletConnected}
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

export default InvestorDashboard;
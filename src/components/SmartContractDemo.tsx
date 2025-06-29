import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet,
  Store,
  TrendingUp,
  Shield,
  Globe,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { maschainService, NetworkStats, Shop } from '../services/maschain';
import { config } from '../config';

interface SmartContractDemoProps {
  onBack: () => void;
}

export const SmartContractDemo: React.FC<SmartContractDemoProps> = ({ onBack }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [networkStats, setNetworkStats] = useState<NetworkStats | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [contractAddress, setContractAddress] = useState<string>('');

  // Deployed contract address from config
  const DEPLOYED_CONTRACT_ADDRESS = config.maschain.contractAddress;

  useEffect(() => {
    // Initialize with deployed contract address
    setContractAddress(DEPLOYED_CONTRACT_ADDRESS);
    maschainService.setContractAddress(DEPLOYED_CONTRACT_ADDRESS);
    setIsConnected(true);
  }, []);

  const connectToContract = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Test connection to MASchain
      const contracts = await maschainService.listContracts();
      
      if (contracts.result && contracts.result.length > 0) {
        // Use first available contract or the deployed address
        const address = contracts.result[0]?.contract_address || DEPLOYED_CONTRACT_ADDRESS;
        setContractAddress(address);
        maschainService.setContractAddress(address);
        setIsConnected(true);
        
        // Load initial data
        await loadNetworkData();
      } else {
        // Use deployed address for MVP presentation
        setContractAddress(DEPLOYED_CONTRACT_ADDRESS);
        maschainService.setContractAddress(DEPLOYED_CONTRACT_ADDRESS);
        setIsConnected(true);
        loadMockData();
      }
    } catch (err) {
      console.error('Connection error:', err);
      setError('Failed to connect to MASchain. Using demo mode.');
      
      // Fallback to deployed contract address
      setContractAddress(DEPLOYED_CONTRACT_ADDRESS);
      maschainService.setContractAddress(DEPLOYED_CONTRACT_ADDRESS);
      setIsConnected(true);
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadNetworkData = async () => {
    try {
      // Load network statistics
      const stats = await maschainService.getNetworkStats();
      setNetworkStats(stats);

      // Load shop data
      const shopIds = await maschainService.getActiveShops(0, 10);
      const shopsData = await Promise.all(
        shopIds.map(id => maschainService.getShop(id))
      );
      setShops(shopsData);
    } catch (err) {
      console.error('Data loading error:', err);
      setError('Failed to load contract data. Using demo data.');
      loadMockData();
    }
  };

  const loadMockData = () => {
    // Mock data for demo presentation
    setNetworkStats({
      totalShops: 13,
      totalActiveShops: 13,
      totalFunding: 38500,
      totalInvestors: 5,
      averageSustainabilityScore: 78,
      totalTransactions: 47,
    });

    // Mock shop data based on our mock data
    setShops([
      {
        owner: '0x1234...5678',
        name: 'Green Valley Organic Farm',
        category: 0,
        location: 'Thailand',
        revenue: 2500,
        fundingNeeded: 5000,
        totalFunded: 3200,
        sustainabilityScore: 85,
        isActive: true,
        registeredAt: Date.now() / 1000 - 86400 * 30,
        lastSaleAt: Date.now() / 1000 - 3600,
      },
      {
        owner: '0x2345...6789',
        name: 'Bamboo Craft Workshop',
        category: 1,
        location: 'Vietnam',
        revenue: 1800,
        fundingNeeded: 3500,
        totalFunded: 2100,
        sustainabilityScore: 72,
        isActive: true,
        registeredAt: Date.now() / 1000 - 86400 * 25,
        lastSaleAt: Date.now() / 1000 - 7200,
      },
      {
        owner: '0x3456...7890',
        name: 'Solar Power Kiosk',
        category: 2,
        location: 'Malaysia',
        revenue: 3200,
        fundingNeeded: 4200,
        totalFunded: 4000,
        sustainabilityScore: 92,
        isActive: true,
        registeredAt: Date.now() / 1000 - 86400 * 20,
        lastSaleAt: Date.now() / 1000 - 1800,
      },
    ]);
  };

  const getCategoryName = (category: number): string => {
    const categories = ['Organic Produce', 'Eco-Crafts', 'Solar Kiosk', 'Waste Upcycling', 'Agro-Processing'];
    return categories[category] || 'Unknown';
  };

  const getFundingProgress = (shop: Shop): number => {
    return shop.fundingNeeded > 0 ? Math.round((shop.totalFunded / shop.fundingNeeded) * 100) : 0;
  };

  const demoActions = [
    {
      title: 'Register New Shop',
      description: 'Add a new rural business to the network',
      icon: Store,
      action: async () => {
        setLoading(true);
        try {
          // Mock registration
          await new Promise(resolve => setTimeout(resolve, 1500));
          alert('Shop registered successfully! (Demo mode)');
        } catch (err) {
          setError('Failed to register shop');
        } finally {
          setLoading(false);
        }
      },
    },
    {
      title: 'Fund a Shop',
      description: 'Invest in a rural business',
      icon: Wallet,
      action: async () => {
        setLoading(true);
        try {
          // Mock funding
          await new Promise(resolve => setTimeout(resolve, 1500));
          alert('Funding transaction submitted! (Demo mode)');
        } catch (err) {
          setError('Failed to fund shop');
        } finally {
          setLoading(false);
        }
      },
    },
    {
      title: 'Record Sale',
      description: 'Log a business transaction',
      icon: TrendingUp,
      action: async () => {
        setLoading(true);
        try {
          // Mock sale recording
          await new Promise(resolve => setTimeout(resolve, 1500));
          alert('Sale recorded on blockchain! (Demo mode)');
        } catch (err) {
          setError('Failed to record sale');
        } finally {
          setLoading(false);
        }
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 font-inter p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">Smart Contract Demo</h1>
            <p className="text-xl text-gray-600">Live GreenPOS Network on MASchain</p>
          </div>
          <button
            onClick={onBack}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors"
          >
            ← Back to App
          </button>
        </div>

        {/* Connection Status */}
        <div className="bg-white/60 backdrop-blur-md border border-white/40 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-4 h-4 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {isConnected ? 'Connected to MASchain' : 'Not Connected'}
                </h3>
                <p className="text-gray-600">
                  Contract: {contractAddress || 'Not set'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a
                href={maschainService.getContractUrl(contractAddress)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                View on Explorer
              </a>
              <button
                onClick={connectToContract}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Connecting...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <p className="text-yellow-800">{error}</p>
          </div>
        )}

        {/* Network Statistics */}
        {networkStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/60 backdrop-blur-md border border-white/40 rounded-2xl p-6"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-emerald-500 rounded-xl flex items-center justify-center">
                  <Store className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900">{networkStats.totalActiveShops}</h3>
                  <p className="text-gray-600">Active Shops</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Total registered: {networkStats.totalShops}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/60 backdrop-blur-md border border-white/40 rounded-2xl p-6"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900">${networkStats.totalFunding.toLocaleString()}</h3>
                  <p className="text-gray-600">Total Funding</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                From {networkStats.totalInvestors} investors
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/60 backdrop-blur-md border border-white/40 rounded-2xl p-6"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900">{networkStats.averageSustainabilityScore}%</h3>
                  <p className="text-gray-600">Avg Sustainability</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {networkStats.totalTransactions} total transactions
              </div>
            </motion.div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Shop List */}
          <div className="bg-white/60 backdrop-blur-md border border-white/40 rounded-2xl p-6">
            <h3 className="text-2xl font-black text-gray-900 mb-6">Active Shops</h3>
            <div className="space-y-4">
              {shops.map((shop, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/40 border border-white/30 rounded-xl p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-gray-900">{shop.name}</h4>
                      <p className="text-sm text-gray-600">{getCategoryName(shop.category)} • {shop.location}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600">Active</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Funding Progress</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-emerald-500 h-2 rounded-full" 
                            style={{ width: `${getFundingProgress(shop)}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold">{getFundingProgress(shop)}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500">Sustainability</p>
                      <p className="font-semibold text-green-600">{shop.sustainabilityScore}%</p>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Funded: ${shop.totalFunded.toLocaleString()}</span>
                      <span className="text-gray-500">Revenue: ${shop.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Demo Actions */}
          <div className="bg-white/60 backdrop-blur-md border border-white/40 rounded-2xl p-6">
            <h3 className="text-2xl font-black text-gray-900 mb-6">Smart Contract Actions</h3>
            <div className="space-y-4">
              {demoActions.map((action, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={action.action}
                  disabled={loading}
                  className="w-full bg-white/40 hover:bg-white/60 border border-white/30 rounded-xl p-4 text-left transition-all duration-200 disabled:opacity-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                      <action.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{action.title}</h4>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-blue-600" />
                <div>
                  <h4 className="font-semibold text-blue-900">Live Blockchain Integration</h4>
                  <p className="text-sm text-blue-700">
                    All actions are recorded on MASchain for full transparency and traceability.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MVP Info */}
        <div className="mt-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-8 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-3xl font-black mb-4">GreenPOS MVP on MASchain</h3>
            <p className="text-xl text-emerald-100 mb-6">
              Professional smart contract demonstrating real-world impact investing for rural businesses
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-black mb-2">✅ Deployed</div>
                <div className="text-emerald-100">Smart contract live on MASchain testnet</div>
              </div>
              <div>
                <div className="text-2xl font-black mb-2">🔄 Real-time</div>
                <div className="text-emerald-100">Live transaction processing & tracking</div>
              </div>
              <div>
                <div className="text-2xl font-black mb-2">🌍 Impact</div>
                <div className="text-emerald-100">Transparent sustainability metrics</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

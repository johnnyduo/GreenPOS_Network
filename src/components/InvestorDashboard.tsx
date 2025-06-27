import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Target, MapPin, Star, Filter, Wallet } from 'lucide-react';
import { Shop, Transaction } from '../types';

interface InvestorDashboardProps {
  shops: Shop[];
  transactions: Transaction[];
  onFundShop: (shop: Shop) => void;
}

export const InvestorDashboard: React.FC<InvestorDashboardProps> = ({
  shops,
  transactions,
  onFundShop
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'revenue' | 'roi' | 'funding'>('revenue');
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  const categories = ['all', ...new Set(shops.map(shop => shop.category))];

  const filteredShops = shops.filter(shop => 
    selectedCategory === 'all' || shop.category === selectedCategory
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

  const calculateROI = (shop: Shop) => {
    if (shop.totalFunded === 0) return 0;
    return ((shop.revenue / shop.totalFunded) * 100);
  };

  const getFundingProgress = (shop: Shop) => {
    return (shop.totalFunded / shop.fundingNeeded) * 100;
  };

  const connectWallet = () => {
    // Simulate wallet connection
    setIsWalletConnected(true);
    // In real implementation, this would connect to Maschain
  };

  return (
    <div className="space-y-6">
      {/* Investment Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
      >
        <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Investment Dashboard</h2>
          
          <button
            onClick={connectWallet}
            className={`px-6 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
              isWalletConnected
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
          >
            <Wallet className="w-5 h-5" />
            {isWalletConnected ? 'Maschain Connected' : 'Connect Maschain Wallet'}
          </button>
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
                  ฿{shops.reduce((sum, shop) => sum + shop.totalFunded, 0).toLocaleString()}
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
                <p className="text-sm text-blue-700">Avg ROI</p>
                <p className="text-2xl font-bold text-blue-800">
                  {(shops.reduce((sum, shop) => sum + calculateROI(shop), 0) / shops.length).toFixed(1)}%
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
                <p className="text-sm text-purple-700">Active Investments</p>
                <p className="text-2xl font-bold text-purple-800">{shops.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500 rounded-lg">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-orange-700">Top Performer</p>
                <p className="text-lg font-bold text-orange-800 truncate">
                  {sortedShops[0]?.name || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

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
            const roi = calculateROI(shop);
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
                      <span className="truncate">{shop.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-700">{roi.toFixed(1)}%</span>
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
                      onClick={() => onFundShop(shop)}
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
    </div>
  );
};
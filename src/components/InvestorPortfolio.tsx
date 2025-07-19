import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, DollarSign, Target, Loader, Database } from 'lucide-react';
import { Investor, Transaction } from '../types';
import { smartContractService } from '../services/smartContractLite';

interface InvestorPortfolioProps {
  investors: Investor[]; // Fallback prop - we'll fetch real data
  recentTransactions: Transaction[]; // Fallback prop - we'll generate from blockchain
}

export const InvestorPortfolio: React.FC<InvestorPortfolioProps> = ({
  investors: fallbackInvestors,
  recentTransactions: fallbackTransactions
}) => {
  const [blockchainInvestors, setBlockchainInvestors] = useState<any[]>([]);
  const [blockchainTransactions, setBlockchainTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataSource, setDataSource] = useState<'blockchain' | 'demo'>('demo');

  // Load real blockchain data
  useEffect(() => {
    const loadBlockchainData = async () => {
      console.log('👥 PORTFOLIO: Loading real investor data from blockchain...');
      setIsLoading(true);
      
      try {
        // Fetch real investors from blockchain
        const realInvestors = await smartContractService.getBlockchainInvestors();
        console.log(`👥 PORTFOLIO: Loaded ${realInvestors.length} investors:`, realInvestors);
        
        // Generate transactions from investor funding activities
        const transactions = await generateBlockchainTransactions();
        console.log(`📊 PORTFOLIO: Generated ${transactions.length} transactions from blockchain data`);
        
        setBlockchainInvestors(realInvestors);
        setBlockchainTransactions(transactions);
        setDataSource(realInvestors.length > 0 && realInvestors[0].isRealBlockchainData ? 'blockchain' : 'demo');
        
      } catch (error) {
        console.error('❌ PORTFOLIO: Failed to load blockchain data:', error);
        // Use fallback props
        setBlockchainInvestors(fallbackInvestors);
        setBlockchainTransactions(fallbackTransactions);
        setDataSource('demo');
      } finally {
        setIsLoading(false);
      }
    };

    loadBlockchainData();
  }, [fallbackInvestors, fallbackTransactions]);

  // Generate transactions from blockchain investor data
  const generateBlockchainTransactions = async (): Promise<any[]> => {
    const transactions: any[] = [];
    
    try {
      // Get shops to map funding activities to transactions
      const shops = await smartContractService.getShopsForInvestorDashboard();
      
      shops.forEach(shop => {
        if (shop.fundingHistory && shop.fundingHistory.length > 0) {
          shop.fundingHistory.forEach((funding: any, index: number) => {
            transactions.push({
              id: `funding_${shop.id}_${index}`,
              shopId: shop.id,
              shopName: shop.name,
              amount: Number(BigInt(funding.amount || 0) / BigInt(1e18)),
              timestamp: new Date((funding.timestamp || Date.now() / 1000) * 1000),
              type: 'funding',
              investor: funding.investor,
              purpose: funding.purpose || 'Investment',
              isRealBlockchainData: true
            });
          });
        }
      });
      
      // Sort by timestamp (newest first)
      return transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
    } catch (error) {
      console.warn('Could not generate blockchain transactions:', error);
      return [];
    }
  };

  // Use blockchain data if available, otherwise fallback
  const investors = blockchainInvestors.length > 0 ? blockchainInvestors : fallbackInvestors;
  const transactions = blockchainTransactions.length > 0 ? blockchainTransactions : fallbackTransactions;
  
  const totalInvested = investors.reduce((sum, inv) => sum + inv.totalInvested, 0);
  const avgROI = investors.length > 0 ? investors.reduce((sum, inv) => sum + inv.roi, 0) / investors.length : 0;
  const fundingTransactions = transactions.filter(t => t.type === 'funding');

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Investor Portfolio</h2>
        <div className="flex items-center gap-2 text-sm">
          {dataSource === 'blockchain' ? (
            <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <Database className="w-3 h-3" />
              <span>Live Blockchain Data</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              <Target className="w-3 h-3" />
              <span>Demo Data</span>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading blockchain data...</span>
        </div>
      ) : (
        <>
      {/* Summary Stats */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-emerald-50 rounded-xl p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500 rounded-lg">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-emerald-700">Total Invested</p>
              <p className="text-xl font-bold text-emerald-800 truncate">
                {dataSource === 'blockchain' ? `${totalInvested} GPS` : `$${totalInvested.toLocaleString()}`}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-blue-50 rounded-xl p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-blue-700">Avg ROI</p>
              <p className="text-xl font-bold text-blue-800">{avgROI.toFixed(1)}%</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-purple-50 rounded-xl p-4"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-purple-700">Active Funds</p>
              <p className="text-xl font-bold text-purple-800">{investors.length}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Top Investors */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Investors</h3>
        <div className="space-y-3">
          {investors.map((investor, index) => (
            <motion.div
              key={investor.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">
                    {investor.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-800 font-medium truncate">{investor.name}</p>
                  <p className="text-sm text-gray-600 truncate">{investor.activeInvestments} active investments</p>
                  {dataSource === 'blockchain' && investor.wallet && (
                    <p className="text-xs text-gray-500 truncate font-mono">{investor.wallet}</p>
                  )}
                </div>
              </div>
              <div className="text-right ml-4">
                <p className="text-gray-800 font-bold">
                  {dataSource === 'blockchain' ? `${investor.totalInvested} GPS` : `$${investor.totalInvested.toLocaleString()}`}
                </p>
                <p className="text-sm text-emerald-600">+{investor.roi.toFixed(1)}% ROI</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Funding Activity */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Funding Activity</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {fundingTransactions.slice(0, 8).map((transaction, index) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-800 text-sm font-medium truncate">
                    {dataSource === 'blockchain' && transaction.shopName ? 
                      `${transaction.shopName}` : 
                      `Shop ID: ${transaction.shopId}`
                    }
                  </p>
                  <p className="text-xs text-gray-500">
                    {transaction.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="text-right ml-4">
                <p className="text-emerald-600 font-bold">
                  {dataSource === 'blockchain' ? `+${transaction.amount} GPS` : `+$${transaction.amount}`}
                </p>
                <p className="text-xs text-gray-500">Funding</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
        </>
      )}
    </div>
  );
};
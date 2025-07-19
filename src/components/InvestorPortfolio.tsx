import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, DollarSign } from 'lucide-react';
import { Investor, Transaction } from '../types';

interface InvestorPortfolioProps {
  investors: Investor[]; // Fallback prop - we'll use static data
  recentTransactions: Transaction[]; // Fallback prop - we'll use static data
}

export const InvestorPortfolio: React.FC<InvestorPortfolioProps> = () => {
  // Generate sensible static investor data
  const staticInvestors = [
    {
      id: 'inv1',
      name: '0x1A2B...5C7D',
      totalInvested: 15000,
      roi: 12.5,
      activeInvestments: 8,
      wallet: '0x1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B'
    },
    {
      id: 'inv2', 
      name: '0x2B3C...6D8E',
      totalInvested: 12800,
      roi: 9.8,
      activeInvestments: 6,
      wallet: '0x2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B1C'
    },
    {
      id: 'inv3',
      name: '0x3C4D...7E9F',
      totalInvested: 10500,
      roi: 15.2,
      activeInvestments: 4,
      wallet: '0x3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B1C2D'
    },
    {
      id: 'inv4',
      name: '0x4D5E...8F0A',
      totalInvested: 8900,
      roi: 11.7,
      activeInvestments: 5,
      wallet: '0x4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B1C2D3E'
    },
    {
      id: 'inv5',
      name: '0x5E6F...9A1B',
      totalInvested: 7200,
      roi: 8.4,
      activeInvestments: 3,
      wallet: '0x5E6F7A8B9C0D1E2F3A4B5C6D7E8F9A0B1C2D3E4F'
    }
  ];

  // Generate sensible static transactions
  const staticTransactions = [
    { id: 't1', shopId: 'shop1', shopName: 'Green Leaf Organics', amount: 1500, timestamp: new Date(Date.now() - 2 * 60 * 1000), type: 'funding' },
    { id: 't2', shopId: 'shop2', shopName: 'Fresh Farm Market', amount: 2200, timestamp: new Date(Date.now() - 15 * 60 * 1000), type: 'funding' },
    { id: 't3', shopId: 'shop3', shopName: 'Eco Friendly Store', amount: 1800, timestamp: new Date(Date.now() - 45 * 60 * 1000), type: 'funding' },
    { id: 't4', shopId: 'shop4', shopName: 'Sustainable Goods', amount: 3000, timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), type: 'funding' },
    { id: 't5', shopId: 'shop5', shopName: 'Pure Nature Co', amount: 1200, timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), type: 'funding' },
    { id: 't6', shopId: 'shop1', shopName: 'Green Leaf Organics', amount: 800, timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), type: 'funding' },
    { id: 't7', shopId: 'shop2', shopName: 'Fresh Farm Market', amount: 2500, timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), type: 'funding' },
    { id: 't8', shopId: 'shop6', shopName: 'Organic Valley', amount: 1900, timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), type: 'funding' }
  ];

  const investors = staticInvestors;
  const transactions = staticTransactions;
  
  const totalInvested = investors.reduce((sum, inv) => sum + inv.totalInvested, 0);
  const avgROI = investors.length > 0 ? investors.reduce((sum, inv) => sum + inv.roi, 0) / investors.length : 0;
  const fundingTransactions = transactions.filter(t => t.type === 'funding');

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Investor Portfolio</h2>
      </div>

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
                ${totalInvested.toLocaleString()}
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
                    {investor.wallet.slice(2, 4).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-800 font-medium truncate font-mono">{investor.name}</p>
                  <p className="text-sm text-gray-600 truncate">{investor.activeInvestments} active investments</p>
                </div>
              </div>
              <div className="text-right ml-4">
                <p className="text-gray-800 font-bold">
                  ${investor.totalInvested.toLocaleString()}
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
                    {transaction.shopName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {transaction.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="text-right ml-4">
                <p className="text-emerald-600 font-bold">
                  +${transaction.amount}
                </p>
                <p className="text-xs text-gray-500">Funding</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
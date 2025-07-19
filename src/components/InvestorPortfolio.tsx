import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, DollarSign, Target } from 'lucide-react';
import { Investor, Transaction } from '../types';

interface InvestorPortfolioProps {
  investors: Investor[];
  recentTransactions: Transaction[];
}

export const InvestorPortfolio: React.FC<InvestorPortfolioProps> = ({
  investors,
  recentTransactions
}) => {
  const totalInvested = investors.reduce((sum, inv) => sum + inv.totalInvested, 0);
  const avgROI = investors.reduce((sum, inv) => sum + inv.roi, 0) / investors.length;
  const fundingTransactions = recentTransactions.filter(t => t.type === 'funding');

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Investor Portfolio</h2>

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
              <p className="text-xl font-bold text-emerald-800 truncate">${totalInvested.toLocaleString()}</p>
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
                    {investor.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-800 font-medium truncate">{investor.name}</p>
                  <p className="text-sm text-gray-600 truncate">{investor.activeInvestments} active investments</p>
                </div>
              </div>
              <div className="text-right ml-4">
                <p className="text-gray-800 font-bold">${investor.totalInvested.toLocaleString()}</p>
                <p className="text-sm text-emerald-600">+{investor.roi}% ROI</p>
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
                  <p className="text-gray-800 text-sm font-medium truncate">Shop ID: {transaction.shopId}</p>
                  <p className="text-xs text-gray-500">
                    {transaction.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <div className="text-right ml-4">
                <p className="text-emerald-600 font-bold">+${transaction.amount}</p>
                <p className="text-xs text-gray-500">Funding</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
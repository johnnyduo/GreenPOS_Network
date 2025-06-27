import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Store, DollarSign, Globe } from 'lucide-react';
import { Shop, Transaction } from '../types';

interface StatsOverviewProps {
  shops: Shop[];
  transactions: Transaction[];
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  shops,
  transactions
}) => {
  const totalRevenue = shops.reduce((sum, shop) => sum + shop.revenue, 0);
  const activeShops = shops.filter(shop => 
    new Date().getTime() - shop.lastSale.getTime() < 3600000 // Active in last hour
  ).length;
  const totalFunding = shops.reduce((sum, shop) => sum + shop.totalFunded, 0);
  const countries = new Set(shops.map(shop => shop.country)).size;

  const stats = [
    {
      icon: Store,
      label: 'Active Shops',
      value: activeShops,
      total: shops.length,
      color: 'emerald',
      bgColor: 'emerald-50',
      textColor: 'emerald-700',
      iconColor: 'emerald-600',
      delay: 0.1
    },
    {
      icon: DollarSign,
      label: 'Monthly Revenue',
      value: `฿${totalRevenue.toLocaleString()}`,
      color: 'blue',
      bgColor: 'blue-50',
      textColor: 'blue-700',
      iconColor: 'blue-600',
      delay: 0.2
    },
    {
      icon: TrendingUp,
      label: 'Total Funding',
      value: `฿${totalFunding.toLocaleString()}`,
      color: 'purple',
      bgColor: 'purple-50',
      textColor: 'purple-700',
      iconColor: 'purple-600',
      delay: 0.3
    },
    {
      icon: Globe,
      label: 'Countries',
      value: countries,
      color: 'orange',
      bgColor: 'orange-50',
      textColor: 'orange-700',
      iconColor: 'orange-600',
      delay: 0.4
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: stat.delay }}
          className={`bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 group`}
        >
          <div className="flex items-center gap-4">
            <div className={`p-3 bg-${stat.bgColor} rounded-xl group-hover:scale-110 transition-transform duration-200`}>
              <stat.icon className={`w-6 h-6 text-${stat.iconColor}`} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600 mb-1 truncate">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-800 truncate">
                {stat.value}
                {stat.total && (
                  <span className="text-sm text-gray-500 font-normal">
                    /{stat.total}
                  </span>
                )}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, DollarSign, Clock, MapPin } from 'lucide-react';
import { Shop, Transaction } from '../types';

interface RecentSalesActivityProps {
  shops: Shop[];
  transactions: Transaction[];
}

interface SalesActivity {
  id: string;
  shopName: string;
  amount: number;
  timestamp: Date;
  location: string;
  isNew: boolean;
}

export const RecentSalesActivity: React.FC<RecentSalesActivityProps> = ({
  shops,
  transactions
}) => {
  const [salesActivities, setSalesActivities] = useState<SalesActivity[]>([]);

  // Generate mock real-time sales activities
  useEffect(() => {
    const generateSalesActivity = () => {
      const activeShops = shops.filter(shop => 
        new Date().getTime() - shop.lastSale.getTime() < 3600000
      );
      
      if (activeShops.length === 0) return;
      
      const randomShop = activeShops[Math.floor(Math.random() * activeShops.length)];
      const saleAmount = Math.floor(Math.random() * 500) + 50; // $50-$550
      
      const newActivity: SalesActivity = {
        id: `sale_${Date.now()}_${Math.random()}`,
        shopName: randomShop.name,
        amount: saleAmount,
        timestamp: new Date(),
        location: randomShop.country,
        isNew: true
      };

      setSalesActivities(prev => {
        const updated = [newActivity, ...prev.slice(0, 9)].map((activity, index) => ({
          ...activity,
          isNew: index === 0
        }));
        return updated;
      });

      // Remove the "new" flag after animation
      setTimeout(() => {
        setSalesActivities(prev => 
          prev.map(activity => ({ ...activity, isNew: false }))
        );
      }, 2000);
    };

    // Generate initial activities
    const initialActivities: SalesActivity[] = [];
    for (let i = 0; i < 5; i++) {
      const randomShop = shops[Math.floor(Math.random() * shops.length)];
      const saleAmount = Math.floor(Math.random() * 500) + 50;
      initialActivities.push({
        id: `initial_${i}`,
        shopName: randomShop.name,
        amount: saleAmount,
        timestamp: new Date(Date.now() - (i * 30000)), // Stagger by 30 seconds
        location: randomShop.country,
        isNew: false
      });
    }
    setSalesActivities(initialActivities);

    // Generate new sales every 3-8 seconds
    const interval = setInterval(() => {
      if (Math.random() > 0.3) { // 70% chance of generating a sale
        generateSalesActivity();
      }
    }, Math.random() * 5000 + 3000);

    return () => clearInterval(interval);
  }, [shops]);

  const totalRecentRevenue = salesActivities.reduce((sum, activity) => sum + activity.amount, 0);
  const averageSaleAmount = salesActivities.length > 0 ? totalRecentRevenue / salesActivities.length : 0;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mt-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500 rounded-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Live Revenue Streams</h3>
            <p className="text-sm text-gray-600">
              Real-time sales flowing to GreenPOS On-Chain Protocol • {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Recent Total</p>
            <p className="text-lg font-bold text-emerald-600">${totalRecentRevenue.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Avg Sale</p>
            <p className="text-lg font-bold text-blue-600">${Math.round(averageSaleAmount).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto">
        <AnimatePresence>
          {salesActivities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={`flex items-center justify-between p-4 rounded-lg transition-all duration-500 ${
                activity.isNew 
                  ? 'bg-emerald-50 border-2 border-emerald-200 shadow-lg' 
                  : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-3 h-3 rounded-full ${
                  activity.isNew 
                    ? 'bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50' 
                    : 'bg-gray-400'
                }`}></div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className={`font-medium truncate ${
                      activity.isNew ? 'text-emerald-800' : 'text-gray-800'
                    }`}>
                      {activity.shopName}
                    </p>
                    {activity.isNew && (
                      <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                        NEW
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{activity.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{activity.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-right ml-4">
                <div className="flex items-center gap-1">
                  <DollarSign className={`w-4 h-4 ${
                    activity.isNew ? 'text-emerald-600' : 'text-gray-600'
                  }`} />
                  <span className={`font-bold text-lg ${
                    activity.isNew ? 'text-emerald-600' : 'text-gray-800'
                  }`}>
                    {activity.amount}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Revenue</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {salesActivities.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Waiting for sales activity...</p>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Store, TrendingUp, Package, Users, ShoppingCart, AlertTriangle, Plus } from 'lucide-react';
import { Shop, Transaction } from '../types';

interface ShopOwnerDashboardProps {
  shops: Shop[];
  transactions: Transaction[];
  onShopSelect: (shop: Shop) => void;
  onOpenPOS: () => void;
}

export const ShopOwnerDashboard: React.FC<ShopOwnerDashboardProps> = ({
  shops,
  transactions,
  onShopSelect,
  onOpenPOS
}) => {
  const [selectedShopId, setSelectedShopId] = useState<string>(shops[0]?.id || '');
  
  const selectedShop = shops.find(shop => shop.id === selectedShopId) || shops[0];
  const shopTransactions = transactions.filter(t => t.shopId === selectedShopId);
  const lowStockItems = selectedShop?.inventory.filter(item => item.quantity <= item.lowStockThreshold) || [];

  const todaysSales = shopTransactions
    .filter(t => t.type === 'sale' && new Date(t.timestamp).toDateString() === new Date().toDateString())
    .reduce((sum, t) => sum + t.amount, 0);

  const handleQuickSale = () => {
    onShopSelect(selectedShop);
    onOpenPOS();
  };

  return (
    <div className="space-y-6">
      {/* Shop Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
      >
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Shop Owner Dashboard</h2>
          <select
            value={selectedShopId}
            onChange={(e) => setSelectedShopId(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white min-w-48"
          >
            {shops.map(shop => (
              <option key={shop.id} value={shop.id}>
                {shop.name} - {shop.country}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {selectedShop && (
        <>
          {/* Shop Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
          >
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                    <Store className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{selectedShop.name}</h3>
                    <p className="text-gray-600">{selectedShop.country} • {selectedShop.category}</p>
                    <p className="text-sm text-gray-500">Owner: {selectedShop.owner}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-emerald-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                      <span className="text-sm text-emerald-700">Monthly Revenue</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-800">฿{selectedShop.revenue.toLocaleString()}</p>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingCart className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-blue-700">Today's Sales</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-800">฿{todaysSales.toLocaleString()}</p>
                  </div>

                  <div className="bg-purple-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-5 h-5 text-purple-600" />
                      <span className="text-sm text-purple-700">Stock Health</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-800">{Math.round(selectedShop.stockHealth * 100)}%</p>
                  </div>

                  <div className="bg-orange-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-orange-600" />
                      <span className="text-sm text-orange-700">Funding Progress</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-800">
                      {Math.round((selectedShop.totalFunded / selectedShop.fundingNeeded) * 100)}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:w-80">
                <div className="bg-gray-50 rounded-xl p-4 h-48">
                  <h4 className="font-semibold text-gray-800 mb-3">Live Shop Feed</h4>
                  <div className="relative rounded-lg overflow-hidden h-32">
                    <img
                      src={selectedShop.liveStream}
                      alt="Shop live feed"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      LIVE
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button
                onClick={handleQuickSale}
                className="flex items-center gap-3 p-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
              >
                <div className="p-2 bg-emerald-500 rounded-lg">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-emerald-800">New Sale</p>
                  <p className="text-sm text-emerald-600">Process transaction</p>
                </div>
              </button>

              <button className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-colors">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-blue-800">Manage Inventory</p>
                  <p className="text-sm text-blue-600">Update stock levels</p>
                </div>
              </button>

              <button className="flex items-center gap-3 p-4 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-colors">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-purple-800">View Analytics</p>
                  <p className="text-sm text-purple-600">Sales reports</p>
                </div>
              </button>

              <button className="flex items-center gap-3 p-4 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl transition-colors">
                <div className="p-2 bg-orange-500 rounded-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-orange-800">Customer Data</p>
                  <p className="text-sm text-orange-600">View insights</p>
                </div>
              </button>
            </div>
          </motion.div>

          {/* Inventory Management */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-4">Current Inventory</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {selectedShop.inventory.map(item => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 truncate">{item.name}</p>
                      <p className="text-sm text-gray-600">{item.category}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="font-bold text-gray-800">฿{item.price}</p>
                      <p className={`text-sm ${item.quantity <= item.lowStockThreshold ? 'text-red-600' : 'text-gray-600'}`}>
                        {item.quantity} in stock
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-6"
            >
              {/* Low Stock Alerts */}
              {lowStockItems.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <h3 className="text-lg font-bold text-red-800">Low Stock Alert</h3>
                  </div>
                  <div className="space-y-2">
                    {lowStockItems.map(item => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-red-800 font-medium">{item.name}</span>
                        <span className="text-red-600">{item.quantity} left</span>
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                    Request Restock
                  </button>
                </div>
              )}

              {/* Recent Transactions */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Transactions</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {shopTransactions.slice(0, 10).map(transaction => (
                    <div
                      key={transaction.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-gray-800 capitalize">{transaction.type}</p>
                        <p className="text-sm text-gray-600">
                          {transaction.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${
                          transaction.type === 'sale' ? 'text-emerald-600' : 
                          transaction.type === 'funding' ? 'text-blue-600' : 'text-orange-600'
                        }`}>
                          {transaction.type === 'sale' ? '+' : transaction.type === 'funding' ? '+' : '-'}฿{transaction.amount}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
};
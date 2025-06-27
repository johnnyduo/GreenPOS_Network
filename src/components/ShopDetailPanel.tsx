import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, TrendingUp, Package, AlertTriangle, Users, DollarSign, RefreshCw } from 'lucide-react';
import { Shop } from '../types';

interface ShopDetailPanelProps {
  shop: Shop | null;
  onClose: () => void;
  onFundShop: (shop: Shop) => void;
  onRestockShop: (shop: Shop) => void;
}

export const ShopDetailPanel: React.FC<ShopDetailPanelProps> = ({
  shop,
  onClose,
  onFundShop,
  onRestockShop
}) => {
  if (!shop) return null;

  const fundingProgress = (shop.totalFunded / shop.fundingNeeded) * 100;
  const lowStockItems = shop.inventory.filter(item => item.quantity <= item.lowStockThreshold);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white border-l border-gray-200 z-50 overflow-y-auto shadow-2xl"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-gray-800 mb-1 truncate">{shop.name}</h2>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm truncate">{shop.country}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1 truncate">Owner: {shop.owner}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-4"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Live Feed */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Live Frontstore Camera</h3>
            <div className="relative rounded-xl overflow-hidden">
              <img
                src={shop.liveStream}
                alt="Shop live feed"
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                LIVE
              </div>
              <div className="absolute bottom-3 left-3 bg-black/50 text-white px-2 py-1 rounded text-xs">
                Active Monitoring
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-emerald-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <span className="text-sm text-emerald-700">Revenue</span>
              </div>
              <p className="text-2xl font-bold text-emerald-800">฿{shop.revenue.toLocaleString()}</p>
              <p className="text-xs text-emerald-600">This month</p>
            </div>

            <div className="bg-blue-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-blue-700">Stock Health</span>
              </div>
              <p className="text-2xl font-bold text-blue-800">{Math.round(shop.stockHealth * 100)}%</p>
              <p className="text-xs text-blue-600">Good condition</p>
            </div>
          </div>

          {/* Funding Progress */}
          <div className="mb-6 bg-gray-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800">Funding Progress</h3>
              <span className="text-sm text-gray-600">{Math.round(fundingProgress)}%</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${fundingProgress}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full"
              />
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">฿{shop.totalFunded.toLocaleString()} funded</span>
              <span className="text-gray-800 font-medium">฿{shop.fundingNeeded.toLocaleString()} goal</span>
            </div>
          </div>

          {/* Low Stock Alerts */}
          {lowStockItems.length > 0 && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-semibold text-red-800">Low Stock Alert</h3>
              </div>
              <div className="space-y-2">
                {lowStockItems.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-red-800 font-medium truncate">{item.name}</span>
                    <span className="text-red-600 font-medium ml-2">{item.quantity} left</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inventory */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Current Inventory</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {shop.inventory.map(item => (
                <div
                  key={item.id}
                  className="flex justify-between items-center bg-gray-50 rounded-lg p-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800 font-medium truncate">{item.name}</p>
                    <p className="text-sm text-gray-600 truncate">{item.category}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-gray-800 font-bold">฿{item.price}</p>
                    <p className={`text-sm ${item.quantity <= item.lowStockThreshold ? 'text-red-600' : 'text-gray-600'}`}>
                      {item.quantity} in stock
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button 
              onClick={() => onFundShop(shop)}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <DollarSign className="w-4 h-4" />
              Fund This Shop
            </button>
            
            <button 
              onClick={() => onRestockShop(shop)}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Restock Assistance
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingUp, BarChart3, PieChart, Calendar, Download } from 'lucide-react';
import { Shop, Transaction } from '../types';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  shop: Shop | null;
  transactions: Transaction[];
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  isOpen,
  onClose,
  shop,
  transactions
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'sales' | 'inventory'>('overview');

  if (!shop) return null;

  const shopTransactions = transactions.filter(t => t.shopId === shop.id);
  const salesTransactions = shopTransactions.filter(t => t.type === 'sale');
  
  // Mock analytics data
  const analyticsData = {
    totalSales: salesTransactions.reduce((sum, t) => sum + t.amount, 0),
    averageOrderValue: salesTransactions.length > 0 ? salesTransactions.reduce((sum, t) => sum + t.amount, 0) / salesTransactions.length : 0,
    topSellingItems: shop.inventory.slice(0, 5),
    salesGrowth: 12.5,
    customerRetention: 68.3,
    profitMargin: 24.8
  };

  const timeRangeLabels = {
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    '90d': 'Last 90 Days'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Analytics Report</h2>
                <p className="text-gray-600">{shop.name}</p>
              </div>
              <div className="flex items-center gap-4">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as any)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {Object.entries(timeRangeLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <button className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-600" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'text-emerald-600 border-b-2 border-emerald-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('sales')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'sales'
                    ? 'text-emerald-600 border-b-2 border-emerald-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Sales Analysis
              </button>
              <button
                onClick={() => setActiveTab('inventory')}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'inventory'
                    ? 'text-emerald-600 border-b-2 border-emerald-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Inventory Insights
              </button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-emerald-50 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-emerald-500 rounded-lg">
                          <TrendingUp className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-emerald-700">Total Sales</p>
                          <p className="text-2xl font-bold text-emerald-800">
                            ${analyticsData.totalSales.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-600 text-sm">↗ {analyticsData.salesGrowth}%</span>
                        <span className="text-gray-600 text-sm">vs last period</span>
                      </div>
                    </div>

                    <div className="bg-blue-50 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-500 rounded-lg">
                          <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-blue-700">Avg Order Value</p>
                          <p className="text-2xl font-bold text-blue-800">
                            ${analyticsData.averageOrderValue.toFixed(0)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-blue-600 text-sm">↗ 8.2%</span>
                        <span className="text-gray-600 text-sm">vs last period</span>
                      </div>
                    </div>

                    <div className="bg-purple-50 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-purple-500 rounded-lg">
                          <PieChart className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-purple-700">Profit Margin</p>
                          <p className="text-2xl font-bold text-purple-800">
                            {analyticsData.profitMargin}%
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-purple-600 text-sm">↗ 2.1%</span>
                        <span className="text-gray-600 text-sm">vs last period</span>
                      </div>
                    </div>
                  </div>

                  {/* Sales Chart Placeholder */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Sales Trend</h3>
                    <div className="h-64 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                      <div className="text-center text-gray-500">
                        <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Sales chart visualization</p>
                        <p className="text-sm">Interactive chart would be displayed here</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'sales' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Selling Items</h3>
                      <div className="space-y-3">
                        {analyticsData.topSellingItems.map((item, index) => (
                          <div key={item.id} className="flex items-center gap-3">
                            <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </span>
                            <img
                              src={item.image || 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=200'}
                              alt={item.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-800 truncate">{item.name}</p>
                              <p className="text-sm text-gray-600">${item.price}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-emerald-600">{Math.floor(Math.random() * 50) + 10} sold</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Insights</h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Customer Retention</span>
                          <span className="font-bold text-gray-800">{analyticsData.customerRetention}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Repeat Customers</span>
                          <span className="font-bold text-gray-800">42%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Peak Hours</span>
                          <span className="font-bold text-gray-800">2-4 PM</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Avg Visit Duration</span>
                          <span className="font-bold text-gray-800">12 min</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'inventory' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Stock Status</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">In Stock</span>
                          <span className="font-bold text-green-600">
                            {shop.inventory.filter(i => i.quantity > i.lowStockThreshold).length} items
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Low Stock</span>
                          <span className="font-bold text-yellow-600">
                            {shop.inventory.filter(i => i.quantity <= i.lowStockThreshold && i.quantity > 0).length} items
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Out of Stock</span>
                          <span className="font-bold text-red-600">
                            {shop.inventory.filter(i => i.quantity === 0).length} items
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Total Value</span>
                          <span className="font-bold text-gray-800">
                            ${shop.inventory.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Inventory Turnover</h3>
                      <div className="space-y-3">
                        {shop.inventory.slice(0, 5).map(item => (
                          <div key={item.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <img
                                src={item.image || 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=200'}
                                alt={item.name}
                                className="w-8 h-8 rounded object-cover"
                              />
                              <span className="text-gray-800 truncate">{item.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="w-20 bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-emerald-500 h-2 rounded-full" 
                                  style={{ width: `${Math.random() * 100}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-gray-600">{Math.floor(Math.random() * 20) + 5} days</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, ShoppingCart, DollarSign, Minus, Search } from 'lucide-react';
import { Shop, InventoryItem } from '../types';

interface POSQuickAddProps {
  isOpen: boolean;
  onClose: () => void;
  shop: Shop | null;
  onSaleComplete: (amount: number) => void;
}

interface SaleItem {
  item: InventoryItem;
  quantity: number;
}

export const POSQuickAdd: React.FC<POSQuickAddProps> = ({
  isOpen,
  onClose,
  shop,
  onSaleComplete
}) => {
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  if (!shop) return null;

  const categories = ['all', ...new Set(shop.inventory.map(item => item.category))];
  
  const filteredInventory = shop.inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addItem = (item: InventoryItem) => {
    const existingItem = saleItems.find(si => si.item.id === item.id);
    if (existingItem) {
      setSaleItems(prev => prev.map(si => 
        si.item.id === item.id 
          ? { ...si, quantity: si.quantity + 1 }
          : si
      ));
    } else {
      setSaleItems(prev => [...prev, { item, quantity: 1 }]);
    }
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setSaleItems(prev => prev.filter(si => si.item.id !== itemId));
    } else {
      setSaleItems(prev => prev.map(si => 
        si.item.id === itemId 
          ? { ...si, quantity: newQuantity }
          : si
      ));
    }
  };

  const removeItem = (itemId: string) => {
    setSaleItems(prev => prev.filter(si => si.item.id !== itemId));
  };

  const calculateTotal = () => {
    return saleItems.reduce((total, saleItem) => 
      total + (saleItem.item.price * saleItem.quantity), 0
    );
  };

  const completeSale = () => {
    const total = calculateTotal();
    onSaleComplete(total);
    setSaleItems([]);
    setSearchTerm('');
    setSelectedCategory('all');
    onClose();
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
            className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">Point of Sale System</h2>
                <p className="text-sm text-gray-600 truncate">{shop.name} - {shop.country}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-4"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="flex h-[calc(90vh-120px)]">
              {/* Left Panel - Product Selection */}
              <div className="flex-1 p-6 border-r border-gray-200 overflow-y-auto">
                {/* Search and Filter */}
                <div className="mb-6">
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredInventory.map(item => (
                    <motion.div
                      key={item.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => addItem(item)}
                      className="bg-gray-50 rounded-xl p-4 cursor-pointer hover:bg-gray-100 transition-colors border border-gray-200"
                    >
                      <div className="aspect-square mb-3 rounded-lg overflow-hidden bg-gray-200">
                        <img
                          src={item.image || 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=200'}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <h3 className="font-semibold text-gray-800 mb-1 truncate">{item.name}</h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-emerald-600">฿{item.price}</span>
                        <span className={`text-sm px-2 py-1 rounded ${
                          item.quantity > item.lowStockThreshold 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {item.quantity} left
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Right Panel - Cart */}
              <div className="w-96 p-6 bg-gray-50 flex flex-col">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Current Sale</h3>
                
                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto mb-6">
                  {saleItems.length === 0 ? (
                    <div className="text-center text-gray-500 mt-8">
                      <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No items in cart</p>
                      <p className="text-sm">Click products to add them</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {saleItems.map(saleItem => (
                        <div
                          key={saleItem.item.id}
                          className="bg-white rounded-lg p-4 border border-gray-200"
                        >
                          <div className="flex items-start gap-3">
                            <img
                              src={saleItem.item.image || 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=200'}
                              alt={saleItem.item.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-800 truncate">{saleItem.item.name}</h4>
                              <p className="text-sm text-gray-600">฿{saleItem.item.price} each</p>
                              
                              <div className="flex items-center gap-2 mt-2">
                                <button
                                  onClick={() => updateQuantity(saleItem.item.id, saleItem.quantity - 1)}
                                  className="p-1 hover:bg-gray-100 rounded"
                                >
                                  <Minus className="w-4 h-4" />
                                </button>
                                <span className="px-3 py-1 bg-gray-100 rounded text-sm font-medium">
                                  {saleItem.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(saleItem.item.id, saleItem.quantity + 1)}
                                  className="p-1 hover:bg-gray-100 rounded"
                                >
                                  <Plus className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => removeItem(saleItem.item.id)}
                                  className="p-1 hover:bg-red-100 rounded text-red-500 ml-auto"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="text-right mt-2">
                            <span className="text-lg font-bold text-emerald-600">
                              ฿{(saleItem.item.price * saleItem.quantity).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Total and Checkout */}
                <div className="border-t border-gray-200 pt-4 space-y-4">
                  <div className="flex items-center justify-between text-xl font-bold">
                    <span className="text-gray-800">Total:</span>
                    <span className="text-emerald-600">฿{calculateTotal().toLocaleString()}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={onClose}
                      className="py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={completeSale}
                      disabled={saleItems.length === 0}
                      className="py-3 px-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Complete Sale
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
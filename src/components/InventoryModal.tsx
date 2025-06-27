import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Plus, Minus, Search, Filter } from 'lucide-react';
import { Shop, InventoryItem } from '../types';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  shop: Shop | null;
  onUpdateInventory: (shopId: string, updatedInventory: InventoryItem[]) => void;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  shop,
  onUpdateInventory
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [tempInventory, setTempInventory] = useState<InventoryItem[]>([]);

  React.useEffect(() => {
    if (shop) {
      setTempInventory([...shop.inventory]);
    }
  }, [shop]);

  if (!shop) return null;

  const categories = ['all', ...new Set(shop.inventory.map(item => item.category))];
  
  const filteredInventory = tempInventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const updateItemQuantity = (itemId: string, newQuantity: number) => {
    setTempInventory(prev => prev.map(item => 
      item.id === itemId ? { ...item, quantity: Math.max(0, newQuantity) } : item
    ));
  };

  const updateItemPrice = (itemId: string, newPrice: number) => {
    setTempInventory(prev => prev.map(item => 
      item.id === itemId ? { ...item, price: Math.max(0, newPrice) } : item
    ));
  };

  const saveChanges = () => {
    onUpdateInventory(shop.id, tempInventory);
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
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Manage Inventory</h2>
                <p className="text-gray-600">{shop.name}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Search and Filter */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search inventory..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Inventory List */}
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="space-y-4">
                {filteredInventory.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200"
                  >
                    <img
                      src={item.image || 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=200'}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 truncate">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.category}</p>
                      <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Quantity Control */}
                      <div className="text-center">
                        <label className="text-xs text-gray-600 block mb-1">Quantity</label>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 0)}
                            className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          />
                          <button
                            onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Price Control */}
                      <div className="text-center">
                        <label className="text-xs text-gray-600 block mb-1">Price (฿)</label>
                        <input
                          type="number"
                          value={item.price}
                          onChange={(e) => updateItemPrice(item.id, parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 text-center border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        />
                      </div>

                      {/* Stock Status */}
                      <div className="text-center">
                        <label className="text-xs text-gray-600 block mb-1">Status</label>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.quantity > item.lowStockThreshold 
                            ? 'bg-green-100 text-green-700' 
                            : item.quantity > 0
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {item.quantity > item.lowStockThreshold ? 'In Stock' : 
                           item.quantity > 0 ? 'Low Stock' : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center p-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                {filteredInventory.length} items • {filteredInventory.filter(i => i.quantity <= i.lowStockThreshold).length} low stock
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={saveChanges}
                  className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
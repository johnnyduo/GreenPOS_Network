import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, ShoppingCart, DollarSign } from 'lucide-react';
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
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  const addItem = () => {
    if (!selectedItem || !shop) return;

    const item = shop.inventory.find(inv => inv.id === selectedItem);
    if (!item) return;

    const existingItem = saleItems.find(si => si.item.id === item.id);
    if (existingItem) {
      setSaleItems(prev => prev.map(si => 
        si.item.id === item.id 
          ? { ...si, quantity: si.quantity + quantity }
          : si
      ));
    } else {
      setSaleItems(prev => [...prev, { item, quantity }]);
    }

    setSelectedItem('');
    setQuantity(1);
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
    onClose();
  };

  if (!shop) return null;

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
            className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-gray-800 mb-1">Quick Sale</h2>
                <p className="text-sm text-gray-600 truncate">{shop.name}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors ml-4"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Add Item Section */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Add Items</h3>
              
              <div className="grid grid-cols-2 gap-3 mb-3">
                <select
                  value={selectedItem}
                  onChange={(e) => setSelectedItem(e.target.value)}
                  className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">Select Item</option>
                  {shop.inventory.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} - ฿{item.price}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Qty"
                />
              </div>

              <button
                onClick={addItem}
                disabled={!selectedItem}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add to Sale
              </button>
            </div>

            {/* Sale Items */}
            {saleItems.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Sale Items</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {saleItems.map(saleItem => (
                    <div
                      key={saleItem.item.id}
                      className="flex items-center justify-between bg-gray-50 rounded-lg p-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 font-medium truncate">{saleItem.item.name}</p>
                        <p className="text-sm text-gray-600">
                          {saleItem.quantity} x ฿{saleItem.item.price}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <span className="text-emerald-600 font-bold">
                          ฿{saleItem.item.price * saleItem.quantity}
                        </span>
                        <button
                          onClick={() => removeItem(saleItem.item.id)}
                          className="p-1 hover:bg-red-100 rounded text-red-500 hover:text-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Total and Actions */}
            <div className="border-t border-gray-200 pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-800">Total:</span>
                <span className="text-2xl font-bold text-emerald-600">
                  ฿{calculateTotal()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onClose}
                  className="py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition-colors"
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
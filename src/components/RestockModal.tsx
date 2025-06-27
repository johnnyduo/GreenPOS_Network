import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Package, Plus, Minus, Truck, CheckCircle } from 'lucide-react';
import { Shop, InventoryItem } from '../types';

interface RestockModalProps {
  isOpen: boolean;
  onClose: () => void;
  shop: Shop | null;
  onRestockComplete: (shopId: string, items: RestockItem[]) => void;
}

interface RestockItem {
  id: string;
  name: string;
  quantity: number;
  cost: number;
}

export const RestockModal: React.FC<RestockModalProps> = ({
  isOpen,
  onClose,
  shop,
  onRestockComplete
}) => {
  const [restockItems, setRestockItems] = useState<RestockItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'standard' | 'express' | 'priority'>('standard');

  if (!shop) return null;

  const lowStockItems = shop.inventory.filter(item => item.quantity <= item.lowStockThreshold);

  const addRestockItem = (item: InventoryItem) => {
    const existingItem = restockItems.find(ri => ri.id === item.id);
    const suggestedQuantity = Math.max(item.lowStockThreshold * 2 - item.quantity, 10);
    const estimatedCost = item.price * 0.6; // Assume 60% of selling price as cost

    if (existingItem) {
      setRestockItems(prev => prev.map(ri => 
        ri.id === item.id 
          ? { ...ri, quantity: ri.quantity + suggestedQuantity }
          : ri
      ));
    } else {
      setRestockItems(prev => [...prev, {
        id: item.id,
        name: item.name,
        quantity: suggestedQuantity,
        cost: estimatedCost
      }]);
    }
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setRestockItems(prev => prev.filter(ri => ri.id !== itemId));
    } else {
      setRestockItems(prev => prev.map(ri => 
        ri.id === itemId 
          ? { ...ri, quantity: newQuantity }
          : ri
      ));
    }
  };

  const removeItem = (itemId: string) => {
    setRestockItems(prev => prev.filter(ri => ri.id !== itemId));
  };

  const calculateTotal = () => {
    const itemsTotal = restockItems.reduce((total, item) => total + (item.cost * item.quantity), 0);
    const deliveryFee = deliveryMethod === 'express' ? 150 : deliveryMethod === 'priority' ? 300 : 50;
    return itemsTotal + deliveryFee;
  };

  const getDeliveryTime = () => {
    switch (deliveryMethod) {
      case 'express': return '1-2 days';
      case 'priority': return 'Same day';
      default: return '3-5 days';
    }
  };

  const handleRestock = async () => {
    if (restockItems.length === 0) return;
    
    setIsProcessing(true);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    onRestockComplete(shop.id, restockItems);
    setIsProcessing(false);
    setRestockItems([]);
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
            className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Restock Assistance</h2>
                <p className="text-gray-600">{shop.name}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Panel - Available Items */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Items Needing Restock</h3>
                
                {lowStockItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>All items are well stocked!</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {lowStockItems.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <img
                            src={item.image || 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=200'}
                            alt={item.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 truncate">{item.name}</p>
                            <p className="text-sm text-red-600">Only {item.quantity} left</p>
                            <p className="text-xs text-gray-500">Threshold: {item.lowStockThreshold}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => addRestockItem(item)}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* All Inventory Items */}
                <div className="mt-6">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">All Inventory Items</h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {shop.inventory.filter(item => item.quantity > item.lowStockThreshold).map(item => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <img
                            src={item.image || 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=200'}
                            alt={item.name}
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 truncate">{item.name}</p>
                            <p className="text-sm text-gray-600">{item.quantity} in stock</p>
                          </div>
                        </div>
                        <button
                          onClick={() => addRestockItem(item)}
                          className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded transition-colors"
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Panel - Restock Order */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Restock Order</h3>
                
                {restockItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Truck className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No items selected for restock</p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto mb-6">
                    {restockItems.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-800 truncate">{item.name}</p>
                          <p className="text-sm text-gray-600">฿{item.cost} per unit</p>
                          
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 hover:bg-blue-200 rounded"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-3 py-1 bg-white rounded text-sm font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 hover:bg-blue-200 rounded"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="p-1 hover:bg-red-200 rounded text-red-500 ml-auto"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-bold text-blue-600">
                            ฿{(item.cost * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Delivery Options */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-800 mb-3">Delivery Method</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="delivery"
                        value="standard"
                        checked={deliveryMethod === 'standard'}
                        onChange={(e) => setDeliveryMethod(e.target.value as any)}
                        className="text-blue-500"
                      />
                      <div className="flex-1">
                        <p className="font-medium">Standard Delivery</p>
                        <p className="text-sm text-gray-600">3-5 days • ฿50</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="delivery"
                        value="express"
                        checked={deliveryMethod === 'express'}
                        onChange={(e) => setDeliveryMethod(e.target.value as any)}
                        className="text-blue-500"
                      />
                      <div className="flex-1">
                        <p className="font-medium">Express Delivery</p>
                        <p className="text-sm text-gray-600">1-2 days • ฿150</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="delivery"
                        value="priority"
                        checked={deliveryMethod === 'priority'}
                        onChange={(e) => setDeliveryMethod(e.target.value as any)}
                        className="text-blue-500"
                      />
                      <div className="flex-1">
                        <p className="font-medium">Priority Delivery</p>
                        <p className="text-sm text-gray-600">Same day • ฿300</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Order Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Items ({restockItems.length})</span>
                      <span>฿{restockItems.reduce((sum, item) => sum + (item.cost * item.quantity), 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery ({getDeliveryTime()})</span>
                      <span>฿{deliveryMethod === 'express' ? '150' : deliveryMethod === 'priority' ? '300' : '50'}</span>
                    </div>
                    <div className="border-t pt-2 flex justify-between font-bold">
                      <span>Total</span>
                      <span>฿{calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRestock}
                    disabled={restockItems.length === 0 || isProcessing}
                    className="flex-1 py-3 px-4 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Place Order
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, TrendingUp, Target, CreditCard } from 'lucide-react';
import { Shop } from '../types';

interface FundingModalProps {
  isOpen: boolean;
  onClose: () => void;
  shop: Shop | null;
  onFundingComplete: (shopId: string, amount: number) => void;
}

export const FundingModal: React.FC<FundingModalProps> = ({
  isOpen,
  onClose,
  shop,
  onFundingComplete
}) => {
  const [fundingAmount, setFundingAmount] = useState<number>(1000);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'crypto'>('card');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!shop) return null;

  const fundingProgress = (shop.totalFunded / shop.fundingNeeded) * 100;
  const remainingFunding = shop.fundingNeeded - shop.totalFunded;
  const projectedROI = ((shop.revenue / Math.max(shop.totalFunded + fundingAmount, 1)) * 100);

  const handleFunding = async () => {
    if (fundingAmount <= 0 || fundingAmount > remainingFunding) return;
    
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    onFundingComplete(shop.id, fundingAmount);
    setIsProcessing(false);
    setFundingAmount(1000);
  };

  const quickAmounts = [500, 1000, 2500, 5000].filter(amount => amount <= remainingFunding);

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
            className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Fund This Shop</h2>
                <p className="text-gray-600">{shop.name}</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Shop Overview */}
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600">Monthly Revenue</p>
                  <p className="text-lg font-bold text-gray-800">฿{shop.revenue.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Funding</p>
                  <p className="text-lg font-bold text-emerald-600">฿{shop.totalFunded.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Funding Goal</p>
                  <p className="text-lg font-bold text-blue-600">฿{shop.fundingNeeded.toLocaleString()}</p>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Funding Progress</span>
                  <span className="text-sm font-medium text-gray-800">{Math.round(fundingProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(fundingProgress, 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Funding Amount */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investment Amount
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  value={fundingAmount}
                  onChange={(e) => setFundingAmount(Math.max(0, parseInt(e.target.value) || 0))}
                  max={remainingFunding}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Enter amount"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 text-sm">THB</span>
                </div>
              </div>
              
              {/* Quick Amount Buttons */}
              <div className="grid grid-cols-4 gap-2 mt-3">
                {quickAmounts.map(amount => (
                  <button
                    key={amount}
                    onClick={() => setFundingAmount(amount)}
                    className="py-2 px-3 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    ฿{amount.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Investment Projection */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Investment Projection
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-emerald-700">Projected ROI</p>
                  <p className="text-xl font-bold text-emerald-800">{projectedROI.toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-emerald-700">Monthly Returns</p>
                  <p className="text-xl font-bold text-emerald-800">
                    ฿{Math.round((fundingAmount * projectedROI) / 100 / 12).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    paymentMethod === 'card'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm font-medium">Card</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('bank')}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    paymentMethod === 'bank'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Target className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm font-medium">Bank</span>
                </button>
                <button
                  onClick={() => setPaymentMethod('crypto')}
                  className={`p-3 border rounded-lg text-center transition-colors ${
                    paymentMethod === 'crypto'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <DollarSign className="w-5 h-5 mx-auto mb-1" />
                  <span className="text-sm font-medium">Crypto</span>
                </button>
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
                onClick={handleFunding}
                disabled={fundingAmount <= 0 || fundingAmount > remainingFunding || isProcessing}
                className="flex-1 py-3 px-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4" />
                    Invest ฿{fundingAmount.toLocaleString()}
                  </>
                )}
              </button>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-gray-500 mt-4 text-center">
              Investment involves risk. Past performance does not guarantee future results.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
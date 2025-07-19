import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, ExternalLink, Copy, X, ShoppingCart, Wallet } from 'lucide-react';

interface SaleSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  saleAmount: number;
  gpsAmount: number;
  transactionHash?: string;
  explorerUrl?: string;
  shopName: string;
  itemCount: number;
}

export const SaleSuccessModal: React.FC<SaleSuccessModalProps> = ({
  isOpen,
  onClose,
  saleAmount,
  gpsAmount,
  transactionHash,
  explorerUrl,
  shopName,
  itemCount
}) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-auto overflow-hidden"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center justify-center mb-4">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-2">Sale Completed!</h2>
          <p className="text-center text-white/90 text-sm">
            Transaction recorded on MASchain blockchain
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Sale Summary */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <ShoppingCart className="w-5 h-5 text-emerald-600" />
              <h3 className="font-semibold text-gray-800">Sale Summary</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Shop:</span>
                <span className="font-medium text-gray-800">{shopName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Items sold:</span>
                <span className="font-medium text-gray-800">{itemCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sale Amount:</span>
                <span className="font-bold text-emerald-600">${saleAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* GPS Payment */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <Wallet className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-800">GPS Payment</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">GPS Tokens:</span>
                <span className="font-bold text-blue-600">{gpsAmount} GPS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-medium text-green-600">✅ Confirmed</span>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          {transactionHash && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Transaction Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600 block mb-1">Transaction Hash</label>
                  <div className="flex items-center gap-2 p-2 bg-white rounded-lg border">
                    <code className="text-xs text-gray-800 flex-1 font-mono break-all">
                      {transactionHash}
                    </code>
                    <button
                      onClick={() => copyToClipboard(transactionHash)}
                      className="p-1 hover:bg-gray-100 rounded transition-colors"
                      title="Copy transaction hash"
                    >
                      <Copy className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>

                {explorerUrl && (
                  <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View on MASchain Explorer
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Success Message */}
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              Your sale has been successfully recorded on the blockchain. 
              The GPS tokens have been transferred and the transaction is immutable.
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Continue
          </button>
        </div>
      </motion.div>
    </div>
  );
};

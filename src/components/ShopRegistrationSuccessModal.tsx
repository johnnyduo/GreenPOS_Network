import React from 'react';
import { Eye, Copy, X, Store } from 'lucide-react';

interface ShopRegistrationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopName: string;
  category: string;
  location: string;
  fundingGoal: number;
  transactionHash?: string;
  explorerUrl?: string;
  isRealTransaction: boolean;
  shopId?: string;
}

export const ShopRegistrationSuccessModal: React.FC<ShopRegistrationSuccessModalProps> = ({
  isOpen,
  onClose,
  shopName,
  category,
  location,
  fundingGoal,
  transactionHash,
  explorerUrl,
  isRealTransaction,
  shopId
}) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-emerald-500 to-green-600 p-4 text-white">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="flex items-center justify-center mb-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
          </div>
          
          <h2 className="text-xl font-bold text-center mb-1">
            {isRealTransaction ? 'Shop Registered!' : 'Demo Registration Complete!'}
          </h2>
          
          <p className="text-center text-green-100 text-sm">
            {isRealTransaction 
              ? `"${shopName}" is now live on blockchain`
              : `Demo shop "${shopName}" added successfully`
            }
          </p>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Shop Details - Compact */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h3 className="font-semibold text-gray-800 mb-2 text-sm">Shop Details</h3>
            <div className="space-y-2 text-sm">
              {shopId && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Shop ID:</span>
                  <span className="font-medium text-emerald-600">#{shopId}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Category:</span>
                <span className="font-medium text-gray-800">{category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Location:</span>
                <span className="font-medium text-gray-800">{location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Goal:</span>
                <span className="font-medium text-emerald-600">{fundingGoal.toLocaleString()} GPS</span>
              </div>
            </div>
          </div>

          {/* Transaction Type Badge */}
          <div className="flex justify-center">
            {isRealTransaction ? (
              <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Blockchain Transaction
              </div>
            ) : (
              <div className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                Demo Transaction
              </div>
            )}
          </div>

          {/* Transaction Hash - Compact */}
          {transactionHash && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">
                Transaction Hash
              </label>
              <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2 border">
                <code className="text-xs text-gray-800 flex-1 font-mono break-all">
                  {transactionHash.length > 20 ? `${transactionHash.substring(0, 10)}...${transactionHash.substring(-10)}` : transactionHash}
                </code>
                <button
                  onClick={() => copyToClipboard(transactionHash)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  title="Copy transaction hash"
                >
                  <Copy className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Success Message - Compact */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <p className="text-emerald-800 text-xs">
              <strong>🎉 Success!</strong> Your shop is now {isRealTransaction ? 'live on blockchain' : 'available for demo'} and ready to receive funding.
            </p>
          </div>
        </div>

        {/* Footer - Compact */}
        <div className="bg-gray-50 px-4 py-3 space-y-2">
          {explorerUrl && isRealTransaction && (
            <button
              onClick={() => window.open(explorerUrl, '_blank')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-2 text-sm"
            >
              <Eye className="w-4 h-4" />
              <span>View on Explorer</span>
            </button>
          )}
          
          <button
            onClick={onClose}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-3 rounded-lg transition-colors text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

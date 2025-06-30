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
  isRealTransaction
}) => {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-auto overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-emerald-500 to-green-600 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Store className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-2">
            {isRealTransaction ? 'Shop Registration Successful!' : 'Demo Registration Complete!'}
          </h2>
          
          <p className="text-center text-green-100">
            {isRealTransaction 
              ? `Your shop "${shopName}" has been registered on the blockchain and is ready for funding`
              : `Demo shop "${shopName}" has been added for testing purposes`
            }
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Shop Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-gray-800 mb-3">Shop Details</h3>
            
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Name:</span>
                <div className="font-medium text-gray-800">{shopName}</div>
              </div>
              
              <div>
                <span className="text-gray-600">Category:</span>
                <div className="font-medium text-gray-800">{category}</div>
              </div>
              
              <div>
                <span className="text-gray-600">Location:</span>
                <div className="font-medium text-gray-800">{location}</div>
              </div>
              
              <div>
                <span className="text-gray-600">Funding Goal:</span>
                <div className="font-medium text-emerald-600">{fundingGoal.toLocaleString()} GPS tokens</div>
              </div>
            </div>
          </div>

          {/* Transaction Type Badge */}
          <div className="flex justify-center">
            {isRealTransaction ? (
              <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Real Blockchain Transaction
              </div>
            ) : (
              <div className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                Demo Transaction
              </div>
            )}
          </div>

          {/* Transaction Hash */}
          {transactionHash && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Transaction Hash
              </label>
              <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-3 border">
                <code className="text-xs text-gray-800 flex-1 font-mono break-all">
                  {transactionHash}
                </code>
                <button
                  onClick={() => copyToClipboard(transactionHash)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  title="Copy transaction hash"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Network Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Network:</span>
                <div className="font-medium text-gray-800">MASchain {isRealTransaction ? 'Testnet' : 'Demo'}</div>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <div className="font-medium text-green-600">
                  {isRealTransaction ? 'Confirmed' : 'Complete'}
                </div>
              </div>
            </div>
          </div>

          {/* Demo Note */}
          {!isRealTransaction && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> This is a demo registration for testing purposes. 
                Real blockchain registration creates a permanent, verifiable record on MASchain. 
                Your demo shop is available for testing the funding process.
              </p>
            </div>
          )}

          {/* Success Message */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <p className="text-emerald-800 text-sm">
              <strong>🎉 Success!</strong> Your shop is now {isRealTransaction ? 'live on the blockchain' : 'available for demo'} and ready to receive funding from investors. 
              The page will refresh to show your new shop in the marketplace.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 space-y-3">
          {explorerUrl && isRealTransaction && (
            <button
              onClick={() => window.open(explorerUrl, '_blank')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>View on MASchain Explorer</span>
            </button>
          )}
          
          <button
            onClick={onClose}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

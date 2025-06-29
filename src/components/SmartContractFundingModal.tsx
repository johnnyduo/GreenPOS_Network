import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  DollarSign, 
  AlertCircle, 
  CheckCircle,
  Loader,
  ExternalLink,
  Target,
  TrendingUp
} from 'lucide-react';
import { Shop, getCategoryName } from '../types';
import { smartContractService } from '../services/smartContract';
import { config } from '../config';

interface SmartContractFundingModalProps {
  shop: Shop | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (txHash: string) => void;
  walletAddress: string | undefined;
}

export const SmartContractFundingModal: React.FC<SmartContractFundingModalProps> = ({
  shop,
  isOpen,
  onClose,
  onSuccess,
  walletAddress
}) => {
  const [amount, setAmount] = useState<string>('');
  const [purpose, setPurpose] = useState<string>('Stock');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const purposeOptions = [
    'Stock',
    'Equipment', 
    'Expansion',
    'Marketing',
    'Training',
    'Infrastructure'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!shop || !walletAddress) {
      setError('Wallet not connected or shop not selected');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid funding amount');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Convert shop.id to number for blockchain
      const shopId = parseInt(shop.id);
      const fundingAmount = parseFloat(amount);

      const result = await smartContractService.fundShop({
        shopId,
        amount: fundingAmount,
        purpose
      });

      setTxHash(result);
      onSuccess(result);
      
      // Reset form
      setAmount('');
      setPurpose('Stock');
      
    } catch (error: any) {
      setError(error.message || 'Failed to process funding');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setAmount('');
    setPurpose('Stock');
    setError(null);
    setTxHash(null);
    onClose();
  };

  const fundingNeeded = shop ? shop.fundingNeeded - shop.totalFunded : 0;
  const fundingProgress = shop ? (shop.totalFunded / shop.fundingNeeded) * 100 : 0;

  if (!shop) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Fund Shop via Smart Contract
                </h2>
                <p className="text-gray-600">
                  Invest in {shop.name} through blockchain
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Shop Info */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{shop.name}</h3>
                  <p className="text-sm text-gray-600">
                    {getCategoryName(shop.category)} • {shop.country}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Sustainability Score</p>
                  <p className="text-lg font-bold text-green-600">
                    {shop.sustainabilityScore}/100
                  </p>
                </div>
              </div>

              {/* Funding Progress */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Funding Progress</span>
                  <span className="text-sm font-medium text-gray-800">
                    {Math.round(fundingProgress)}%
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(fundingProgress, 100)}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{shop.totalFunded.toLocaleString()} GPS funded</span>
                  <span>{shop.fundingNeeded.toLocaleString()} GPS goal</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-green-200">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-xs text-gray-600">Funding Needed</p>
                    <p className="font-bold text-green-600">
                      {fundingNeeded.toLocaleString()} GPS
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-600">Monthly Revenue</p>
                    <p className="font-bold text-blue-600">
                      {shop.revenue.toLocaleString()} GPS
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Success State */}
            {txHash && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">
                      Funding transaction submitted successfully!
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Transaction Hash: {txHash}
                    </p>
                  </div>
                  <button
                    onClick={() => window.open(`${config.maschain.explorerUrl}/tx/${txHash}`, '_blank')}
                    className="p-1 hover:bg-green-100 rounded transition-colors"
                    title="View on explorer"
                  >
                    <ExternalLink className="w-4 h-4 text-green-600" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Error State */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Funding Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Funding Amount (GPS Tokens)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter GPS token amount to invest"
                    min="0"
                    step="1"
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-16 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100"
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-gray-500">
                    GPS
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Funding Purpose
                </label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100"
                >
                  {purposeOptions.map(option => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              {/* Wallet Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-blue-700">
                      <strong>Connected Wallet:</strong>
                    </p>
                    {walletAddress ? (
                      <code className="text-xs bg-blue-100 px-2 py-1 rounded mt-1 inline-block break-all">
                        {walletAddress}
                      </code>
                    ) : (
                      <span className="text-xs text-blue-600 mt-1 inline-block">Not connected</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-blue-700">
                      <strong>GPS Token Balance:</strong>
                    </p>
                    <span className="text-xs bg-blue-100 px-2 py-1 rounded mt-1 inline-block">
                      Available for funding
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-xs text-blue-600">
                    💡 This transaction will use GPS tokens from your connected wallet to fund the shop via smart contract.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !walletAddress || !!txHash}
                  className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : txHash ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Funded Successfully
                    </>
                  ) : (
                    <>
                      <DollarSign className="w-5 h-5" />
                      Fund Shop
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Smart Contract Info */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                <strong>Smart Contract:</strong> {config.maschain.contractAddress}
                <br />
                <strong>Network:</strong> MASchain Testnet
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SmartContractFundingModal;

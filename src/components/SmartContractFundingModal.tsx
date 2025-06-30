import React, { useState, useEffect } from 'react';
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
import { smartContractService } from '../services/smartContractLite';
import { shopFundingService } from '../services/shopFunding';
import { virtualShopMapping } from '../services/virtualShopMapping';
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
  const [currentShop, setCurrentShop] = useState<Shop | null>(shop);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [fundingAmount, setFundingAmount] = useState<number>(0);
  const [gpsBalance, setGpsBalance] = useState<number>(0);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setPurpose('Stock');
      setError(null);
      setTxHash(null);
      setShowSuccessModal(false);
      setFundingAmount(0);
    }
  }, [isOpen]);

  // Load GPS token info
  useEffect(() => {
    const loadTokenInfo = async () => {
      try {
        const tokenInfo = await smartContractService.getGPSTokenInfo();
        setGpsBalance(tokenInfo.balance);
        // Note: MASchain handles allowances automatically - no need to track allowance
      } catch (error) {
        console.error('Failed to load GPS token info:', error);
      }
    };

    if (isOpen && walletAddress) {
      loadTokenInfo();
    }
  }, [isOpen, walletAddress]);

  // Update shop data with real-time funding
  useEffect(() => {
    if (shop) {
      const updatedShop = shopFundingService.getUpdatedShop(shop);
      setCurrentShop(updatedShop);
    }
  }, [shop]);

  // Listen for funding updates to this specific shop
  useEffect(() => {
    if (!shop) return;

    const unsubscribe = shopFundingService.onFundingUpdate((shopId, _newFunding) => {
      if (shopId === shop.id) {
        const updatedShop = shopFundingService.getUpdatedShop(shop);
        setCurrentShop(updatedShop);
        console.log(`🔄 Modal: Shop ${shopId} funding updated to ${updatedShop.totalFunded} GPS`);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [shop]);

  // Debug wallet address changes
  useEffect(() => {
    console.log('🔄 Wallet address changed in modal:', {
      walletAddress,
      type: typeof walletAddress,
      length: walletAddress?.length,
      truthy: !!walletAddress,
      isOpen
    });
  }, [walletAddress, isOpen]);

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
    
    console.log('🔄 Funding modal submit - detailed debug:', {
      shop: shop?.id,
      shopExists: !!shop,
      walletAddress,
      walletAddressType: typeof walletAddress,
      walletAddressLength: walletAddress?.length,
      walletAddressTruthy: !!walletAddress,
      amount,
      amountValid: !!(amount && parseFloat(amount) > 0)
    });
    
    if (!shop) {
      console.error('❌ Shop validation failed:', shop);
      setError('Shop not selected');
      return;
    }
    
    if (!walletAddress || walletAddress.trim() === '') {
      console.error('❌ Wallet validation failed:', {
        walletAddress,
        type: typeof walletAddress,
        length: walletAddress?.length,
        truthy: !!walletAddress
      });
      setError('Wallet not connected. Please connect your wallet first.');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      console.error('❌ Amount validation failed:', {
        amount,
        parsed: parseFloat(amount),
        valid: !!(amount && parseFloat(amount) > 0),
        isEmpty: amount === '',
        isZero: amount === '0'
      });
      setError('Please enter a valid funding amount greater than 0');
      return;
    }

    // Additional validations for real funding
    const fundingAmount = parseFloat(amount);
    
    if (fundingAmount > gpsBalance) {
      setError(`Insufficient GPS balance. You have ${gpsBalance} GPS but trying to fund ${fundingAmount} GPS.`);
      return;
    }

    // Note: MASchain handles token approvals automatically - no explicit allowance check needed      console.log('✅ All validations passed, proceeding with funding...');

      try {
        setLoading(true);
        setError(null);

        // Use virtual shop mapping to get blockchain-compatible shop ID
        let shopId: number;
        try {
          shopId = virtualShopMapping.getBlockchainShopId(shop.id);
          console.log('🔄 Virtual shop mapping success:', {
            originalShopId: shop.id,
            mappedBlockchainId: shopId
          });
        } catch (mappingError: any) {
          console.error('❌ Virtual shop mapping failed:', mappingError);
          setError(`Unable to process funding for shop ${shop.id}: ${mappingError.message}`);
          return;
        }
        
        const fundingAmount = parseFloat(amount);

        console.log('🔄 Initiating REAL funding transaction...', {
          originalShopId: shop.id,
          blockchainShopId: shopId,
          fundingAmount,
          purpose,
          walletAddress
        });

      // Execute REAL blockchain transaction - no simulation
      const result = await smartContractService.fundShop({
        shopId,
        amount: fundingAmount,
        purpose
      });

      console.log('✅ Funding transaction completed:', result);
      setTxHash(result);
      setFundingAmount(fundingAmount);
      setShowSuccessModal(true);
      
      // Don't call onSuccess immediately - wait for user to close success modal
      
    } catch (error: any) {
      console.error('❌ Funding transaction failed:', error);
      
      // Provide more specific error messages
      if (error.message.includes('Insufficient GPS balance')) {
        setError(`Insufficient GPS tokens. ${error.message}`);
      } else if (error.message.includes('Wallet not connected')) {
        setError('Wallet connection lost. Please reconnect your wallet and try again.');
      } else {
        setError(error.message || 'Failed to process funding transaction');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // Only reset form when explicitly closing the modal
    setAmount('');
    setPurpose('Stock');
    setError(null);
    setTxHash(null);
    setShowSuccessModal(false);
    setFundingAmount(0);
    onClose();
  };

  const fundingNeeded = currentShop ? currentShop.fundingNeeded - currentShop.totalFunded : 0;
  const fundingProgress = currentShop ? (currentShop.totalFunded / currentShop.fundingNeeded) * 100 : 0;

  if (!currentShop) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="funding-modal"
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
                  Invest in {currentShop.name} through blockchain
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Demo Mode Info Banner */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                  <span className="text-amber-600 text-sm">🎭</span>
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-amber-800 mb-1">Demo Mode Active</h4>
                  <p className="text-xs text-amber-700 mb-2">
                    GPS token contract ({config.maschain.gpsTokenAddress}) is not available on MASchain testnet. 
                    All transactions will be simulated for demonstration purposes.
                  </p>
                  <div className="flex items-center gap-4 text-xs text-amber-600">
                    <span>✅ UI/UX Testing</span>
                    <span>✅ Local State Updates</span>
                    <span>✅ Mock Transaction Hashes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shop Info */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{currentShop.name}</h3>
                  <p className="text-sm text-gray-600">
                    {getCategoryName(currentShop.category)} • {currentShop.country}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Sustainability Score</p>
                  <p className="text-lg font-bold text-green-600">
                    {currentShop.sustainabilityScore}/100
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
                  <span>{currentShop.totalFunded.toLocaleString()} GPS funded</span>
                  <span>{currentShop.fundingNeeded.toLocaleString()} GPS goal</span>
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
                      {currentShop.revenue.toLocaleString()} GPS
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
                    title="View on MASchain Explorer"
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
                  <div className="flex-1">
                    <p className="text-sm text-red-700">{error}</p>
                    {/* Debug info */}
                    <div className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded">
                      Debug: Wallet Address = {walletAddress || 'undefined'}, Shop = {shop?.id || 'none'}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Wallet Connection Status */}
            <div className="mb-6 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Wallet Status:</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${walletAddress ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className={`text-sm font-medium ${walletAddress ? 'text-green-700' : 'text-red-700'}`}>
                    {walletAddress ? 'Connected' : 'Not Connected'}
                  </span>
                </div>
              </div>
              {walletAddress && (
                <div className="mt-1 text-xs text-gray-500 font-mono">
                  {walletAddress}
                </div>
              )}
            </div>

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
                    onChange={(e) => {
                      const value = e.target.value;
                      setAmount(value);
                      // Clear error when user starts typing a valid amount
                      if (error && value && parseFloat(value) > 0) {
                        setError(null);
                      }
                    }}
                    placeholder="Enter GPS token amount to invest"
                    min="1"
                    step="1"
                    required
                    disabled={loading}
                    className={`w-full pl-10 pr-16 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-100 ${
                      error && error.includes('amount') ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-gray-500">
                    GPS
                  </span>
                </div>
                
                {/* Amount Help Text */}
                <p className="mt-1 text-xs text-gray-600">
                  💡 Enter the number of GPS tokens you want to invest (minimum: 1 GPS)
                </p>
                
                {/* Quick Amount Buttons */}
                <div className="flex gap-2 mt-2">
                  {[100, 500, 1000, 2000].map((quickAmount) => (
                    <button
                      key={quickAmount}
                      type="button"
                      onClick={() => {
                        setAmount(quickAmount.toString());
                        setError(null);
                      }}
                      disabled={loading}
                      className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 rounded-md transition-colors"
                    >
                      {quickAmount.toLocaleString()}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      const maxAffordable = Math.min(gpsBalance, fundingNeeded);
                      if (maxAffordable > 0) {
                        setAmount(maxAffordable.toString());
                        setError(null);
                      }
                    }}
                    disabled={loading || gpsBalance <= 0}
                    className="px-3 py-1 text-xs bg-emerald-100 hover:bg-emerald-200 disabled:bg-gray-50 text-emerald-700 rounded-md transition-colors"
                  >
                    Max ({Math.min(gpsBalance, fundingNeeded).toLocaleString()})
                  </button>
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
                      {gpsBalance.toLocaleString()} GPS
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-xs text-blue-600">
                    💡 This transaction will use GPS tokens from your connected wallet to fund the shop via smart contract. MASchain handles approvals automatically.
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

      {/* Beautiful Success Modal */}
      {showSuccessModal && (
        <motion.div
          key="success-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={(e) => e.target === e.currentTarget && setShowSuccessModal(false)}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
          >
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full p-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                  <CheckCircle className="w-12 h-12 text-white" />
                </motion.div>
              </div>
            </div>

            {/* Success Content */}
            <div className="text-center mb-6">
              <motion.h3
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold text-gray-800 mb-2"
              >
                🎉 Funding Successful!
              </motion.h3>
              
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-gray-600 mb-4"
              >
                You've successfully invested <span className="font-bold text-emerald-600">{fundingAmount} GPS tokens</span> in <span className="font-bold">{currentShop?.name}</span>!
              </motion.p>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 mb-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">New Funding Progress</span>
                  <span className="text-sm font-bold text-emerald-700">
                    {Math.round(((currentShop?.totalFunded || 0) + fundingAmount) / (currentShop?.fundingNeeded || 1) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div
                    initial={{ width: `${fundingProgress}%` }}
                    animate={{ width: `${Math.min(((currentShop?.totalFunded || 0) + fundingAmount) / (currentShop?.fundingNeeded || 1) * 100, 100)}%` }}
                    transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-3 rounded-full"
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{((currentShop?.totalFunded || 0) + fundingAmount).toLocaleString()} GPS funded</span>
                  <span>{(currentShop?.fundingNeeded || 0).toLocaleString()} GPS goal</span>
                </div>
              </motion.div>

              {/* Transaction Details */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="bg-gray-50 rounded-lg p-3 mb-4"
              >
                <p className="text-xs text-gray-600 mb-1">Transaction Hash:</p>
                <p className="text-xs font-mono text-gray-800 break-all">{txHash}</p>
              </motion.div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                onClick={() => window.open(`${config.maschain.explorerUrl}/tx/${txHash}`, '_blank')}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                View on MASchain Explorer
              </motion.button>
              
              <motion.button
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
                onClick={() => {
                  setShowSuccessModal(false);
                  setTxHash(null);
                  setError(null);
                  setFundingAmount(0);
                  
                  // Don't reset amount and purpose - let user decide if they want to fund again
                  // setAmount('');
                  // setPurpose('Stock');
                  
                  // Refresh token info after funding
                  smartContractService.getGPSTokenInfo().then(tokenInfo => {
                    setGpsBalance(tokenInfo.balance);
                    // Note: MASchain handles allowances automatically
                  });
                  
                  onSuccess(txHash || '');
                  // Don't call handleClose() here - just close the success modal
                  // handleClose();
                }}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-4 rounded-xl font-medium transition-colors"
              >
                Continue
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SmartContractFundingModal;

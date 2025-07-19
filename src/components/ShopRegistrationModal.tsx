import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Store, MapPin, DollarSign, Tag, AlertCircle, Loader, CheckCircle } from 'lucide-react';
import { ShopCategory } from '../types';
import { smartContractService, ShopRegistrationData } from '../services/smartContractLite';

interface ShopRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (shopData: ShopRegistrationData, transactionHash: string, shopId: string) => void;
  isWalletConnected: boolean;
}

const categoryOptions = [
  { value: ShopCategory.OrganicProduce, label: 'Organic Produce', icon: '🌿', description: 'Fresh organic fruits and vegetables' },
  { value: ShopCategory.EcoCrafts, label: 'Eco Crafts', icon: '🎨', description: 'Sustainable handmade crafts and goods' },
  { value: ShopCategory.SolarKiosk, label: 'Solar Kiosk', icon: '☀️', description: 'Solar-powered energy solutions' },
  { value: ShopCategory.WasteUpcycling, label: 'Waste Upcycling', icon: '♻️', description: 'Recycled and upcycled products' },
  { value: ShopCategory.AgroProcessing, label: 'Agro Processing', icon: '🌾', description: 'Agricultural processing and value-added products' }
];

const locationSuggestions = [
  'Bangkok, Thailand',
  'Ho Chi Minh City, Vietnam', 
  'Kuala Lumpur, Malaysia',
  'Jakarta, Indonesia',
  'Manila, Philippines',
  'Singapore',
  'Yangon, Myanmar',
  'Phnom Penh, Cambodia'
];

export const ShopRegistrationModal: React.FC<ShopRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  isWalletConnected
}) => {
  const [formData, setFormData] = useState<ShopRegistrationData>({
    name: '',
    category: ShopCategory.OrganicProduce,
    location: '',
    fundingNeeded: 1000
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ShopRegistrationData, string>>>({});
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ShopRegistrationData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Shop name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Shop name must be at least 3 characters';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Shop name must be less than 50 characters';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    } else if (formData.location.trim().length < 2) {
      newErrors.location = 'Location must be at least 2 characters';
    }

    if (formData.fundingNeeded < 100) {
      newErrors.fundingNeeded = 'Minimum funding needed is $100';
    } else if (formData.fundingNeeded > 1000000) {
      newErrors.fundingNeeded = 'Maximum funding needed is $1,000,000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isWalletConnected) {
      alert('Please connect your wallet first');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('🏪 Registering shop with form data:', formData);
      
      // Use the smart contract service instead of direct API calls
      const txHash = await smartContractService.registerShop(formData);
      
      console.log('🎉 Shop registration successful:', { txHash });
      
      // Try to extract shop ID - for now we'll generate one since the service doesn't return it
      const shopId = `shop_${Date.now()}`;
      
      console.log('🆔 Generated Shop ID:', shopId);
      
      // Success callback
      onSuccess(formData, txHash, shopId);
      
      // Reset form
      setFormData({
        name: '',
        category: ShopCategory.OrganicProduce,
        location: '',
        fundingNeeded: 1000
      });
      
      // Close modal
      onClose();
      
    } catch (error: any) {
      console.error('❌ Shop registration failed:', error);
      
      let errorMessage = 'Failed to register shop';
      
      if (String(error).includes('500')) {
        errorMessage = 'Server error during registration. The contract may be busy or have reached its limits. Please try again in a few moments.';
      } else if (String(error).includes('network') || String(error).includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (String(error).includes('permissions') || String(error).includes('unauthorized')) {
        errorMessage = 'Wallet permissions error. Please ensure your wallet is properly connected.';
      } else if (String(error).includes('gas') || String(error).includes('fee')) {
        errorMessage = 'Transaction fee error. Please ensure you have sufficient balance for transaction fees.';
      } else {
        errorMessage = `Registration failed: ${error.message || error}`;
      }
      
      alert(`❌ Shop Registration Failed\n\n${errorMessage}\n\nPlease try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ShopRegistrationData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleLocationSelect = (location: string) => {
    handleInputChange('location', location);
    setShowLocationSuggestions(false);
  };

  if (!isOpen) return null;

  const selectedCategory = categoryOptions.find(opt => opt.value === formData.category);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-lg">
                <Store className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Register New Shop</h2>
                <p className="text-sm text-gray-600">Create a new shop on the blockchain</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={isSubmitting}
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Shop Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Store className="w-4 h-4 inline mr-1" />
                Shop Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Green Valley Organic Farm"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Business Category *
              </label>
              <div className="grid grid-cols-1 gap-2">
                {categoryOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleInputChange('category', option.value)}
                    className={`text-left p-3 border rounded-lg transition-colors ${
                      formData.category === option.value
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    disabled={isSubmitting}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{option.icon}</span>
                      <div>
                        <div className="font-medium text-gray-800">{option.label}</div>
                        <div className="text-xs text-gray-600">{option.description}</div>
                      </div>
                      {formData.category === option.value && (
                        <CheckCircle className="w-5 h-5 text-emerald-500 ml-auto" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Location */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                onFocus={() => setShowLocationSuggestions(true)}
                onBlur={() => setTimeout(() => setShowLocationSuggestions(false), 200)}
                placeholder="e.g., Bangkok, Thailand"
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                  errors.location ? 'border-red-300' : 'border-gray-300'
                }`}
                disabled={isSubmitting}
              />
              {showLocationSuggestions && formData.location.length < 3 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg z-10 mt-1">
                  {locationSuggestions.map(location => (
                    <button
                      key={location}
                      type="button"
                      onClick={() => handleLocationSelect(location)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{location}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {errors.location && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.location}
                </p>
              )}
            </div>

            {/* Funding Needed */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Funding Goal (USD) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  min="100"
                  max="1000000"
                  step="100"
                  value={formData.fundingNeeded}
                  onChange={(e) => handleInputChange('fundingNeeded', parseInt(e.target.value) || 0)}
                  placeholder="1000"
                  className={`w-full pl-8 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                    errors.fundingNeeded ? 'border-red-300' : 'border-gray-300'
                  }`}
                  disabled={isSubmitting}
                />
              </div>
              {errors.fundingNeeded && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.fundingNeeded}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Minimum: $100 • Maximum: $1,000,000
              </p>
              {/* Quick Amount Buttons */}
              <div className="flex gap-2 mt-2">
                {[1000, 5000, 10000, 25000].map(amount => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => handleInputChange('fundingNeeded', amount)}
                    className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                    disabled={isSubmitting}
                  >
                    ${amount.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
              <div className="space-y-1 text-xs text-gray-600">
                <p><strong>Shop:</strong> {formData.name || 'Shop Name'}</p>
                <p><strong>Category:</strong> {selectedCategory?.icon} {selectedCategory?.label}</p>
                <p><strong>Location:</strong> {formData.location || 'Location'}</p>
                <p><strong>Funding Goal:</strong> ${formData.fundingNeeded.toLocaleString()}</p>
              </div>
            </div>

            {/* Wallet Warning */}
            {!isWalletConnected && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Please connect your MASchain wallet to register a shop
                </p>
              </div>
            )}

            {/* Blockchain Info */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-1">
                🔗 Blockchain Registration
              </p>
              <p className="text-xs text-blue-600">
                Your shop will be permanently registered on the MASchain blockchain. 
                This is a real transaction that cannot be undone.
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !isWalletConnected}
                className="flex-1 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>
                    <Store className="w-4 h-4" />
                    Register Shop
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

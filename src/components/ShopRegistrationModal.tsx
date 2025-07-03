import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Store, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { ShopCategory } from '../types';
import { SmartContractServiceLite } from '../services/smartContractLite';

interface ShopRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (txHash: string, shopData: ShopFormData) => void;
  smartContract: SmartContractServiceLite;
}

interface ShopFormData {
  name: string;
  category: ShopCategory;
  location: string;
  description: string;
  contactInfo: string;
  businessType: string;
  expectedRevenue: string;
}

const SHOP_CATEGORIES = [
  { value: ShopCategory.OrganicProduce, label: 'Organic Produce', icon: '🌿', description: 'Fresh organic fruits, vegetables & herbs' },
  { value: ShopCategory.EcoCrafts, label: 'Eco-Crafts', icon: '🎨', description: 'Handmade sustainable crafts & products' },
  { value: ShopCategory.SolarKiosk, label: 'Solar Kiosk', icon: '☀️', description: 'Solar-powered services & charging stations' },
  { value: ShopCategory.WasteUpcycling, label: 'Waste Upcycling', icon: '♻️', description: 'Creative upcycling & waste management' },
  { value: ShopCategory.AgroProcessing, label: 'Agro-Processing', icon: '🌾', description: 'Food processing & value addition' }
];

const BUSINESS_TYPES = [
  'Retail Store',
  'Service Provider',
  'Manufacturing',
  'Agriculture',
  'Food & Beverage',
  'Technology',
  'Consulting',
  'Other'
];

const SAMPLE_LOCATIONS = [
  'Bangkok, Thailand',
  'Ho Chi Minh City, Vietnam',
  'Kuala Lumpur, Malaysia',
  'Jakarta, Indonesia',
  'Manila, Philippines',
  'Yangon, Myanmar',
  'Phnom Penh, Cambodia',
  'Vientiane, Laos'
];

export const ShopRegistrationModal: React.FC<ShopRegistrationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  smartContract
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextShopId, setNextShopId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState<ShopFormData>({
    name: '',
    category: ShopCategory.OrganicProduce,
    location: '',
    description: '',
    contactInfo: '',
    businessType: 'Retail Store',
    expectedRevenue: ''
  });

  // Fetch next shop ID on modal open
  useEffect(() => {
    if (isOpen) {
      fetchNextShopId();
      resetForm();
      setCurrentStep(1);
      setError(null);
    }
  }, [isOpen]);

  const fetchNextShopId = async () => {
    try {
      const shopCount = await smartContract.getShopCount();
      setNextShopId(shopCount);
      console.log(`📊 Next shop ID will be: ${shopCount}`);
    } catch (error) {
      console.error('Failed to fetch shop count:', error);
      setNextShopId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: ShopCategory.OrganicProduce,
      location: '',
      description: '',
      contactInfo: '',
      businessType: 'Retail Store',
      expectedRevenue: ''
    });
  };

  const handleInputChange = (field: keyof ShopFormData, value: string | ShopCategory) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.name.trim().length >= 3 && formData.location.trim().length >= 3;
      case 2:
        return formData.description.trim().length >= 10;
      case 3:
        return formData.contactInfo.trim().length >= 3;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
      setError(null);
    } else {
      setError(getStepValidationError(currentStep));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError(null);
  };

  const getStepValidationError = (step: number): string => {
    switch (step) {
      case 1:
        if (formData.name.trim().length < 3) return 'Shop name must be at least 3 characters';
        if (formData.location.trim().length < 3) return 'Location must be at least 3 characters';
        return '';
      case 2:
        if (formData.description.trim().length < 10) return 'Description must be at least 10 characters';
        return '';
      case 3:
        if (formData.contactInfo.trim().length < 3) return 'Contact information is required';
        return '';
      default:
        return '';
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) {
      setError(getStepValidationError(3));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🏪 Submitting shop registration:', formData);
      
      // Prepare registration data for smart contract
      const registrationData = {
        name: formData.name.trim(),
        category: formData.category,
        location: formData.location.trim(),
        fundingNeeded: 100 // Always 100 GPS as per contract logic
      };

      // Call smart contract
      const txHash = await smartContract.registerShop(registrationData);
      
      console.log('✅ Shop registration successful:', {
        txHash,
        shopId: nextShopId,
        shopData: formData
      });

      // Call success callback
      onSuccess(txHash, formData);
      
      // Close modal
      onClose();
      
    } catch (error: any) {
      console.error('❌ Shop registration failed:', error);
      setError(error.message || 'Failed to register shop. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Register New Shop</h2>
                  <p className="text-emerald-100 text-sm">
                    {nextShopId !== null ? `Shop ID: #${nextShopId}` : 'Loading ID...'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            {/* Progress Steps */}
            <div className="flex items-center gap-4 mt-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                      step <= currentStep ? 'bg-white text-emerald-500' : 'bg-white/20 text-white/70'
                    }`}
                  >
                    {step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`w-8 h-0.5 mx-2 transition-colors ${
                        step < currentStep ? 'bg-white' : 'bg-white/20'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                <p className="text-red-800 text-sm">{error}</p>
              </motion.div>
            )}

            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Shop Name *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="e.g., Green Valley Organic Farm"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Category *
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {SHOP_CATEGORIES.map((category) => (
                          <button
                            key={category.value}
                            type="button"
                            onClick={() => handleInputChange('category', category.value)}
                            className={`p-3 border rounded-xl text-left transition-all ${
                              formData.category === category.value
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-xl">{category.icon}</span>
                              <div>
                                <div className="font-medium">{category.label}</div>
                                <div className="text-xs text-gray-500">{category.description}</div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location *
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        placeholder="City, Country"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      />
                      <div className="mt-2 flex flex-wrap gap-2">
                        {SAMPLE_LOCATIONS.map((location) => (
                          <button
                            key={location}
                            type="button"
                            onClick={() => handleInputChange('location', location)}
                            className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                          >
                            {location}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 2: Details */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Details</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Type
                      </label>
                      <select
                        value={formData.businessType}
                        onChange={(e) => handleInputChange('businessType', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      >
                        {BUSINESS_TYPES.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Business Description *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Describe your business, products, and services..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
                      />
                      <div className="mt-1 text-xs text-gray-500">
                        {formData.description.length}/500 characters (minimum 10)
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expected Monthly Revenue (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.expectedRevenue}
                        onChange={(e) => handleInputChange('expectedRevenue', e.target.value)}
                        placeholder="e.g., $2,000"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3: Contact & Confirmation */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact & Confirmation</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Information *
                      </label>
                      <input
                        type="text"
                        value={formData.contactInfo}
                        onChange={(e) => handleInputChange('contactInfo', e.target.value)}
                        placeholder="Phone, email, or other contact method"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      />
                    </div>

                    {/* Registration Summary */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-900 mb-3">Registration Summary</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Shop Name:</span>
                          <span className="font-medium">{formData.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Category:</span>
                          <span className="font-medium">
                            {SHOP_CATEGORIES.find(c => c.value === formData.category)?.label}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Location:</span>
                          <span className="font-medium">{formData.location}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Funding Goal:</span>
                          <span className="font-medium text-emerald-600">100 GPS Tokens</span>
                        </div>
                        {nextShopId !== null && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Shop ID:</span>
                            <span className="font-medium">#{nextShopId}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Blockchain Notice */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-blue-900">Blockchain Registration</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            This shop will be permanently registered on the MASchain blockchain. 
                            All information will be publicly verifiable and immutable.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Step {currentStep} of 3
              </div>
              
              <div className="flex items-center gap-3">
                {currentStep > 1 && (
                  <button
                    onClick={handlePrevious}
                    disabled={loading}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
                  >
                    Previous
                  </button>
                )}
                
                {currentStep < 3 ? (
                  <button
                    onClick={handleNext}
                    disabled={!validateStep(currentStep)}
                    className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !validateStep(3)}
                    className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      <>
                        <Store className="w-4 h-4" />
                        Register Shop
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

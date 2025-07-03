// Quick test to verify smartContractService import is working
console.log('🧪 Testing smartContractService import...');

try {
  // Test the import
  import('./src/services/smartContractLite.js').then(module => {
    console.log('✅ Module imported successfully');
    console.log('Available exports:', Object.keys(module));
    
    if (module.smartContractService) {
      console.log('✅ smartContractService export found');
      console.log('Service methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(module.smartContractService)));
    } else {
      console.log('❌ smartContractService export not found');
    }
  }).catch(error => {
    console.error('❌ Import failed:', error);
  });
  
  // Also test shopFunding service
  import('./src/services/shopFunding.js').then(module => {
    console.log('✅ ShopFunding module imported successfully');
    console.log('ShopFunding exports:', Object.keys(module));
  }).catch(error => {
    console.error('❌ ShopFunding import failed:', error);
  });
  
} catch (error) {
  console.error('❌ Test failed:', error);
}

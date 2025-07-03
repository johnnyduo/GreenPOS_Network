// Test SmartContractServiceLite instantiation
console.log('🧪 Testing SmartContractServiceLite instantiation...');

try {
  // Test importing the module
  console.log('1. Testing module import...');
  import('./src/services/smartContractLite.js').then(module => {
    console.log('✅ Module imported successfully');
    console.log('Available exports:', Object.keys(module));
    
    if (module.smartContractService) {
      console.log('✅ smartContractService export found');
      console.log('2. Testing service methods...');
      
      try {
        // Test getting version
        const version = module.smartContractService.getVersion();
        console.log('✅ Version method works:', version);
        
        // Test basic properties
        console.log('✅ Contract address:', module.smartContractService.getContractAddress());
        console.log('✅ GPS token address:', module.smartContractService.getGPSTokenAddress());
        console.log('✅ Wallet connected:', module.smartContractService.isWalletConnected());
        
        console.log('🎉 All tests passed! SmartContractServiceLite is working correctly.');
        
      } catch (methodError) {
        console.error('❌ Error testing service methods:', methodError);
      }
    } else {
      console.error('❌ smartContractService export not found');
    }
  }).catch(error => {
    console.error('❌ Module import failed:', error);
  });
  
} catch (error) {
  console.error('❌ Test setup failed:', error);
}

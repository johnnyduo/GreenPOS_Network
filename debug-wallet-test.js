// Quick test script to verify smart contract service wallet connection
// This can be run in browser console to debug wallet connection issues

console.log('🔧 GreenPOS Wallet Connection Debug Test');
console.log('=====================================');

// Test 1: Check environment variables
console.log('1. Environment Configuration:');
console.log('   MASCHAIN_WALLET_ADDRESS:', import.meta.env.VITE_MASCHAIN_WALLET_ADDRESS);
console.log('   MASCHAIN_CONTRACT_ADDRESS:', import.meta.env.VITE_MASCHAIN_CONTRACT_ADDRESS);
console.log('   GPS_TOKEN_ADDRESS:', import.meta.env.VITE_GPS_TOKEN_ADDRESS);

// Test 2: Check localStorage for wallet connection
console.log('2. LocalStorage Wallet Info:');
console.log('   maschain_wallet_address:', localStorage.getItem('maschain_wallet_address'));
console.log('   maschain_connected:', localStorage.getItem('maschain_connected'));

// Test 3: Check smart contract service state
console.log('3. Smart Contract Service State:');
try {
  const { smartContractService } = await import('./src/services/smartContractLite.ts');
  console.log('   Service loaded successfully');
  console.log('   Current wallet address:', smartContractService.getWalletAddress?.());
  console.log('   GPS Token address:', smartContractService.getGPSTokenAddress?.());
  
  // Test GPS token info
  console.log('4. Testing GPS Token Info:');
  const tokenInfo = await smartContractService.getGPSTokenInfo();
  console.log('   Token info:', tokenInfo);
} catch (error) {
  console.error('   Error testing smart contract service:', error);
}

console.log('=====================================');
console.log('✅ Debug test complete. Check logs above for any issues.');

#!/usr/bin/env node

// Test the shop loading directly to see what's happening

console.log('🧪 Testing shop loading service directly...');

try {
  // Import the service
  const { smartContractService } = await import('./src/services/smartContractLite.ts');
  
  console.log('📦 Service imported successfully');
  
  // Set wallet address
  const walletAddress = '0x1154dfA292A59A003ADF3a820dfc98ddbD273FeD';
  smartContractService.setWalletAddress(walletAddress);
  console.log('🔗 Wallet address set:', walletAddress);
  
  // Test shop count
  console.log('\n1️⃣ Testing shop count...');
  const shopCount = await smartContractService.getShopCount();
  console.log(`📊 Shop count: ${shopCount}`);
  
  if (shopCount > 0) {
    // Test individual shop fetch
    console.log('\n2️⃣ Testing individual shop fetch...');
    const shop0 = await smartContractService.getShop(0);
    console.log('🏪 Shop 0:', shop0);
    
    // Test getShopsForInvestorDashboard
    console.log('\n3️⃣ Testing getShopsForInvestorDashboard...');
    const dashboardShops = await smartContractService.getShopsForInvestorDashboard();
    console.log(`📈 Dashboard shops count: ${dashboardShops.length}`);
    console.log('📋 Dashboard shops:', dashboardShops.map(shop => ({
      id: shop.id,
      name: shop.name,
      isActive: shop.isActive,
      isPlaceholder: shop.isPlaceholder
    })));
    
    if (dashboardShops.length === 0) {
      console.log('❌ PROBLEM: getShopsForInvestorDashboard returned empty array despite shops existing!');
    } else {
      console.log('✅ SUCCESS: getShopsForInvestorDashboard returned shops');
    }
  } else {
    console.log('⚠️ No shops found in contract');
  }
  
} catch (error) {
  console.error('❌ Test failed:', error);
}

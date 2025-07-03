// Test script to verify the MASchain error handling and fallback mechanism
import { smartContractService } from './src/services/smartContractLite.js';

console.log('🧪 Testing MASchain error handling and fallback...');

async function testShopFetching() {
  console.log('\n1. Testing shop fetching with current API state...');
  
  try {
    const shops = await smartContractService.getShopsForInvestorDashboard();
    console.log(`✅ Fetched ${shops.length} shops:`);
    
    shops.forEach((shop, index) => {
      console.log(`   ${index + 1}. ${shop.name} (${shop.isDemoData ? 'Demo' : 'Blockchain'} Data)`);
      console.log(`      - Funding: $${shop.totalFunded}/${shop.fundingNeeded}`);
      console.log(`      - Country: ${shop.country}`);
      console.log(`      - Active: ${shop.isActive}`);
    });
    
    // Test specific scenarios
    if (shops.length > 0 && shops[0].isDemoData) {
      console.log('\n🔄 Fallback mechanism is working - demo shops provided when API fails');
    } else if (shops.length > 0 && !shops[0].isDemoData) {
      console.log('\n🌐 Real blockchain data loaded successfully');
    } else if (shops.length === 0) {
      console.log('\n⚠️ No shops available (empty contract or API completely down)');
    }
    
  } catch (error) {
    console.error('❌ Error testing shop fetching:', error);
  }
}

async function testNetworkStats() {
  console.log('\n2. Testing network stats...');
  
  try {
    const stats = await smartContractService.getNetworkStats();
    console.log('✅ Network stats:', {
      totalShops: stats.totalShops,
      totalFunding: stats.totalFunding,
      totalInvestors: stats.totalInvestors
    });
  } catch (error) {
    console.error('❌ Network stats failed:', error.message);
  }
}

async function runTests() {
  console.log('🚀 Starting comprehensive tests...');
  
  await testShopFetching();
  await testNetworkStats();
  
  console.log('\n📋 Test Summary:');
  console.log('- If you see demo shops with "isDemoData: true", the fallback is working');
  console.log('- If you see real blockchain data, the API connection is restored');
  console.log('- The dashboard should now display shops instead of "No Shops Registered Yet"');
}

runTests();

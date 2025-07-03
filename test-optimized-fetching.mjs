// Test script for optimized shop fetching
import { smartContractService } from '../src/services/smartContractLite.js';

async function testOptimizedFetching() {
  console.log('🧪 Testing optimized shop fetching performance...');
  
  const startTime = Date.now();
  
  try {
    // Test 1: First call (should trigger fresh fetch)
    console.log('\n📋 Test 1: First call (fresh fetch)');
    const shops1 = await smartContractService.getShopsForInvestorDashboard();
    const time1 = Date.now() - startTime;
    console.log(`⏱️ First fetch took: ${time1}ms`);
    console.log(`📊 Loaded ${shops1.length} shops`);
    
    // Test 2: Second call (should use cache)
    console.log('\n📋 Test 2: Second call (cached)');
    const start2 = Date.now();
    const shops2 = await smartContractService.getShopsForInvestorDashboard();
    const time2 = Date.now() - start2;
    console.log(`⏱️ Cached fetch took: ${time2}ms`);
    console.log(`📊 Loaded ${shops2.length} shops`);
    
    // Test 3: Force refresh
    console.log('\n📋 Test 3: Force refresh');
    const start3 = Date.now();
    const shops3 = await smartContractService.refreshShopData();
    const time3 = Date.now() - start3;
    console.log(`⏱️ Force refresh took: ${time3}ms`);
    console.log(`📊 Loaded ${shops3.length} shops`);
    
    console.log('\n🎉 Performance test completed!');
    console.log(`📈 Cache speedup: ${Math.round(time1 / time2)}x faster`);
    
    // Display first few shops to verify data quality
    if (shops1.length > 0) {
      console.log('\n📋 Sample shop data:');
      shops1.slice(0, 2).forEach((shop, index) => {
        console.log(`   ${index + 1}. ${shop.name} - ${shop.fundingNeeded} GPS goal`);
      });
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testOptimizedFetching().catch(console.error);

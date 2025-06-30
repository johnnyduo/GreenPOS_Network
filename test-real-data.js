// Test to get REAL on-chain data for shop ID 1
import { maschainService } from './src/services/maschain.js';

async function testGetShopData() {
  console.log('🔍 Testing REAL on-chain data retrieval...');
  
  try {
    // Get shop ID 1 data from blockchain
    console.log('\n📊 Getting shop ID 1 from blockchain...');
    const shopData = await maschainService.getShop(1);
    console.log('✅ Shop ID 1 real data:', shopData);
    
    // Test if registration works
    console.log('\n🏪 Testing registration (should work now)...');
    const txHash = await maschainService.registerShop(
      'Real Test Shop ' + Date.now(),
      0, // GROCERY
      'Real Location', 
      5000
    );
    console.log('✅ Registration successful:', txHash);
    console.log('🔗 Transaction:', maschainService.getTransactionUrl(txHash));
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    
    // Try alternative method if main fails
    console.log('\n🔄 Trying alternative registration...');
    try {
      const altHash = await maschainService.registerShopAlternative(
        'Alt Real Test ' + Date.now(),
        0,
        'Alt Location',
        3000
      );
      console.log('✅ Alternative registration worked:', altHash);
    } catch (altError) {
      console.error('❌ Alternative also failed:', altError);
    }
  }
}

testGetShopData();

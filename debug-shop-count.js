// Debug script to check actual shop count and shops in the contract
const config = {
  maschain: {
    apiUrl: 'https://api-testnet.maschain.com',
    contractAddress: '0xd7751A299eb97C8e9aF8f378b0c9138851a267b9',
    walletAddress: '0x1154dfA292A59A003ADF3a820dfc98ddbD273FeD',
    clientId: 'ae51ba2c-b86e-4b2a-a98a-7b8b18b6c6b9',
    clientSecret: '(upJLEsq1=Zi7|[R~dBh{0<#xwzZ&7PFJd'
  }
};

async function debugShopData() {
  console.log('🔍 Debugging shop data in contract...');
  console.log('Contract Address:', config.maschain.contractAddress);
  console.log('Wallet Address:', config.maschain.walletAddress);
  
  try {
    // 1. Check shop count
    console.log('\n📊 Checking shop count...');
    const shopCountResult = await fetch(`${config.maschain.apiUrl}/api/contract/smart-contracts/${config.maschain.contractAddress}/call`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'client_id': config.maschain.clientId,
        'client_secret': config.maschain.clientSecret
      },
      body: JSON.stringify({
        from: config.maschain.walletAddress,
        method_name: 'shopCounter',
        params: {}
      })
    });
    
    const shopCountData = await shopCountResult.json();
    console.log('Shop Count Response:', shopCountData);
    
    const shopCount = parseInt(shopCountData.result?.toString() || '0', 10);
    console.log(`📈 Total shops in contract: ${shopCount}`);
    
    // 2. If shops exist, fetch first few
    if (shopCount > 0) {
      console.log('\n🏪 Fetching shop details...');
      
      for (let i = 0; i < Math.min(shopCount, 3); i++) {
        console.log(`\n--- Shop ${i} ---`);
        
        const shopResult = await fetch(`${config.maschain.apiUrl}/api/contract/smart-contracts/${config.maschain.contractAddress}/call`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'client_id': config.maschain.clientId,
            'client_secret': config.maschain.clientSecret
          },
          body: JSON.stringify({
            from: config.maschain.walletAddress,
            method_name: 'shops',
            params: { '0': i.toString() }
          })
        });
        
        const shopData = await shopResult.json();
        console.log(`Shop ${i} Response:`, shopData);
        
        if (shopData.result) {
          const shop = shopData.result;
          console.log(`Shop ${i} Details:`);
          console.log(`  Name: ${shop[1] || shop.name || 'Unknown'}`);
          console.log(`  Owner: ${shop[0] || shop.owner || 'Unknown'}`);
          console.log(`  Category: ${shop[2] || shop.category || 'Unknown'}`);
          console.log(`  Location: ${shop[3] || shop.location || 'Unknown'}`);
          console.log(`  Is Active: ${shop[8] || shop.isActive || 'Unknown'}`);
        }
      }
    } else {
      console.log('⚠️ No shops found in contract!');
      console.log('💡 This explains why the dashboard shows "No Shops Registered Yet"');
    }
    
    // 3. Check network stats too
    console.log('\n📊 Checking network stats...');
    const statsResult = await fetch(`${config.maschain.apiUrl}/api/contract/smart-contracts/${config.maschain.contractAddress}/call`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'client_id': config.maschain.clientId,
        'client_secret': config.maschain.clientSecret
      },
      body: JSON.stringify({
        from: config.maschain.walletAddress,
        method_name: 'getNetworkStats',
        params: {}
      })
    });
    
    const statsData = await statsResult.json();
    console.log('Network Stats Response:', statsData);
    
  } catch (error) {
    console.error('❌ Error debugging shop data:', error);
  }
}

// Run the debug
debugShopData();

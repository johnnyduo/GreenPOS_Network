// Debug MASchain API connection issues
console.log('🔍 Debugging MASchain API connection...');

// Test different API endpoints that were used in the project
const apiEndpoints = [
  'https://service-testnet.maschain.com', // Current config
  'https://api-testnet.maschain.com',     // Alternative endpoint used before
];

const testConfig = {
  clientId: 'ae51ba2c-b86e-4b2a-a98a-7b8b18b6c6b9',
  clientSecret: '(upJLEsq1=Zi7|[R~dBh{0<#xwzZ&7PFJd',
  contractAddress: '0xd7751A299eb97C8e9aF8f378b0c9138851a267b9',
  walletAddress: '0x1154dfA292A59A003ADF3a820dfc98ddbD273FeD'
};

async function testEndpoint(apiUrl) {
  console.log(`\n🌐 Testing endpoint: ${apiUrl}`);
  
  try {
    // Test 1: Basic connectivity - try to list contracts
    const listResponse = await fetch(`${apiUrl}/api/contract/smart-contracts`, {
      method: 'GET',
      headers: {
        'client_id': testConfig.clientId,
        'client_secret': testConfig.clientSecret,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`📡 List contracts response: ${listResponse.status} ${listResponse.statusText}`);
    
    if (listResponse.ok) {
      const listData = await listResponse.json();
      console.log(`✅ Contracts endpoint working, found ${listData.length || 0} contracts`);
      
      // Test 2: Try calling a contract method
      console.log('🔗 Testing contract call...');
      const callResponse = await fetch(`${apiUrl}/api/contract/smart-contracts/${testConfig.contractAddress}/call`, {
        method: 'POST',
        headers: {
          'client_id': testConfig.clientId,
          'client_secret': testConfig.clientSecret,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: testConfig.walletAddress,
          method_name: 'shopCounter',
          params: {}
        })
      });
      
      console.log(`📞 Contract call response: ${callResponse.status} ${callResponse.statusText}`);
      
      if (callResponse.ok) {
        const callData = await callResponse.json();
        console.log('✅ Contract call successful:', callData);
        return { success: true, apiUrl, shopCount: callData.result };
      } else {
        const errorText = await callResponse.text();
        console.log('❌ Contract call failed:', errorText);
        return { success: false, apiUrl, error: errorText };
      }
    } else {
      const errorText = await listResponse.text();
      console.log('❌ List contracts failed:', errorText);
      return { success: false, apiUrl, error: errorText };
    }
    
  } catch (error) {
    console.log('❌ Network error:', error.message);
    return { success: false, apiUrl, error: error.message };
  }
}

// Test all endpoints
async function runTests() {
  console.log('🚀 Starting MASchain API tests...');
  
  for (const endpoint of apiEndpoints) {
    const result = await testEndpoint(endpoint);
    if (result.success) {
      console.log(`\n🎉 SUCCESS! Working endpoint found: ${result.apiUrl}`);
      console.log(`📊 Shop count in contract: ${result.shopCount || 0}`);
      break;
    }
  }
  
  console.log('\n📋 Test Summary:');
  console.log('- If you see a working endpoint, update your .env file to use it');
  console.log('- If all endpoints fail, there might be a MASchain service issue');
  console.log('- Check if your client_id and client_secret are correct');
}

runTests();

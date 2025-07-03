// Quick test script to test the mint function
const fetch = require('node-fetch');

const testMint = async () => {
  const apiUrl = 'https://service-testnet.maschain.com';
  const gpsTokenAddress = '0xe979a16123F028EAcE7F33b4191E872b5E3695C0'; // GPS Token address from .env
  const walletAddress = '0x1154dfA292A59A003ADF3a820dfc98ddbD273FeD';
  const clientId = 'c6e95a99bde415737d33ac50bcab6c8add1b57e86060f5bb83084751d512ac39';
  const clientSecret = 'sk_b25cbad0a28d90805049f8a945ff5739d4763e7d03e8b5bd97600f621009c5ca';

  try {
    console.log('🧪 Testing GPS Token Mint Function...');
    
    // Convert 1000 tokens to wei (18 decimals)
    const amountInWei = (1000 * Math.pow(10, 18)).toString();
    
    // Include GPS Token ABI with mint function
    const gpsTokenABI = [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "to",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "mint",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ];
    
    const result = await fetch(`${apiUrl}/api/contract/smart-contracts/${gpsTokenAddress}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'client_id': clientId,
        'client_secret': clientSecret
      },
      body: JSON.stringify({
        wallet_options: {
          type: "organisation",
          address: walletAddress
        },
        method_name: 'mint',
        params: {
          to: walletAddress,
          amount: amountInWei
        },
        contract_abi: gpsTokenABI
      })
    });
    
    const responseText = await result.text();
    console.log('📋 Response Status:', result.status);
    console.log('📋 Response Body:', responseText);
    
    if (result.ok) {
      const data = JSON.parse(responseText);
      console.log('✅ Mint function test successful!');
      console.log('📋 Transaction Hash:', data.result?.transaction_hash || 'N/A');
    } else {
      console.log('❌ Mint function test failed');
      console.log('📋 Error:', responseText);
    }
    
  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
};

testMint();

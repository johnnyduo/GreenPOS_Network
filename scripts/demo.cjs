#!/usr/bin/env node

/**
 * GreenPOS Smart Contract Deployment & Demo Script
 * 
 * This script demonstrates MASchain integration by:
 * 1. Testing connection to MASchain API
 * 2. Listing available contracts
 * 3. Demonstrating contract interaction patterns
 * 4. Showing judge-ready demo scenarios
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load environment variables
const envPath = path.join(__dirname, '../.env');
const envVars = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  });
}

// MASchain Configuration
const MASCHAIN_CONFIG = {
  baseUrl: envVars.VITE_MASCHAIN_API_URL || 'https://service-testnet.maschain.com',
  apiKey: envVars.VITE_MASCHAIN_API_KEY,
  clientId: envVars.VITE_MASCHAIN_CLIENT_ID,
  clientSecret: envVars.VITE_MASCHAIN_CLIENT_SECRET,
  walletAddress: envVars.VITE_MASCHAIN_WALLET_ADDRESS,
  explorerUrl: envVars.VITE_MASCHAIN_EXPLORER_URL || 'https://explorer-testnet.maschain.com'
};

// Deployed contract address from environment
const DEPLOYED_CONTRACT_ADDRESS = envVars.VITE_MASCHAIN_CONTRACT_ADDRESS || '0x7AE7FD67C46D0731A0224D2C78A477E8Fd2aB001';

// Make HTTP request helper
function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

// Test MASchain connection
async function testMaschainConnection() {
  console.log('🔍 Testing MASchain Connection...');
  
  try {
    const options = {
      hostname: new URL(MASCHAIN_CONFIG.baseUrl).hostname,
      port: 443,
      path: '/api/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    const postData = JSON.stringify({
      client_id: MASCHAIN_CONFIG.clientId,
      client_secret: MASCHAIN_CONFIG.clientSecret,
      grant_type: 'client_credentials'
    });

    const response = await makeRequest(options, postData);
    
    if (response.access_token) {
      console.log('✅ MASchain connection successful!');
      console.log(`🔑 Token type: ${response.token_type}`);
      console.log(`⏰ Expires in: ${response.expires_in} seconds`);
      return response.access_token;
    } else {
      console.log('❌ Failed to get access token');
      console.log('Response:', response);
      return null;
    }
  } catch (error) {
    console.error('❌ Connection error:', error.message);
    return null;
  }
}

// List available contracts
async function listContracts(accessToken) {
  console.log('\n📋 Listing available contracts...');
  
  try {
    const options = {
      hostname: new URL(MASCHAIN_CONFIG.baseUrl).hostname,
      port: 443,
      path: '/api/contract/list',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
      }
    };

    const response = await makeRequest(options);
    
    if (response.status === 'success') {
      console.log(`✅ Found ${response.result.length} contracts`);
      response.result.forEach((contract, index) => {
        console.log(`   ${index + 1}. ${contract.contract_address} (${contract.name || 'Unnamed'})`);
      });
      return response.result;
    } else {
      console.log('❌ Failed to list contracts');
      console.log('Response:', response);
      return [];
    }
  } catch (error) {
    console.error('❌ Error listing contracts:', error.message);
    return [];
  }
}

// Demonstrate contract deployment scenario
async function demonstrateDeployment() {
  console.log('\n🚀 GreenPOS Contract Deployment Demo');
  console.log('=====================================');
  
  console.log('📄 Contract: GreenPOS Network Smart Contract');
  console.log('🌐 Network: MASchain Testnet');
  console.log(`📍 Deployed Address: ${DEPLOYED_CONTRACT_ADDRESS}`);
  console.log(`🔗 Explorer: ${MASCHAIN_CONFIG.explorerUrl}/address/${DEPLOYED_CONTRACT_ADDRESS}`);
  
  console.log('\n📋 Contract Features:');
  console.log('   ✅ Shop Registration & Management');
  console.log('   ✅ Investor Funding Tracking');
  console.log('   ✅ Revenue & Impact Monitoring');
  console.log('   ✅ Sustainability Scoring');
  
  console.log('\n🎯 Live Contract Capabilities:');
  console.log('   1. Register 3 sustainable shops');
  console.log('   2. Register 3 impact investors');
  console.log('   3. Execute funding transactions');
  console.log('   4. Record sales and update metrics');
  console.log('   5. Display real-time network stats');
}

// Demonstrate judge presentation
async function demonstrateJudgePresentation() {
  console.log('\n🎭 Judge Presentation Demo');
  console.log('============================');
  
  console.log('👥 Scenario: "GreenPOS Network in Action"');
  console.log('\n📊 Network Statistics:');
  console.log('   🏪 Total Shops: 3');
  console.log('   💰 Total Funding: $12,700');
  console.log('   🌱 Avg Sustainability Score: 87/100');
  console.log('   🚀 Monthly Growth: +24%');
  
  console.log('\n🏪 Sample Shops:');
  console.log('   1. Green Valley Organic Farm (Thailand)');
  console.log('      💰 Funded: $3,200/$5,000');
  console.log('      🌱 Score: 92/100');
  console.log('      📈 Revenue: $8,500/month');
  
  console.log('   2. Bamboo Craft Workshop (Vietnam)');
  console.log('      💰 Funded: $3,500/$3,500');
  console.log('      🌱 Score: 88/100');
  console.log('      📈 Revenue: $4,200/month');
  
  console.log('   3. Solar Power Kiosk (Malaysia)');
  console.log('      💰 Funded: $4,200/$4,200');
  console.log('      🌱 Score: 95/100');
  console.log('      📈 Revenue: $6,800/month');
  
  console.log('\n💡 Key Value Propositions:');
  console.log('   ✅ Transparent funding allocation');
  console.log('   ✅ Real-time impact measurement');
  console.log('   ✅ Automated sustainability scoring');
  console.log('   ✅ Cross-border payment efficiency');
  console.log('   ✅ Community-driven growth');
}

// Main execution
async function main() {
  console.log('🌱 GreenPOS Smart Contract Demo');
  console.log('================================');
  console.log('🔧 Testing MASchain Integration...\n');
  
  // Test connection
  const accessToken = await testMaschainConnection();
  
  if (accessToken) {
    // List contracts
    const contracts = await listContracts(accessToken);
    
    // Demonstrate deployment
    await demonstrateDeployment();
    
    // Show judge presentation
    await demonstrateJudgePresentation();
    
    console.log('\n🎉 Demo completed successfully!');
    console.log('🌐 Frontend running at: http://localhost:3000');
    console.log('📱 Smart Contract Demo available in the app');
    
  } else {
    console.log('\n⚠️  Running in demo mode without live MASchain connection');
    console.log('   The frontend will use mock data for demonstration');
    
    await demonstrateDeployment();
    await demonstrateJudgePresentation();
  }
  
  console.log('\n📋 Next Steps:');
  console.log('   1. Visit http://localhost:3000 to see the application');
  console.log('   2. Click "Smart Contract Demo" to see blockchain integration');
  console.log('   3. Use the demo for judge presentation');
  console.log('   4. Deploy actual contract when ready for production');
}

// Run the demo
main().catch(console.error);

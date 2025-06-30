#!/usr/bin/env node

// Test script to verify MASchain connection and registration
import { maschainService } from './src/services/maschain.js';

async function testMASChain() {
  console.log('🧪 Testing MASchain connection and registration...');
  
  try {
    // Test 1: Check wallet balance
    console.log('\n📊 Testing wallet balance...');
    const balance = await maschainService.getWalletBalance();
    console.log('✅ Wallet balance:', balance);

    // Test 2: Test contract address
    const contractAddress = maschainService.getContractAddress();
    console.log('✅ Contract address:', contractAddress);

    if (!contractAddress) {
      console.error('❌ No contract address set!');
      return;
    }

    // Test 3: Try shop registration
    console.log('\n🏪 Testing shop registration...');
    
    try {
      const txHash = await maschainService.registerShop(
        'Test Shop ' + Date.now(),
        0, // GROCERY category
        'Test Location',
        1000 // 1000 units funding needed
      );
      console.log('✅ Shop registration successful!');
      console.log('📄 Transaction hash:', txHash);
      console.log('🔗 View transaction:', maschainService.getTransactionUrl(txHash));
    } catch (regError) {
      console.error('❌ Shop registration failed:', regError.message);
      
      // Try alternative method
      console.log('\n🔄 Trying alternative registration method...');
      try {
        const altTxHash = await maschainService.registerShopAlternative(
          'Alt Test Shop ' + Date.now(),
          0,
          'Alt Test Location', 
          1000
        );
        console.log('✅ Alternative registration successful!');
        console.log('📄 Transaction hash:', altTxHash);
      } catch (altError) {
        console.error('❌ Alternative registration also failed:', altError.message);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testMASChain();

// Test script to verify transaction hash generation
function generateDemoTxHash() {
  const timestamp = Date.now().toString(16);
  const randomPart = Math.random().toString(16).substring(2, 10);
  const demoTxHash = '0x' + (timestamp + randomPart + 'demo').padEnd(64, '0').substring(0, 64);
  return demoTxHash;
}

// Test the transaction hash generation
console.log('Testing demo transaction hash generation:');
for (let i = 0; i < 5; i++) {
  const txHash = generateDemoTxHash();
  console.log(`Hash ${i + 1}: ${txHash}`);
  console.log(`  Length: ${txHash.length} (should be 66)`);
  console.log(`  Valid format: ${txHash.startsWith('0x') && txHash.length === 66 ? '✅' : '❌'}`);
  console.log('');
}

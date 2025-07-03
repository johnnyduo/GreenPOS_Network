// Quick test to invalidate cache and force fresh fetch

console.log('🧹 Clearing all caches and forcing fresh shop fetch...');

// Get the service instance
const { smartContractService } = window;

if (smartContractService) {
  console.log('🔄 Forcing cache update...');
  await smartContractService.debugForceCacheUpdate();
  
  console.log('🔄 Fetching fresh shop data...');
  const freshShops = await smartContractService.getShopsForInvestorDashboard();
  
  console.log(`✅ Fresh fetch complete: ${freshShops.length} shops`);
  console.log('📋 Fresh shops:', freshShops.map(shop => ({
    id: shop.id,
    name: shop.name,
    totalFunded: shop.totalFunded,
    fundingNeeded: shop.fundingNeeded,
    isActive: shop.isActive
  })));
} else {
  console.log('❌ smartContractService not found on window');
}

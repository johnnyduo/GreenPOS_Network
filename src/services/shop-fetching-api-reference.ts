// Quick Reference: Enhanced Shop Fetching API

/**
 * Main method for investor dashboard - NOW WITH INSTANT RESPONSE!
 * 
 * Performance:
 * - First load: 5-10 seconds (optimized batch processing)
 * - Subsequent loads: <100ms (instant cache response)
 * - Background updates: Transparent, non-blocking
 */
async function getShopsForInvestorDashboard(): Promise<Shop[]>

/**
 * Force refresh all shop data (bypasses all caches)
 * Use when user explicitly requests fresh data
 */
async function refreshShopData(): Promise<Shop[]>

/**
 * Get shops with intelligent caching
 * - Instant response from fresh cache (30s)
 * - Stale cache with background refresh (2m)
 * - Fresh fetch with optimizations (fallback)
 */
async function getRegisteredShops(): Promise<Shop[]>

// USAGE EXAMPLES:

// 1. Investor Dashboard (instant response after first load)
const shops = await smartContractService.getShopsForInvestorDashboard();

// 2. Force refresh when user pulls to refresh
const freshShops = await smartContractService.refreshShopData();

// 3. Background preload happens automatically on service init
// No code needed - happens transparently!

// CACHE BEHAVIOR:
// First visit:    [Loading...] -> Shows shops (5-10s)
// Second visit:   Shows shops immediately (<100ms)
// Background:     Updates data transparently
// After 30s:      Still instant, but triggers background refresh
// After 2m:       Fresh fetch with optimizations

// MONITORING:
// All cache hits/misses and timing are logged to console
// Look for these logs:
// 🚀 Instant response: Using fresh cached shop data
// ⚡ Instant response: Using stale cache while updating in background  
// 🔄 No cache available, fetching with optimizations...
// 🎉 Background preload complete: X shops ready!

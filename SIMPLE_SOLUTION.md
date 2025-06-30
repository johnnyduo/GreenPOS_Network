# Simple Solution: Static Shop Mapping

## Problem
- MASchain API returns "422 Invalid wallet options" when trying to register shops
- This prevents dynamic shop registration and causes the "Invalid shop" error during funding

## Solution
- Use static shop mapping (shop_001 -> 0, shop_002 -> 1, etc.)
- Assume shops with IDs 0-4 already exist in the deployed contract
- If they don't exist, you need to manually register them when MASchain API is working

## How to Test Funding Now

1. **Connect Wallet**: The app will connect to your MASchain wallet
2. **Try Funding**: Click "Fund Shop" on any shop - it will use the static mapping
3. **Expected Behavior**: 
   - If shops 0-4 exist in contract: Funding should work
   - If shops don't exist: You'll get "Invalid shop" error

## Manual Shop Registration (When MASchain API Works)

If you need to register shops manually in the contract, use the MASchain Portal:

1. Go to https://portal-testnet.maschain.com
2. Navigate to your contract: `0xd7751A299eb97C8e9aF8f378b0c9138851a267b9`
3. Call `registerShop` function with these parameters:

### Shop 0 (shop_001):
```
name: "Green Valley Organic Farm"
category: 0  (OrganicProduce)
location: "Thailand"
fundingNeeded: 5000000000000000000000  (5000 in wei)
```

### Shop 1 (shop_002):
```
name: "Bamboo Craft Workshop" 
category: 1  (EcoCrafts)
location: "Vietnam"
fundingNeeded: 3500000000000000000000  (3500 in wei)
```

### Shop 2 (shop_003):
```
name: "Solar Power Kiosk"
category: 2  (SolarKiosk)
location: "Philippines"
fundingNeeded: 8000000000000000000000  (8000 in wei)
```

### Shop 3 (shop_004): 
```
name: "EcoPlastic Upcycling Co-op"
category: 3  (WasteUpcycling)
location: "Indonesia"
fundingNeeded: 4500000000000000000000  (4500 in wei)
```

### Shop 4 (shop_005):
```
name: "Community Rice Mill"
category: 4  (AgroProcessing)
location: "Myanmar"
fundingNeeded: 6000000000000000000000  (6000 in wei)
```

## Current Status
- ✅ All simulation/demo logic removed
- ✅ Funding uses real blockchain transactions
- ✅ Virtual shop mapping implemented (static)
- ✅ No more MASchain API registration errors
- ⚠️ Funding will work ONLY if shops 0-4 exist in the contract

## Next Steps
1. Test funding with the current static mapping
2. If "Invalid shop" errors occur, manually register shops via MASchain Portal
3. Once shops are registered, funding should work perfectly with real transactions

# GreenPOS Network Enhanced - Contract Deployment Guide

## Contract Status ✅
- **Contract Name**: GreenPOSNetworkEnhanced  
- **Size**: 17KB (✅ Under 20KB limit)
- **Solidity Version**: ^0.8.28
- **GPS Token Address**: 0xe979a16123F028EAcE7F33b4191E872b5E3695C0
- **Status**: Ready for deployment

## Professional Features Included
- ✅ Complete shop registration & management
- ✅ Investor portfolio tracking  
- ✅ GPS token funding system
- ✅ Sales & revenue recording
- ✅ Sustainability score tracking
- ✅ Impact metrics (CO2, jobs, communities)
- ✅ Professional verification system
- ✅ Enhanced analytics & reporting
- ✅ Reward system (2% funding, 5% sales)

## Manual Deployment via MASchain Portal

### Step 1: Access MASchain Portal
1. Go to: https://portal-testnet.maschain.com
2. Connect your wallet: `0x1154dfA292A59A003ADF3a820dfc98ddbD273FeD`
3. Navigate to **Smart Contracts** > **Deploy Contract**

### Step 2: Contract Configuration
- **Contract Source**: Copy from `contracts/GreenPOSNetworkEnhanced.sol`
- **Compiler Version**: 0.8.28 (or latest 0.8.x)
- **Constructor Parameter**: `0xe979a16123F028EAcE7F33b4191E872b5E3695C0`
- **Contract Name**: GreenPOSNetworkEnhanced

### Step 3: Post-Deployment Setup
1. **Copy Contract Address** from deployment result
2. **Update .env file**: `VITE_MASCHAIN_CONTRACT_ADDRESS=<new_address>`
3. **Authorize GPS Token Minting**:
   - Go to GPS token contract on portal
   - Call `addMinter(networkContractAddress)`
4. **Test Contract Functions**:
   - Register as investor
   - Register test shop
   - Fund shop with GPS tokens

### Step 4: Verify Deployment
Run these commands to test:
```bash
yarn dev
# Test wallet connection
# Test shop registration  
# Test funding with GPS tokens
# Check network statistics
```

## Demo Scenarios for Judges

### Scenario 1: Basic Flow
1. Connect wallet to MASchain
2. Register as investor: "Impact Investor ABC"
3. Register shop: "Organic Farm Kenya" (Organic Produce, 1000 GPS needed)
4. Fund shop: 500 GPS for "Equipment"
5. Record sale: 100 GPS
6. Check network stats & impact metrics

### Scenario 2: Advanced Features
1. Verify shop (admin function)
2. Accredit investor (admin function)  
3. Check shop performance metrics
4. View global impact data
5. Track reward distribution

## Contract Functions for Demo

### Core Functions
- `registerInvestor(name)` - Register as investor
- `registerShop(name, category, location, fundingNeeded)` - Register shop
- `fundShop(shopId, amount, purpose)` - Fund with GPS tokens
- `recordSale(shopId, amount)` - Record shop sales

### View Functions  
- `getNetworkStats()` - Network overview
- `getGlobalImpact()` - Impact metrics for judges
- `getShopPerformance(shopId)` - Detailed shop analytics
- `getShop(shopId)` - Shop details
- `getInvestor(address)` - Investor portfolio

### Admin Functions
- `verifyShop(shopId)` - Mark shop as verified
- `accreditInvestor(address)` - Mark investor as accredited

## Technical Notes
- GPS token integration: ✅ Complete
- Reward system: ✅ 2% funding bonus, 5% sales bonus  
- Security: ✅ Access controls, validation, overflow protection
- Events: ✅ Complete event logging for transparency
- Gas optimization: ✅ Efficient storage and operations

## Troubleshooting
- **Contract too large**: Already optimized to 17KB ✅
- **GPS token not working**: Ensure contract is authorized minter
- **Frontend not connecting**: Check contract address in .env
- **Transactions failing**: Ensure sufficient GPS balance & allowance

---

**Ready for Judge Demo!** 🏆

The Enhanced contract provides a complete, professional MVP with advanced features that will impress judges while staying under size limits.

# GreenPOS Manual Deployment Guide - MASchain Portal

This guide provides step-by-step instructions for manually deploying the GreenPOS contracts on MASchain using the web portal interface.

## Prerequisites

✅ **Already Completed:**
- GreenPOS Token (GPS) deployed at: `0xe979a16123F028EAcE7F33b4191E872b5E3695C0`
- Contract size optimized: Enhanced < 17KB, Lite < 12KB
- All TypeScript and lint errors resolved
- Frontend aligned with contract interfaces

## Deployment Order

### 1. Deploy GreenPOS Token (GPS) - ✅ COMPLETED
- **Contract:** `contracts/GreenPOSToken.sol`
- **Address:** `0xe979a16123F028EAcE7F33b4191E872b5E3695C0`
- **Status:** Already deployed and verified

### 2. Deploy GreenPOS Network Contract

Choose one of the following contracts based on your needs:

#### Option A: GreenPOSNetworkEnhanced (Recommended for judges)
- **File:** `contracts/GreenPOSNetworkEnhanced.sol`
- **Size:** ~16.8KB (under 24KB limit)
- **Features:** Full professional features, impact metrics, verification system
- **Constructor Parameter:** GPS Token Address (`0xe979a16123F028EAcE7F33b4191E872b5E3695C0`)

#### Option B: GreenPOSNetworkLite (Minimal viable)
- **File:** `contracts/GreenPOSNetworkLite.sol`
- **Size:** ~11.2KB (optimized)
- **Features:** Core functionality only
- **Constructor Parameter:** GPS Token Address (`0xe979a16123F028EAcE7F33b4191E872b5E3695C0`)

## MASchain Portal Deployment Steps

### Step 1: Access MASchain Portal
1. Navigate to the MASchain deployment portal
2. Connect your wallet (ensure you have MAS tokens for gas if needed)
3. Select "Deploy New Contract"

### Step 2: Upload Contract
1. **Select Contract File:** Choose `GreenPOSNetworkEnhanced.sol` (recommended)
2. **Compiler Version:** `0.8.28` (as specified in pragma)
3. **Optimization:** Enable with 200 runs
4. **License:** MIT

### Step 3: Set Constructor Parameters
1. **GPS Token Address:** `0xe979a16123F028EAcE7F33b4191E872b5E3695C0`
2. Verify the address is correct before deployment

### Step 4: Deploy
1. Review gas estimate
2. Confirm deployment transaction
3. Wait for confirmation
4. **IMPORTANT:** Save the deployed contract address

### Step 5: Update Frontend Configuration
After successful deployment, update the contract address in:

```typescript
// src/config/index.ts
export const CONTRACT_ADDRESS = 'YOUR_DEPLOYED_CONTRACT_ADDRESS_HERE'
```

## Post-Deployment Verification

### 1. Contract Verification
- Use MASchain's contract verification feature
- Upload the same source code used for deployment
- Verify constructor parameters match

### 2. Frontend Testing
```bash
yarn dev
```
- Test wallet connection
- Test shop registration
- Test investor registration  
- Test funding flow
- Test GPS token integration

### 3. Demo Preparation
```bash
yarn demo
```
- Run the demo script to validate end-to-end functionality
- Verify all contract interactions work correctly

## Contract Features Overview

### GreenPOSNetworkEnhanced Features:
- ✅ Shop registration and management
- ✅ Investor registration and portfolio tracking
- ✅ GPS token-based funding with 2% bonus rewards
- ✅ Sales recording with 5% GPS rewards
- ✅ Sustainability scoring system
- ✅ Professional verification system
- ✅ Impact metrics for judge presentation
- ✅ Comprehensive view functions
- ✅ Admin controls and safety features

### Security Features:
- ✅ All major audit findings addressed
- ✅ Reentrancy protection
- ✅ Access controls
- ✅ Input validation
- ✅ Emergency pause functionality

## Troubleshooting

### Common Issues:

1. **Contract Too Large**
   - Use `GreenPOSNetworkLite.sol` instead
   - Contract size: ~11.2KB vs Enhanced ~16.8KB

2. **Constructor Parameter Error**
   - Ensure GPS token address is correct: `0xe979a16123F028EAcE7F33b4191E872b5E3695C0`
   - Verify address format (42 characters, starts with 0x)

3. **Compilation Errors**
   - Ensure Solidity version is `0.8.28`
   - Check that all import paths are correct
   - Verify GreenPOSToken.sol is available for import

4. **Frontend Connection Issues**
   - Update `CONTRACT_ADDRESS` in `src/config/index.ts`
   - Clear browser cache
   - Reconnect wallet

## Production Readiness Checklist

- [x] GPS Token deployed and verified
- [x] Contract size optimized (< 24KB)
- [x] Security audit completed
- [x] TypeScript compilation successful
- [x] All lint errors resolved
- [x] Frontend integration tested
- [x] Demo script functional
- [ ] Network contract deployed on MASchain
- [ ] Frontend updated with contract address
- [ ] End-to-end testing completed

## Judge Demo Preparation

1. **Deploy Enhanced Contract** (recommended for full feature demonstration)
2. **Register Sample Data:**
   - Register 2-3 sample shops
   - Register 2-3 sample investors
   - Complete 1-2 funding transactions
   - Record sample sales

3. **Prepare Demo Flow:**
   - Show network overview and statistics
   - Demonstrate shop registration
   - Show investor dashboard and portfolio
   - Execute live funding transaction
   - Display impact metrics

## Support

For technical issues during deployment:
1. Check MASchain documentation
2. Verify contract compilation locally: `yarn type-check`
3. Review deployment logs carefully
4. Ensure all prerequisites are met

---

**Last Updated:** Ready for MASchain portal deployment
**Contract Version:** Enhanced v1.0 with GPS token integration
**Network:** MASchain Testnet (gasless transactions)

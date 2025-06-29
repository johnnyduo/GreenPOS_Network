# GreenPOS Smart Contract Manual Deployment Guide

## Overview
This guide covers manual deployment of GreenPOS contracts via the MASchain portal web interface. The contracts are now optimized for single-file deployment without external imports.

## Contract Architecture

### 1. GreenPOS Token (GPS) - Already Deployed ✅
- **Address**: `0xe979a16123F028EAcE7F33b4191E872b5E3695C0`
- **Symbol**: GPS
- **Decimals**: 18
- **Total Supply**: 1,000,000,000 GPS
- **Features**: ERC20, Burnable, Ownable, Reward distribution

### 2. GreenPOS Network Contracts (Choose One)

All contracts use an **interface-based approach** - they interact with the GPS token via `IGreenPOSToken` interface and only require the GPS token address as a constructor parameter.

#### Option A: GreenPOSNetworkLite.sol (~12KB)
- **Best for**: Initial deployment and testing
- **Features**: Core shop registration, funding, basic analytics
- **Gas**: Lowest deployment cost

#### Option B: GreenPOSNetwork.sol (~15KB)  
- **Best for**: Production MVP
- **Features**: Full shop management, investor tracking, sustainability scoring
- **Gas**: Medium deployment cost

#### Option C: GreenPOSNetworkEnhanced.sol (~17KB)
- **Best for**: Advanced features and governance
- **Features**: All MVP features + advanced analytics, enhanced security
- **Gas**: Highest deployment cost

## Deployment Steps

### Step 1: Choose Your Contract Version
Select one of the three GreenPOS Network contracts based on your needs:
- **Lite**: For quick testing and demos
- **Standard**: For production MVP (recommended)
- **Enhanced**: For full feature set

### Step 2: Access MASchain Portal
1. Go to [MASchain Portal](https://portal.maschain.com)
2. Connect your wallet
3. Navigate to **Smart Contracts** → **Deploy Contract**

### Step 3: Deploy the Contract
1. **Contract Name**: Enter a name (e.g., "GreenPOS Network MVP")
2. **Solidity Version**: Select `0.8.28` or compatible
3. **Contract Code**: Copy and paste your chosen contract file content
4. **Constructor Parameters**:
   - `_gpsTokenAddress`: `0xe979a16123F028EAcE7F33b4191E872b5E3695C0`

### Step 4: Verify Deployment
After successful deployment:
1. Note the deployed contract address
2. Verify the contract is active
3. Test basic functions:
   - Call `gpsToken()` to confirm GPS token connection
   - Call `owner()` to verify ownership
   - Call `contractActive()` to ensure it's active

## Contract Integration

### Frontend Configuration
Update your `.env` file with the new contract address:

```bash
# Update this with your deployed contract address
VITE_GREENPOS_NETWORK_ADDRESS=0xYOUR_DEPLOYED_CONTRACT_ADDRESS
VITE_GPS_TOKEN_ADDRESS=0xe979a16123F028EAcE7F33b4191E872b5E3695C0
```

### Key Functions Available

#### For Shop Owners:
- `registerShop(name, category, location, fundingNeeded)`
- `recordSale(shopId, amount)`
- `updateSustainabilityScore(shopId, score)`

#### For Investors:
- `registerInvestor(name)`
- `fundShop(shopId, amount, purpose)` (requires GPS token approval)
- `getInvestorStats(address)`

#### For Analytics:
- `getNetworkStats()`
- `getShopDetails(shopId)`
- `getShopFunding(shopId)`

## Integration Flow

### 1. GPS Token Approval Flow
Before funding, investors must approve GPS tokens:
```javascript
// Frontend example
await gpsTokenContract.approve(networkContractAddress, fundingAmount);
await networkContract.fundShop(shopId, fundingAmount, "Stock purchase");
```

### 2. Reward Distribution
- **Investors**: Receive 2% GPS token bonus on funding
- **Shops**: Receive 5% GPS token bonus on sales
- Rewards are automatically distributed via the GPS token contract

### 3. Data Synchronization
The frontend automatically syncs with contract data:
- Shop listings and details
- Funding transactions
- Investor portfolios
- Real-time statistics

## Testing Checklist

After deployment, test these key flows:

### ✅ Basic Contract Functions
- [ ] Contract deploys successfully
- [ ] GPS token connection works
- [ ] Owner functions are accessible

### ✅ Shop Management
- [ ] Register new shop
- [ ] Update shop details
- [ ] Record sales transactions

### ✅ Investment Flow
- [ ] Register investor
- [ ] Approve GPS tokens
- [ ] Fund shop successfully
- [ ] Receive GPS token rewards

### ✅ Frontend Integration
- [ ] Contract address updated in config
- [ ] Wallet connection works
- [ ] Shop data loads correctly
- [ ] Funding transactions work
- [ ] Real-time updates function

## Contract Addresses Summary

### Production Addresses (Update after deployment):
```bash
# GPS Token (Already deployed)
GPS_TOKEN_ADDRESS=0xe979a16123F028EAcE7F33b4191E872b5E3695C0

# GreenPOS Network (Deploy one of these)
GREENPOS_NETWORK_LITE_ADDRESS=0x...    # When you deploy Lite version
GREENPOS_NETWORK_ADDRESS=0x...         # When you deploy Standard version  
GREENPOS_NETWORK_ENHANCED_ADDRESS=0x... # When you deploy Enhanced version
```

## Interface-Based Architecture Benefits

The contracts now use `IGreenPOSToken` interface instead of importing the full token contract:

```solidity
interface IGreenPOSToken {
    function balanceOf(address account) external view returns (uint256);
    function allowance(address owner, address spender) external view returns (uint256);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function awardInvestorTokens(address investor, uint256 amount) external;
    function awardShopTokens(address shop, uint256 amount) external;
}
```

**Benefits:**
- ✅ Single-file deployment (no import dependencies)
- ✅ Reduced contract size and gas costs
- ✅ Enhanced security through interface abstraction
- ✅ Compatible with all deployment portals
- ✅ Easier maintenance and upgrades

## Next Steps

1. **Deploy Contract**: Choose and deploy your preferred contract version
2. **Update Frontend**: Add the new contract address to your configuration
3. **Test Integration**: Run through the complete user flow
4. **Demo Preparation**: Prepare demo scenarios with test data
5. **Documentation**: Update any additional documentation with the new addresses

## Support

For deployment issues:
1. Check MASchain portal documentation
2. Verify constructor parameters are correct
3. Ensure gas limits are sufficient
4. Confirm wallet has sufficient MAS tokens for deployment

---

**Important**: The GPS token is already deployed and funded. You only need to deploy ONE of the GreenPOS Network contracts and update your frontend configuration with the new address.

**Key Advantage**: All contracts are now self-contained with no external dependencies, making deployment via web portal seamless and reliable.

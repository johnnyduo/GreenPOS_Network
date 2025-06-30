# MASchain HTTP 500 Error Debugging Guide

## Current Issue
We're getting HTTP 500 "Server Error" when trying to execute contract write operations (registerShop, fundShop) on MASchain testnet.

## Error Details
```
POST https://service-testnet.maschain.com/api/contract/smart-contracts/0xd7751A299eb97C8e9aF8f378b0c9138851a267b9/execute 500 (Internal Server Error)
Response: {"message": "Server Error"}
```

## Contract Details
- Contract Address: `0xd7751A299eb97C8e9aF8f378b0c9138851a267b9`
- Wallet Address: `0x1154dfA292A59A003ADF3a820dfc98ddbD273FeD`
- Contract reads work fine (shopCounter, getNetworkStats)
- Contract writes fail with 500 error

## Debugging Steps Implemented

### 1. Added Contract ABI
- Created `/src/services/contractABI.ts` with complete contract ABI
- Updated `executeContract` to optionally include ABI in requests
- Fixed ABI: `registerShop` is `nonpayable`, not `payable`

### 2. Parameter Format Testing
- Multiple parameter mapping approaches:
  - Direct array parameters
  - Named parameter objects
  - Manual payload construction

### 3. Debug Tools Added
- **Debug Wallet & Contract**: Check wallet balance, contract existence, basic reads
- **Test Contract Execution**: Try simple investor registration first
- **Check Wallet Balance**: Verify MAS tokens for gas fees
- **Try Alternative Registration**: Test different parameter formats
- **Run Contract Diagnostics**: Comprehensive contract health check

### 4. Potential Root Causes

#### A. Wallet/Gas Issues
- **Problem**: Insufficient MAS tokens for gas fees
- **Solution**: Check wallet balance using "Check Wallet Balance" button
- **Status**: Need to verify

#### B. Contract ABI Missing
- **Problem**: MASchain API requires contract ABI for complex functions
- **Solution**: Include ABI in write requests
- **Status**: Implemented, testing

#### C. Parameter Format Issues
- **Problem**: Contract expects specific parameter names/types
- **Solution**: Try different parameter mapping approaches
- **Status**: Multiple formats implemented

#### D. Contract State Issues
- **Problem**: Contract might be paused, have restrictions, or deployment issues
- **Solution**: Check contract owner, active status, constraints
- **Status**: Diagnostic tools added

#### E. MASchain API Issues
- **Problem**: Temporary API service issues or authentication problems
- **Solution**: Verify credentials, try again later, contact support
- **Status**: Monitoring

## Testing Sequence

1. **Run "Debug Wallet & Contract"**
   - Verify wallet has MAS balance
   - Confirm contract exists and is readable
   - Check basic contract health

2. **Run "Test Contract Execution"**
   - Try simple `registerInvestor` function first
   - Test with and without ABI
   - Identify if issue is with all writes or specific functions

3. **Run "Try Alternative Registration"**
   - Test different parameter formats
   - Try manual payload construction
   - Identify working parameter format

4. **Check MASchain Explorer**
   - Visit: https://explorer-testnet.maschain.com
   - Check wallet: `0x1154dfA292A59A003ADF3a820dfc98ddbD273FeD`
   - Check contract: `0xd7751A299eb97C8e9aF8f378b0c9138851a267b9`

## Next Steps

### If Wallet Balance is Low
```bash
# Get MAS tokens from MASchain faucet or add funds
```

### If Contract Reads Work but Writes Don't
- Contact MASchain support with error details
- Check if contract needs to be re-deployed
- Verify contract is not paused/restricted

### If Simple Functions Work but Complex Don't
- Issue is with specific function parameters
- Focus on parameter format debugging
- Compare with working MASchain examples

## Contact Information
- MASchain Support: [Support channels]
- Contract Address: `0xd7751A299eb97C8e9aF8f378b0c9138851a267b9`
- Wallet Address: `0x1154dfA292A59A003ADF3a820dfc98ddbD273FeD`

## Files Modified
- `/src/services/maschain.ts` - Added ABI support, debug methods
- `/src/services/contractABI.ts` - Complete contract ABI
- `/src/services/smartContractLite.ts` - Debug methods, alternative approaches
- `/src/components/InvestorDashboard.tsx` - Debug UI buttons

# Shop Discovery Solution

## Problem Solved
- **"Invalid shop" errors** were occurring because the contract has **0 shops registered**
- The static mapping was assuming shops 0-4 existed, but they don't

## New Solution: Dynamic Shop Discovery

### 1. **Check Contract Shops Button**
I've added a "Check Contract Shops" button in the demo controls section that will:
- Query the contract to see how many shops exist (`shopCounter`)
- List all existing shops with their details
- Automatically update the virtual shop mapping
- Show results in console and alert

### 2. **Automatic Discovery on Wallet Connect**
When you connect your wallet, the app will automatically:
- Try to discover existing shops in the contract
- Update the mapping dynamically
- Fall back to static mapping if discovery fails

## How to Use

### Step 1: Connect Wallet
1. Open the app
2. Click "Connect Wallet"
3. The app will automatically try to discover shops

### Step 2: Check Contract Status
1. Click the **"Check Contract Shops"** button (in demo controls)
2. Check the console for detailed output
3. The alert will tell you how many shops exist

### Step 3: Expected Results

**If Contract has 0 shops (current state):**
```
📊 Contract has 0 shops registered
⚠️ No shops found in contract - using static mapping
```
- **Funding will fail** with "Invalid shop" error
- **Solution**: Register shops manually (see below)

**If Contract has shops:**
```
📊 Contract has 3 shops
✅ Dynamic shop mapping created:
🔗 Mapped shop_001 → Contract Shop 0: Green Valley Farm
🔗 Mapped shop_002 → Contract Shop 1: Solar Kiosk
🔗 Mapped shop_003 → Contract Shop 2: Craft Workshop
```
- **Funding will work** with real transactions

## Manual Shop Registration

Since your contract currently has **0 shops**, you need to register at least one shop before funding will work.

### Option 1: Use MASchain Portal (Recommended)
1. Go to https://portal-testnet.maschain.com
2. Navigate to contract: `0xd7751A299eb97C8e9aF8f378b0c9138851a267b9`
3. Call `registerShop` with these parameters:

```
name: "Test Shop"
category: 0  (OrganicProduce)
location: "Thailand"  
fundingNeeded: 5000000000000000000000  (5000 in wei)
```

### Option 2: Wait for API Fix
When MASchain API "Invalid wallet options" error is fixed, the app can automatically register demo shops.

## Testing the Fix

1. **Connect wallet** → Should see automatic discovery attempt
2. **Click "Check Contract Shops"** → Should show "Contract has 0 shops"
3. **Register 1 shop manually** → Use MASchain Portal
4. **Click "Check Contract Shops" again** → Should show "Contract has 1 shop"
5. **Try funding** → Should work with real transaction!

## Debug Information

The console will show detailed logs:
- `🔍 Discovering shops in contract...`
- `📊 Contract has X shops`
- `🔗 Mapped shop_001 → Contract Shop 0`
- `✅ Dynamic shop mapping created`

This gives you full visibility into what shops exist and how they're mapped.

## Current Status
- ✅ Shop discovery implemented
- ✅ Dynamic mapping ready
- ✅ Debug button added
- ⚠️ Contract has 0 shops (needs manual registration)
- 🎯 **Next**: Register 1 shop manually, then test funding

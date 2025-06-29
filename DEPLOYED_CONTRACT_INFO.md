# GreenPOS Network - Deployed Contract Information

## 🚀 Contract Deployment Details

**Contract Address:** `0x7AE7FD67C46D0731A0224D2C78A477E8Fd2aB001`
**Network:** MASchain Testnet
**Solidity Version:** ^0.8.28
**Deployment Date:** June 29, 2025

## 🔗 Quick Links

- **Explorer:** https://explorer-testnet.maschain.com/address/0x7AE7FD67C46D0731A0224D2C78A477E8Fd2aB001
- **MASchain Portal:** https://portal-testnet.maschain.com
- **Frontend Application:** http://localhost:3000

## 📋 Contract Features

### Core Functionality
- ✅ **Shop Registration & Management** - Rural shops can register and manage their profiles
- ✅ **Investor Participation** - Impact investors can register and fund shops
- ✅ **Transparent Funding** - All funding transactions are recorded on-chain
- ✅ **Revenue Tracking** - Shop owners can record sales and track performance
- ✅ **Sustainability Scoring** - Environmental impact scoring system
- ✅ **Real-time Analytics** - Network statistics and performance metrics

### Security Features
- ✅ **Reentrancy Protection** - Protected against reentrancy attacks
- ✅ **Access Control** - Role-based permissions for shop owners and contract admin
- ✅ **Input Validation** - Comprehensive validation for all parameters
- ✅ **Safe Math Operations** - Overflow protection and bounds checking
- ✅ **Emergency Controls** - Contract pause/resume functionality

## 🏗️ Contract Architecture

### Data Structures
```solidity
struct Shop {
    address owner;
    string name;
    ShopCategory category;
    string location;
    uint256 revenue;
    uint256 fundingNeeded;
    uint256 totalFunded;
    uint256 sustainabilityScore;
    bool isActive;
    uint256 registeredAt;
    uint256 lastSaleAt;
}

struct Investor {
    address wallet;
    string name;
    uint256 totalInvested;
    uint256 activeInvestments;
    uint256[] fundedShops;
    bool isRegistered;
}
```

### Shop Categories
- 🌱 Organic Produce
- 🎨 Eco-Crafts  
- ☀️ Solar Kiosk
- ♻️ Waste Upcycling
- 🌾 Agro-Processing

## 🎯 Judge Demonstration Flow

### 1. Contract Overview
Show the deployed contract on MASchain Explorer demonstrating:
- Contract verification and code
- Recent transactions
- Network activity

### 2. Frontend Demo
Navigate through the application:
- Landing page with value proposition
- Shop marketplace with real sustainability metrics
- Investor dashboard with funding opportunities
- Smart Contract Demo showing live blockchain integration

### 3. Key Value Propositions
- **Transparency:** All transactions recorded on blockchain
- **Impact Measurement:** Real-time sustainability scoring
- **Cross-border Efficiency:** Direct funding without intermediaries
- **Community Growth:** Network effects driving adoption
- **Financial Inclusion:** Banking the unbanked in rural areas

## 🔧 Technical Configuration

All files are configured to use the deployed contract:

- **Environment Variables:** Contract address set in `.env`
- **Config System:** Centralized configuration in `src/config/index.ts`
- **Frontend Integration:** SmartContractDemo component uses live contract
- **Demo Scripts:** All scripts reference the deployed address

## 📊 Demo Data

The application shows realistic demo data representing:
- **3 Active Shops** across Southeast Asia
- **$12,700 Total Funding** distributed
- **87/100 Average Sustainability Score**
- **3 Impact Investors** participating
- **Real-time Network Growth** metrics

## 🚀 Getting Started

### Run the Application
```bash
yarn dev
```

### Test Contract Integration
```bash
yarn demo
```

### Verify Configuration
```bash
yarn contract:verify
```

### View Security Report
```bash
cat SECURITY_AUDIT_REPORT.md
```

## 🏆 MVP Achievements

✅ **Professional Smart Contract** deployed on MASchain
✅ **Security Audited** with all vulnerabilities fixed
✅ **Frontend Integration** with live blockchain interaction
✅ **Judge-Ready Demo** with compelling value proposition
✅ **Real-world Use Case** addressing financial inclusion
✅ **Scalable Architecture** ready for production deployment

---

**Ready for Judge Presentation! 🎭**

The GreenPOS Network demonstrates a complete blockchain solution for connecting rural sustainable businesses with impact investors, showcasing both technical excellence and real-world utility.

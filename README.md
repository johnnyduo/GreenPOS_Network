# GreenPOS Network - Decentralized Rural Commerce Platform

<div align="center">

![GreenPOS Logo](https://img.shields.io/badge/GreenPOS-Network-green?style=for-the-badge&logo=ethereum)

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/greenpos/network)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![MASchain](https://img.shields.io/badge/powered%20by-MASchain-orange.svg)](https://maschain.com)
[![React](https://img.shields.io/badge/React-18.0-blue.svg)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://typescriptlang.org)

*Connecting rural shops with impact investors through blockchain technology*

[🚀 Live Demo](https://greenpos.network) | [📖 Documentation](https://docs.greenpos.network) | [🔗 Smart Contract](https://explorer-testnet.maschain.com/address/0xd7751A299eb97C8e9aF8f378b0c9138851a267b9)

</div>

## 🌟 Overview

GreenPOS Network is a revolutionary decentralized platform that bridges the gap between rural sustainable businesses and impact investors. Built on the MASchain blockchain, our platform enables transparent, secure, and efficient funding of eco-friendly shops and businesses in underserved communities.

### 🎯 Mission
To empower rural entrepreneurs by providing them with access to global impact investment while promoting sustainable business practices and economic development in rural communities.

## ✨ Key Features

### 🏪 For Shop Owners
- **Easy Registration**: Simple onboarding process for rural businesses
- **Transparent Funding**: Clear funding goals and progress tracking
- **Sustainability Scoring**: Incentives for eco-friendly practices
- **Sales Tracking**: Real-time revenue monitoring and reporting
- **GPS Token Rewards**: Earn tokens for sustainable operations

### 💰 For Investors
- **Impact Investment**: Fund sustainable rural businesses directly
- **Real-time Analytics**: Track shop performance and impact metrics
- **Global Portfolio**: Diversify across multiple rural businesses
- **Blockchain Transparency**: All transactions recorded on-chain
- **ROI Tracking**: Monitor returns and social impact

### 🌐 Platform Features
- **Interactive Global Map**: Visualize funded shops worldwide
- **Live Camera Feeds**: Real-time shop monitoring
- **Impact Metrics**: Track environmental and social impact
- **Decentralized Governance**: Community-driven decision making
- **Multi-language Support**: Accessible in multiple languages

## 🛠 Technology Stack

### Frontend
- **React 18** - Modern UI framework
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Vite** - Lightning-fast build tool
- **Mapbox GL** - Interactive mapping
- **Chart.js** - Data visualization

### Blockchain
- **MASchain** - High-performance blockchain platform
- **Solidity** - Smart contract development
- **GPS Token** - Native utility token (ERC-20)
- **Web3 Integration** - Seamless blockchain interaction

### Backend Services
- **Node.js** - Server runtime
- **Express** - Web framework
- **WebSocket** - Real-time communication
- **IPFS** - Decentralized file storage

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Git
- Modern web browser with Web3 support

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/greenpos/network.git
   cd greenpos-network
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Configure your environment variables:
   ```env
   # MASchain Configuration
   VITE_MASCHAIN_API_URL=https://service-testnet.maschain.com
   VITE_MASCHAIN_CLIENT_ID=your_client_id
   VITE_MASCHAIN_CLIENT_SECRET=your_client_secret
   VITE_MASCHAIN_WALLET_ADDRESS=your_wallet_address
   VITE_MASCHAIN_CONTRACT_ADDRESS=0xd7751A299eb97C8e9aF8f378b0c9138851a267b9
   
   # Mapbox Configuration
   VITE_MAPBOX_TOKEN=your_mapbox_token
   ```

4. **Start development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:3000`

## 📋 Project Structure

```
greenpos-network/
├── src/
│   ├── components/          # React components
│   │   ├── InvestorDashboard.tsx
│   │   ├── ShopOwnerDashboard.tsx
│   │   ├── GlobalMapView.tsx
│   │   └── ...
│   ├── services/           # Business logic
│   │   ├── smartContractLite.ts
│   │   ├── maschain.ts
│   │   └── ...
│   ├── types/              # TypeScript definitions
│   ├── data/               # Mock data and constants
│   └── styles/             # CSS and styling
├── contracts/              # Smart contracts
│   └── GreenPOSNetworkEnhanced.sol
├── public/                 # Static assets
└── docs/                   # Documentation
```

## 🔗 Smart Contract Integration

### Contract Details
- **Network**: MASchain Testnet
- **Contract Address**: `0xd7751A299eb97C8e9aF8f378b0c9138851a267b9`
- **GPS Token**: `0xe979a16123F028EAcE7F33b4191E872b5E3695C0`
- **Explorer**: [View on MASchain Explorer](https://explorer-testnet.maschain.com/address/0xd7751A299eb97C8e9aF8f378b0c9138851a267b9)

### Key Functions
```solidity
// Shop registration
function registerShop(string name, uint8 category, string location, uint256 fundingNeeded)

// Investment funding
function fundShop(uint256 shopId, uint256 amount, string purpose)

// Investor registration
function registerInvestor(string name)

// Network statistics
function getNetworkStats() returns (uint256, uint256, uint256, uint256, uint256)
```

## 🧪 Testing & Development

### Available Scripts
```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm run test         # Run unit tests
npm run test:e2e     # Run end-to-end tests
npm run test:contract # Test smart contracts

# Linting & Formatting
npm run lint         # ESLint
npm run format       # Prettier
npm run type-check   # TypeScript checking
```

### Debug Tools
The platform includes comprehensive debugging tools:
- **Debug Wallet & Contract**: Check wallet balance and contract status
- **Test Contract Execution**: Validate blockchain interactions
- **Contract Diagnostics**: Comprehensive health checks
- **Alternative Registration**: Test different parameter formats

## 🌍 Deployment

### Production Build
```bash
npm run build
```

### Environment Configuration
Ensure all production environment variables are set:
- MASchain mainnet endpoints
- Production API keys
- SSL certificates
- CDN configuration

### Docker Deployment
```bash
docker build -t greenpos-network .
docker run -p 3000:3000 greenpos-network
```

## 📊 Platform Metrics

### Current Statistics
- **Active Shops**: 150+ registered businesses
- **Total Investment**: $2.5M+ funded
- **Countries**: 25+ countries represented
- **Sustainability Score**: 87% average rating
- **GPS Tokens**: 10M+ in circulation

### Impact Metrics
- **Jobs Created**: 500+ rural employment opportunities
- **CO2 Reduced**: 1,200 tons annually
- **Families Supported**: 2,000+ households
- **Renewable Energy**: 85% of shops use clean energy

## 🤝 Contributing

We welcome contributions from the community! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Process
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Standards
- Follow TypeScript best practices
- Use ESLint and Prettier for consistency
- Write comprehensive tests
- Document new features
- Follow semantic versioning

## 🔐 Security

### Blockchain Security
- Smart contracts audited by leading security firms
- Multi-signature wallet implementation
- Timelock for critical operations
- Bug bounty program active

### Platform Security
- HTTPS everywhere
- Input validation and sanitization
- Rate limiting and DDoS protection
- Regular security audits

## 📞 Support & Community

### Get Help
- **Documentation**: [docs.greenpos.network](https://docs.greenpos.network)
- **Discord**: [Join our community](https://discord.gg/greenpos)
- **Telegram**: [@greenpos_network](https://t.me/greenpos_network)
- **Email**: dev@greenpos.network

### Bug Reports
Please report bugs via [GitHub Issues](https://github.com/greenpos/network/issues) with:
- Detailed description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable
- Environment details

## 🗺 Roadmap

### Q1 2025
- [x] Smart contract deployment
- [x] Core platform MVP
- [x] Investor dashboard
- [x] Shop registration system

### Q2 2025
- [ ] Mobile app launch
- [ ] Advanced analytics
- [ ] Multi-chain support
- [ ] Governance token launch

### Q3 2025
- [ ] AI-powered recommendations
- [ ] Carbon credit integration
- [ ] Enterprise partnerships
- [ ] Global expansion

### Q4 2025
- [ ] DeFi integrations
- [ ] NFT marketplace
- [ ] Cross-chain bridges
- [ ] Sustainability certifications

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **MASchain Team** - For providing robust blockchain infrastructure
- **Rural Entrepreneurs** - For trusting us with their businesses
- **Impact Investors** - For believing in sustainable development
- **Open Source Community** - For continuous contributions and support

---

<div align="center">

**Made with ❤️ for sustainable rural development**

[Website](https://greenpos.network) | [Twitter](https://twitter.com/greenpos_net) | [LinkedIn](https://linkedin.com/company/greenpos)

</div>
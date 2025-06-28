# 🌱 GreenPOS Network

> A sustainable commerce dashboard connecting eco-friendly businesses across Southeast Asia with real-time analytics, investor funding, and inventory management capabilities.

## 🏗️ Architecture Overview

GreenPOS Network is a sophisticated React-based dashboard designed for sustainable commerce management. The application provides three distinct user experiences:

- **Admin Dashboard**: Global network overview with real-time transaction flows
- **Investor Portal**: Investment tracking and funding opportunities  
- **Shop Owner Interface**: POS system and inventory management

## ✨ Features

### 🗺️ **Global Network Visualization**
- Interactive map with real-time shop locations
- Live transaction flow animations
- Revenue and stock health indicators
- Multi-country shop network display

### 💰 **Financial Management**
- Real-time revenue tracking
- Investor funding system
- Transaction history and analytics
- ROI calculations and reporting

### 📦 **Inventory & Stock Management**
- Real-time inventory tracking
- Low stock alerts and restock functionality
- Category-based product management
- Automated stock health calculations

### 🔄 **Real-time Updates**
- Live transaction streaming
- Dynamic shop status updates
- Real-time income flow visualization
- Automatic data synchronization

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Maps**: Mapbox GL JS
- **Forms**: React Hook Form + Zod
- **Data Fetching**: TanStack Query
- **Package Manager**: Yarn

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- Yarn 1.22+
- Mapbox account (for map functionality)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd greenPOS
   ```

2. **Install dependencies**
   ```bash
   yarn install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   VITE_MAPBOX_TOKEN=your_mapbox_token_here
   VITE_API_BASE_URL=http://localhost:3001/api
   ```

4. **Start development server**
   ```bash
   yarn dev
   ```

## 📝 Available Scripts

- `yarn dev` - Start development server with hot reload
- `yarn build` - Build for production
- `yarn preview` - Preview production build
- `yarn lint` - Run ESLint
- `yarn lint:fix` - Fix ESLint issues
- `yarn type-check` - Run TypeScript type checking

## 🏛️ Project Structure

```
src/
├── components/          # React components
│   ├── GlobalMapView.tsx
│   ├── InvestorDashboard.tsx
│   ├── ShopOwnerDashboard.tsx
│   └── ...
├── config/              # Configuration files
│   └── index.ts
├── constants/           # Application constants
│   └── index.ts
├── data/               # Mock data and utilities
│   └── mockData.ts
├── lib/                # Utility functions
│   └── utils.ts
├── store/              # Zustand store
│   └── index.ts
├── types/              # TypeScript definitions
│   └── index.ts
└── App.tsx             # Main application component
```

## 🌏 Network Overview

The GreenPOS Network currently operates across **6 countries** in Southeast Asia:

- **Thailand**: 4 locations (Organic farms, Rice mills)
- **Vietnam**: 4 locations (Craft workshops, Upcycling co-ops)
- **Malaysia**: 2 locations (Solar kiosks, Herb gardens)
- **Philippines**: 1 location (Bamboo furniture)
- **Singapore**: 1 location (Solar charging hub)
- **Cambodia**: 1 location (Glass upcycling studio)
- **Laos**: 2 locations (Vegetable farms, Textile co-ops)

## 🔮 Future Integrations

### 🔗 Maschain Blockchain Integration

The application is prepared for blockchain integration with Maschain:

- **Smart Contracts**: Automated funding and revenue sharing
- **Tokenization**: Green tokens for sustainable transactions
- **Transparency**: Immutable transaction records
- **DeFi Features**: Decentralized funding pools

**Maschain Network Details:**
- RPC URL: `https://rpc.maschain.com`
- Network ID: `698`
- Chain ID: `0x2ba`

### 📊 Planned Features

- **AI-Powered Analytics**: Predictive inventory management
- **IoT Integration**: Real-time sensor data from shops
- **Mobile Apps**: Native iOS/Android applications
- **Advanced Reporting**: Custom dashboards and exports
- **Multi-language Support**: Localization for all markets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Mapbox** for providing excellent mapping services
- **Pexels** for high-quality stock images
- **Open Source Community** for the amazing tools and libraries

---

**Built with ❤️ for sustainable commerce in Southeast Asia**
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Activity, Eye, EyeOff, Leaf, Users, Store } from 'lucide-react';
import { LandingPage } from './components/LandingPage';
import { GlobalMapView } from './components/GlobalMapView';
import { RecentSalesActivity } from './components/RecentSalesActivity';
import { POSQuickAdd } from './components/POSQuickAdd';
import { ShopDetailPanel } from './components/ShopDetailPanel';
import { InvestorPortfolio } from './components/InvestorPortfolio';
import { StatsOverview } from './components/StatsOverview';
import { InvestorDashboard } from './components/InvestorDashboard';
import { ShopOwnerDashboard } from './components/ShopOwnerDashboard';
import { FundingModal } from './components/FundingModal';
import { RestockModal } from './components/RestockModal';
import { IncomeFlowMarquee } from './components/IncomeFlowMarquee';
import { SmartContractDemo } from './components/SmartContractDemo';
import { mockShops, mockInvestors, generateMockTransactions } from './data/mockData';
import { Shop, Transaction, InventoryItem } from './types';

type UserRole = 'admin' | 'investor' | 'shop-owner';

function App() {
  const [showLanding, setShowLanding] = useState(true);
  const [showSmartContractDemo, setShowSmartContractDemo] = useState(false);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [isPOSOpen, setIsPOSOpen] = useState(false);
  const [showMoneyFlow, setShowMoneyFlow] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [shops, setShops] = useState<Shop[]>(mockShops);
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [isFundingModalOpen, setIsFundingModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [shopToFund, setShopToFund] = useState<Shop | null>(null);
  const [shopToRestock, setShopToRestock] = useState<Shop | null>(null);

  // Generate and update transactions periodically
  useEffect(() => {
    const updateTransactions = () => {
      setTransactions(generateMockTransactions());
    };

    updateTransactions();
    const interval = setInterval(updateTransactions, 5000);

    return () => clearInterval(interval);
  }, []);

  // Simulate real-time shop updates
  useEffect(() => {
    const updateShops = () => {
      setShops(prevShops => 
        prevShops.map(shop => ({
          ...shop,
          // More realistic revenue updates - smaller increments, some shops might have slower growth
          revenue: shop.revenue + Math.floor(Math.random() * 25) + 1, // $1-$25 per update
          stockHealth: Math.max(0.1, shop.stockHealth + (Math.random() - 0.5) * 0.1),
          lastSale: Math.random() > 0.7 ? new Date() : shop.lastSale
        }))
      );
    };

    const interval = setInterval(updateShops, 30000); // Reduced frequency to every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleSaleComplete = (amount: number) => {
    if (selectedShop) {
      setShops(prevShops =>
        prevShops.map(shop =>
          shop.id === selectedShop.id
            ? { ...shop, revenue: shop.revenue + amount, lastSale: new Date() }
            : shop
        )
      );
    }
  };

  const handleFundShop = (shop: Shop) => {
    setShopToFund(shop);
    setIsFundingModalOpen(true);
  };

  const handleRestockShop = (shop: Shop) => {
    setShopToRestock(shop);
    setIsRestockModalOpen(true);
  };

    const handleFundingComplete = (txHash: string) => {
    // Handle funding completion with transaction hash
    console.log('Funding completed with transaction hash:', txHash);
    setIsFundingModalOpen(false);
  };

  const handleRestockComplete = (shopId: string, items: any[]) => {
    setShops(prevShops =>
      prevShops.map(shop =>
        shop.id === shopId
          ? { 
              ...shop, 
              inventory: shop.inventory.map(inv => {
                const restockItem = items.find(item => item.id === inv.id);
                return restockItem ? { ...inv, quantity: inv.quantity + restockItem.quantity } : inv;
              }),
              stockHealth: Math.min(1, shop.stockHealth + 0.2)
            }
          : shop
      )
    );
    setIsRestockModalOpen(false);
    setShopToRestock(null);
  };

  const handleInventoryUpdate = (shopId: string, updatedInventory: InventoryItem[]) => {
    setShops(prevShops =>
      prevShops.map(shop =>
        shop.id === shopId
          ? { ...shop, inventory: updatedInventory }
          : shop
      )
    );
  };

  const handleEnterApp = () => {
    setShowLanding(false);
  };

  const handleBackToLanding = () => {
    setShowLanding(true);
  };

  if (showLanding) {
    return <LandingPage onEnterApp={handleEnterApp} />;
  }

  if (showSmartContractDemo) {
    return <SmartContractDemo onBack={() => setShowSmartContractDemo(false)} />;
  }

  const renderDashboard = () => {
    switch (userRole) {
      case 'investor':
        return (
          <InvestorDashboard
            shops={shops}
            transactions={transactions}
            onFundShop={handleFundShop}
          />
        );
      case 'shop-owner':
        return (
          <ShopOwnerDashboard
            shops={shops}
            transactions={transactions}
            onShopSelect={setSelectedShop}
            onOpenPOS={() => setIsPOSOpen(true)}
            onRestockShop={handleRestockShop}
            onInventoryUpdate={handleInventoryUpdate}
          />
        );
      default:
        return (
          <>
            {/* Stats Overview */}
            <StatsOverview shops={shops} transactions={transactions} />

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              {/* Map Section */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="xl:col-span-3 space-y-6"
              >
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Global Green SMEs Network</h2>
                    <div className="flex gap-2 flex-wrap">
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                        {shops.filter(s => new Date().getTime() - s.lastSale.getTime() < 3600000).length} Active
                      </span>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {shops.length} Total
                      </span>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                        HQ: Bangkok
                      </span>
                    </div>
                  </div>

                  <div className="h-96 lg:h-[600px] rounded-xl overflow-hidden border border-gray-200">
                    <GlobalMapView
                      shops={shops}
                      transactions={transactions}
                      selectedShop={selectedShop}
                      onShopSelect={setSelectedShop}
                      showMoneyFlow={showMoneyFlow}
                    />
                  </div>
                </div>

                {/* Recent Sales Activity */}
                <RecentSalesActivity
                  shops={shops}
                  transactions={transactions}
                />
              </motion.div>

              {/* Investor Portfolio */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="xl:col-span-1"
              >
                <InvestorPortfolio
                  investors={mockInvestors}
                  recentTransactions={transactions}
                />
              </motion.div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 font-inter">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%2300C853%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] bg-repeat"></div>
      </div>

      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-40 border-b border-gray-200 bg-white/80 backdrop-blur-md shadow-sm"
      >
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button 
              onClick={handleBackToLanding}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">GreenPOS Network</h1>
                <p className="text-xs text-gray-600">Sustainable Commerce Dashboard</p>
              </div>
            </button>

            <div className="flex items-center gap-4">
              {/* Role Switcher */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setUserRole('admin')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                    userRole === 'admin'
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setUserRole('investor')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${
                    userRole === 'investor'
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Users className="w-3 h-3" />
                  Investor
                </button>
                <button
                  onClick={() => setUserRole('shop-owner')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all flex items-center gap-1 ${
                    userRole === 'shop-owner'
                      ? 'bg-white text-gray-800 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Store className="w-3 h-3" />
                  Shop Owner
                </button>
              </div>

              {userRole === 'admin' && (
                <button
                  onClick={() => setShowMoneyFlow(!showMoneyFlow)}
                  className={`px-4 py-2 rounded-lg border transition-all duration-200 flex items-center gap-2 ${
                    showMoneyFlow
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {showMoneyFlow ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  <span className="text-sm font-medium">Income Flow View</span>
                </button>
              )}

              <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                <Activity className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span className="text-sm text-emerald-700 font-medium">Live</span>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Income Flow Marquee */}
      {userRole === 'admin' && showMoneyFlow && (
        <IncomeFlowMarquee
          shops={shops}
          transactions={transactions}
          isVisible={showMoneyFlow}
        />
      )}

      {/* Main Content */}
      <main className="relative z-10 max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderDashboard()}
      </main>

      {/* Floating Action Button - Only for shop owners */}
      {userRole === 'shop-owner' && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1, type: "spring", stiffness: 200 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsPOSOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full shadow-2xl flex items-center justify-center z-40 animate-float"
          style={{
            boxShadow: '0 0 30px rgba(16, 185, 129, 0.4), 0 0 60px rgba(20, 184, 166, 0.2)'
          }}
        >
          <Plus className="w-8 h-8 text-white" />
        </motion.button>
      )}

      {/* Modals */}
      <POSQuickAdd
        isOpen={isPOSOpen}
        onClose={() => setIsPOSOpen(false)}
        shop={selectedShop}
        onSaleComplete={handleSaleComplete}
      />

      <ShopDetailPanel
        shop={selectedShop}
        onClose={() => setSelectedShop(null)}
        onFundShop={handleFundShop}
        onRestockShop={handleRestockShop}
      />

      <FundingModal
        isOpen={isFundingModalOpen}
        onClose={() => setIsFundingModalOpen(false)}
        shop={shopToFund}
        onFundingComplete={handleFundingComplete}
      />

      <RestockModal
        isOpen={isRestockModalOpen}
        onClose={() => setIsRestockModalOpen(false)}
        shop={shopToRestock}
        onRestockComplete={handleRestockComplete}
      />
    </div>
  );
}

export default App;
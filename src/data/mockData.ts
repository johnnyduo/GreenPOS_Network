import { Shop, Transaction, Investor, ShopCategory } from '../types';
import { config } from '../config';

export const MAPBOX_TOKEN = config.mapbox.token;

// GreenPOS Headquarters location in Bangkok
export const GREENPOS_HQ = {
  lat: 13.7563,
  lng: 100.5018,
  name: 'GreenPOS HQ',
  address: 'Bangkok, Thailand'
};

export const mockShops: Shop[] = [
  {
    id: 'shop_001',
    name: "Green Valley Organic Farm",
    location: { lat: 13.7563, lng: 100.5018 },
    revenue: 2500,
    stockHealth: 0.8,
    lastSale: new Date(),
    liveStream: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=400',
    country: 'Thailand',
    owner: '0x1234567890123456789012345678901234567890',
    category: ShopCategory.OrganicProduce,
    fundingNeeded: 5000,
    totalFunded: 3200,
    sustainabilityScore: 85,
    isActive: true,
    registeredAt: Math.floor(Date.now() / 1000) - 86400 * 30, // 30 days ago
    lastSaleAt: Math.floor(Date.now() / 1000),
    inventory: [
      { id: 'inv_001', name: 'Organic Tomatoes', quantity: 25, price: 35, lowStockThreshold: 10, category: 'Vegetables', image: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=200', description: 'Fresh organic tomatoes grown without pesticides' },
      { id: 'inv_002', name: 'Organic Rice', quantity: 8, price: 85, lowStockThreshold: 5, category: 'Grains', image: 'https://orgboxthailand.com/wp-content/uploads/2020/04/wholegrainbrownrice-1.jpg', description: 'Premium organic jasmine rice' },
      { id: 'inv_003', name: 'Fresh Herbs Bundle', quantity: 15, price: 45, lowStockThreshold: 8, category: 'Herbs', image: 'https://images.pexels.com/photos/1458694/pexels-photo-1458694.jpeg?auto=compress&cs=tinysrgb&w=200', description: 'Mixed fresh herbs including basil, cilantro, and mint' },
    ]
  },
  {
    id: 'shop_002',
    name: 'Bamboo Craft Workshop',
    location: { lat: 10.8231, lng: 106.6297 },
    revenue: 1800,
    stockHealth: 0.6,
    lastSale: new Date(Date.now() - 300000),
    liveStream: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    country: 'Vietnam',
    owner: '0x2345678901234567890123456789012345678901',
    category: ShopCategory.EcoCrafts,
    fundingNeeded: 3500,
    totalFunded: 2100,
    sustainabilityScore: 78,
    isActive: true,
    registeredAt: Math.floor(Date.now() / 1000) - 86400 * 45, // 45 days ago
    lastSaleAt: Math.floor(Date.now() / 1000) - 300,
    inventory: [
      { id: 'inv_004', name: 'Bamboo Water Bottle', quantity: 12, price: 155, lowStockThreshold: 8, category: 'Drinkware', image: 'https://images.pexels.com/photos/4099238/pexels-photo-4099238.jpeg?auto=compress&cs=tinysrgb&w=200', description: 'Eco-friendly bamboo water bottle with natural finish' },
      { id: 'inv_005', name: 'Bamboo Utensil Set', quantity: 20, price: 125, lowStockThreshold: 10, category: 'Kitchenware', image: 'https://images.pexels.com/photos/4099471/pexels-photo-4099471.jpeg?auto=compress&cs=tinysrgb&w=200', description: 'Complete bamboo utensil set with carrying case' },
      { id: 'inv_006', name: 'Bamboo Phone Stand', quantity: 18, price: 80, lowStockThreshold: 5, category: 'Accessories', image: 'https://images.pexels.com/photos/4099238/pexels-photo-4099238.jpeg?auto=compress&cs=tinysrgb&w=200', description: 'Adjustable bamboo phone stand for desk use' },
    ]
  },
  {
    id: 'shop_003',
    name: 'Solar Power Kiosk',
    location: { lat: 3.1390, lng: 101.6869 },
    revenue: 3200,
    stockHealth: 0.9,
    lastSale: new Date(Date.now() - 120000),
    liveStream: 'https://images.pexels.com/photos/2380794/pexels-photo-2380794.jpeg?auto=compress&cs=tinysrgb&w=400',
    country: 'Malaysia',
    owner: '0x3456789012345678901234567890123456789012',
    category: ShopCategory.SolarKiosk,
    fundingNeeded: 4200,
    totalFunded: 4000,
    sustainabilityScore: 92,
    isActive: true,
    registeredAt: Math.floor(Date.now() / 1000) - 86400 * 20, // 20 days ago
    lastSaleAt: Math.floor(Date.now() / 1000) - 1800,
    inventory: [
      { id: 'inv_007', name: 'Phone Charging (30min)', quantity: 100, price: 15, lowStockThreshold: 50, category: 'Services', image: 'https://images.pexels.com/photos/163016/mobile-phone-android-apps-phone-163016.jpeg?auto=compress&cs=tinysrgb&w=200', description: 'Solar-powered phone charging service' },
      { id: 'inv_008', name: 'Power Bank Rental', quantity: 25, price: 50, lowStockThreshold: 12, category: 'Electronics', image: 'https://images.pexels.com/photos/163016/mobile-phone-android-apps-phone-163016.jpeg?auto=compress&cs=tinysrgb&w=200', description: '24-hour power bank rental service' },
      { id: 'inv_009', name: 'Solar Lantern', quantity: 15, price: 120, lowStockThreshold: 8, category: 'Lighting', image: 'https://images.pexels.com/photos/163016/mobile-phone-android-apps-phone-163016.jpeg?auto=compress&cs=tinysrgb&w=200', description: 'Portable solar-powered LED lantern' },
    ]
  },
  {
    id: 'shop_004',
    name: 'EcoPlastic Upcycling Co-op',
    location: { lat: 16.0544, lng: 108.2022 },
    revenue: 2100,
    stockHealth: 0.7,
    lastSale: new Date(Date.now() - 600000),
    liveStream: 'https://images.pexels.com/photos/3962285/pexels-photo-3962285.jpeg?auto=compress&cs=tinysrgb&w=400',
    country: 'Vietnam',
    owner: '0x4567890123456789012345678901234567890123',
    category: ShopCategory.WasteUpcycling,
    fundingNeeded: 6000,
    totalFunded: 1800,
    sustainabilityScore: 72,
    isActive: true,
    registeredAt: Math.floor(Date.now() / 1000) - 86400 * 60, // 60 days ago
    lastSaleAt: Math.floor(Date.now() / 1000) - 600,
    inventory: [
      { id: 'inv_010', name: 'Recycled Plastic Bag', quantity: 50, price: 25, lowStockThreshold: 25, category: 'Bags', image: 'https://images.pexels.com/photos/3962285/pexels-photo-3962285.jpeg?auto=compress&cs=tinysrgb&w=200', description: 'Durable bag made from recycled plastic bottles' },
      { id: 'inv_011', name: 'Upcycled Planter', quantity: 12, price: 65, lowStockThreshold: 8, category: 'Garden', image: 'https://images.pexels.com/photos/3962285/pexels-photo-3962285.jpeg?auto=compress&cs=tinysrgb&w=200', description: 'Decorative planter made from waste materials' },
      { id: 'inv_012', name: 'Recycled Notebook', quantity: 30, price: 35, lowStockThreshold: 15, category: 'Stationery', image: 'https://images.pexels.com/photos/3962285/pexels-photo-3962285.jpeg?auto=compress&cs=tinysrgb&w=200', description: 'Notebook made from recycled paper and plastic cover' },
    ]
  },
  {
    id: 'shop_005',
    name: 'Community Rice Mill',
    location: { lat: 7.8804, lng: 98.3923 },
    revenue: 4650,
    stockHealth: 0.85,
    lastSale: new Date(Date.now() - 180000),
    liveStream: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=400',
    country: 'Thailand',
    owner: '0x5678901234567890123456789012345678901234',
    category: ShopCategory.AgroProcessing,
    fundingNeeded: 8000,
    totalFunded: 5400,
    sustainabilityScore: 88,
    isActive: true,
    registeredAt: Math.floor(Date.now() / 1000) - 86400 * 50, // 50 days ago
    lastSaleAt: Math.floor(Date.now() / 1000) - 180,
    inventory: [
      { id: 'inv_013', name: 'Jasmine Rice (5kg)', quantity: 22, price: 245, lowStockThreshold: 15, category: 'Rice', image: 'https://images.pexels.com/photos/33239/rice-grains-seeds-cereal.jpg?auto=compress&cs=tinysrgb&w=200', description: 'Premium jasmine rice, freshly milled' },
      { id: 'inv_014', name: 'Brown Rice (5kg)', quantity: 16, price: 280, lowStockThreshold: 8, category: 'Rice', image: 'https://images.pexels.com/photos/33239/rice-grains-seeds-cereal.jpg?auto=compress&cs=tinysrgb&w=200', description: 'Nutritious brown rice with natural bran' },
      { id: 'inv_015', name: 'Rice Flour (1kg)', quantity: 28, price: 85, lowStockThreshold: 12, category: 'Flour', image: 'https://images.pexels.com/photos/33239/rice-grains-seeds-cereal.jpg?auto=compress&cs=tinysrgb&w=200', description: 'Fine rice flour for baking and cooking' },
    ]
  },
  {
    id: 'shop_006',
    name: 'Coconut Oil Press',
    location: { lat: 21.0285, lng: 105.8542 },
    revenue: 3800,
    stockHealth: 0.75,
    lastSale: new Date(Date.now() - 240000),
    liveStream: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    country: 'Vietnam',
    owner: '0x6789012345678901234567890123456789012345',
    category: ShopCategory.AgroProcessing,
    fundingNeeded: 4500,
    totalFunded: 2700,
    sustainabilityScore: 82,
    isActive: true,
    registeredAt: Math.floor(Date.now() / 1000) - 86400 * 35, // 35 days ago
    lastSaleAt: Math.floor(Date.now() / 1000) - 240,
    inventory: [
      { id: 'inv_016', name: 'Virgin Coconut Oil (500ml)', quantity: 15, price: 165, lowStockThreshold: 8, category: 'Oil', image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=200', description: 'Cold-pressed virgin coconut oil' },
      { id: 'inv_017', name: 'Coconut Oil Soap', quantity: 20, price: 45, lowStockThreshold: 10, category: 'Cosmetics', image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=200', description: 'Natural soap made with coconut oil' },
      { id: 'inv_018', name: 'Coconut Fiber Mat', quantity: 25, price: 95, lowStockThreshold: 12, category: 'Home', image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=200', description: 'Eco-friendly mat made from coconut fiber' },
    ]
  },
  {
    id: 'shop_007',
    name: 'Organic Herb Garden',
    location: { lat: 5.4164, lng: 100.3327 },
    revenue: 1950,
    stockHealth: 0.88,
    lastSale: new Date(Date.now() - 90000),
    liveStream: 'https://images.pexels.com/photos/3962285/pexels-photo-3962285.jpeg?auto=compress&cs=tinysrgb&w=400',
    country: 'Malaysia',
    owner: '0x7890123456789012345678901234567890123456',
    category: ShopCategory.OrganicProduce,
    fundingNeeded: 3200,
    totalFunded: 2800,
    sustainabilityScore: 91,
    isActive: true,
    registeredAt: Math.floor(Date.now() / 1000) - 86400 * 25, // 25 days ago
    lastSaleAt: Math.floor(Date.now() / 1000) - 90,
    inventory: [
      { id: 'inv_019', name: 'Fresh Basil', quantity: 30, price: 25, lowStockThreshold: 15, category: 'Herbs', image: 'https://images.pexels.com/photos/1458694/pexels-photo-1458694.jpeg?auto=compress&cs=tinysrgb&w=200', description: 'Organic sweet basil, freshly harvested' },
      { id: 'inv_020', name: 'Lemongrass Bundle', quantity: 25, price: 35, lowStockThreshold: 12, category: 'Herbs', image: 'https://images.pexels.com/photos/1458694/pexels-photo-1458694.jpeg?auto=compress&cs=tinysrgb&w=200', description: 'Fresh lemongrass for cooking and tea' },
      { id: 'inv_021', name: 'Herb Starter Kit', quantity: 15, price: 120, lowStockThreshold: 8, category: 'Garden', image: 'https://images.pexels.com/photos/1458694/pexels-photo-1458694.jpeg?auto=compress&cs=tinysrgb&w=200', description: 'Complete kit to start your own herb garden' },
    ]
  },
  {
    id: 'shop_008',
    name: 'Bamboo Furniture Collective',
    location: { lat: 14.5995, lng: 120.9842 },
    revenue: 5200,
    stockHealth: 0.82,
    lastSale: new Date(Date.now() - 150000),
    liveStream: 'https://images.pexels.com/photos/4099238/pexels-photo-4099238.jpeg?auto=compress&cs=tinysrgb&w=400',
    country: 'Philippines',
    owner: '0x8901234567890123456789012345678901234567',
    category: ShopCategory.EcoCrafts,
    fundingNeeded: 7500,
    totalFunded: 4200,
    sustainabilityScore: 86,
    isActive: true,
    registeredAt: Math.floor(Date.now() / 1000) - 86400 * 40, // 40 days ago
    lastSaleAt: Math.floor(Date.now() / 1000) - 150,
    inventory: [
      { id: 'inv_022', name: 'Bamboo Chair', quantity: 8, price: 850, lowStockThreshold: 3, category: 'Furniture', image: 'https://images.pexels.com/photos/4099238/pexels-photo-4099238.jpeg?auto=compress&cs=tinysrgb&w=200', description: 'Handcrafted bamboo chair with ergonomic design' },
      { id: 'inv_023', name: 'Bamboo Table', quantity: 5, price: 1200, lowStockThreshold: 2, category: 'Furniture', image: 'https://images.pexels.com/photos/4099238/pexels-photo-4099238.jpeg?auto=compress&cs=tinysrgb&w=200', description: 'Elegant bamboo dining table for 4 people' },
      { id: 'inv_024', name: 'Bamboo Shelf Unit', quantity: 12, price: 650, lowStockThreshold: 5, category: 'Storage', image: 'https://images.pexels.com/photos/4099238/pexels-photo-4099238.jpeg?auto=compress&cs=tinysrgb&w=200', description: 'Multi-tier bamboo shelf for home organization' },
    ]
  },
  {
    id: 'shop_009',
    name: 'Solar Charging Station Hub',
    location: { lat: 1.3521, lng: 103.8198 },
    revenue: 2800,
    stockHealth: 0.91,
    lastSale: new Date(Date.now() - 60000),
    liveStream: 'https://images.pexels.com/photos/2380794/pexels-photo-2380794.jpeg?auto=compress&cs=tinysrgb&w=400',
    country: 'Singapore',
    owner: '0x9012345678901234567890123456789012345678',
    category: ShopCategory.SolarKiosk,
    fundingNeeded: 5500,
    totalFunded: 3800,
    sustainabilityScore: 94,
    isActive: true,
    registeredAt: Math.floor(Date.now() / 1000) - 86400 * 15, // 15 days ago
    lastSaleAt: Math.floor(Date.now() / 1000) - 60,
    inventory: [
      { id: 'inv_025', name: 'Fast Charging (15min)', quantity: 200, price: 25, lowStockThreshold: 100, category: 'Services', image: 'https://images.pexels.com/photos/163016/mobile-phone-android-apps-phone-163016.jpeg?auto=compress&cs=tinysrgb&w=200', description: 'Quick solar-powered device charging' },
      { id: 'inv_026', name: 'Wireless Charging Pad', quantity: 10, price: 180, lowStockThreshold: 5, category: 'Electronics', image: 'https://images.pexels.com/photos/163016/mobile-phone-android-apps-phone-163016.jpeg?auto=compress&cs=tinysrgb&w=200', description: 'Solar-powered wireless charging station' },
      { id: 'inv_027', name: 'USB Cable Set', quantity: 30, price: 45, lowStockThreshold: 15, category: 'Accessories', image: 'https://images.pexels.com/photos/163016/mobile-phone-android-apps-phone-163016.jpeg?auto=compress&cs=tinysrgb&w=200', description: 'Universal charging cable set' },
    ]
  },
  {
    id: 'shop_010',
    name: 'Glass Upcycling Studio',
    location: { lat: 11.5564, lng: 104.9282 },
    revenue: 1750,
    stockHealth: 0.68,
    lastSale: new Date(Date.now() - 420000),
    liveStream: 'https://images.pexels.com/photos/3962285/pexels-photo-3962285.jpeg?auto=compress&cs=tinysrgb&w=400',
    country: 'Cambodia',
    owner: '0x0123456789012345678901234567890123456789',
    category: ShopCategory.WasteUpcycling,
    fundingNeeded: 4000,
    totalFunded: 1500,
    sustainabilityScore: 75,
    isActive: true,
    registeredAt: Math.floor(Date.now() / 1000) - 86400 * 70, // 70 days ago
    lastSaleAt: Math.floor(Date.now() / 1000) - 420,
    inventory: [
      { id: 'inv_028', name: 'Upcycled Glass Vase', quantity: 18, price: 85, lowStockThreshold: 8, category: 'Decor', image: 'https://images.pexels.com/photos/3962285/pexels-photo-3962285.jpeg?auto=compress&cs=tinysrgb&w=200', description: 'Beautiful vase made from recycled glass bottles' },
      { id: 'inv_029', name: 'Glass Candle Holder', quantity: 25, price: 55, lowStockThreshold: 12, category: 'Lighting', image: 'https://images.pexels.com/photos/3962285/pexels-photo-3962285.jpeg?auto=compress&cs=tinysrgb&w=200', description: 'Elegant candle holder from upcycled glass' },
      { id: 'inv_030', name: 'Glass Drinking Set', quantity: 15, price: 120, lowStockThreshold: 6, category: 'Drinkware', image: 'https://images.pexels.com/photos/3962285/pexels-photo-3962285.jpeg?auto=compress&cs=tinysrgb&w=200', description: 'Set of 4 glasses made from recycled bottles' },
    ]
  },
  {
    id: 'shop_011',
    name: 'Ocean Plastic Recovery Center',
    location: { lat: 14.5995, lng: 120.9842 },
    revenue: 3200,
    stockHealth: 0.85,
    lastSale: new Date(Date.now() - 180000),
    liveStream: 'https://images.pexels.com/photos/3962285/pexels-photo-3962285.jpeg?auto=compress&cs=tinysrgb&w=400',
    country: 'Philippines',
    owner: '0x1111111111111111111111111111111111111111',
    category: ShopCategory.WasteUpcycling,
    fundingNeeded: 6000,
    totalFunded: 4200,
    sustainabilityScore: 92,
    isActive: true,
    registeredAt: Math.floor(Date.now() / 1000) - 86400 * 45, // 45 days ago
    lastSaleAt: Math.floor(Date.now() / 1000) - 180,
    inventory: [
      { id: 'inv_031', name: 'Ocean Plastic Backpack', quantity: 12, price: 180, lowStockThreshold: 5, category: 'Bags', image: 'https://images.pexels.com/photos/3962285/pexels-photo-3962285.jpeg?auto=compress&cs=tinysrgb&w=200', description: 'Durable backpack made from recycled ocean plastic' },
      { id: 'inv_032', name: 'Recycled Phone Case', quantity: 30, price: 45, lowStockThreshold: 15, category: 'Electronics', image: 'https://images.pexels.com/photos/3962285/pexels-photo-3962285.jpeg?auto=compress&cs=tinysrgb&w=200', description: 'Protective phone case from ocean plastic waste' },
      { id: 'inv_033', name: 'Eco Water Bottle', quantity: 25, price: 65, lowStockThreshold: 10, category: 'Drinkware', image: 'https://images.pexels.com/photos/3962285/pexels-photo-3962285.jpeg?auto=compress&cs=tinysrgb&w=200', description: 'Reusable water bottle from recycled materials' },
    ]
  },
  {
    id: 'shop_012',
    name: 'Urban Vertical Garden',
    location: { lat: 1.3521, lng: 103.8198 },
    revenue: 2800,
    stockHealth: 0.75,
    lastSale: new Date(Date.now() - 240000),
    liveStream: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=400',
    country: 'Singapore',
    owner: '0x2222222222222222222222222222222222222222',
    category: ShopCategory.OrganicProduce,
    fundingNeeded: 5500,
    totalFunded: 3800,
    sustainabilityScore: 88,
    isActive: true,
    registeredAt: Math.floor(Date.now() / 1000) - 86400 * 60, // 60 days ago
    lastSaleAt: Math.floor(Date.now() / 1000) - 240,
    inventory: [
      { id: 'inv_034', name: 'Microgreens Mix', quantity: 40, price: 25, lowStockThreshold: 20, category: 'Vegetables', image: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=200', description: 'Fresh microgreens grown in vertical farms' },
      { id: 'inv_035', name: 'Hydroponic Lettuce', quantity: 18, price: 35, lowStockThreshold: 8, category: 'Vegetables', image: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=200', description: 'Crisp lettuce grown without soil' },
      { id: 'inv_036', name: 'Vertical Farm Kit', quantity: 8, price: 250, lowStockThreshold: 3, category: 'Gardening', image: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=200', description: 'Complete vertical farming setup for homes' },
    ]
  },
  {
    id: 'shop_013',
    name: 'Renewable Energy Hub',
    location: { lat: -6.2088, lng: 106.8456 },
    revenue: 4200,
    stockHealth: 0.90,
    lastSale: new Date(Date.now() - 120000),
    liveStream: 'https://images.pexels.com/photos/3962285/pexels-photo-3962285.jpeg?auto=compress&cs=tinysrgb&w=400',
    country: 'Indonesia',
    owner: '0x3333333333333333333333333333333333333333',
    category: ShopCategory.SolarKiosk,
    fundingNeeded: 8000,
    totalFunded: 6500,
    sustainabilityScore: 95,
    isActive: true,
    registeredAt: Math.floor(Date.now() / 1000) - 86400 * 90, // 90 days ago
    lastSaleAt: Math.floor(Date.now() / 1000) - 120,
    inventory: [
      { id: 'inv_037', name: 'Solar Panel Kit', quantity: 15, price: 380, lowStockThreshold: 5, category: 'Energy', image: 'https://images.pexels.com/photos/3962285/pexels-photo-3962285.jpeg?auto=compress&cs=tinysrgb&w=200', description: 'Complete solar panel system for homes' },
      { id: 'inv_038', name: 'Wind Turbine Mini', quantity: 8, price: 550, lowStockThreshold: 3, category: 'Energy', image: 'https://images.pexels.com/photos/3962285/pexels-photo-3962285.jpeg?auto=compress&cs=tinysrgb&w=200', description: 'Small wind turbine for residential use' },
      { id: 'inv_039', name: 'Energy Storage Battery', quantity: 12, price: 420, lowStockThreshold: 4, category: 'Energy', image: 'https://images.pexels.com/photos/3962285/pexels-photo-3962285.jpeg?auto=compress&cs=tinysrgb&w=200', description: 'Rechargeable battery for renewable energy storage' },
    ]
  }
];

export const mockInvestors: Investor[] = [
  {
    id: 'inv_001',
    name: 'Green Impact Fund',
    totalInvested: 45000,
    activeInvestments: 12,
    roi: 18.5,
    walletAddress: '0xA123456789012345678901234567890123456789',
    joinDate: Math.floor(Date.now() / 1000) - 86400 * 180 // 180 days ago
  },
  {
    id: 'inv_002',
    name: 'Southeast Asia Ventures',
    totalInvested: 32000,
    activeInvestments: 8,
    roi: 22.3,
    walletAddress: '0xB234567890123456789012345678901234567890',
    joinDate: Math.floor(Date.now() / 1000) - 86400 * 120 // 120 days ago
  },
  {
    id: 'inv_003',
    name: 'Sustainable Growth Capital',
    totalInvested: 28000,
    activeInvestments: 15,
    roi: 15.8,
    walletAddress: '0xC345678901234567890123456789012345678901',
    joinDate: Math.floor(Date.now() / 1000) - 86400 * 200 // 200 days ago
  },
  {
    id: 'inv_004',
    name: 'Rural Development Bank',
    totalInvested: 18000,
    activeInvestments: 6,
    roi: 12.4,
    walletAddress: '0xD456789012345678901234567890123456789012',
    joinDate: Math.floor(Date.now() / 1000) - 86400 * 90 // 90 days ago
  },
  {
    id: 'inv_005',
    name: 'EcoFinance Initiative',
    totalInvested: 22000,
    activeInvestments: 9,
    roi: 16.7,
    walletAddress: '0xE567890123456789012345678901234567890123',
    joinDate: Math.floor(Date.now() / 1000) - 86400 * 150 // 150 days ago
  }
];

export const generateMockTransactions = (): Transaction[] => {
  const transactions: Transaction[] = [];
  const now = Date.now();
  
  for (let i = 0; i < 20; i++) {
    const shop = mockShops[Math.floor(Math.random() * mockShops.length)];
    const types: ('sale' | 'funding' | 'restock')[] = ['sale', 'funding', 'restock'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    transactions.push({
      id: `trans_${i}`,
      shopId: String(shop.id),
      amount: Math.floor(Math.random() * 500) + 50,
      type,
      timestamp: new Date(now - Math.random() * 3600000),
      toLocation: type === 'sale' ? GREENPOS_HQ : shop.location,
      fromLocation: type === 'sale' ? shop.location : 
        type === 'funding' ? 
        { lat: 1.3521 + Math.random() * 0.1, lng: 103.8198 + Math.random() * 0.1 } : 
        undefined
    });
  }
  
  return transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};
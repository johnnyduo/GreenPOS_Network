import { Shop, Transaction, Investor } from '../types';
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
    owner: 'Siriporn Tantipong',
    category: 'Organic Produce',
    fundingNeeded: 5000,
    totalFunded: 3200,
    inventory: [
      { id: 'inv_001', name: 'Organic Tomatoes', quantity: 25, price: 35, lowStockThreshold: 10, category: 'Vegetables', image: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=200', description: 'Fresh organic tomatoes grown without pesticides' },
      { id: 'inv_002', name: 'Organic Rice', quantity: 8, price: 85, lowStockThreshold: 5, category: 'Grains', image: 'https://images.pexels.com/photos/33239/rice-grains-seeds-cereal.jpg?auto=compress&cs=tinysrgb&w=200', description: 'Premium organic jasmine rice' },
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
    owner: 'Nguyen Thi Lan',
    category: 'Eco-Crafts',
    fundingNeeded: 3500,
    totalFunded: 2100,
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
    owner: 'Ahmad Rahman',
    category: 'Solar Kiosk',
    fundingNeeded: 4200,
    totalFunded: 4000,
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
    owner: 'Le Minh Duc',
    category: 'Waste Upcycling',
    fundingNeeded: 6000,
    totalFunded: 1800,
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
    owner: 'Kamala Surasak',
    category: 'Agro-Processing',
    fundingNeeded: 8000,
    totalFunded: 5400,
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
    owner: 'Tran Van Minh',
    category: 'Agro-Processing',
    fundingNeeded: 4500,
    totalFunded: 2700,
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
    owner: 'Lim Wei Ming',
    category: 'Organic Produce',
    fundingNeeded: 3200,
    totalFunded: 2800,
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
    owner: 'Maria Santos',
    category: 'Eco-Crafts',
    fundingNeeded: 7500,
    totalFunded: 4200,
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
    owner: 'Chen Wei Lin',
    category: 'Solar Kiosk',
    fundingNeeded: 5500,
    totalFunded: 3800,
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
    owner: 'Sophea Pich',
    category: 'Waste Upcycling',
    fundingNeeded: 4000,
    totalFunded: 1500,
    inventory: [
      { id: 'inv_028', name: 'Upcycled Glass Vase', quantity: 18, price: 85, lowStockThreshold: 8, category: 'Decor', image: 'https://images.pexels.com/photos/3962285/pexels-photo-3962285.jpeg?auto=compress&cs=tinysrgb&w=200', description: 'Beautiful vase made from recycled glass bottles' },
      { id: 'inv_029', name: 'Glass Candle Holder', quantity: 25, price: 55, lowStockThreshold: 12, category: 'Lighting', image: 'https://images.pexels.com/photos/3962285/pexels-photo-3962285.jpeg?auto=compress&cs=tinysrgb&w=200', description: 'Elegant candle holder from upcycled glass' },
      { id: 'inv_030', name: 'Glass Drinking Set', quantity: 15, price: 120, lowStockThreshold: 6, category: 'Drinkware', image: 'https://images.pexels.com/photos/3962285/pexels-photo-3962285.jpeg?auto=compress&cs=tinysrgb&w=200', description: 'Set of 4 glasses made from recycled bottles' },
    ]
  },
  {
    id: 'shop_011',
    name: 'Community Vegetable Farm',
    location: { lat: 17.9757, lng: 102.6331 },
    revenue: 3100,
    stockHealth: 0.79,
    lastSale: new Date(Date.now() - 200000),
    liveStream: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=400',
    country: 'Laos',
    owner: 'Bounmy Vongsa',
    category: 'Organic Produce',
    fundingNeeded: 4800,
    totalFunded: 2900,
    inventory: [
      { id: 'inv_031', name: 'Organic Lettuce', quantity: 40, price: 28, lowStockThreshold: 20, category: 'Vegetables', image: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=200', description: 'Fresh organic lettuce, pesticide-free' },
      { id: 'inv_032', name: 'Organic Carrots', quantity: 35, price: 32, lowStockThreshold: 18, category: 'Vegetables', image: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=200', description: 'Sweet organic carrots, locally grown' },
      { id: 'inv_033', name: 'Vegetable Box (Mixed)', quantity: 20, price: 150, lowStockThreshold: 10, category: 'Bundles', image: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=200', description: 'Weekly vegetable box with seasonal produce' },
    ]
  },
  {
    id: 'shop_012',
    name: 'Eco-Textile Weaving Co-op',
    location: { lat: 19.8563, lng: 102.4955 },
    revenue: 2650,
    stockHealth: 0.84,
    lastSale: new Date(Date.now() - 180000),
    liveStream: 'https://images.pexels.com/photos/4099471/pexels-photo-4099471.jpeg?auto=compress&cs=tinysrgb&w=400',
    country: 'Laos',
    owner: 'Kham Pheng',
    category: 'Eco-Crafts',
    fundingNeeded: 5200,
    totalFunded: 3100,
    inventory: [
      { id: 'inv_034', name: 'Handwoven Scarf', quantity: 22, price: 185, lowStockThreshold: 10, category: 'Textiles', image: 'https://images.pexels.com/photos/4099471/pexels-photo-4099471.jpeg?auto=compress&cs=tinysrgb&w=200', description: 'Traditional handwoven scarf with natural dyes' },
      { id: 'inv_035', name: 'Organic Cotton Bag', quantity: 30, price: 95, lowStockThreshold: 15, category: 'Bags', image: 'https://images.pexels.com/photos/4099471/pexels-photo-4099471.jpeg?auto=compress&cs=tinysrgb&w=200', description: 'Durable bag made from organic cotton' },
      { id: 'inv_036', name: 'Table Runner', quantity: 18, price: 145, lowStockThreshold: 8, category: 'Home', image: 'https://images.pexels.com/photos/4099471/pexels-photo-4099471.jpeg?auto=compress&cs=tinysrgb&w=200', description: 'Elegant handwoven table runner' },
    ]
  },
  {
    id: 'shop_013',
    name: 'Solar Water Purification Station',
    location: { lat: 16.4637, lng: 107.5909 },
    revenue: 1850,
    stockHealth: 0.77,
    lastSale: new Date(Date.now() - 300000),
    liveStream: 'https://images.pexels.com/photos/2380794/pexels-photo-2380794.jpeg?auto=compress&cs=tinysrgb&w=400',
    country: 'Vietnam',
    owner: 'Pham Thi Mai',
    category: 'Solar Kiosk',
    fundingNeeded: 6500,
    totalFunded: 2200,
    inventory: [
      { id: 'inv_037', name: 'Purified Water (5L)', quantity: 50, price: 25, lowStockThreshold: 25, category: 'Water', image: 'https://images.pexels.com/photos/2380794/pexels-photo-2380794.jpeg?auto=compress&cs=tinysrgb&w=200', description: 'Solar-purified drinking water' },
      { id: 'inv_038', name: 'Water Bottle (Reusable)', quantity: 35, price: 65, lowStockThreshold: 18, category: 'Containers', image: 'https://images.pexels.com/photos/2380794/pexels-photo-2380794.jpeg?auto=compress&cs=tinysrgb&w=200', description: 'BPA-free reusable water bottle' },
      { id: 'inv_039', name: 'Water Filter Cartridge', quantity: 20, price: 85, lowStockThreshold: 10, category: 'Filters', image: 'https://images.pexels.com/photos/2380794/pexels-photo-2380794.jpeg?auto=compress&cs=tinysrgb&w=200', description: 'Replacement filter for home water systems' },
    ]
  }
];

export const mockInvestors: Investor[] = [
  {
    id: 'inv_001',
    name: 'Green Impact Fund',
    totalInvested: 45000,
    activeInvestments: 12,
    roi: 18.5
  },
  {
    id: 'inv_002',
    name: 'Southeast Asia Ventures',
    totalInvested: 32000,
    activeInvestments: 8,
    roi: 22.3
  },
  {
    id: 'inv_003',
    name: 'Sustainable Growth Capital',
    totalInvested: 28000,
    activeInvestments: 15,
    roi: 15.8
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
      shopId: shop.id,
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
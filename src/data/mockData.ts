import { Shop, Transaction, Investor } from '../types';

export const MAPBOX_TOKEN = 'pk.eyJ1IjoiZG9rYXB1bmciLCJhIjoiY20zNWJ6bzZwMDdldzJxcTZnYnZmYmRociJ9.2l4UBJst224_6s1kf7Rqdw';

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
    name: "Mama's Green Café",
    location: { lat: 13.7563, lng: 100.5018 },
    revenue: 2500,
    stockHealth: 0.8,
    lastSale: new Date(),
    liveStream: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=400',
    country: 'Thailand',
    owner: 'Siriporn Tantipong',
    category: 'Food & Beverage',
    fundingNeeded: 5000,
    totalFunded: 3200,
    inventory: [
      { id: 'inv_001', name: 'Thai Coffee', quantity: 25, price: 35, lowStockThreshold: 10, category: 'Beverages' },
      { id: 'inv_002', name: 'Pad Thai Kit', quantity: 8, price: 85, lowStockThreshold: 5, category: 'Meals' },
      { id: 'inv_003', name: 'Mango Sticky Rice', quantity: 15, price: 45, lowStockThreshold: 8, category: 'Desserts' },
    ]
  },
  {
    id: 'shop_002',
    name: 'Rice & Roots Eatery',
    location: { lat: 10.8231, lng: 106.6297 },
    revenue: 1800,
    stockHealth: 0.6,
    lastSale: new Date(Date.now() - 300000),
    liveStream: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    country: 'Vietnam',
    owner: 'Nguyen Thi Lan',
    category: 'Traditional Food',
    fundingNeeded: 3500,
    totalFunded: 2100,
    inventory: [
      { id: 'inv_004', name: 'Pho Bo', quantity: 12, price: 55, lowStockThreshold: 8, category: 'Soup' },
      { id: 'inv_005', name: 'Spring Rolls', quantity: 20, price: 25, lowStockThreshold: 10, category: 'Appetizers' },
      { id: 'inv_006', name: 'Vietnamese Coffee', quantity: 18, price: 30, lowStockThreshold: 5, category: 'Beverages' },
    ]
  },
  {
    id: 'shop_003',
    name: 'Bamboo Brew Stand',
    location: { lat: 3.1390, lng: 101.6869 },
    revenue: 3200,
    stockHealth: 0.9,
    lastSale: new Date(Date.now() - 120000),
    liveStream: 'https://images.pexels.com/photos/2380794/pexels-photo-2380794.jpeg?auto=compress&cs=tinysrgb&w=400',
    country: 'Malaysia',
    owner: 'Ahmad Rahman',
    category: 'Beverages',
    fundingNeeded: 4200,
    totalFunded: 4000,
    inventory: [
      { id: 'inv_007', name: 'Teh Tarik', quantity: 30, price: 15, lowStockThreshold: 15, category: 'Hot Drinks' },
      { id: 'inv_008', name: 'Coconut Water', quantity: 25, price: 20, lowStockThreshold: 12, category: 'Cold Drinks' },
      { id: 'inv_009', name: 'Satay Skewers', quantity: 40, price: 12, lowStockThreshold: 20, category: 'Snacks' },
    ]
  },
  {
    id: 'shop_004',
    name: 'Eco Market Hub',
    location: { lat: 16.0544, lng: 108.2022 },
    revenue: 2100,
    stockHealth: 0.7,
    lastSale: new Date(Date.now() - 600000),
    liveStream: 'https://images.pexels.com/photos/3962285/pexels-photo-3962285.jpeg?auto=compress&cs=tinysrgb&w=400',
    country: 'Vietnam',
    owner: 'Le Minh Duc',
    category: 'Organic Produce',
    fundingNeeded: 6000,
    totalFunded: 1800,
    inventory: [
      { id: 'inv_010', name: 'Organic Rice', quantity: 50, price: 35, lowStockThreshold: 25, category: 'Grains' },
      { id: 'inv_011', name: 'Fresh Herbs', quantity: 12, price: 15, lowStockThreshold: 8, category: 'Vegetables' },
      { id: 'inv_012', name: 'Dragon Fruit', quantity: 18, price: 25, lowStockThreshold: 10, category: 'Fruits' },
    ]
  },
  {
    id: 'shop_005',
    name: 'Spice Route Stall',
    location: { lat: 7.8804, lng: 98.3923 },
    revenue: 1650,
    stockHealth: 0.85,
    lastSale: new Date(Date.now() - 180000),
    liveStream: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=400',
    country: 'Thailand',
    owner: 'Kamala Surasak',
    category: 'Spices & Condiments',
    fundingNeeded: 2800,
    totalFunded: 2400,
    inventory: [
      { id: 'inv_013', name: 'Tom Yum Paste', quantity: 22, price: 45, lowStockThreshold: 15, category: 'Condiments' },
      { id: 'inv_014', name: 'Fresh Lemongrass', quantity: 16, price: 12, lowStockThreshold: 8, category: 'Herbs' },
      { id: 'inv_015', name: 'Chili Oil', quantity: 28, price: 35, lowStockThreshold: 12, category: 'Sauces' },
    ]
  },
  {
    id: 'shop_006',
    name: 'Golden Noodle House',
    location: { lat: 21.0285, lng: 105.8542 },
    revenue: 2800,
    stockHealth: 0.75,
    lastSale: new Date(Date.now() - 240000),
    liveStream: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    country: 'Vietnam',
    owner: 'Tran Van Minh',
    category: 'Noodles & Soup',
    fundingNeeded: 4500,
    totalFunded: 2700,
    inventory: [
      { id: 'inv_016', name: 'Beef Pho', quantity: 15, price: 65, lowStockThreshold: 8, category: 'Soup' },
      { id: 'inv_017', name: 'Chicken Noodles', quantity: 20, price: 50, lowStockThreshold: 10, category: 'Noodles' },
      { id: 'inv_018', name: 'Fresh Herbs Mix', quantity: 25, price: 15, lowStockThreshold: 12, category: 'Herbs' },
    ]
  },
  {
    id: 'shop_007',
    name: 'Tropical Fruit Corner',
    location: { lat: 5.4164, lng: 100.3327 },
    revenue: 1950,
    stockHealth: 0.88,
    lastSale: new Date(Date.now() - 90000),
    liveStream: 'https://images.pexels.com/photos/3962285/pexels-photo-3962285.jpeg?auto=compress&cs=tinysrgb&w=400',
    country: 'Malaysia',
    owner: 'Lim Wei Ming',
    category: 'Fresh Fruits',
    fundingNeeded: 3200,
    totalFunded: 2800,
    inventory: [
      { id: 'inv_019', name: 'Durian', quantity: 8, price: 120, lowStockThreshold: 3, category: 'Exotic Fruits' },
      { id: 'inv_020', name: 'Rambutan', quantity: 30, price: 25, lowStockThreshold: 15, category: 'Tropical Fruits' },
      { id: 'inv_021', name: 'Coconut Water', quantity: 40, price: 18, lowStockThreshold: 20, category: 'Beverages' },
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
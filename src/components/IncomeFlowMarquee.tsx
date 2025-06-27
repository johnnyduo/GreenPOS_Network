import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shop, Transaction } from '../types';

interface IncomeFlowMarqueeProps {
  shops: Shop[];
  transactions: Transaction[];
  isVisible: boolean;
}

interface MarqueeItem {
  id: string;
  shopName: string;
  amount: number;
  timestamp: Date;
  type: 'sale' | 'funding';
}

export const IncomeFlowMarquee: React.FC<IncomeFlowMarqueeProps> = ({
  shops,
  transactions,
  isVisible
}) => {
  const [marqueeItems, setMarqueeItems] = useState<MarqueeItem[]>([]);

  useEffect(() => {
    if (!isVisible) {
      setMarqueeItems([]);
      return;
    }

    const generateMarqueeItem = (): MarqueeItem => {
      const shop = shops[Math.floor(Math.random() * shops.length)];
      const types: ('sale' | 'funding')[] = ['sale', 'funding'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      return {
        id: `marquee-${Date.now()}-${Math.random()}`,
        shopName: shop.name,
        amount: Math.floor(Math.random() * 800) + 100,
        timestamp: new Date(),
        type
      };
    };

    // Add initial items
    const initialItems = Array.from({ length: 3 }, generateMarqueeItem);
    setMarqueeItems(initialItems);

    // Add new items periodically
    const interval = setInterval(() => {
      const newItem = generateMarqueeItem();
      setMarqueeItems(prev => {
        const updated = [newItem, ...prev];
        return updated.slice(0, 8); // Keep only last 8 items
      });
    }, 3000 + Math.random() * 2000); // Random interval 3-5 seconds

    return () => clearInterval(interval);
  }, [shops, isVisible]);

  if (!isVisible || marqueeItems.length === 0) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500 text-white py-3 shadow-lg">
      <div className="absolute inset-0 bg-black/10"></div>
      
      <motion.div
        className="flex gap-8 whitespace-nowrap"
        animate={{ x: [0, -2000] }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        {/* Duplicate items for seamless loop */}
        {[...marqueeItems, ...marqueeItems, ...marqueeItems].map((item, index) => (
          <motion.div
            key={`${item.id}-${index}`}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 px-6 py-1 bg-white/20 rounded-full backdrop-blur-sm"
          >
            <motion.div
              className={`w-3 h-3 rounded-full ${
                item.type === 'sale' ? 'bg-yellow-300' : 'bg-blue-300'
              }`}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="font-medium text-sm">
              {item.shopName}
            </span>
            <motion.span
              className="font-bold text-lg"
              animate={{ color: ['#ffffff', '#fbbf24', '#ffffff'] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              +฿{item.amount.toLocaleString()}
            </motion.span>
            <span className="text-xs opacity-80">
              {item.type === 'sale' ? '💰 Sale' : '💎 Funding'}
            </span>
          </motion.div>
        ))}
      </motion.div>
      
      {/* Gradient overlays for fade effect */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-emerald-500 to-transparent pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-emerald-500 to-transparent pointer-events-none"></div>
    </div>
  );
};
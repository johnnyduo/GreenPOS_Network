import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shop, Transaction } from '../types';
import { GREENPOS_HQ } from '../data/mockData';

interface FlowParticlesProps {
  shops: Shop[];
  transactions: Transaction[];
  isVisible: boolean;
}

interface Particle {
  id: string;
  shopId: string;
  amount: number;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  progress: number;
  type: 'sale' | 'funding' | 'restock';
}

export const FlowParticles: React.FC<FlowParticlesProps> = ({
  shops,
  transactions,
  isVisible
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (!isVisible) {
      setParticles([]);
      return;
    }

    const createParticle = (shop: Shop): Particle => {
      return {
        id: `particle-${shop.id}-${Date.now()}-${Math.random()}`,
        shopId: shop.id,
        amount: Math.floor(Math.random() * 500) + 100,
        startLat: shop.location.lat,
        startLng: shop.location.lng,
        endLat: GREENPOS_HQ.lat,
        endLng: GREENPOS_HQ.lng,
        progress: 0,
        type: 'sale'
      };
    };

    // Create particles periodically from each shop
    const intervals = shops.map(shop => {
      return setInterval(() => {
        if (Math.random() > 0.3) { // 70% chance to create particle
          setParticles(prev => [...prev, createParticle(shop)]);
        }
      }, 2000 + Math.random() * 3000); // Random interval between 2-5 seconds
    });

    // Clean up old particles
    const cleanupInterval = setInterval(() => {
      setParticles(prev => prev.filter(p => p.progress < 1));
    }, 1000);

    return () => {
      intervals.forEach(clearInterval);
      clearInterval(cleanupInterval);
    };
  }, [shops, isVisible]);

  // Animate particles
  useEffect(() => {
    const animateParticles = () => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        progress: Math.min(particle.progress + 0.008, 1)
      })));
    };

    const animationInterval = setInterval(animateParticles, 50);
    return () => clearInterval(animationInterval);
  }, []);

  // Convert lat/lng to screen coordinates (simplified)
  const getScreenPosition = (lat: number, lng: number, progress: number) => {
    // This is a simplified conversion - in a real app you'd use the map's project method
    const startX = ((lng + 180) / 360) * window.innerWidth;
    const startY = ((90 - lat) / 180) * window.innerHeight;
    
    const endX = ((GREENPOS_HQ.lng + 180) / 360) * window.innerWidth;
    const endY = ((90 - GREENPOS_HQ.lat) / 180) * window.innerHeight;
    
    return {
      x: startX + (endX - startX) * progress,
      y: startY + (endY - startY) * progress
    };
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-20">
      <AnimatePresence>
        {particles.map(particle => {
          const position = getScreenPosition(
            particle.startLat,
            particle.startLng,
            particle.progress
          );

          return (
            <motion.div
              key={particle.id}
              initial={{ 
                scale: 0,
                opacity: 0,
                x: position.x,
                y: position.y
              }}
              animate={{ 
                scale: [0, 1.2, 1],
                opacity: particle.progress < 0.9 ? [0, 1, 1] : [1, 0],
                x: position.x,
                y: position.y
              }}
              exit={{ 
                scale: 0,
                opacity: 0 
              }}
              transition={{ 
                duration: 0.3,
                scale: { duration: 0.5 }
              }}
              className="absolute"
              style={{
                left: position.x - 6,
                top: position.y - 6
              }}
            >
              {/* Main particle */}
              <div 
                className="w-3 h-3 rounded-full relative"
                style={{
                  background: 'linear-gradient(45deg, #F59E0B, #D97706)',
                  boxShadow: '0 0 15px #F59E0B, 0 0 30px #D97706'
                }}
              >
                {/* Particle trail */}
                <div 
                  className="absolute inset-0 rounded-full animate-ping"
                  style={{
                    background: 'linear-gradient(45deg, #F59E0B, #D97706)',
                    animationDuration: '1s'
                  }}
                />
                
                {/* Amount indicator */}
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white border border-gray-200 text-gray-800 text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
                  ฿{particle.amount}
                </div>
              </div>

              {/* Energy burst effect when reaching HQ */}
              {particle.progress > 0.95 && (
                <motion.div
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 3, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: 'radial-gradient(circle, #F59E0B 0%, transparent 70%)',
                    boxShadow: '0 0 50px #F59E0B'
                  }}
                />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* HQ Income Counter */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute top-20 right-8 bg-white border border-gray-200 rounded-2xl p-6 shadow-lg"
      >
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-orange-500 font-bold text-sm">HQ</span>
            </div>
          </div>
          <h3 className="text-gray-800 font-bold text-lg mb-2">Live Income Flow</h3>
          <div className="text-2xl font-bold text-yellow-600 mb-1">
            ฿{particles.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">
            {particles.length} active streams
          </div>
        </div>
      </motion.div>

      {/* Flow intensity indicator */}
      <div className="absolute bottom-8 left-8 bg-white border border-gray-200 rounded-xl p-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
          <div className="text-gray-800">
            <div className="text-sm font-medium">Flow Intensity</div>
            <div className="text-xs text-gray-600">
              {Math.round((particles.length / shops.length) * 100)}% active
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
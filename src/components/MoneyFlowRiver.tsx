import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Transaction } from '../types';

interface MoneyFlowRiverProps {
  transactions: Transaction[];
  isVisible: boolean;
}

interface FlowParticle {
  id: string;
  transaction: Transaction;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  progress: number;
}

export const MoneyFlowRiver: React.FC<MoneyFlowRiverProps> = ({
  transactions,
  isVisible
}) => {
  const [particles, setParticles] = useState<FlowParticle[]>([]);

  useEffect(() => {
    if (!isVisible) {
      setParticles([]);
      return;
    }

    const createParticle = (transaction: Transaction): FlowParticle => {
      const startX = transaction.fromLocation ? 
        Math.random() * 200 : Math.random() * window.innerWidth;
      const startY = Math.random() * window.innerHeight;
      
      return {
        id: `particle-${transaction.id}-${Date.now()}`,
        transaction,
        x: startX,
        y: startY,
        targetX: Math.random() * window.innerWidth,
        targetY: Math.random() * window.innerHeight,
        progress: 0
      };
    };

    const interval = setInterval(() => {
      if (transactions.length > 0) {
        const randomTransaction = transactions[Math.floor(Math.random() * transactions.length)];
        setParticles(prev => [...prev, createParticle(randomTransaction)]);
      }
    }, 2000);

    // Clean up old particles
    const cleanupInterval = setInterval(() => {
      setParticles(prev => prev.filter(p => p.progress < 1));
    }, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(cleanupInterval);
    };
  }, [transactions, isVisible]);

  useEffect(() => {
    const animateParticles = () => {
      setParticles(prev => prev.map(particle => ({
        ...particle,
        progress: Math.min(particle.progress + 0.01, 1),
        x: particle.x + (particle.targetX - particle.x) * 0.01,
        y: particle.y + (particle.targetY - particle.y) * 0.01
      })));
    };

    const animationFrame = setInterval(animateParticles, 50);
    return () => clearInterval(animationFrame);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      <AnimatePresence>
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            initial={{ 
              x: particle.x, 
              y: particle.y, 
              scale: 0,
              opacity: 0 
            }}
            animate={{ 
              x: particle.targetX,
              y: particle.targetY,
              scale: 1,
              opacity: particle.progress < 0.8 ? 1 : 1 - (particle.progress - 0.8) / 0.2
            }}
            exit={{ 
              scale: 0,
              opacity: 0 
            }}
            transition={{ 
              duration: 3,
              ease: "easeInOut"
            }}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: particle.transaction.type === 'funding' ? 
                'linear-gradient(45deg, #10B981, #059669)' :
                particle.transaction.type === 'sale' ?
                'linear-gradient(45deg, #F59E0B, #D97706)' :
                'linear-gradient(45deg, #EF4444, #DC2626)',
              boxShadow: `0 0 10px ${
                particle.transaction.type === 'funding' ? '#10B981' :
                particle.transaction.type === 'sale' ? '#F59E0B' : '#EF4444'
              }`
            }}
          >
            {/* Particle trail effect */}
            <div 
              className="absolute inset-0 rounded-full animate-ping"
              style={{
                background: 'inherit',
                animationDuration: '2s'
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* River paths - decorative curved lines */}
      <svg className="absolute inset-0 w-full h-full opacity-20">
        <defs>
          <linearGradient id="riverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#059669" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        
        {/* Curved river paths */}
        <path
          d="M0,100 Q200,50 400,100 T800,100"
          stroke="url(#riverGradient)"
          strokeWidth="2"
          fill="none"
          className="animate-pulse"
        />
        <path
          d="M0,200 Q300,150 600,200 T1200,200"
          stroke="url(#riverGradient)"
          strokeWidth="1.5"
          fill="none"
          className="animate-pulse"
          style={{ animationDelay: '1s' }}
        />
        <path
          d="M0,300 Q250,250 500,300 T1000,300"
          stroke="url(#riverGradient)"
          strokeWidth="1"
          fill="none"
          className="animate-pulse"
          style={{ animationDelay: '2s' }}
        />
      </svg>
    </div>
  );
};
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Camera } from 'lucide-react';

interface LiveCameraCarouselProps {
  shop: {
    name: string;
    liveStream: string;
  };
}

export const LiveCameraCarousel: React.FC<LiveCameraCarouselProps> = ({ shop: _ }) => {
  const [currentCamera, setCurrentCamera] = useState(0);
  
  // Mock multiple camera feeds with animated GIFs
  const cameraFeeds = [
    {
      id: 1,
      name: 'Front Store',
      url: 'https://solink.com/wp-content/uploads/2022/06/360-camera-solink-view.gif',
      description: 'Main entrance and customer area'
    },
    {
      id: 2,
      name: 'Checkout Counter',
      url: 'https://solink.com/wp-content/uploads/2022/06/360-camera-solink-view.gif',
      description: 'Point of sale and transaction area'
    },
    {
      id: 3,
      name: 'Storage Area',
      url: 'https://solink.com/wp-content/uploads/2022/06/360-camera-solink-view.gif',
      description: 'Inventory and storage monitoring'
    },
    {
      id: 4,
      name: 'Product Display',
      url: 'https://solink.com/wp-content/uploads/2022/06/360-camera-solink-view.gif',
      description: 'Product shelves and displays'
    }
  ];

  const nextCamera = () => {
    setCurrentCamera((prev) => (prev + 1) % cameraFeeds.length);
  };

  const prevCamera = () => {
    setCurrentCamera((prev) => (prev - 1 + cameraFeeds.length) % cameraFeeds.length);
  };

  return (
    <div className="bg-gray-50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-800 flex items-center gap-2">
          <Camera className="w-4 h-4" />
          Live Frontstore Camera
        </h4>
        <div className="flex items-center gap-1">
          <button
            onClick={prevCamera}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs text-gray-600 px-2">
            {currentCamera + 1}/{cameraFeeds.length}
          </span>
          <button
            onClick={nextCamera}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="relative rounded-lg overflow-hidden h-40 mb-3 bg-gray-900">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentCamera}
            src={cameraFeeds[currentCamera].url}
            alt={cameraFeeds[currentCamera].name}
            className="w-full h-full object-cover"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.4 }}
          />
        </AnimatePresence>
        
        <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          LIVE
        </div>
        
        <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs font-medium">
          {cameraFeeds[currentCamera].name}
        </div>
        
        <div className="absolute bottom-3 right-3 bg-emerald-500/90 text-white px-2 py-1 rounded text-xs font-medium">
          📹 HD
        </div>

        {/* Gradient overlay for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20 pointer-events-none"></div>
      </div>
      
      <div className="space-y-2">
        <p className="text-xs text-gray-600 font-medium">
          {cameraFeeds[currentCamera].description}
        </p>
        
        {/* Enhanced Camera indicators */}
        <div className="flex justify-center gap-1.5">
          {cameraFeeds.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentCamera(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                index === currentCamera 
                  ? 'bg-emerald-500 scale-125' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
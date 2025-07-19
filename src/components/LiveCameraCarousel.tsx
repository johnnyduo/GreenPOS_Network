import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Camera } from 'lucide-react';

interface LiveCameraCarouselProps {
  shop: {
    name: string;
    liveStream: string;
  };
}

export const LiveCameraCarousel: React.FC<LiveCameraCarouselProps> = ({ shop }) => {
  const [currentCamera, setCurrentCamera] = useState(0);
  
  // Mock multiple camera feeds
  const cameraFeeds = [
    {
      id: 1,
      name: 'Front Store',
      url: shop.liveStream,
      description: 'Main entrance and customer area'
    },
    {
      id: 2,
      name: 'Checkout Counter',
      url: 'https://images.pexels.com/photos/3962285/pexels-photo-3962285.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Point of sale and transaction area'
    },
    {
      id: 3,
      name: 'Storage Area',
      url: 'https://images.pexels.com/photos/4099238/pexels-photo-4099238.jpeg?auto=compress&cs=tinysrgb&w=400',
      description: 'Inventory and storage monitoring'
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
      
      <div className="relative rounded-lg overflow-hidden h-32 mb-2 bg-gray-200">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentCamera}
            src={cameraFeeds[currentCamera].url}
            alt={cameraFeeds[currentCamera].name}
            className="w-full h-full object-cover"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=400';
            }}
          />
        </AnimatePresence>
        
        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          LIVE
        </div>
        
        <div className="absolute bottom-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
          {cameraFeeds[currentCamera].name}
        </div>
        
        <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
          Active Monitoring
        </div>
      </div>
      
      <p className="text-xs text-gray-600 text-center">
        {cameraFeeds[currentCamera].description}
      </p>
      
      {/* Camera indicators */}
      <div className="flex justify-center gap-1 mt-2">
        {cameraFeeds.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentCamera(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentCamera ? 'bg-emerald-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
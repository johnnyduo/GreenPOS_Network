import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import { Shop, Transaction } from '../types';
import { MAPBOX_TOKEN, GREENPOS_HQ } from '../data/mockData';
import { IncomeFlowLines } from './IncomeFlowLines';

interface GlobalMapViewProps {
  shops: Shop[];
  transactions: Transaction[];
  selectedShop: Shop | null;
  onShopSelect: (shop: Shop | null) => void;
  showMoneyFlow: boolean;
}

export const GlobalMapView: React.FC<GlobalMapViewProps> = ({
  shops,
  transactions,
  selectedShop,
  onShopSelect,
  showMoneyFlow
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Set the Mapbox access token
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [104.0, 12.0],
      zoom: 4,
      pitch: 30,
      bearing: 0
    });

    map.current.on('load', () => {
      setMapLoaded(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add HQ marker
    const hqEl = document.createElement('div');
    hqEl.className = 'hq-marker';
    hqEl.innerHTML = `
      <div class="relative">
        <div class="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-pulse-ring absolute"></div>
        <div class="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full border-4 border-white relative z-10 cursor-pointer hover:scale-110 transition-transform duration-200 flex items-center justify-center" 
             style="box-shadow: 0 0 25px rgba(255, 215, 0, 0.8)">
          <div class="w-3 h-3 bg-white rounded-full"></div>
        </div>
      </div>
    `;
    
    const hqMarker = new mapboxgl.Marker(hqEl)
      .setLngLat([GREENPOS_HQ.lng, GREENPOS_HQ.lat])
      .addTo(map.current!);

    // Add HQ popup
    const hqPopup = new mapboxgl.Popup({ offset: 25 })
      .setHTML(`
        <div class="text-center p-2">
          <h3 class="font-bold text-lg text-yellow-600">GreenPOS HQ</h3>
          <p class="text-sm text-gray-600">Bangkok, Thailand</p>
          <p class="text-xs text-gray-500 mt-1">Central Command Center</p>
        </div>
      `);

    hqEl.addEventListener('click', () => {
      hqMarker.setPopup(hqPopup).togglePopup();
      map.current!.flyTo({
        center: [GREENPOS_HQ.lng, GREENPOS_HQ.lat],
        zoom: 12,
        duration: 1500
      });
    });

    markersRef.current.push(hqMarker);

    // Add shop markers
    shops.forEach(shop => {
      const el = document.createElement('div');
      el.className = 'shop-marker';
      
      // Determine shop status and color
      const isActive = new Date().getTime() - shop.lastSale.getTime() < 3600000;
      const revenueLevel = shop.revenue > 2500 ? 'high' : shop.revenue > 1500 ? 'medium' : 'low';
      
      const colors = {
        high: { primary: '#10B981', secondary: '#059669' },
        medium: { primary: '#F59E0B', secondary: '#D97706' },
        low: { primary: '#EF4444', secondary: '#DC2626' }
      };

      const color = colors[revenueLevel];
      
      el.innerHTML = `
        <div class="relative">
          <div class="w-8 h-8 rounded-full animate-pulse-ring absolute" 
               style="background: ${color.primary}; opacity: 0.6;"></div>
          <div class="w-5 h-5 rounded-full border-2 border-white relative z-10 cursor-pointer hover:scale-110 transition-transform duration-200 ${isActive ? 'animate-pulse' : ''}" 
               style="background: linear-gradient(45deg, ${color.primary}, ${color.secondary}); box-shadow: 0 0 15px ${color.primary}">
          </div>
          ${isActive ? `<div class="absolute -top-1 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping"></div>` : ''}
        </div>
      `;
      
      const marker = new mapboxgl.Marker(el)
        .setLngLat([shop.location.lng, shop.location.lat])
        .addTo(map.current!);

      // Add shop popup
      const popup = new mapboxgl.Popup({ offset: 25 })
        .setHTML(`
          <div class="p-3 min-w-48">
            <h3 class="font-bold text-lg text-gray-800">${shop.name}</h3>
            <p class="text-sm text-gray-600 mb-2">${shop.country} • ${shop.category}</p>
            <div class="space-y-1 text-sm">
              <div class="flex justify-between">
                <span class="text-gray-600">Revenue:</span>
                <span class="font-semibold text-green-600">฿${shop.revenue.toLocaleString()}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Stock Health:</span>
                <span class="font-semibold" style="color: ${shop.stockHealth > 0.7 ? '#059669' : shop.stockHealth > 0.4 ? '#D97706' : '#DC2626'}">${Math.round(shop.stockHealth * 100)}%</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Status:</span>
                <span class="font-semibold ${isActive ? 'text-green-600' : 'text-gray-500'}">${isActive ? 'Active' : 'Idle'}</span>
              </div>
            </div>
            <button class="w-full mt-3 bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
              View Details
            </button>
          </div>
        `);

      el.addEventListener('click', () => {
        onShopSelect(shop);
        marker.setPopup(popup).togglePopup();
        map.current!.flyTo({
          center: [shop.location.lng, shop.location.lat],
          zoom: 12,
          duration: 1500
        });
      });

      markersRef.current.push(marker);
    });

    // Add smooth camera movement
    const moveCamera = () => {
      if (!map.current) return;
      
      const newBearing = map.current.getBearing() + 0.05;
      
      map.current.easeTo({
        bearing: newBearing,
        duration: 100
      });
    };

    const interval = setInterval(moveCamera, 150);

    return () => {
      clearInterval(interval);
      markersRef.current.forEach(marker => marker.remove());
      markersRef.current = [];
    };
  }, [mapLoaded, shops, onShopSelect]);

  return (
    <div className="relative w-full h-full">
      <div 
        ref={mapContainer} 
        className="w-full h-full rounded-xl overflow-hidden"
        style={{ minHeight: '500px' }}
      />
      
      {/* Income Flow Lines Component */}
      <IncomeFlowLines
        shops={shops}
        transactions={transactions}
        mapInstance={map.current}
        isVisible={showMoneyFlow}
        mapLoaded={mapLoaded}
      />
      
      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => {
            if (map.current) {
              map.current.flyTo({
                center: [GREENPOS_HQ.lng, GREENPOS_HQ.lat],
                zoom: 6,
                pitch: 45,
                bearing: 0,
                duration: 2000
              });
            }
          }}
          className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-800 text-sm font-medium hover:bg-gray-50 transition-all duration-200 shadow-sm"
        >
          Focus HQ
        </button>
        
        <button
          onClick={() => {
            if (map.current) {
              map.current.flyTo({
                center: [104.0, 12.0],
                zoom: 4,
                pitch: 30,
                bearing: 0,
                duration: 2000
              });
            }
          }}
          className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-800 text-sm font-medium hover:bg-gray-50 transition-all duration-200 shadow-sm"
        >
          Reset View
        </button>
        
        <button
          onClick={() => {
            if (map.current) {
              const zoom = map.current.getZoom();
              map.current.flyTo({
                zoom: zoom < 8 ? 15 : 4,
                pitch: zoom < 8 ? 0 : 45,
                bearing: zoom < 8 ? 0 : 30,
                duration: 2000
              });
            }
          }}
          className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-800 text-sm font-medium hover:bg-gray-50 transition-all duration-200 shadow-sm"
        >
          Toggle View
        </button>
      </div>

      {/* Enhanced Legend */}
      <div className="absolute bottom-4 left-4 bg-white border border-gray-200 rounded-lg p-4 text-gray-800 shadow-lg">
        <h3 className="font-semibold mb-3 text-center">Network Status</h3>
        
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
            <span className="text-sm">GreenPOS HQ</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-glow"></div>
            <span className="text-sm">High Revenue (฿2500+)</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-sm">Medium Revenue (฿1500+)</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm">Low Revenue (&lt;฿1500)</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
            <span className="text-sm">Active (Last Hour)</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-600 text-center">
            Income flows to Bangkok HQ
          </div>
        </div>
      </div>
    </div>
  );
};
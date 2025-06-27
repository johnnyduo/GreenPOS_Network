import React, { useEffect, useRef } from 'react';
import { Shop, Transaction } from '../types';
import { GREENPOS_HQ } from '../data/mockData';

interface IncomeFlowLinesProps {
  shops: Shop[];
  transactions: Transaction[];
  mapInstance: mapboxgl.Map | null;
  isVisible: boolean;
  mapLoaded: boolean;
}

export const IncomeFlowLines: React.FC<IncomeFlowLinesProps> = ({
  shops,
  transactions,
  mapInstance,
  isVisible,
  mapLoaded
}) => {
  const animationFrameRef = useRef<number>();
  const particlesRef = useRef<any[]>([]);

  useEffect(() => {
    if (!mapInstance || !isVisible || !mapLoaded) return;

    // Add income flow lines source and layer
    if (!mapInstance.getSource('income-flow-lines')) {
      const lineFeatures = shops.map(shop => ({
        type: 'Feature' as const,
        properties: {
          shopId: shop.id,
          shopName: shop.name,
          revenue: shop.revenue
        },
        geometry: {
          type: 'LineString' as const,
          coordinates: [
            [shop.location.lng, shop.location.lat],
            [GREENPOS_HQ.lng, GREENPOS_HQ.lat]
          ]
        }
      }));

      mapInstance.addSource('income-flow-lines', {
        type: 'geojson',
        lineMetrics: true,
        data: {
          type: 'FeatureCollection',
          features: lineFeatures
        }
      });

      // Add animated gradient lines
      mapInstance.addLayer({
        id: 'income-flow-lines',
        type: 'line',
        source: 'income-flow-lines',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': [
            'interpolate',
            ['linear'],
            ['get', 'revenue'],
            1000, '#00C853',
            2000, '#00E676',
            3000, '#FFD700'
          ],
          'line-width': [
            'interpolate',
            ['linear'],
            ['get', 'revenue'],
            1000, 2,
            2000, 3,
            3000, 4
          ],
          'line-opacity': 0.6,
          'line-gradient': [
            'interpolate',
            ['linear'],
            ['line-progress'],
            0, 'rgba(0, 200, 83, 0.1)',
            0.5, 'rgba(0, 230, 118, 0.8)',
            1, 'rgba(255, 215, 0, 1)'
          ]
        }
      });

      // Add pulsing effect layer
      mapInstance.addLayer({
        id: 'income-flow-pulse',
        type: 'line',
        source: 'income-flow-lines',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#00E676',
          'line-width': 6,
          'line-opacity': 0.3
        }
      });
    }

    // Add HQ marker if not exists
    if (!mapInstance.getSource('greenpos-hq')) {
      mapInstance.addSource('greenpos-hq', {
        type: 'geojson',
        data: {
          type: 'FeatureCollection',
          features: [{
            type: 'Feature',
            properties: {
              name: 'GreenPOS HQ',
              type: 'headquarters'
            },
            geometry: {
              type: 'Point',
              coordinates: [GREENPOS_HQ.lng, GREENPOS_HQ.lat]
            }
          }]
        }
      });

      // Add HQ glow effect
      mapInstance.addLayer({
        id: 'hq-glow',
        type: 'circle',
        source: 'greenpos-hq',
        paint: {
          'circle-radius': 30,
          'circle-color': '#00E676',
          'circle-opacity': 0.1,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#00E676',
          'circle-stroke-opacity': 0.8
        }
      });

      // Add HQ core
      mapInstance.addLayer({
        id: 'hq-core',
        type: 'circle',
        source: 'greenpos-hq',
        paint: {
          'circle-radius': 12,
          'circle-color': '#FFD700',
          'circle-stroke-width': 3,
          'circle-stroke-color': '#00E676',
          'circle-stroke-opacity': 1
        }
      });
    }

    // Animate the lines with pulsing effect
    let pulseOpacity = 0.3;
    let pulseDirection = 1;

    const animatePulse = () => {
      pulseOpacity += pulseDirection * 0.02;
      if (pulseOpacity >= 0.8) pulseDirection = -1;
      if (pulseOpacity <= 0.1) pulseDirection = 1;

      if (mapInstance.getLayer('income-flow-pulse')) {
        mapInstance.setPaintProperty('income-flow-pulse', 'line-opacity', pulseOpacity);
      }

      if (mapInstance.getLayer('hq-glow')) {
        mapInstance.setPaintProperty('hq-glow', 'circle-opacity', pulseOpacity * 0.5);
      }

      animationFrameRef.current = requestAnimationFrame(animatePulse);
    };

    animatePulse();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [mapInstance, shops, isVisible, mapLoaded]);

  // Clean up when component unmounts or becomes invisible
  useEffect(() => {
    if (!mapInstance || !mapLoaded) return;

    if (!isVisible) {
      // Hide layers
      if (mapInstance.getLayer('income-flow-lines')) {
        mapInstance.setLayoutProperty('income-flow-lines', 'visibility', 'none');
      }
      if (mapInstance.getLayer('income-flow-pulse')) {
        mapInstance.setLayoutProperty('income-flow-pulse', 'visibility', 'none');
      }
      if (mapInstance.getLayer('hq-glow')) {
        mapInstance.setLayoutProperty('hq-glow', 'visibility', 'none');
      }
      if (mapInstance.getLayer('hq-core')) {
        mapInstance.setLayoutProperty('hq-core', 'visibility', 'none');
      }
    } else {
      // Show layers
      if (mapInstance.getLayer('income-flow-lines')) {
        mapInstance.setLayoutProperty('income-flow-lines', 'visibility', 'visible');
      }
      if (mapInstance.getLayer('income-flow-pulse')) {
        mapInstance.setLayoutProperty('income-flow-pulse', 'visibility', 'visible');
      }
      if (mapInstance.getLayer('hq-glow')) {
        mapInstance.setLayoutProperty('hq-glow', 'visibility', 'visible');
      }
      if (mapInstance.getLayer('hq-core')) {
        mapInstance.setLayoutProperty('hq-core', 'visibility', 'visible');
      }
    }
  }, [isVisible, mapInstance, mapLoaded]);

  return null;
};
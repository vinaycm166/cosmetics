import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Truck, MapPin, Navigation, Compass, RefreshCw, AlertCircle, Clock } from 'lucide-react';
import { LatLng } from '../../lib/routingService';

interface LiveTrackingMapProps {
  riderLocation?: {
    latitude: number;
    longitude: number;
    heading?: number;
    speed?: number;
    accuracy?: number;
    timestamp?: string;
  };
  destinationLocation: {
    latitude: number;
    longitude: number;
    addressText?: string;
  };
  hubLocation?: {
    latitude: number;
    longitude: number;
    name?: string;
  };
  routeCoordinates?: [number, number][];
  distanceRemainingKm?: number;
  etaMinutes?: number;
  lastUpdated?: string;
  isSharingActive?: boolean;
  orderStatus: string;
  height?: string;
}

export const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({
  riderLocation,
  destinationLocation,
  hubLocation,
  routeCoordinates,
  distanceRemainingKm,
  etaMinutes,
  lastUpdated,
  isSharingActive = true,
  orderStatus,
  height = '420px'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const riderMarkerRef = useRef<L.Marker | null>(null);
  const destMarkerRef = useRef<L.Marker | null>(null);
  const hubMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);

  const [timeAgo, setTimeAgo] = useState<string>('Just now');

  // Update time ago indicator
  useEffect(() => {
    if (!lastUpdated) return;
    const interval = setInterval(() => {
      const diffSecs = Math.max(0, Math.round((Date.now() - new Date(lastUpdated).getTime()) / 1000));
      if (diffSecs < 10) setTimeAgo('Just now');
      else if (diffSecs < 60) setTimeAgo(`${diffSecs}s ago`);
      else setTimeAgo(`${Math.floor(diffSecs / 60)}m ago`);
    }, 3000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const centerLat = riderLocation ? riderLocation.latitude : destinationLocation.latitude;
      const centerLng = riderLocation ? riderLocation.longitude : destinationLocation.longitude;

      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false
      });

      // Add OpenStreetMap CartoDB Positron / OSM standard tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd'
      }).addTo(map);

      // Custom zoom control in bottom-right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers and Route
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const boundsPoints: L.LatLngExpression[] = [];

    // 1. Destination Marker (Doorstep Pin)
    const destIcon = L.divIcon({
      className: 'custom-dest-pin',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          <div style="
            background: #29242A;
            color: #FFF9F4;
            padding: 6px 10px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 700;
            white-space: nowrap;
            box-shadow: 0 4px 12px rgba(0,0,0,0.25);
            display: flex;
            align-items: center;
            gap: 4px;
            border: 2px solid #FFF;
          ">
            <span>🏠 Your Doorstep</span>
          </div>
          <div style="
            width: 0;
            height: 0;
            border-left: 6px solid transparent;
            border-right: 6px solid transparent;
            border-top: 8px solid #29242A;
          "></div>
        </div>
      `,
      iconSize: [120, 42],
      iconAnchor: [60, 42]
    });

    if (destMarkerRef.current) {
      destMarkerRef.current.setLatLng([destinationLocation.latitude, destinationLocation.longitude]);
    } else {
      destMarkerRef.current = L.marker(
        [destinationLocation.latitude, destinationLocation.longitude],
        { icon: destIcon, zIndexOffset: 800 }
      ).addTo(map);
    }
    boundsPoints.push([destinationLocation.latitude, destinationLocation.longitude]);

    // 2. Hub Marker (if visible and rider is at hub or picking up)
    if (hubLocation) {
      const hubIcon = L.divIcon({
        className: 'custom-hub-pin',
        html: `
          <div style="
            background: #721C46;
            color: #FFF;
            width: 28px;
            height: 28px;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            border: 2px solid #FFF;
            box-shadow: 0 4px 10px rgba(114,28,70,0.35);
          " title="${hubLocation.name || 'Dew & Go Dark Store'}">
            🏬
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });

      if (hubMarkerRef.current) {
        hubMarkerRef.current.setLatLng([hubLocation.latitude, hubLocation.longitude]);
      } else {
        hubMarkerRef.current = L.marker([hubLocation.latitude, hubLocation.longitude], {
          icon: hubIcon,
          zIndexOffset: 700
        }).addTo(map);
      }
      boundsPoints.push([hubLocation.latitude, hubLocation.longitude]);
    }

    // 3. Rider Marker (Moving Pulsing Scooter)
    if (riderLocation && isSharingActive) {
      const heading = riderLocation.heading || 0;
      const riderIcon = L.divIcon({
        className: 'custom-rider-pin',
        html: `
          <div style="position: relative; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;">
            <!-- Pulsing outer wave -->
            <div style="
              position: absolute;
              width: 48px;
              height: 48px;
              border-radius: 9999px;
              background: rgba(232, 79, 135, 0.25);
              animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;
            "></div>
            <!-- Inner Glowing Circle -->
            <div style="
              width: 36px;
              height: 36px;
              border-radius: 9999px;
              background: linear-gradient(135deg, #721C46, #E84F87);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 18px;
              border: 3px solid #FFF;
              box-shadow: 0 4px 14px rgba(114, 28, 70, 0.45);
              transform: rotate(${heading}deg);
              transition: transform 0.4s ease;
            ">
              🛵
            </div>
            <!-- Mini speed badge -->
            ${
              riderLocation.speed && riderLocation.speed > 0
                ? `<div style="
                    position: absolute;
                    bottom: -2px;
                    right: -2px;
                    background: #267653;
                    color: white;
                    font-size: 9px;
                    font-weight: 800;
                    padding: 1px 4px;
                    border-radius: 6px;
                    border: 1px solid white;
                  ">${Math.round(riderLocation.speed)}km/h</div>`
                : ''
            }
          </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 24]
      });

      if (riderMarkerRef.current) {
        riderMarkerRef.current.setLatLng([riderLocation.latitude, riderLocation.longitude]);
        riderMarkerRef.current.setIcon(riderIcon);
      } else {
        riderMarkerRef.current = L.marker([riderLocation.latitude, riderLocation.longitude], {
          icon: riderIcon,
          zIndexOffset: 1000
        }).addTo(map);
      }
      boundsPoints.push([riderLocation.latitude, riderLocation.longitude]);
    } else if (riderMarkerRef.current) {
      map.removeLayer(riderMarkerRef.current);
      riderMarkerRef.current = null;
    }

    // 4. Road Route Polyline
    if (routeCoordinates && routeCoordinates.length > 1) {
      if (routePolylineRef.current) {
        routePolylineRef.current.setLatLngs(routeCoordinates);
      } else {
        routePolylineRef.current = L.polyline(routeCoordinates, {
          color: '#721C46',
          weight: 5,
          opacity: 0.85,
          lineJoin: 'round',
          lineCap: 'round',
          dashArray: undefined
        }).addTo(map);
      }
    } else if (riderLocation) {
      // Connect straight path if route polyline is still fetching
      const fallbackPoints: [number, number][] = [
        [riderLocation.latitude, riderLocation.longitude],
        [destinationLocation.latitude, destinationLocation.longitude]
      ];
      if (routePolylineRef.current) {
        routePolylineRef.current.setLatLngs(fallbackPoints);
      } else {
        routePolylineRef.current = L.polyline(fallbackPoints, {
          color: '#E84F87',
          weight: 4,
          opacity: 0.6,
          dashArray: '8, 8'
        }).addTo(map);
      }
    }

    // Smooth auto fit bounds
    if (boundsPoints.length >= 2) {
      const bounds = L.latLngBounds(boundsPoints);
      map.fitBounds(bounds, { padding: [55, 55], maxZoom: 16 });
    }
  }, [riderLocation, destinationLocation, hubLocation, routeCoordinates, isSharingActive]);

  const handleRecenter = () => {
    if (!mapInstanceRef.current) return;
    if (riderLocation && isSharingActive) {
      mapInstanceRef.current.flyTo([riderLocation.latitude, riderLocation.longitude], 15, { duration: 1.2 });
    } else {
      mapInstanceRef.current.flyTo([destinationLocation.latitude, destinationLocation.longitude], 15, { duration: 1.2 });
    }
  };

  const isLive = ['picked_up', 'out_for_delivery'].includes(orderStatus) && riderLocation && isSharingActive;

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-[#EFE7E1] shadow-md bg-[#FFF9F4]" style={{ height }}>
      {/* Map Target Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Floating ETA Card */}
      <div className="absolute top-3 left-3 right-3 sm:right-auto sm:max-w-md z-10 pointer-events-auto">
        <div className="p-3.5 rounded-xl bg-white/95 backdrop-blur-md border border-[#EFE7E1] shadow-lg flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm shrink-0 ${
              isLive ? 'bg-gradient-to-br from-[#721C46] to-[#E84F87]' : 'bg-[#29242A]'
            }`}>
              {isLive ? <Truck className="w-5 h-5 animate-pulse" /> : <Clock className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-sm text-[#29242A]">
                  {orderStatus === 'delivered' 
                    ? 'Delivered to Doorstep 🎉' 
                    : isLive 
                      ? `${etaMinutes || 6} MINS ARRIVAL` 
                      : orderStatus === 'ready_for_dispatch' 
                        ? 'Rider Allocation in Progress' 
                        : 'Order Packaging at Micro-Hub'}
                </span>
                {isLive && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#267653] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#267653] animate-ping" />
                    LIVE GPS
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#756D77] flex items-center gap-2 mt-0.5">
                {isLive && distanceRemainingKm !== undefined ? (
                  <>
                    <span><strong>{distanceRemainingKm} km</strong> away</span>
                    <span>•</span>
                    <span>Ping: {timeAgo}</span>
                  </>
                ) : (
                  <span>Insulated express packaging ensures formulation freshness</span>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={handleRecenter}
            title="Center Map"
            className="w-8 h-8 rounded-lg bg-[#FAF7F4] hover:bg-[#EFE7E1] border border-[#EFE7E1] text-[#721C46] flex items-center justify-center transition-colors shrink-0"
          >
            <Compass className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Status Ribbon if GPS is pausing or connecting */}
      {!isLive && orderStatus === 'out_for_delivery' && (
        <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-auto">
          <div className="p-2.5 rounded-lg bg-amber-50/95 border border-amber-200 text-amber-900 text-xs flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Rider location connecting. Displaying last verified checkpoint.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

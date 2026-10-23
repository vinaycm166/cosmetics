/**
 * Dew & Go — Real Road Routing, Geocoding & GPS Validation Engine
 * Integrates OSRM (Open Source Routing Machine) with Haversine fallback
 */

export interface LatLng {
  lat: number;
  lng: number;
}

export interface RouteResult {
  success: boolean;
  coordinates: [number, number][]; // [lat, lng] for Leaflet
  distanceKm: number;
  durationMinutes: number;
  provider: 'osrm' | 'haversine_fallback';
  summary?: string;
}

export interface LocationValidationResult {
  isValid: boolean;
  valid: boolean; // alias for test compatibility
  reason?: string;
  speedKmh?: number;
}

// Known micro-fulfillment dark-store hubs
export const DARK_STORE_HUBS: Record<string, { name: string; address: string; coordinates: LatLng }> = {
  '560038': {
    name: 'Dew & Go Dark Store #104 — Indiranagar',
    address: '100ft Road, Indiranagar, Bengaluru 560038',
    coordinates: { lat: 12.9719, lng: 77.6412 }
  },
  '560008': {
    name: 'Dew & Go Dark Store #104 — Indiranagar East',
    address: 'HAL 2nd Stage, Domlur, Bengaluru 560008',
    coordinates: { lat: 12.9648, lng: 77.6433 }
  },
  '560034': {
    name: 'Dew & Go Dark Store #108 — Koramangala',
    address: '80ft Road, 4th Block Koramangala, Bengaluru 560034',
    coordinates: { lat: 12.9345, lng: 77.6265 }
  },
  '560001': {
    name: 'Dew & Go Dark Store #101 — Central CBD',
    address: 'MG Road / Brigade Rd Junction, Bengaluru 560001',
    coordinates: { lat: 12.9742, lng: 77.6074 }
  },
  '110001': {
    name: 'Dew & Go Dark Store #201 — Delhi Central',
    address: 'Inner Circle, Connaught Place, New Delhi 110001',
    coordinates: { lat: 28.6328, lng: 77.2197 }
  },
  '400001': {
    name: 'Dew & Go Dark Store #301 — South Mumbai',
    address: 'Fort Heritage Precinct, Mumbai 400001',
    coordinates: { lat: 18.9322, lng: 77.8355 }
  }
};

export const DEFAULT_DARK_STORE_HUB = DARK_STORE_HUBS['560038'];

/**
 * Resolves or geocodes address coordinates based on pinCode, area, or city
 */
export const resolveDestinationCoordinates = (
  address: { pinCode?: string; area?: string; city?: string; addressLine?: string } | string,
  extraAddress?: string
): LatLng => {
  const pin = (typeof address === 'string' ? address : (address.pinCode || '')).trim();
  if (DARK_STORE_HUBS[pin]) {
    // Add realistic 800m - 2.5km destination offset so destination is distinct from hub
    const hub = DARK_STORE_HUBS[pin].coordinates;
    return {
      lat: hub.lat + 0.0125,
      lng: hub.lng + 0.0095
    };
  }

  const combined = (typeof address === 'string' ? (extraAddress || '') : `${address.area || ''} ${address.city || ''} ${address.addressLine || ''}`).toLowerCase();
  if (combined.includes('koramangala')) return { lat: 12.9352, lng: 77.6245 };
  if (combined.includes('indiranagar')) return { lat: 12.9784, lng: 77.6408 };
  if (combined.includes('domlur')) return { lat: 12.9609, lng: 77.6387 };
  if (combined.includes('mg road') || combined.includes('central')) return { lat: 12.9756, lng: 77.6067 };
  if (combined.includes('hsr')) return { lat: 12.9121, lng: 77.6446 };
  if (combined.includes('delhi')) return { lat: 28.6289, lng: 77.2162 };
  if (combined.includes('mumbai')) return { lat: 18.9220, lng: 72.8347 };

  // Default Central Bengaluru offset
  return { lat: 12.9754, lng: 77.6320 };
};

/**
 * Resolves dark-store hub coordinates for a given pin code
 */
export const resolveHubCoordinates = (pinCode: string): LatLng => {
  return DARK_STORE_HUBS[pinCode]?.coordinates || DEFAULT_DARK_STORE_HUB.coordinates;
};

/**
 * Estimates travel duration in minutes based on distance and average urban vehicle speed
 */
export const estimateTravelDurationMinutes = (distanceKm: number, speedKmH: number = 22): number => {
  return Math.max(1, Math.round((distanceKm / speedKmH) * 60));
};

/**
 * Calculates Haversine spherical distance in kilometers
 * Supports both LatLng objects or scalar (lat1, lng1, lat2, lng2)
 */
export const calculateHaversineDistanceKm = (
  p1: LatLng | number,
  p2: LatLng | number,
  lat2Num?: number,
  lng2Num?: number
): number => {
  let lat1: number, lng1: number, lat2: number, lng2: number;

  if (typeof p1 === 'number' && typeof p2 === 'number' && typeof lat2Num === 'number' && typeof lng2Num === 'number') {
    lat1 = p1;
    lng1 = p2;
    lat2 = lat2Num;
    lng2 = lng2Num;
  } else {
    lat1 = (p1 as LatLng).lat;
    lng1 = (p1 as LatLng).lng;
    lat2 = (p2 as LatLng).lat;
    lng2 = (p2 as LatLng).lng;
  }

  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
};

/**
 * Calculates road route using OSRM with automatic Haversine fallback
 */
export const calculateRoadRoute = async (
  origin: LatLng,
  destination: LatLng
): Promise<RouteResult> => {
  // Try OSRM public router
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson`;
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        // OSRM returns coordinates as [lng, lat]; Leaflet expects [lat, lng]
        const coordinates: [number, number][] = route.geometry.coordinates.map(
          ([lng, lat]: [number, number]) => [lat, lng]
        );

        const distanceKm = Number((route.distance / 1000).toFixed(2));
        const durationMinutes = Math.max(1, Math.round(route.duration / 60));

        return {
          success: true,
          coordinates,
          distanceKm,
          durationMinutes,
          provider: 'osrm',
          summary: route.legs?.[0]?.summary || 'Fastest urban road route'
        };
      }
    }
  } catch (err) {
    // Graceful fallback below
  }

  // Robust Fallback: Realistic curved road approximation
  const straightDist = calculateHaversineDistanceKm(origin, destination);
  const roadDistKm = Number((straightDist * 1.35).toFixed(2)); // 1.35x urban street factor
  
  // Quick-commerce delivery speed in Indian traffic: ~22 km/h average + 2 mins buffer
  const durationMinutes = Math.max(2, Math.round((roadDistKm / 22) * 60) + 1);

  // Generate 8 realistic intermediate waypoints along the vector with slight road curvature
  const coordinates: [number, number][] = [];
  const steps = 8;
  for (let i = 0; i <= steps; i++) {
    const fraction = i / steps;
    // Add gentle sinusoidal perpendicular offset to mimic city turns
    const curvature = Math.sin(fraction * Math.PI) * 0.0018;
    const lat = origin.lat + (destination.lat - origin.lat) * fraction + curvature;
    const lng = origin.lng + (destination.lng - origin.lng) * fraction - curvature;
    coordinates.push([lat, lng]);
  }

  return {
    success: true,
    coordinates,
    distanceKm: roadDistKm,
    durationMinutes,
    provider: 'haversine_fallback',
    summary: 'Direct express route'
  };
};

/**
 * Validates GPS payload server/store side
 * Supports both object payload and positional arguments.
 * Rejects invalid coordinates, stale timestamps (>120s), clock drift, degraded accuracy (>200m),
 * and impossible speeds (>120 km/h)
 */
export const validateLocationUpdate = (
  locOrLat: {
    latitude?: number;
    lat?: number;
    longitude?: number;
    lng?: number;
    accuracy?: number;
    speed?: number;
    timestamp?: string;
  } | number,
  prevOrLng?: {
    latitude?: number;
    lat?: number;
    longitude?: number;
    lng?: number;
    updatedAt?: string;
    timestamp?: string;
  } | number,
  argTimestamp?: string,
  argAccuracy?: number,
  prevCoord?: { lat: number; lng: number } | { latitude: number; longitude: number },
  prevTimestamp?: string
): LocationValidationResult => {
  let latitude: number;
  let longitude: number;
  let timestamp: string | undefined;
  let accuracy: number | undefined;
  let previousLocation: { latitude: number; longitude: number; updatedAt: string } | undefined;

  if (typeof locOrLat === 'number') {
    latitude = locOrLat;
    longitude = typeof prevOrLng === 'number' ? prevOrLng : 0;
    timestamp = argTimestamp;
    accuracy = argAccuracy;

    if (prevCoord) {
      const prevLat = 'lat' in prevCoord ? prevCoord.lat : prevCoord.latitude;
      const prevLng = 'lng' in prevCoord ? prevCoord.lng : prevCoord.longitude;
      previousLocation = {
        latitude: prevLat,
        longitude: prevLng,
        updatedAt: prevTimestamp || new Date(Date.now() - 10000).toISOString()
      };
    }
  } else {
    latitude = locOrLat.latitude !== undefined ? locOrLat.latitude : (locOrLat.lat || 0);
    longitude = locOrLat.longitude !== undefined ? locOrLat.longitude : (locOrLat.lng || 0);
    timestamp = locOrLat.timestamp;
    accuracy = locOrLat.accuracy;

    if (prevOrLng && typeof prevOrLng === 'object') {
      const pLat = prevOrLng.latitude !== undefined ? prevOrLng.latitude : (prevOrLng.lat || 0);
      const pLng = prevOrLng.longitude !== undefined ? prevOrLng.longitude : (prevOrLng.lng || 0);
      const pTime = prevOrLng.updatedAt || prevOrLng.timestamp || new Date().toISOString();
      previousLocation = { latitude: pLat, longitude: pLng, updatedAt: pTime };
    }
  }

  // 1. Valid numbers
  if (
    typeof latitude !== 'number' ||
    typeof longitude !== 'number' ||
    isNaN(latitude) ||
    isNaN(longitude)
  ) {
    return { isValid: false, valid: false, reason: 'Latitude and longitude must be valid numbers.' };
  }

  // 2. Lat/Lng bounds
  if (latitude < -90 || latitude > 90) {
    return { isValid: false, valid: false, reason: 'Latitude out of bounds (-90 to +90 degrees).' };
  }
  if (longitude < -180 || longitude > 180) {
    return { isValid: false, valid: false, reason: 'Longitude out of bounds (-180 to +180 degrees).' };
  }

  // 3. Degraded accuracy check
  if (accuracy !== undefined && accuracy > 200) {
    return { isValid: false, valid: false, reason: `Rejected degraded accuracy (±${Math.round(accuracy)}m is too imprecise).` };
  }

  // 4. Stale timestamp / clock drift check
  if (timestamp) {
    const updateTime = new Date(timestamp).getTime();
    const now = Date.now();
    const diffSeconds = (now - updateTime) / 1000;

    if (diffSeconds > 120) {
      return { isValid: false, valid: false, reason: `Stale location update (${Math.round(diffSeconds)}s old).` };
    }
    if (diffSeconds < -60) {
      return { isValid: false, valid: false, reason: `Clock drift detected (${Math.round(Math.abs(diffSeconds))}s in the future).` };
    }
  }

  // 5. Physical speed / distance jump check
  if (previousLocation) {
    const prevTime = new Date(previousLocation.updatedAt).getTime();
    const currTime = timestamp ? new Date(timestamp).getTime() : Date.now();
    const elapsedSeconds = Math.max(1, (currTime - prevTime) / 1000);

    const distKm = calculateHaversineDistanceKm(
      { lat: previousLocation.latitude, lng: previousLocation.longitude },
      { lat: latitude, lng: longitude }
    );

    const speedKmh = (distKm / elapsedSeconds) * 3600;

    // Reject teleportation or speeds > 120 km/h for delivery riders
    if (speedKmh > 120) {
      return {
        isValid: false,
        valid: false,
        reason: `Impossible movement detected (${Math.round(speedKmh)} km/h teleportation rejected).`,
        speedKmh: Math.round(speedKmh)
      };
    }

    return { isValid: true, valid: true, speedKmh: Math.round(speedKmh) };
  }

  return { isValid: true, valid: true };
};

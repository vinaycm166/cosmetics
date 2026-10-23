import React, { createContext, useContext, useState, useEffect } from 'react';
import { store } from '../lib/store';
import { DeliveryZone } from '../types';

interface LocationContextType {
  selectedPinCode: string;
  selectedArea: string;
  isServiceable: boolean;
  activeZone?: DeliveryZone;
  estimatedDeliveryMinutes: number;
  isLocationModalOpen: boolean;
  openLocationModal: () => void;
  closeLocationModal: () => void;
  updateLocation: (pinCode: string, areaName?: string) => { serviceable: boolean; message: string };
}

const STORAGE_KEY_LOCATION = 'dew_and_go_location';

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedPinCode, setSelectedPinCode] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_LOCATION);
      if (stored) return JSON.parse(stored).pinCode;
    } catch {}
    return '560038'; // Indiranagar, Bengaluru
  });

  const [selectedArea, setSelectedArea] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_LOCATION);
      if (stored) return JSON.parse(stored).area;
    } catch {}
    return 'Indiranagar, Bengaluru';
  });

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Validate serviceability
  const serviceCheck = store.checkServiceability(selectedPinCode);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY_LOCATION,
      JSON.stringify({ pinCode: selectedPinCode, area: selectedArea })
    );
  }, [selectedPinCode, selectedArea]);

  const updateLocation = (pinCode: string, areaName?: string) => {
    const cleanPin = pinCode.trim();
    const result = store.checkServiceability(cleanPin);

    setSelectedPinCode(cleanPin);
    if (areaName) {
      setSelectedArea(areaName);
    } else if (result.zone) {
      setSelectedArea(result.zone.zoneName);
    } else {
      setSelectedArea(`PIN Code ${cleanPin}`);
    }

    if (result.serviceable) {
      return { serviceable: true, message: `Delivering in ~${result.estimatedMinutes} mins to ${cleanPin}!` };
    } else {
      return {
        serviceable: false,
        message: `PIN code ${cleanPin} is currently outside our 15-minute express delivery zone. Standard delivery unavailable.`
      };
    }
  };

  return (
    <LocationContext.Provider
      value={{
        selectedPinCode,
        selectedArea,
        isServiceable: serviceCheck.serviceable,
        activeZone: serviceCheck.zone,
        estimatedDeliveryMinutes: serviceCheck.estimatedMinutes || 15,
        isLocationModalOpen,
        openLocationModal: () => setIsLocationModalOpen(true),
        closeLocationModal: () => setIsLocationModalOpen(false),
        updateLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) throw new Error('useLocation must be used within a LocationProvider');
  return context;
};

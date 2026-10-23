import React, { useState } from 'react';
import { X, MapPin, Zap, CheckCircle2, AlertTriangle, Search } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { store } from '../../lib/store';

export const LocationModal: React.FC = () => {
  const { isLocationModalOpen, closeLocationModal, updateLocation, selectedPinCode } = useLocation();
  const [customPin, setCustomPin] = useState('');
  const [feedback, setFeedback] = useState<{ serviceable: boolean; message: string } | null>(null);

  if (!isLocationModalOpen) return null;

  const zones = store.getDeliveryZones();

  const handleCustomPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPin || customPin.trim().length !== 6) {
      setFeedback({ serviceable: false, message: 'Please enter a valid 6-digit PIN code.' });
      return;
    }

    const res = updateLocation(customPin.trim());
    setFeedback(res);
    if (res.serviceable) {
      setTimeout(() => {
        closeLocationModal();
        setFeedback(null);
      }, 1200);
    }
  };

  const handleSelectZone = (pincode: string, zoneName: string) => {
    const res = updateLocation(pincode, zoneName);
    setFeedback(res);
    setTimeout(() => {
      closeLocationModal();
      setFeedback(null);
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={closeLocationModal} 
        className="absolute inset-0 bg-[#292323]/50 backdrop-blur-[2px] transition-opacity"
      />

      <div className="relative bg-white rounded-md max-w-lg w-full p-6 shadow-2xl border border-neutral-border z-10 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-mint-50 border border-mint-200 text-mint-500 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-charcoal-900 leading-tight">
                Select Delivery Location
              </h3>
              <p className="text-xs text-muted">
                Check 15-minute hyperlocal beauty availability
              </p>
            </div>
          </div>
          <button
            onClick={closeLocationModal}
            className="p-1 rounded-md text-muted hover:bg-neutral-100 hover:text-charcoal-900 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Custom PIN Code Form */}
        <form onSubmit={handleCustomPinSubmit} className="mt-5">
          <label className="block text-[11px] font-semibold text-charcoal-900 uppercase tracking-wider mb-1.5">
            Enter 6-Digit PIN Code
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                maxLength={6}
                value={customPin}
                onChange={(e) => {
                  setCustomPin(e.target.value.replace(/\D/g, ''));
                  setFeedback(null);
                }}
                placeholder="e.g. 560038"
                className="w-full pl-9 pr-4 py-2 rounded-md border border-neutral-border text-xs font-semibold tracking-wider text-charcoal-900 focus:outline-none focus:border-brand-500 bg-white"
              />
              <Search className="w-4 h-4 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              className="dew-btn-primary !px-4 !py-2 text-xs font-semibold"
            >
              Verify
            </button>
          </div>
        </form>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`mt-3 p-3 rounded-md border text-xs flex items-start gap-2.5 ${
            feedback.serviceable
              ? 'bg-mint-50 border-mint-200 text-mint-500 font-semibold'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}>
            {feedback.serviceable ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-mint-500 mt-0.5" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            )}
            <p className="leading-relaxed">{feedback.message}</p>
          </div>
        )}

        {/* Popular Active Express Hubs */}
        <div className="mt-5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted mb-2 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-brand-500 fill-brand-500" />
            <span>Active Hyperlocal Micro-Hubs</span>
          </div>

          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {zones.map((zone) => {
              const mainPin = zone.supportedPincodes[0];
              const isSelected = selectedPinCode === mainPin;

              return (
                <button
                  key={zone.id}
                  onClick={() => handleSelectZone(mainPin, zone.zoneName)}
                  className={`w-full flex items-center justify-between p-3 rounded-md border text-left transition-colors ${
                    isSelected 
                      ? 'border-brand-500 bg-brand-50/30' 
                      : 'border-neutral-border hover:border-neutral-300 bg-white'
                  }`}
                >
                  <div>
                    <span className="font-heading font-bold text-xs text-charcoal-900 block">
                      {zone.zoneName}
                    </span>
                    <span className="text-[11px] text-muted mt-0.5 block">
                      PIN Codes: {zone.supportedPincodes.join(', ')}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-mint-500 bg-mint-50 px-2 py-0.5 rounded border border-mint-200">
                      ⚡ {zone.estimatedDeliveryMinutes} MINS
                    </span>
                    <span className="text-[10px] text-muted block mt-0.5">
                      Min order ₹{zone.minOrderValue}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-neutral-100 text-center">
          <p className="text-[11px] text-muted">
            Fast temperature-controlled dispatch directly from local micro-hubs.
          </p>
        </div>
      </div>
    </div>
  );
};

import React from 'react';

// Clean editorial campaign photography component (Replacing deprecated 3D models)
export const ThreeHeroScene: React.FC = () => {
  return (
    <div className="relative aspect-[4/3] w-full rounded-md overflow-hidden bg-neutral-100 border border-border shadow-card">
      <img
        src="https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=1200&q=80"
        alt="Dew & Go Curated Cosmetics"
        className="w-full h-full object-cover"
        loading="eager"
      />
    </div>
  );
};

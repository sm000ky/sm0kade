import React from 'react';

interface CRTOverlayProps {
  enabled: boolean;
}

export const CRTOverlay: React.FC<CRTOverlayProps> = ({ enabled }) => {
  if (!enabled) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden rounded-md">
      {/* Scanline pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.35)_50%)] bg-[length:100%_4px]" />
      
      {/* Phosphor glow & vignette */}
      <div className="absolute inset-0 shadow-[inset_0_0_60px_rgba(0,0,0,0.85)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-pink-500/5 mix-blend-overlay" />
    </div>
  );
};

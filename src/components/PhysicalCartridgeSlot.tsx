import React from 'react';
import { CARTRIDGES } from '../games/registry';
import { sounds } from '../audio/soundManager';

interface PhysicalCartridgeSlotProps {
  activeId: string;
  onSelectCartridge: (id: string) => void;
}

export const PhysicalCartridgeSlot: React.FC<PhysicalCartridgeSlotProps> = ({
  activeId,
  onSelectCartridge
}) => {
  const handleInsert = (id: string) => {
    if (id !== activeId) {
      sounds.playCartridgeSwap();
      onSelectCartridge(id);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto px-3 pt-1 select-none">
      {/* Top Cartridge Bay Rim */}
      <div className="bg-[#151722] border-t-2 border-x-2 border-[#2b2e44] rounded-t-xl px-3 pt-2 pb-1 shadow-inner flex items-end justify-around gap-2">
        {CARTRIDGES.map((cart, idx) => {
          const isInserted = cart.id === activeId;

          // Distinct retro cartridge plastic shells
          const cartStyles = [
            { bg: 'from-[#3a2800] via-[#5c3e00] to-[#241800]', border: 'border-amber-500/60', text: '#ffea00', label: 'YELLOW' },
            { bg: 'from-[#002d38] via-[#004859] to-[#001c24]', border: 'border-cyan-500/60', text: '#00f0ff', label: 'CYAN' },
            { bg: 'from-[#38001d] via-[#59002e] to-[#240013]', border: 'border-pink-500/60', text: '#ff007f', label: 'CRIMSON' }
          ][idx % 3];

          return (
            <button
              key={cart.id}
              onClick={() => handleInsert(cart.id)}
              className={`relative flex-1 group transition-all duration-200 flex flex-col items-center ${
                isInserted
                  ? 'translate-y-2.5 z-10'
                  : 'translate-y-0 hover:-translate-y-1 opacity-75 hover:opacity-100 z-0'
              }`}
              title={`Click to insert ${cart.title} cartridge`}
            >
              {/* Cartridge Grip Ridges */}
              <div className="w-10/12 h-1.5 flex justify-between px-1 mb-0.5 pointer-events-none">
                <div className="w-1 h-full bg-black/40 rounded-full" />
                <div className="w-1 h-full bg-black/40 rounded-full" />
                <div className="w-1 h-full bg-black/40 rounded-full" />
                <div className="w-1 h-full bg-black/40 rounded-full" />
              </div>

              {/* Cartridge Body */}
              <div
                className={`w-full bg-gradient-to-b ${cartStyles.bg} border-2 ${cartStyles.border} rounded-t-md p-1.5 shadow-md flex flex-col items-center`}
              >
                {/* Cartridge Label Sticker */}
                <div className="w-full bg-[#0a0b12] border border-gray-700/80 rounded px-1 py-1 text-center shadow-inner">
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-xs">{cart.icon}</span>
                    <span
                      className="text-[9px] font-pixel font-bold tracking-tight truncate"
                      style={{ color: cartStyles.text }}
                    >
                      {cart.title}
                    </span>
                  </div>
                  <div className="text-[7px] text-gray-500 font-mono flex items-center justify-between px-1 mt-0.5">
                    <span>ROM-0{idx + 1}</span>
                    <span className={isInserted ? 'text-[#00ff66] font-bold' : ''}>
                      {isInserted ? '● LOADED' : 'EJECTED'}
                    </span>
                  </div>
                </div>

                {/* Insertion Arrow Indicator */}
                <div className="text-[8px] font-pixel text-gray-400 mt-0.5">
                  {isInserted ? '▼ IN SLOT' : 'INSERT ▾'}
                </div>
              </div>

              {/* Active Golden Contact Pins */}
              {isInserted && (
                <div className="w-11/12 h-1 bg-gradient-to-r from-amber-600 via-yellow-300 to-amber-600 shadow-[0_0_8px_#ffea00]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

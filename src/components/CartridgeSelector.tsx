import React from 'react';
import { CARTRIDGES } from '../games/registry';
import { sounds } from '../audio/soundManager';

interface CartridgeSelectorProps {
  activeId: string;
  onSelectCartridge: (id: string) => void;
}

export const CartridgeSelector: React.FC<CartridgeSelectorProps> = ({
  activeId,
  onSelectCartridge
}) => {
  const handleSelect = (id: string) => {
    if (id !== activeId) {
      sounds.playCartridgeSwap();
      onSelectCartridge(id);
    }
  };

  return (
    <div className="w-full bg-[#0d0e1a] border-t border-b border-[#25283f] px-2 py-1.5 shadow-inner">
      <div className="max-w-xl mx-auto flex items-center justify-between gap-1.5">
        {CARTRIDGES.map((cart, index) => {
          const isActive = cart.id === activeId;
          return (
            <button
              key={cart.id}
              onClick={() => handleSelect(cart.id)}
              className={`relative flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md transition-all duration-150 border text-left overflow-hidden ${
                isActive
                  ? 'bg-gradient-to-b from-[#1f2238] to-[#121322] text-white border-[#00f0ff] shadow-neon-cyan scale-102'
                  : 'bg-gradient-to-b from-[#141524] to-[#0c0d16] text-gray-400 border-gray-800 hover:border-gray-600 hover:text-gray-200'
              }`}
            >
              {/* Active LED indicator */}
              <div
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                  isActive ? 'bg-[#00ff66] shadow-[0_0_8px_#00ff66] animate-pulse' : 'bg-gray-700'
                }`}
              />

              {/* Slot Number & Icon */}
              <div className="flex items-center gap-1 min-w-0">
                <span className="text-xs shrink-0">{cart.icon}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] font-pixel text-gray-500">MVS-{index + 1}</span>
                    <span
                      className="text-[9px] font-pixel truncate tracking-wide font-bold"
                      style={{ color: isActive ? cart.themeColor : undefined }}
                    >
                      {cart.title}
                    </span>
                  </div>
                </div>
              </div>

              {/* Top Bezel Highlight */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/15" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

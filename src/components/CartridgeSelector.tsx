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
      sounds.playCoin();
      onSelectCartridge(id);
    }
  };

  return (
    <div className="w-full bg-[#0a0b12] border-t border-b border-[#242638] px-3 py-2">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-pixel whitespace-nowrap mr-2">
          <span className="text-[#00f0ff] animate-pulse">▶</span>
          <span className="text-[9px]">CARTRIDGE SLOT:</span>
        </div>

        <div className="flex items-center gap-2">
          {CARTRIDGES.map((cart) => {
            const isActive = cart.id === activeId;
            return (
              <button
                key={cart.id}
                onClick={() => handleSelect(cart.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded border text-xs transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#181a28] text-white border-[#00f0ff] shadow-neon-cyan scale-102 font-bold'
                    : 'bg-[#0f101a] text-gray-400 border-[#2a2b3d] hover:border-gray-500 hover:text-gray-200'
                }`}
              >
                <span className="text-sm">{cart.icon}</span>
                <div className="text-left font-mono">
                  <div className="text-[10px] font-pixel leading-tight" style={{ color: isActive ? cart.themeColor : undefined }}>
                    {cart.title}
                  </div>
                  <div className="text-[9px] text-gray-500">{cart.genre}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

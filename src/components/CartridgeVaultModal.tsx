import React from 'react';
import { CARTRIDGES } from '../games/registry';
import { sounds } from '../audio/soundManager';
import { X, Play, Sparkles } from 'lucide-react';

interface CartridgeVaultModalProps {
  isOpen: boolean;
  activeId: string;
  onSelectCartridge: (id: string) => void;
  onClose: () => void;
}

export const CartridgeVaultModal: React.FC<CartridgeVaultModalProps> = ({
  isOpen,
  activeId,
  onSelectCartridge,
  onClose
}) => {
  if (!isOpen) return null;

  const handleSelect = (id: string) => {
    sounds.playCartridgeSwap();
    onSelectCartridge(id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-fadeIn select-none">
      <div className="relative w-full max-w-lg bg-[#0c0d18] border-2 border-[#00f0ff] rounded-xl shadow-neon-cyan overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-[#141626] px-4 py-3 border-b border-[#2a2d44] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">🕹️</span>
            <div>
              <h3 className="font-pixel text-xs text-[#00f0ff] tracking-wider">
                CARTRIDGE VAULT // 6-IN-1 MVS
              </h3>
              <p className="text-[10px] text-gray-400 font-mono">
                Select a game cartridge to load into the console
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playSwitchClick();
              onClose();
            }}
            className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Cartridges Grid */}
        <div className="p-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CARTRIDGES.map((cart, idx) => {
            const isCurrent = cart.id === activeId;
            return (
              <div
                key={cart.id}
                onClick={() => handleSelect(cart.id)}
                className={`relative cursor-pointer p-3 rounded-lg border-2 transition-all group flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-[#181b2c] border-[#00f0ff] shadow-neon-cyan'
                    : 'bg-[#10121d] border-[#222438] hover:border-gray-500 hover:bg-[#151726]'
                }`}
              >
                {/* Top Badge: ROM Slot & Status */}
                <div className="flex items-center justify-between text-[9px] font-pixel mb-2">
                  <span className="text-gray-500">ROM-0{idx + 1}</span>
                  {isCurrent ? (
                    <span className="px-1.5 py-0.5 bg-[#00ff66]/20 text-[#00ff66] border border-[#00ff66]/40 rounded flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00ff66] animate-ping" />
                      LOADED
                    </span>
                  ) : (
                    <span className="text-gray-500 group-hover:text-gray-300">
                      STANDBY
                    </span>
                  )}
                </div>

                {/* Game Title & Icon */}
                <div className="flex items-start gap-2.5 mb-2">
                  <div className="w-10 h-10 rounded bg-[#191b29] border border-gray-700 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                    {cart.icon}
                  </div>
                  <div className="min-w-0">
                    <h4
                      className="font-pixel text-xs tracking-wide font-bold truncate"
                      style={{ color: cart.themeColor }}
                    >
                      {cart.title}
                    </h4>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                      {cart.genre}
                    </p>
                  </div>
                </div>

                {/* Subtitle / Engine Info */}
                <p className="text-[10px] text-gray-400 font-mono italic line-clamp-1 mb-3">
                  "{cart.subtitle}"
                </p>

                {/* Insert / Play Action Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(cart.id);
                  }}
                  className={`w-full py-1.5 rounded font-pixel text-[10px] flex items-center justify-center gap-1.5 transition-all ${
                    isCurrent
                      ? 'bg-[#00f0ff] text-black font-bold shadow-neon-cyan'
                      : 'bg-[#212438] group-hover:bg-[#2b2f4a] text-gray-300 group-hover:text-white border border-gray-700'
                  }`}
                >
                  <Play size={11} className={isCurrent ? 'fill-black' : ''} />
                  <span>{isCurrent ? 'RESUME PLAY' : 'INSERT CART'}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="bg-[#10111e] px-4 py-2 border-t border-[#222438] flex items-center justify-between text-[10px] font-mono text-gray-500">
          <div className="flex items-center gap-1">
            <Sparkles size={12} className="text-amber-400" />
            <span>Tip: Press [SELECT] on the controller to quick-cycle</span>
          </div>
          <span>6 Active Cartridges</span>
        </div>
      </div>
    </div>
  );
};

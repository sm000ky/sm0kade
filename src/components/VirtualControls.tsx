import React from 'react';
import { InputState } from '../games/types';

interface VirtualControlsProps {
  onInput: (keys: Partial<InputState>) => void;
  onActionClick: (action: string) => void;
  instructions: {
    desktop: string;
    mobile: string;
  };
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({
  onInput,
  onActionClick,
  instructions
}) => {
  const handleTouch = (key: keyof InputState, value: boolean) => {
    onInput({ [key]: value });
  };

  return (
    <div className="w-full bg-[#0d0e17] border-t-2 border-[#2a2b3d] p-3 select-none">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Instructions Ticker */}
        <div className="hidden md:flex flex-col gap-1 text-left font-mono">
          <div className="text-[10px] text-gray-400 font-pixel flex items-center gap-1.5">
            <span className="text-[#ffea00]">⌨️ CONTROLS:</span>
            <span className="text-gray-200">{instructions.desktop}</span>
          </div>
          <div className="text-[9px] text-gray-500">
            [P] Pause • [M] Mute Sound • [Space] Action A • [Enter] Insert Coin
          </div>
        </div>

        {/* Mobile Control Deck (D-Pad + Action Buttons) */}
        <div className="flex md:hidden items-center justify-between w-full max-w-sm mx-auto px-2 py-1">
          {/* 4-Way D-Pad */}
          <div className="relative w-32 h-32 bg-[#141522] rounded-full border-2 border-[#2b2d42] flex items-center justify-center shadow-inner">
            {/* Center Hub */}
            <div className="absolute w-10 h-10 bg-[#1b1d2e] rounded-full border border-gray-700" />

            {/* UP */}
            <button
              onTouchStart={(e) => { e.preventDefault(); handleTouch('up', true); }}
              onTouchEnd={(e) => { e.preventDefault(); handleTouch('up', false); }}
              onMouseDown={() => handleTouch('up', true)}
              onMouseUp={() => handleTouch('up', false)}
              className="absolute top-1 w-10 h-10 bg-[#25283d] active:bg-[#00f0ff] active:text-black text-gray-300 rounded-t flex items-center justify-center font-pixel text-xs"
            >
              ▲
            </button>

            {/* DOWN */}
            <button
              onTouchStart={(e) => { e.preventDefault(); handleTouch('down', true); }}
              onTouchEnd={(e) => { e.preventDefault(); handleTouch('down', false); }}
              onMouseDown={() => handleTouch('down', true)}
              onMouseUp={() => handleTouch('down', false)}
              className="absolute bottom-1 w-10 h-10 bg-[#25283d] active:bg-[#00f0ff] active:text-black text-gray-300 rounded-b flex items-center justify-center font-pixel text-xs"
            >
              ▼
            </button>

            {/* LEFT */}
            <button
              onTouchStart={(e) => { e.preventDefault(); handleTouch('left', true); }}
              onTouchEnd={(e) => { e.preventDefault(); handleTouch('left', false); }}
              onMouseDown={() => handleTouch('left', true)}
              onMouseUp={() => handleTouch('left', false)}
              className="absolute left-1 w-10 h-10 bg-[#25283d] active:bg-[#00f0ff] active:text-black text-gray-300 rounded-l flex items-center justify-center font-pixel text-xs"
            >
              ◀
            </button>

            {/* RIGHT */}
            <button
              onTouchStart={(e) => { e.preventDefault(); handleTouch('right', true); }}
              onTouchEnd={(e) => { e.preventDefault(); handleTouch('right', false); }}
              onMouseDown={() => handleTouch('right', true)}
              onMouseUp={() => handleTouch('right', false)}
              className="absolute right-1 w-10 h-10 bg-[#25283d] active:bg-[#00f0ff] active:text-black text-gray-300 rounded-r flex items-center justify-center font-pixel text-xs"
            >
              ▶
            </button>
          </div>

          {/* Action Buttons (A & B) */}
          <div className="flex items-center gap-4">
            {/* Button B */}
            <div className="flex flex-col items-center gap-1">
              <button
                onTouchStart={(e) => { e.preventDefault(); handleTouch('actionB', true); onActionClick('actionB'); }}
                onTouchEnd={(e) => { e.preventDefault(); handleTouch('actionB', false); }}
                onMouseDown={() => { handleTouch('actionB', true); onActionClick('actionB'); }}
                onMouseUp={() => handleTouch('actionB', false)}
                className="w-13 h-13 rounded-full bg-[#1e2030] border-2 border-amber-500/60 active:bg-amber-400 active:text-black text-amber-400 font-pixel text-sm flex items-center justify-center shadow-lg active:scale-95 transition-transform"
              >
                B
              </button>
              <span className="text-[8px] font-pixel text-gray-500">SPEED</span>
            </div>

            {/* Button A */}
            <div className="flex flex-col items-center gap-1">
              <button
                onTouchStart={(e) => { e.preventDefault(); handleTouch('actionA', true); onActionClick('actionA'); }}
                onTouchEnd={(e) => { e.preventDefault(); handleTouch('actionA', false); }}
                onMouseDown={() => { handleTouch('actionA', true); onActionClick('actionA'); }}
                onMouseUp={() => handleTouch('actionA', false)}
                className="w-14 h-14 rounded-full bg-[#ff0055] border-2 border-white/80 active:bg-white active:text-[#ff0055] text-white font-pixel text-base flex items-center justify-center shadow-neon-pink active:scale-95 transition-transform"
              >
                A
              </button>
              <span className="text-[8px] font-pixel text-[#ff0055]">ACTION</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
  const handleDirTouch = (dir: 'up' | 'down' | 'left' | 'right', active: boolean) => {
    if (active) {
      // Set the active direction and clear the others
      onInput({
        up: dir === 'up',
        down: dir === 'down',
        left: dir === 'left',
        right: dir === 'right'
      });
    } else {
      onInput({ [dir]: false });
    }
  };

  const handleActionTouch = (actionKey: 'actionA' | 'actionB', active: boolean) => {
    onInput({ [actionKey]: active });
    if (active) {
      onActionClick(actionKey);
    }
  };

  return (
    <div className="w-full bg-gradient-to-b from-[#181926] via-[#12131f] to-[#0a0b12] border-t-4 border-[#2c2f48] shadow-[0_-10px_25px_rgba(0,0,0,0.8)] px-3 py-2 select-none shrink-0">
      <div className="max-w-xl mx-auto flex items-center justify-between gap-2">
        {/* LEFT: Classic Sanwa-Style Cross D-Pad */}
        <div className="relative w-32 h-32 flex items-center justify-center">
          {/* Metallic Outer Chassis Ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#3a3d58] to-[#12131c] p-1 shadow-[0_4px_12px_rgba(0,0,0,0.9)] border border-gray-600/40">
            <div className="w-full h-full rounded-full bg-[#181a26] shadow-inner flex items-center justify-center">
              {/* Brushed Texture Accent Ring */}
              <div className="w-24 h-24 rounded-full border border-gray-700/60" />
            </div>
          </div>

          {/* UP Button */}
          <button
            onTouchStart={(e) => { e.preventDefault(); handleDirTouch('up', true); }}
            onTouchEnd={(e) => { e.preventDefault(); handleDirTouch('up', false); }}
            onMouseDown={() => handleDirTouch('up', true)}
            onMouseUp={() => handleDirTouch('up', false)}
            className="absolute top-1 w-10 h-10 bg-gradient-to-b from-[#32364e] to-[#202334] active:from-[#00f0ff] active:to-[#00a8b3] rounded-t-md border-t-2 border-x border-gray-500/80 active:border-[#00f0ff] flex items-center justify-center text-gray-300 active:text-black font-pixel text-xs shadow-md active:shadow-neon-cyan transition-transform active:scale-95"
            style={{ touchAction: 'none' }}
          >
            ▲
          </button>

          {/* DOWN Button */}
          <button
            onTouchStart={(e) => { e.preventDefault(); handleDirTouch('down', true); }}
            onTouchEnd={(e) => { e.preventDefault(); handleDirTouch('down', false); }}
            onMouseDown={() => handleDirTouch('down', true)}
            onMouseUp={() => handleDirTouch('down', false)}
            className="absolute bottom-1 w-10 h-10 bg-gradient-to-b from-[#202334] to-[#181926] active:from-[#00f0ff] active:to-[#00a8b3] rounded-b-md border-b-2 border-x border-gray-600/80 active:border-[#00f0ff] flex items-center justify-center text-gray-300 active:text-black font-pixel text-xs shadow-md active:shadow-neon-cyan transition-transform active:scale-95"
            style={{ touchAction: 'none' }}
          >
            ▼
          </button>

          {/* LEFT Button */}
          <button
            onTouchStart={(e) => { e.preventDefault(); handleDirTouch('left', true); }}
            onTouchEnd={(e) => { e.preventDefault(); handleDirTouch('left', false); }}
            onMouseDown={() => handleDirTouch('left', true)}
            onMouseUp={() => handleDirTouch('left', false)}
            className="absolute left-1 w-10 h-10 bg-gradient-to-r from-[#202334] to-[#2b2f44] active:from-[#00f0ff] active:to-[#00a8b3] rounded-l-md border-l-2 border-y border-gray-500/80 active:border-[#00f0ff] flex items-center justify-center text-gray-300 active:text-black font-pixel text-xs shadow-md active:shadow-neon-cyan transition-transform active:scale-95"
            style={{ touchAction: 'none' }}
          >
            ◀
          </button>

          {/* RIGHT Button */}
          <button
            onTouchStart={(e) => { e.preventDefault(); handleDirTouch('right', true); }}
            onTouchEnd={(e) => { e.preventDefault(); handleDirTouch('right', false); }}
            onMouseDown={() => handleDirTouch('right', true)}
            onMouseUp={() => handleDirTouch('right', false)}
            className="absolute right-1 w-10 h-10 bg-gradient-to-l from-[#202334] to-[#2b2f44] active:from-[#00f0ff] active:to-[#00a8b3] rounded-r-md border-r-2 border-y border-gray-500/80 active:border-[#00f0ff] flex items-center justify-center text-gray-300 active:text-black font-pixel text-xs shadow-md active:shadow-neon-cyan transition-transform active:scale-95"
            style={{ touchAction: 'none' }}
          >
            ▶
          </button>

          {/* Center Convex Hub */}
          <div className="absolute w-8 h-8 rounded-full bg-gradient-to-b from-[#181924] to-[#0e0f17] border border-gray-600/50 shadow-inner flex items-center justify-center pointer-events-none">
            <div className="w-3 h-3 rounded-full bg-black/80" />
          </div>
        </div>

        {/* CENTER: Arcade Decal / Instructions Badge */}
        <div className="hidden sm:flex flex-col items-center justify-center text-center font-pixel text-[9px] text-gray-400">
          <div className="text-[#00f0ff] tracking-widest text-[10px] mb-0.5">SM0KADE DECK</div>
          <div className="text-gray-500 text-[8px] max-w-[140px] leading-tight">
            {instructions.mobile}
          </div>
        </div>

        {/* RIGHT: Classic Convex Japanese Candy-Cab Buttons */}
        <div className="flex items-center gap-4 pr-1">
          {/* BUTTON B (Amber / Boost) */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onTouchStart={(e) => { e.preventDefault(); handleActionTouch('actionB', true); }}
              onTouchEnd={(e) => { e.preventDefault(); handleActionTouch('actionB', false); }}
              onMouseDown={() => handleActionTouch('actionB', true)}
              onMouseUp={() => handleActionTouch('actionB', false)}
              className="relative w-14 h-14 rounded-full bg-gradient-to-b from-[#ffaa00] via-[#d48800] to-[#8a5500] border-2 border-amber-300/80 p-0.5 shadow-[0_5px_15px_rgba(255,170,0,0.4)] active:scale-92 active:translate-y-1 transition-all"
              style={{ touchAction: 'none' }}
            >
              {/* Glossy top specular reflection */}
              <div className="w-full h-full rounded-full bg-gradient-to-b from-[#ffbb33] to-[#cc8800] flex items-center justify-center font-pixel text-sm text-black font-bold shadow-inner">
                <span className="drop-shadow-sm">B</span>
                <div className="absolute top-1 left-2 w-8 h-3 rounded-full bg-white/30 blur-[1px]" />
              </div>
            </button>
            <span className="text-[8px] font-pixel text-amber-400 tracking-wider">BOOST</span>
          </div>

          {/* BUTTON A (Crimson / Action) */}
          <div className="flex flex-col items-center gap-1.5">
            <button
              onTouchStart={(e) => { e.preventDefault(); handleActionTouch('actionA', true); }}
              onTouchEnd={(e) => { e.preventDefault(); handleActionTouch('actionA', false); }}
              onMouseDown={() => handleActionTouch('actionA', true)}
              onMouseUp={() => handleActionTouch('actionA', false)}
              className="relative w-16 h-16 rounded-full bg-gradient-to-b from-[#ff0055] via-[#d60047] to-[#8a002e] border-2 border-pink-300/90 p-0.5 shadow-[0_6px_20px_rgba(255,0,85,0.6)] active:scale-92 active:translate-y-1 transition-all"
              style={{ touchAction: 'none' }}
            >
              {/* Glossy top specular reflection */}
              <div className="w-full h-full rounded-full bg-gradient-to-b from-[#ff1a6b] to-[#c70041] flex items-center justify-center font-pixel text-base text-white font-bold shadow-inner">
                <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">A</span>
                <div className="absolute top-1.5 left-2.5 w-10 h-4 rounded-full bg-white/35 blur-[1px]" />
              </div>
            </button>
            <span className="text-[8px] font-pixel text-[#ff0055] tracking-wider">ACTION</span>
          </div>
        </div>
      </div>
    </div>
  );
};

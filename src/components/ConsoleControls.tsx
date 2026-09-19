import React from 'react';
import { ConsolePreset } from '../types/console';

interface ConsoleControlsProps {
  preset: ConsolePreset;
  onDirTouch: (dir: 'up' | 'down' | 'left' | 'right', active: boolean) => void;
  onActionTouch: (action: 'actionA' | 'actionB', active: boolean) => void;
  onSelect: () => void;
  onStart: () => void;
}

export const ConsoleControls: React.FC<ConsoleControlsProps> = ({
  preset,
  onDirTouch,
  onActionTouch,
  onSelect,
  onStart
}) => {
  // Render D-Pad based on preset.dpadShape: 'cross' | 'disc' | 'separate' | 'diamond'
  const renderDpad = () => {
    if (preset.dpadShape === 'disc') {
      // Sega Genesis / Saturn Style Concave Rocker Disc
      return (
        <div className="relative w-28 h-28 flex items-center justify-center">
          {/* Outer Deep Bezel */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#111217] to-[#252838] border-2 border-gray-600/70 shadow-[0_4px_12px_rgba(0,0,0,0.9)] p-1">
            <div className="w-full h-full rounded-full bg-gradient-to-b from-[#1e202e] to-[#0d0e14] shadow-inner" />
          </div>

          {/* Directional Disc Buttons */}
          <button
            onTouchStart={(e) => { e.preventDefault(); onDirTouch('up', true); }}
            onTouchEnd={(e) => { e.preventDefault(); onDirTouch('up', false); }}
            onMouseDown={() => onDirTouch('up', true)}
            onMouseUp={() => onDirTouch('up', false)}
            className="absolute top-1 w-10 h-8 rounded-t-full text-cyan-300 font-pixel text-[10px] active:scale-95 flex items-center justify-center"
            style={{ touchAction: 'none' }}
          >
            ▲
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); onDirTouch('down', true); }}
            onTouchEnd={(e) => { e.preventDefault(); onDirTouch('down', false); }}
            onMouseDown={() => onDirTouch('down', true)}
            onMouseUp={() => onDirTouch('down', false)}
            className="absolute bottom-1 w-10 h-8 rounded-b-full text-cyan-300 font-pixel text-[10px] active:scale-95 flex items-center justify-center"
            style={{ touchAction: 'none' }}
          >
            ▼
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); onDirTouch('left', true); }}
            onTouchEnd={(e) => { e.preventDefault(); onDirTouch('left', false); }}
            onMouseDown={() => onDirTouch('left', true)}
            onMouseUp={() => onDirTouch('left', false)}
            className="absolute left-1 w-8 h-10 rounded-l-full text-cyan-300 font-pixel text-[10px] active:scale-95 flex items-center justify-center"
            style={{ touchAction: 'none' }}
          >
            ◀
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); onDirTouch('right', true); }}
            onTouchEnd={(e) => { e.preventDefault(); onDirTouch('right', false); }}
            onMouseDown={() => onDirTouch('right', true)}
            onMouseUp={() => onDirTouch('right', false)}
            className="absolute right-1 w-8 h-10 rounded-r-full text-cyan-300 font-pixel text-[10px] active:scale-95 flex items-center justify-center"
            style={{ touchAction: 'none' }}
          >
            ▶
          </button>

          {/* Concave Center Thumb Pivot */}
          <div className="w-9 h-9 rounded-full bg-[#111218] border border-gray-700/80 shadow-inner flex items-center justify-center pointer-events-none">
            <div className="w-3 h-3 rounded-full bg-black/70" />
          </div>
        </div>
      );
    }

    if (preset.dpadShape === 'separate') {
      // Cyberdeck / PlayStation Split 4-Button Cluster
      return (
        <div className="relative w-28 h-28 flex items-center justify-center">
          <button
            onTouchStart={(e) => { e.preventDefault(); onDirTouch('up', true); }}
            onTouchEnd={(e) => { e.preventDefault(); onDirTouch('up', false); }}
            onMouseDown={() => onDirTouch('up', true)}
            onMouseUp={() => onDirTouch('up', false)}
            className="absolute top-1 w-8 h-8 rounded-full bg-gradient-to-b from-[#0e1628] to-[#050a14] border-2 border-[#00f0ff]/60 active:border-[#00f0ff] text-[#00f0ff] active:bg-[#00f0ff] active:text-black font-pixel text-xs shadow-neon-cyan flex items-center justify-center"
            style={{ touchAction: 'none' }}
          >
            ▲
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); onDirTouch('down', true); }}
            onTouchEnd={(e) => { e.preventDefault(); onDirTouch('down', false); }}
            onMouseDown={() => onDirTouch('down', true)}
            onMouseUp={() => onDirTouch('down', false)}
            className="absolute bottom-1 w-8 h-8 rounded-full bg-gradient-to-b from-[#0e1628] to-[#050a14] border-2 border-[#00f0ff]/60 active:border-[#00f0ff] text-[#00f0ff] active:bg-[#00f0ff] active:text-black font-pixel text-xs shadow-neon-cyan flex items-center justify-center"
            style={{ touchAction: 'none' }}
          >
            ▼
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); onDirTouch('left', true); }}
            onTouchEnd={(e) => { e.preventDefault(); onDirTouch('left', false); }}
            onMouseDown={() => onDirTouch('left', true)}
            onMouseUp={() => onDirTouch('left', false)}
            className="absolute left-1 w-8 h-8 rounded-full bg-gradient-to-b from-[#0e1628] to-[#050a14] border-2 border-[#00f0ff]/60 active:border-[#00f0ff] text-[#00f0ff] active:bg-[#00f0ff] active:text-black font-pixel text-xs shadow-neon-cyan flex items-center justify-center"
            style={{ touchAction: 'none' }}
          >
            ◀
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); onDirTouch('right', true); }}
            onTouchEnd={(e) => { e.preventDefault(); onDirTouch('right', false); }}
            onMouseDown={() => onDirTouch('right', true)}
            onMouseUp={() => onDirTouch('right', false)}
            className="absolute right-1 w-8 h-8 rounded-full bg-gradient-to-b from-[#0e1628] to-[#050a14] border-2 border-[#00f0ff]/60 active:border-[#00f0ff] text-[#00f0ff] active:bg-[#00f0ff] active:text-black font-pixel text-xs shadow-neon-cyan flex items-center justify-center"
            style={{ touchAction: 'none' }}
          >
            ▶
          </button>
          <div className="w-4 h-4 rounded-full bg-[#03060a] border border-gray-700/60 pointer-events-none" />
        </div>
      );
    }

    if (preset.dpadShape === 'diamond') {
      // FranXX Cockpit Angular Diamond D-Pad
      return (
        <div className="relative w-28 h-28 flex items-center justify-center">
          <div className="absolute inset-2 rounded-xl rotate-45 bg-[#200309] border-2 border-[#ff0055]/50 shadow-[0_0_15px_rgba(255,0,85,0.3)]" />
          <button
            onTouchStart={(e) => { e.preventDefault(); onDirTouch('up', true); }}
            onTouchEnd={(e) => { e.preventDefault(); onDirTouch('up', false); }}
            onMouseDown={() => onDirTouch('up', true)}
            onMouseUp={() => onDirTouch('up', false)}
            className="absolute top-1 w-9 h-8 bg-gradient-to-b from-[#4a0618] to-[#25020c] active:from-[#ff0055] active:to-[#990033] border-t-2 border-x border-[#ff0055] text-[#ff7aa3] active:text-white rounded-t font-pixel text-xs flex items-center justify-center shadow"
            style={{ touchAction: 'none' }}
          >
            ▲
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); onDirTouch('down', true); }}
            onTouchEnd={(e) => { e.preventDefault(); onDirTouch('down', false); }}
            onMouseDown={() => onDirTouch('down', true)}
            onMouseUp={() => onDirTouch('down', false)}
            className="absolute bottom-1 w-9 h-8 bg-gradient-to-b from-[#25020c] to-[#150106] active:from-[#ff0055] active:to-[#990033] border-b-2 border-x border-[#ff0055] text-[#ff7aa3] active:text-white rounded-b font-pixel text-xs flex items-center justify-center shadow"
            style={{ touchAction: 'none' }}
          >
            ▼
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); onDirTouch('left', true); }}
            onTouchEnd={(e) => { e.preventDefault(); onDirTouch('left', false); }}
            onMouseDown={() => onDirTouch('left', true)}
            onMouseUp={() => onDirTouch('left', false)}
            className="absolute left-1 w-8 h-9 bg-gradient-to-r from-[#380410] to-[#22020a] active:from-[#ff0055] active:to-[#990033] border-l-2 border-y border-[#ff0055] text-[#ff7aa3] active:text-white rounded-l font-pixel text-xs flex items-center justify-center shadow"
            style={{ touchAction: 'none' }}
          >
            ◀
          </button>
          <button
            onTouchStart={(e) => { e.preventDefault(); onDirTouch('right', true); }}
            onTouchEnd={(e) => { e.preventDefault(); onDirTouch('right', false); }}
            onMouseDown={() => onDirTouch('right', true)}
            onMouseUp={() => onDirTouch('right', false)}
            className="absolute right-1 w-8 h-9 bg-gradient-to-l from-[#380410] to-[#22020a] active:from-[#ff0055] active:to-[#990033] border-r-2 border-y border-[#ff0055] text-[#ff7aa3] active:text-white rounded-r font-pixel text-xs flex items-center justify-center shadow"
            style={{ touchAction: 'none' }}
          >
            ▶
          </button>
          <div className="w-5 h-5 rotate-45 bg-[#120005] border border-[#ff0055]/40 pointer-events-none" />
        </div>
      );
    }

    // Default: Classic Cross D-Pad (DMG / Famicom / Obsidian)
    return (
      <div className="relative w-28 h-28 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#2b2d42] to-[#12131c] p-1 shadow-md border border-gray-700/60 flex items-center justify-center">
          <div className="w-full h-full rounded-full bg-[#161724]" />
        </div>

        <button
          onTouchStart={(e) => { e.preventDefault(); onDirTouch('up', true); }}
          onTouchEnd={(e) => { e.preventDefault(); onDirTouch('up', false); }}
          onMouseDown={() => onDirTouch('up', true)}
          onMouseUp={() => onDirTouch('up', false)}
          className={`absolute top-0.5 w-9 h-9 bg-gradient-to-b ${preset.dpadBg} ${preset.dpadActiveBg} border-t border-x ${preset.dpadBorder} ${preset.dpadTextColor} flex items-center justify-center font-pixel text-[11px] rounded-t-md shadow-sm active:scale-95`}
          style={{ touchAction: 'none' }}
        >
          ▲
        </button>
        <button
          onTouchStart={(e) => { e.preventDefault(); onDirTouch('down', true); }}
          onTouchEnd={(e) => { e.preventDefault(); onDirTouch('down', false); }}
          onMouseDown={() => onDirTouch('down', true)}
          onMouseUp={() => onDirTouch('down', false)}
          className={`absolute bottom-0.5 w-9 h-9 bg-gradient-to-b ${preset.dpadBg} ${preset.dpadActiveBg} border-b border-x ${preset.dpadBorder} ${preset.dpadTextColor} flex items-center justify-center font-pixel text-[11px] rounded-b-md shadow-sm active:scale-95`}
          style={{ touchAction: 'none' }}
        >
          ▼
        </button>
        <button
          onTouchStart={(e) => { e.preventDefault(); onDirTouch('left', true); }}
          onTouchEnd={(e) => { e.preventDefault(); onDirTouch('left', false); }}
          onMouseDown={() => onDirTouch('left', true)}
          onMouseUp={() => onDirTouch('left', false)}
          className={`absolute left-0.5 w-9 h-9 bg-gradient-to-r ${preset.dpadBg} ${preset.dpadActiveBg} border-l border-y ${preset.dpadBorder} ${preset.dpadTextColor} flex items-center justify-center font-pixel text-[11px] rounded-l-md shadow-sm active:scale-95`}
          style={{ touchAction: 'none' }}
        >
          ◀
        </button>
        <button
          onTouchStart={(e) => { e.preventDefault(); onDirTouch('right', true); }}
          onTouchEnd={(e) => { e.preventDefault(); onDirTouch('right', false); }}
          onMouseDown={() => onDirTouch('right', true)}
          onMouseUp={() => onDirTouch('right', false)}
          className={`absolute right-0.5 w-9 h-9 bg-gradient-to-l ${preset.dpadBg} ${preset.dpadActiveBg} border-r border-y ${preset.dpadBorder} ${preset.dpadTextColor} flex items-center justify-center font-pixel text-[11px] rounded-r-md shadow-sm active:scale-95`}
          style={{ touchAction: 'none' }}
        >
          ▶
        </button>
        <div className="absolute w-7 h-7 rounded-full bg-[#131420] border border-gray-600/40 pointer-events-none" />
      </div>
    );
  };

  // Render Action Buttons based on preset.buttonShape: 'circle' | 'square' | 'diamond' | 'hexagon'
  const renderActionButtons = () => {
    if (preset.buttonShape === 'diamond') {
      // Zero Two Cockpit Diamond Buttons
      return (
        <div className="flex items-center gap-4 pr-1">
          {/* Button B */}
          <div className="flex flex-col items-center gap-1 translate-y-3">
            <button
              onTouchStart={(e) => { e.preventDefault(); onActionTouch('actionB', true); }}
              onTouchEnd={(e) => { e.preventDefault(); onActionTouch('actionB', false); }}
              onMouseDown={() => onActionTouch('actionB', true)}
              onMouseUp={() => onActionTouch('actionB', false)}
              className="relative w-12 h-12 bg-gradient-to-b from-[#ff7aa3] to-[#cc4c74] border-2 border-pink-200 rotate-45 rounded-md shadow-[0_0_15px_rgba(255,122,163,0.5)] active:scale-90 active:translate-y-1 transition-all flex items-center justify-center"
              style={{ touchAction: 'none' }}
            >
              <span className="-rotate-45 font-pixel text-xs text-black font-bold">B</span>
              <div className="absolute top-1 left-1 w-5 h-2 bg-white/40 -rotate-45 blur-[0.5px]" />
            </button>
            <span className="text-[8px] font-pixel text-pink-300">BOOST</span>
          </div>

          {/* Button A */}
          <div className="flex flex-col items-center gap-1 -translate-y-1">
            <button
              onTouchStart={(e) => { e.preventDefault(); onActionTouch('actionA', true); }}
              onTouchEnd={(e) => { e.preventDefault(); onActionTouch('actionA', false); }}
              onMouseDown={() => onActionTouch('actionA', true)}
              onMouseUp={() => onActionTouch('actionA', false)}
              className="relative w-14 h-14 bg-gradient-to-b from-[#ff0055] to-[#990033] border-2 border-white rotate-45 rounded-lg shadow-[0_0_20px_rgba(255,0,85,0.7)] active:scale-90 active:translate-y-1 transition-all flex items-center justify-center"
              style={{ touchAction: 'none' }}
            >
              <span className="-rotate-45 font-pixel text-sm text-white font-bold drop-shadow">A</span>
              <div className="absolute top-1.5 left-1.5 w-6 h-2.5 bg-white/50 -rotate-45 blur-[0.5px]" />
            </button>
            <span className="text-[8px] font-pixel text-[#ff0055]">ACTION</span>
          </div>
        </div>
      );
    }

    if (preset.buttonShape === 'square') {
      // Atari / Famicom Square Push Buttons
      return (
        <div className="flex items-center gap-3 pr-1">
          {/* Button B */}
          <div className="flex flex-col items-center gap-1 translate-y-3">
            <button
              onTouchStart={(e) => { e.preventDefault(); onActionTouch('actionB', true); }}
              onTouchEnd={(e) => { e.preventDefault(); onActionTouch('actionB', false); }}
              onMouseDown={() => onActionTouch('actionB', true)}
              onMouseUp={() => onActionTouch('actionB', false)}
              className={`relative w-12 h-12 bg-gradient-to-b ${preset.btnBBg} border-2 ${preset.btnBBorder} rounded-xs shadow-md active:scale-90 active:translate-y-1 transition-all flex items-center justify-center font-pixel text-xs font-bold ${preset.btnBText}`}
              style={{ touchAction: 'none' }}
            >
              <span>B</span>
              <div className="absolute top-0.5 left-0.5 right-0.5 h-1.5 bg-white/30" />
            </button>
            <span className="text-[8px] font-pixel text-amber-400">BOOST</span>
          </div>

          {/* Button A */}
          <div className="flex flex-col items-center gap-1 -translate-y-1">
            <button
              onTouchStart={(e) => { e.preventDefault(); onActionTouch('actionA', true); }}
              onTouchEnd={(e) => { e.preventDefault(); onActionTouch('actionA', false); }}
              onMouseDown={() => onActionTouch('actionA', true)}
              onMouseUp={() => onActionTouch('actionA', false)}
              className={`relative w-13 h-13 bg-gradient-to-b ${preset.btnABg} border-2 ${preset.btnABorder} rounded-xs shadow-lg active:scale-90 active:translate-y-1 transition-all flex items-center justify-center font-pixel text-sm font-bold ${preset.btnAText}`}
              style={{ touchAction: 'none' }}
            >
              <span>A</span>
              <div className="absolute top-0.5 left-0.5 right-0.5 h-2 bg-white/35" />
            </button>
            <span className="text-[8px] font-pixel text-[#ff0055]">ACTION</span>
          </div>
        </div>
      );
    }

    if (preset.buttonShape === 'hexagon') {
      // Cyberdeck Hexagonal Buttons
      return (
        <div className="flex items-center gap-3 pr-1">
          {/* Button B */}
          <div className="flex flex-col items-center gap-1 translate-y-3">
            <button
              onTouchStart={(e) => { e.preventDefault(); onActionTouch('actionB', true); }}
              onTouchEnd={(e) => { e.preventDefault(); onActionTouch('actionB', false); }}
              onMouseDown={() => onActionTouch('actionB', true)}
              onMouseUp={() => onActionTouch('actionB', false)}
              className="relative w-12 h-12 bg-gradient-to-b from-[#00f0ff] to-[#008899] border-2 border-cyan-200 rounded-lg active:scale-90 transition-all flex items-center justify-center font-pixel text-xs text-black font-bold shadow-neon-cyan"
              style={{ touchAction: 'none', clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}
            >
              <span>B</span>
            </button>
            <span className="text-[8px] font-pixel text-cyan-400">BOOST</span>
          </div>

          {/* Button A */}
          <div className="flex flex-col items-center gap-1 -translate-y-1">
            <button
              onTouchStart={(e) => { e.preventDefault(); onActionTouch('actionA', true); }}
              onTouchEnd={(e) => { e.preventDefault(); onActionTouch('actionA', false); }}
              onMouseDown={() => onActionTouch('actionA', true)}
              onMouseUp={() => onActionTouch('actionA', false)}
              className="relative w-14 h-14 bg-gradient-to-b from-[#ffea00] to-[#b3a400] border-2 border-yellow-200 rounded-lg active:scale-90 transition-all flex items-center justify-center font-pixel text-sm text-black font-bold shadow-neon-amber"
              style={{ touchAction: 'none', clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)' }}
            >
              <span>A</span>
            </button>
            <span className="text-[8px] font-pixel text-amber-300">ACTION</span>
          </div>
        </div>
      );
    }

    // Default: Authentic Slanted Candy / DMG Circular Buttons
    return (
      <div className="flex items-center gap-3 pr-1">
        {/* Button B */}
        <div className="flex flex-col items-center gap-1 translate-y-3">
          <button
            onTouchStart={(e) => { e.preventDefault(); onActionTouch('actionB', true); }}
            onTouchEnd={(e) => { e.preventDefault(); onActionTouch('actionB', false); }}
            onMouseDown={() => onActionTouch('actionB', true)}
            onMouseUp={() => onActionTouch('actionB', false)}
            className={`relative w-12 h-12 rounded-full bg-gradient-to-b ${preset.btnBBg} border-2 ${preset.btnBBorder} ${preset.btnBText} shadow-md active:scale-90 active:translate-y-0.5 transition-all flex items-center justify-center font-pixel text-xs font-bold`}
            style={{ touchAction: 'none' }}
          >
            <span>B</span>
            <div className="absolute top-1 left-1.5 w-6 h-2 rounded-full bg-white/30 blur-[0.5px]" />
          </button>
          <span className="text-[8px] font-pixel text-gray-400">BOOST</span>
        </div>

        {/* Button A */}
        <div className="flex flex-col items-center gap-1 -translate-y-1">
          <button
            onTouchStart={(e) => { e.preventDefault(); onActionTouch('actionA', true); }}
            onTouchEnd={(e) => { e.preventDefault(); onActionTouch('actionA', false); }}
            onMouseDown={() => onActionTouch('actionA', true)}
            onMouseUp={() => onActionTouch('actionA', false)}
            className={`relative w-13 h-13 rounded-full bg-gradient-to-b ${preset.btnABg} border-2 ${preset.btnABorder} ${preset.btnAText} shadow-md active:scale-90 active:translate-y-0.5 transition-all flex items-center justify-center font-pixel text-sm font-bold`}
            style={{ touchAction: 'none' }}
          >
            <span className="drop-shadow-sm">A</span>
            <div className="absolute top-1 left-2 w-7 h-2.5 rounded-full bg-white/35 blur-[0.5px]" />
          </button>
          <span className="text-[8px] font-pixel text-[#ff0055]">ACTION</span>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full pt-1.5 flex md:hidden items-center justify-between px-2 shrink-0">
      {renderDpad()}

      {/* Center SELECT & START Rubber Pill Buttons */}
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={onSelect}
              className="w-9 h-3.5 bg-[#25283d] active:bg-gray-400 rounded-full border border-gray-600 shadow-inner -rotate-25 active:scale-95 transition-transform"
              title="Switch to Next Cartridge"
            />
            <span className="text-[7px] font-pixel text-gray-500">SELECT</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <button
              onClick={onStart}
              className="w-9 h-3.5 bg-[#25283d] active:bg-gray-400 rounded-full border border-gray-600 shadow-inner -rotate-25 active:scale-95 transition-transform"
              title="Restart Current Game"
            />
            <span className="text-[7px] font-pixel text-gray-500">START</span>
          </div>
        </div>

        {/* Speaker Grille Slits */}
        <div className="flex gap-1 opacity-40">
          <div className="w-1 h-4 bg-black rounded-full" />
          <div className="w-1 h-4 bg-black rounded-full" />
          <div className="w-1 h-4 bg-black rounded-full" />
          <div className="w-1 h-4 bg-black rounded-full" />
        </div>
      </div>

      {renderActionButtons()}
    </div>
  );
};

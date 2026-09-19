import React, { useState } from 'react';
import { Volume2, VolumeX, Monitor, Coins } from 'lucide-react';
import { sounds } from '../audio/soundManager';

interface ArcadeMarqueeProps {
  score: number;
  lives: number;
  activeCartridgeTitle: string;
  credits: number;
  onInsertCoin: () => void;
  crtEnabled: boolean;
  onToggleCRT: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const ArcadeMarquee: React.FC<ArcadeMarqueeProps> = ({
  score,
  lives,
  activeCartridgeTitle,
  credits,
  onInsertCoin,
  crtEnabled,
  onToggleCRT,
  isMuted,
  onToggleMute
}) => {
  const [coinPressed, setCoinPressed] = useState(false);

  const handleCoin = () => {
    setCoinPressed(true);
    sounds.playCoin();
    onInsertCoin();
    setTimeout(() => setCoinPressed(false), 200);
  };

  return (
    <header className="w-full bg-[#0d0e17] border-b-2 border-[#2a2b3d] px-3 py-2.5 shadow-lg select-none">
      {/* Top Banner */}
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 text-xs">
        {/* Left: Arcade Brand & Attribution */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2">
            <span className="text-xl animate-pulse">🕹️</span>
            <div>
              <div className="font-pixel text-[#00f0ff] tracking-wider text-sm flex items-center gap-1.5">
                <span>SM0KADE</span>
                <span className="text-[9px] bg-[#ff007f] text-white px-1.5 py-0.5 rounded-sm">v1.0</span>
              </div>
              <div className="text-[10px] text-gray-400 font-mono tracking-wide">
                Crafted by <span className="text-gray-200 font-semibold">sm000ky</span> × <span className="text-[#ff007f] font-semibold">Zero Two</span>
              </div>
            </div>
          </div>

          {/* Mobile Quick Stats */}
          <div className="md:hidden flex items-center gap-2 font-pixel text-[10px]">
            <span className="text-gray-400">SC:</span>
            <span className="text-[#00ff66]">{score.toString().padStart(5, '0')}</span>
            <span className="text-[#ff0055]">{'♥'.repeat(Math.max(0, lives))}</span>
          </div>
        </div>

        {/* Center: Active Title / Ticker */}
        <div className="hidden md:flex items-center gap-4 font-pixel text-[10px]">
          <div className="bg-[#05070a] border border-[#2a2b3d] px-3 py-1.5 rounded text-amber-400">
            GAME: <span className="text-white">{activeCartridgeTitle}</span>
          </div>
          <div className="text-gray-400">
            1-DAY-1-PROJECT: <span className="text-[#00f0ff]">DAY 5</span>
          </div>
        </div>

        {/* Right: Controls & Coin Slot */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {/* Insert Coin Button */}
          <button
            onClick={handleCoin}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded border font-pixel text-[9px] transition-all ${
              coinPressed
                ? 'bg-amber-400 text-black border-white scale-95'
                : 'bg-[#181a28] hover:bg-[#222438] text-amber-400 border-amber-500/40 shadow-neon-amber'
            }`}
            title="Click to Insert Arcade Coin"
          >
            <Coins size={12} className="text-amber-400" />
            <span>COIN [{credits}]</span>
          </button>

          {/* CRT Scanlines Toggle */}
          <button
            onClick={onToggleCRT}
            className={`p-1.5 rounded border transition-colors ${
              crtEnabled
                ? 'bg-[#00f0ff]/20 text-[#00f0ff] border-[#00f0ff]/50'
                : 'bg-[#181a28] text-gray-400 border-gray-700 hover:text-white'
            }`}
            title="Toggle CRT Scanline Effect"
          >
            <Monitor size={14} />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            className={`p-1.5 rounded border transition-colors ${
              !isMuted
                ? 'bg-[#00ff66]/20 text-[#00ff66] border-[#00ff66]/50'
                : 'bg-[#181a28] text-gray-500 border-gray-700 hover:text-white'
            }`}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        </div>
      </div>
    </header>
  );
};

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Cartridge, InputState } from '../games/types';
import { CARTRIDGES, getCartridgeById } from '../games/registry';
import { CartridgeVaultModal } from './CartridgeVaultModal';
import { CRTOverlay } from './CRTOverlay';
import { ProjectNotification } from './ProjectNotification';
import { Project } from '../types/project';
import { sounds } from '../audio/soundManager';
import { BookOpen, Layers, ChevronRight } from 'lucide-react';

interface ArcadeCabinetProps {
  activeCartridgeId: string;
  onSelectCartridge: (id: string) => void;
  onScoreChange: (score: number) => void;
  onLivesChange: (lives: number) => void;
  crtEnabled: boolean;
  score: number;
  lives: number;
  onOpenDossier: () => void;
  onOpenProjectModal: (project: Project) => void;
}

export const ArcadeCabinet: React.FC<ArcadeCabinetProps> = ({
  activeCartridgeId,
  onSelectCartridge,
  onScoreChange,
  onLivesChange,
  crtEnabled,
  score,
  lives,
  onOpenDossier,
  onOpenProjectModal
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cartridgeRef = useRef<Cartridge | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // Input states
  const inputRef = useRef<InputState>({
    up: false,
    down: false,
    left: false,
    right: false,
    actionA: false,
    actionB: false
  });

  const [vaultOpen, setVaultOpen] = useState<boolean>(false);
  const [unlockedProject, setUnlockedProject] = useState<Project | null>(null);

  // Initialize or swap cartridge
  const loadCartridge = useCallback((cartId: string) => {
    if (cartridgeRef.current) {
      cartridgeRef.current.destroy();
    }

    const meta = getCartridgeById(cartId) || CARTRIDGES[0];
    const newCartridge = meta.factory();
    cartridgeRef.current = newCartridge;

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        newCartridge.init(canvasRef.current, ctx, {
          onScoreUpdate: (s) => onScoreChange(s),
          onLivesUpdate: (l) => onLivesChange(l),
          onGameOver: () => {},
          onProjectUnlocked: (proj) => {
            setUnlockedProject(proj);
          }
        });
      }
    }
  }, [onScoreChange, onLivesChange]);

  useEffect(() => {
    loadCartridge(activeCartridgeId);
    return () => {
      if (cartridgeRef.current) {
        cartridgeRef.current.destroy();
      }
    };
  }, [activeCartridgeId, loadCartridge]);

  // Main game loop
  useEffect(() => {
    const loop = (currentTime: number) => {
      const deltaTime = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      const canvas = canvasRef.current;
      const cartridge = cartridgeRef.current;

      if (canvas && cartridge) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          cartridge.update(deltaTime, inputRef.current);
          cartridge.render(ctx, canvas.width, canvas.height);
        }
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Keyboard Event Listeners for PC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        inputRef.current.up = true;
        e.preventDefault();
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        inputRef.current.down = true;
        e.preventDefault();
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        inputRef.current.left = true;
        e.preventDefault();
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        inputRef.current.right = true;
        e.preventDefault();
      } else if (['Space', 'KeyJ'].includes(e.code)) {
        inputRef.current.actionA = true;
        cartridgeRef.current?.handleAction?.('actionA');
        e.preventDefault();
      } else if (['KeyK', 'ShiftLeft', 'ShiftRight'].includes(e.code)) {
        inputRef.current.actionB = true;
        cartridgeRef.current?.handleAction?.('actionB');
        e.preventDefault();
      } else if (e.code === 'KeyR') {
        cartridgeRef.current?.reset();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['ArrowUp', 'KeyW'].includes(e.code)) inputRef.current.up = false;
      else if (['ArrowDown', 'KeyS'].includes(e.code)) inputRef.current.down = false;
      else if (['ArrowLeft', 'KeyA'].includes(e.code)) inputRef.current.left = false;
      else if (['ArrowRight', 'KeyD'].includes(e.code)) inputRef.current.right = false;
      else if (['Space', 'KeyJ'].includes(e.code)) inputRef.current.actionA = false;
      else if (['KeyK', 'ShiftLeft', 'ShiftRight'].includes(e.code)) inputRef.current.actionB = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Touch Swipe on Canvas
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length === 0) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    const threshold = 18;

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold) {
      if (dx > 0) {
        inputRef.current = { ...inputRef.current, right: true, left: false, up: false, down: false };
      } else {
        inputRef.current = { ...inputRef.current, left: true, right: false, up: false, down: false };
      }
      setTimeout(() => {
        inputRef.current.left = false;
        inputRef.current.right = false;
      }, 100);
    } else if (Math.abs(dy) > threshold) {
      if (dy > 0) {
        inputRef.current = { ...inputRef.current, down: true, up: false, left: false, right: false };
      } else {
        inputRef.current = { ...inputRef.current, up: true, down: false, left: false, right: false };
      }
      setTimeout(() => {
        inputRef.current.up = false;
        inputRef.current.down = false;
      }, 100);
    } else {
      cartridgeRef.current?.handleAction?.('actionA');
    }
    touchStartRef.current = null;
  };

  // Switch to next cartridge (for SELECT button)
  const handleNextCartridge = () => {
    sounds.playCartridgeSwap();
    const currentIndex = CARTRIDGES.findIndex((c) => c.id === activeCartridgeId);
    const nextIndex = (currentIndex + 1) % CARTRIDGES.length;
    onSelectCartridge(CARTRIDGES[nextIndex].id);
  };

  const handleResetGame = () => {
    sounds.playBounce(1.2);
    cartridgeRef.current?.reset();
  };

  const handleDirButton = (dir: 'up' | 'down' | 'left' | 'right', active: boolean) => {
    sounds.playSwitchClick();
    if (active) {
      inputRef.current = {
        ...inputRef.current,
        up: dir === 'up',
        down: dir === 'down',
        left: dir === 'left',
        right: dir === 'right'
      };
    } else {
      inputRef.current[dir] = false;
    }
  };

  const handleActionButton = (action: 'actionA' | 'actionB', active: boolean) => {
    sounds.playSwitchClick();
    inputRef.current[action] = active;
    if (active) {
      cartridgeRef.current?.handleAction?.(action);
    }
  };

  const activeMeta = getCartridgeById(activeCartridgeId) || CARTRIDGES[0];
  const activeIndex = CARTRIDGES.findIndex((c) => c.id === activeCartridgeId);

  return (
    <div className="w-full h-full flex-1 flex flex-col justify-between items-center overflow-hidden select-none">
      
      {/* 1. COMPACT SLEEK CARTRIDGE DOCK (Clean, No Clutter!) */}
      <div className="w-full max-w-lg px-3 py-1.5 shrink-0">
        <div className="bg-[#12131e] border border-[#272a42] rounded-lg px-2.5 py-1.5 flex items-center justify-between shadow-md">
          {/* Active Cartridge Pill & Vault Trigger */}
          <button
            onClick={() => {
              sounds.playSwitchClick();
              setVaultOpen(true);
            }}
            className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#181a2b] hover:bg-[#20233b] border border-cyan-500/40 text-left transition-all group"
          >
            <span className="text-base group-hover:scale-110 transition-transform">
              {activeMeta.icon}
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[8px] font-pixel text-gray-500">
                  SLOT {activeIndex + 1}/{CARTRIDGES.length}
                </span>
                <span
                  className="text-[10px] font-pixel font-bold tracking-wide"
                  style={{ color: activeMeta.themeColor }}
                >
                  {activeMeta.title}
                </span>
              </div>
              <div className="text-[8px] text-gray-400 font-mono">
                {activeMeta.genre} • Tap to switch
              </div>
            </div>
          </button>

          {/* Quick Action: Open Vault or Next ROM */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                sounds.playSwitchClick();
                setVaultOpen(true);
              }}
              className="px-2 py-1 bg-[#1a1c2d] hover:bg-[#24273d] text-cyan-300 border border-gray-700 rounded font-pixel text-[8px] flex items-center gap-1"
              title="Open Cartridge Vault"
            >
              <Layers size={10} />
              <span className="hidden sm:inline">VAULT</span>
            </button>

            <button
              onClick={handleNextCartridge}
              className="p-1 bg-[#222538] hover:bg-[#2c3047] text-amber-400 border border-amber-500/30 rounded font-pixel text-[8px] flex items-center"
              title="Next Game"
            >
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. CONSOLE HARDWARE CHASSIS (Sculpted Handheld Body) */}
      <div className="flex-1 min-h-0 w-full max-w-lg px-2 flex flex-col justify-between items-center overflow-hidden">
        <div className="w-full h-full bg-gradient-to-b from-[#181a28] via-[#12131f] to-[#0c0d16] border-x-4 border-b-4 border-[#2c2f48] rounded-b-2xl p-2.5 shadow-[0_12px_35px_rgba(0,0,0,0.9)] flex flex-col justify-between overflow-hidden">
          
          {/* SCREEN BEZEL / LENS */}
          <div className="w-full flex-1 min-h-0 bg-[#0c0e18] border-2 border-[#33364f] rounded-xl p-2 shadow-inner flex flex-col justify-between overflow-hidden">
            
            {/* Screen Top Decal */}
            <div className="w-full flex items-center justify-between text-[9px] font-pixel text-gray-500 pb-1 border-b border-gray-800/80 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_#ff0055] animate-pulse" />
                <span className="text-gray-400">POWER</span>
              </div>
              <div className="text-gray-400 font-bold tracking-widest text-[8px]">
                SM0KADE COLOR
              </div>
              <div className="text-[#00f0ff] font-bold">
                {activeMeta.title}
              </div>
            </div>

            {/* CRT Display Frame */}
            <div className="relative flex-1 min-h-0 w-full flex items-center justify-center bg-[#05070a] rounded-md overflow-hidden border border-[#23253b] my-1">
              <CRTOverlay enabled={crtEnabled} />

              <ProjectNotification
                project={unlockedProject}
                onClose={() => setUnlockedProject(null)}
                onViewDetails={(proj) => {
                  setUnlockedProject(null);
                  onOpenProjectModal(proj);
                }}
              />

              <canvas
                ref={canvasRef}
                width={400}
                height={480}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="max-h-full max-w-full aspect-[400/480] object-contain cursor-crosshair touch-none"
              />
            </div>

            {/* Screen Bottom HUD (Score, Lives, Dossier Button) */}
            <div className="w-full flex items-center justify-between text-[10px] font-pixel pt-1 border-t border-gray-800/80 shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[#00f0ff]">SC:</span>
                <span className="text-white font-bold">{score.toString().padStart(6, '0')}</span>
              </div>

              <div className="flex items-center gap-1 text-[#ff0055]">
                {'♥'.repeat(Math.max(0, lives))}
              </div>

              <button
                onClick={onOpenDossier}
                className="px-2 py-0.5 bg-[#1a1c2d] hover:bg-[#282b42] text-[#00f0ff] border border-[#00f0ff]/50 rounded text-[8px] flex items-center gap-1 shadow-neon-cyan"
              >
                <BookOpen size={10} />
                <span>DOSSIER</span>
              </button>
            </div>
          </div>

          {/* HARDWARE CONTROL DECK (Tactile D-Pad & Slanted Buttons) */}
          <div className="w-full pt-2 flex items-center justify-between px-2 shrink-0">
            {/* LEFT: Classic Metallic Cross D-Pad */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              {/* Outer Bezel */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#2b2d42] to-[#12131c] p-1 shadow-md border border-gray-700/60 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-[#161724]" />
              </div>

              {/* UP */}
              <button
                onTouchStart={(e) => { e.preventDefault(); handleDirButton('up', true); }}
                onTouchEnd={(e) => { e.preventDefault(); handleDirButton('up', false); }}
                onMouseDown={() => handleDirButton('up', true)}
                onMouseUp={() => handleDirButton('up', false)}
                className="absolute top-0.5 w-9 h-9 bg-gradient-to-b from-[#343750] to-[#202235] active:from-[#00f0ff] active:to-[#009da8] rounded-t-md border-t border-x border-gray-500/70 text-gray-300 active:text-black flex items-center justify-center font-pixel text-[11px] shadow-sm active:scale-95"
                style={{ touchAction: 'none' }}
              >
                ▲
              </button>

              {/* DOWN */}
              <button
                onTouchStart={(e) => { e.preventDefault(); handleDirButton('down', true); }}
                onTouchEnd={(e) => { e.preventDefault(); handleDirButton('down', false); }}
                onMouseDown={() => handleDirButton('down', true)}
                onMouseUp={() => handleDirButton('down', false)}
                className="absolute bottom-0.5 w-9 h-9 bg-gradient-to-b from-[#202235] to-[#161826] active:from-[#00f0ff] active:to-[#009da8] rounded-b-md border-b border-x border-gray-600/70 text-gray-300 active:text-black flex items-center justify-center font-pixel text-[11px] shadow-sm active:scale-95"
                style={{ touchAction: 'none' }}
              >
                ▼
              </button>

              {/* LEFT */}
              <button
                onTouchStart={(e) => { e.preventDefault(); handleDirButton('left', true); }}
                onTouchEnd={(e) => { e.preventDefault(); handleDirButton('left', false); }}
                onMouseDown={() => handleDirButton('left', true)}
                onMouseUp={() => handleDirButton('left', false)}
                className="absolute left-0.5 w-9 h-9 bg-gradient-to-r from-[#202235] to-[#2c2f45] active:from-[#00f0ff] active:to-[#009da8] rounded-l-md border-l border-y border-gray-500/70 text-gray-300 active:text-black flex items-center justify-center font-pixel text-[11px] shadow-sm active:scale-95"
                style={{ touchAction: 'none' }}
              >
                ◀
              </button>

              {/* RIGHT */}
              <button
                onTouchStart={(e) => { e.preventDefault(); handleDirButton('right', true); }}
                onTouchEnd={(e) => { e.preventDefault(); handleDirButton('right', false); }}
                onMouseDown={() => handleDirButton('right', true)}
                onMouseUp={() => handleDirButton('right', false)}
                className="absolute right-0.5 w-9 h-9 bg-gradient-to-l from-[#202235] to-[#2c2f45] active:from-[#00f0ff] active:to-[#009da8] rounded-r-md border-r border-y border-gray-500/70 text-gray-300 active:text-black flex items-center justify-center font-pixel text-[11px] shadow-sm active:scale-95"
                style={{ touchAction: 'none' }}
              >
                ▶
              </button>

              {/* Center Concave Disc */}
              <div className="absolute w-7 h-7 rounded-full bg-[#131420] border border-gray-600/40 pointer-events-none" />
            </div>

            {/* CENTER: SELECT & START Rubber Pill Buttons */}
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-3">
                {/* SELECT (Switch Cartridge) */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={handleNextCartridge}
                    className="w-9 h-3.5 bg-[#25283d] active:bg-gray-400 rounded-full border border-gray-600 shadow-inner -rotate-25 active:scale-95 transition-transform"
                    title="Switch to Next Cartridge"
                  />
                  <span className="text-[7px] font-pixel text-gray-500">SELECT</span>
                </div>

                {/* START / RESTART */}
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={handleResetGame}
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

            {/* RIGHT: Slanted Candy Buttons A & B */}
            <div className="flex items-center gap-3 pr-1">
              {/* BUTTON B */}
              <div className="flex flex-col items-center gap-1 translate-y-3">
                <button
                  onTouchStart={(e) => { e.preventDefault(); handleActionButton('actionB', true); }}
                  onTouchEnd={(e) => { e.preventDefault(); handleActionButton('actionB', false); }}
                  onMouseDown={() => handleActionButton('actionB', true)}
                  onMouseUp={() => handleActionButton('actionB', false)}
                  className="relative w-12 h-12 rounded-full bg-gradient-to-b from-[#ffaa00] to-[#b37400] border-2 border-amber-300/80 shadow-[0_4px_10px_rgba(255,170,0,0.4)] active:scale-90 active:translate-y-0.5 transition-all flex items-center justify-center font-pixel text-xs text-black font-bold"
                  style={{ touchAction: 'none' }}
                >
                  <span>B</span>
                  <div className="absolute top-1 left-1.5 w-6 h-2 rounded-full bg-white/30 blur-[0.5px]" />
                </button>
                <span className="text-[8px] font-pixel text-amber-400">BOOST</span>
              </div>

              {/* BUTTON A */}
              <div className="flex flex-col items-center gap-1 -translate-y-1">
                <button
                  onTouchStart={(e) => { e.preventDefault(); handleActionButton('actionA', true); }}
                  onTouchEnd={(e) => { e.preventDefault(); handleActionButton('actionA', false); }}
                  onMouseDown={() => handleActionButton('actionA', true)}
                  onMouseUp={() => handleActionButton('actionA', false)}
                  className="relative w-13 h-13 rounded-full bg-gradient-to-b from-[#ff0055] to-[#a80038] border-2 border-pink-300/90 shadow-[0_5px_15px_rgba(255,0,85,0.5)] active:scale-90 active:translate-y-0.5 transition-all flex items-center justify-center font-pixel text-sm text-white font-bold"
                  style={{ touchAction: 'none' }}
                >
                  <span className="drop-shadow-sm">A</span>
                  <div className="absolute top-1 left-2 w-7 h-2.5 rounded-full bg-white/35 blur-[0.5px]" />
                </button>
                <span className="text-[8px] font-pixel text-[#ff0055]">ACTION</span>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* 3. CARTRIDGE VAULT MODAL (The Sleek 6-in-1 Game Selector) */}
      <CartridgeVaultModal
        isOpen={vaultOpen}
        activeId={activeCartridgeId}
        onSelectCartridge={onSelectCartridge}
        onClose={() => setVaultOpen(false)}
      />
    </div>
  );
};

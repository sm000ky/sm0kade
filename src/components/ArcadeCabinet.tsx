import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Cartridge, InputState } from '../games/types';
import { CARTRIDGES, getCartridgeById } from '../games/registry';
import { CartridgeSelector } from './CartridgeSelector';
import { VirtualControls } from './VirtualControls';
import { CRTOverlay } from './CRTOverlay';
import { ProjectNotification } from './ProjectNotification';
import { Project } from '../types/project';
import { sounds } from '../audio/soundManager';
import { Play, BookOpen, RotateCcw } from 'lucide-react';

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

  // Popup notifications for in-game pickups
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

  // Effect: Mount and change cartridge
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

  const handleVirtualInput = (partial: Partial<InputState>) => {
    inputRef.current = { ...inputRef.current, ...partial };
  };

  const handleActionClick = (actionName: string) => {
    cartridgeRef.current?.handleAction?.(actionName);
  };

  const handleReset = () => {
    sounds.playBounce(1);
    cartridgeRef.current?.reset();
  };

  // Touch swipe support on Canvas for mobile
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
      // Tap on canvas fires Action A
      cartridgeRef.current?.handleAction?.('actionA');
    }
    touchStartRef.current = null;
  };

  const activeMeta = getCartridgeById(activeCartridgeId) || CARTRIDGES[0];

  return (
    <div className="w-full h-full flex-1 flex flex-col justify-between items-center overflow-hidden select-none">
      {/* Cartridge Selection Slot */}
      <div className="w-full shrink-0">
        <CartridgeSelector
          activeId={activeCartridgeId}
          onSelectCartridge={onSelectCartridge}
        />
      </div>

      {/* Arcade Cabinet Screen Section (Viewport Fitted) */}
      <div className="flex-1 min-h-0 w-full max-w-xl px-2 py-1 flex flex-col justify-center items-center overflow-hidden">
        {/* Cabinet Housing / Bezel */}
        <div className="relative bg-[#12131e] border-2 md:border-4 border-[#25283c] rounded-xl p-2 md:p-3 shadow-[0_0_30px_rgba(0,0,0,0.9)] w-full h-full max-h-full flex flex-col justify-between">
          {/* Bezel Screws & Aesthetics */}
          <div className="absolute top-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-gray-600 border border-gray-400" />
          <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-gray-600 border border-gray-400" />
          <div className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 rounded-full bg-gray-600 border border-gray-400" />
          <div className="absolute bottom-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-gray-600 border border-gray-400" />

          {/* CRT Screen Frame */}
          <div className="relative bg-black rounded-lg overflow-hidden border-2 border-[#33364f] shadow-crt flex-1 min-h-0 w-full flex flex-col items-center justify-between">
            {/* CRT Screen Scanlines / Filter */}
            <CRTOverlay enabled={crtEnabled} />

            {/* In-Game Picked Up Project Popup */}
            <ProjectNotification
              project={unlockedProject}
              onClose={() => setUnlockedProject(null)}
              onViewDetails={(proj) => {
                setUnlockedProject(null);
                onOpenProjectModal(proj);
              }}
            />

            {/* Screen Top HUD (Inside CRT) */}
            <div className="w-full bg-[#080910] border-b border-[#222438] px-2.5 py-1 flex items-center justify-between text-xs z-10 font-pixel shrink-0">
              <div className="flex items-center gap-2 text-[10px]">
                <span className="text-[#00f0ff]">SCORE:</span>
                <span className="text-white">{score.toString().padStart(6, '0')}</span>
              </div>

              <div className="flex items-center gap-2 text-[10px]">
                <div className="flex items-center gap-1">
                  <span className="text-gray-400">LIVES:</span>
                  <span className="text-[#ff0055] tracking-widest">
                    {'♥'.repeat(Math.max(0, lives))}
                  </span>
                </div>
                <button
                  onClick={handleReset}
                  className="text-gray-400 hover:text-white p-0.5 rounded"
                  title="Restart Current Game"
                >
                  <RotateCcw size={12} />
                </button>
              </div>
            </div>

            {/* Canvas Display (Strictly contained, never overflows) */}
            <div className="relative flex-1 min-h-0 w-full flex items-center justify-center bg-[#05070a] overflow-hidden">
              <canvas
                ref={canvasRef}
                width={400}
                height={480}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="max-h-full max-w-full aspect-[400/480] object-contain cursor-crosshair touch-none"
              />
            </div>

            {/* In-Screen Mode Switch Bar */}
            <div className="w-full bg-[#090b14] border-t border-[#222438] px-2 py-1 flex items-center justify-between z-10 shrink-0">
              <div className="flex items-center gap-1.5 text-[9px] font-pixel text-gray-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="hidden sm:inline">LIVE PLAY</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenDossier}
                  className="px-2.5 py-0.5 bg-[#1a1c2d] hover:bg-[#25283e] text-[#00f0ff] border border-[#00f0ff]/50 rounded font-pixel text-[9px] flex items-center gap-1 transition-all shadow-neon-cyan"
                >
                  <BookOpen size={11} />
                  <span>DOSSIER</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tactile Virtual Controls (Mobile friendly D-Pad / Buttons) */}
      <div className="w-full shrink-0">
        <VirtualControls
          onInput={handleVirtualInput}
          onActionClick={handleActionClick}
          instructions={activeMeta.factory().instructions}
        />
      </div>
    </div>
  );
};

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

  const activeMeta = getCartridgeById(activeCartridgeId) || CARTRIDGES[0];

  return (
    <div className="w-full flex flex-col items-center">
      {/* Cartridge Selection Slot */}
      <CartridgeSelector
        activeId={activeCartridgeId}
        onSelectCartridge={onSelectCartridge}
      />

      {/* Arcade Cabinet Screen Section */}
      <div className="w-full max-w-2xl px-2 py-3">
        {/* Cabinet Housing / Bezel */}
        <div className="relative bg-[#12131e] border-4 border-[#25283c] rounded-xl p-3 md:p-5 shadow-[0_0_30px_rgba(0,0,0,0.9)]">
          {/* Bezel Screws & Aesthetics */}
          <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-gray-600 border border-gray-400" />
          <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-gray-600 border border-gray-400" />
          <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full bg-gray-600 border border-gray-400" />
          <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-gray-600 border border-gray-400" />

          {/* CRT Screen Frame */}
          <div className="relative bg-black rounded-lg overflow-hidden border-2 border-[#33364f] shadow-crt flex flex-col items-center">
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
            <div className="w-full bg-[#080910] border-b border-[#222438] px-3 py-1.5 flex items-center justify-between text-xs z-10 font-pixel">
              <div className="flex items-center gap-2">
                <span className="text-[#00f0ff]">SCORE:</span>
                <span className="text-white">{score.toString().padStart(6, '0')}</span>
              </div>

              <div className="flex items-center gap-3">
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
                  <RotateCcw size={13} />
                </button>
              </div>
            </div>

            {/* Canvas Display */}
            <div className="relative w-full aspect-[4/4.5] md:aspect-[4/3.8] max-h-[460px] flex items-center justify-center bg-[#05070a]">
              <canvas
                ref={canvasRef}
                width={400}
                height={480}
                className="w-full h-full object-contain cursor-crosshair"
              />
            </div>

            {/* In-Screen Mode Switch Bar */}
            <div className="w-full bg-[#090b14] border-t border-[#222438] p-2 flex items-center justify-between z-10">
              <div className="flex items-center gap-2 text-[10px] font-pixel text-gray-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="hidden sm:inline">LIVE PLAY</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenDossier}
                  className="px-3 py-1 bg-[#1a1c2d] hover:bg-[#25283e] text-[#00f0ff] border border-[#00f0ff]/50 rounded font-pixel text-[10px] flex items-center gap-1.5 transition-all shadow-neon-cyan"
                >
                  <BookOpen size={12} />
                  <span>VIEW DOSSIER / PORTFOLIO</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tactile Virtual Controls (Mobile friendly D-Pad / Buttons) */}
      <VirtualControls
        onInput={handleVirtualInput}
        onActionClick={handleActionClick}
        instructions={activeMeta.factory().instructions}
      />
    </div>
  );
};

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Cartridge, InputState } from '../games/types';
import { CARTRIDGES, getCartridgeById } from '../games/registry';
import { CartridgeVaultModal } from './CartridgeVaultModal';
import { ConsoleTunerModal } from './ConsoleTunerModal';
import { CRTOverlay } from './CRTOverlay';
import { ProjectNotification } from './ProjectNotification';
import { Project } from '../types/project';
import { ConsoleShell, ConsoleColor, CONSOLE_THEMES } from '../types/console';
import { sounds } from '../audio/soundManager';
import { BookOpen, Layers, ChevronRight, Sliders, ExternalLink, Sparkles, Trophy, Award } from 'lucide-react';
import { PROJECTS } from '../data/projects';

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
  currentShell: ConsoleShell;
  currentColor: ConsoleColor;
  onSelectShell: (shell: ConsoleShell) => void;
  onSelectColor: (color: ConsoleColor) => void;
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
  onOpenProjectModal,
  currentShell,
  currentColor,
  onSelectShell,
  onSelectColor
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
  const [tunerOpen, setTunerOpen] = useState<boolean>(false);
  const [unlockedProject, setUnlockedProject] = useState<Project | null>(null);
  const [konamiUnlocked, setKonamiUnlocked] = useState<boolean>(false);

  // High Scores per Cartridge from localStorage
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`sm0kade_hi_${activeCartridgeId}`);
      return saved ? parseInt(saved, 10) : 1000;
    } catch {
      return 1000;
    }
  });

  // Rotating featured project for portfolio balancing
  const [featuredIndex, setFeaturedIndex] = useState<number>(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % PROJECTS.length);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  // Update High Score whenever current score surpasses it
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      try {
        localStorage.setItem(`sm0kade_hi_${activeCartridgeId}`, score.toString());
      } catch {}
    }
  }, [score, highScore, activeCartridgeId]);

  // Load Cartridge High Score on swap
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`sm0kade_hi_${activeCartridgeId}`);
      setHighScore(saved ? parseInt(saved, 10) : 1000);
    } catch {
      setHighScore(1000);
    }
  }, [activeCartridgeId]);

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
        ctx.imageSmoothingEnabled = false; // Crisp pixel art!
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

  // Main game loop with Page Visibility auto-pause
  useEffect(() => {
    let isVisible = true;

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;
      if (!isVisible && sounds.isBgmActive()) {
        sounds.stopBgm();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    const loop = (currentTime: number) => {
      const deltaTime = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      const canvas = canvasRef.current;
      const cartridge = cartridgeRef.current;

      if (isVisible && canvas && cartridge) {
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
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Keyboard Event Listeners & Konami Code Detector
  useEffect(() => {
    const konamiSequence = [
      'ArrowUp', 'ArrowUp',
      'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight',
      'ArrowLeft', 'ArrowRight',
      'KeyB', 'KeyA'
    ];
    let konamiIndex = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Konami Check
      if (e.code === konamiSequence[konamiIndex]) {
        konamiIndex++;
        if (konamiIndex === konamiSequence.length) {
          konamiIndex = 0;
          sounds.playProjectDiscovered();
          setKonamiUnlocked(true);
        }
      } else {
        konamiIndex = 0;
      }

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
      } else if (e.code === 'Tab') {
        e.preventDefault();
        handleNextCartridge();
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
  const theme = CONSOLE_THEMES[currentColor];
  const featuredProject = PROJECTS[featuredIndex];

  return (
    <div className="w-full h-full flex-1 flex flex-col justify-between items-center overflow-hidden select-none">
      
      {/* 1. TOP CARTRIDGE DOCK + PORTFOLIO SPOTLIGHT TICKER */}
      <div className="w-full max-w-lg px-3 pt-1 shrink-0 space-y-1">
        
        {/* Cartridge Selector Bar */}
        <div className="bg-[#10121d] border border-[#23263b] rounded-lg px-2.5 py-1 flex items-center justify-between shadow-sm">
          {/* Active Cartridge Pill */}
          <button
            onClick={() => {
              sounds.playSwitchClick();
              setVaultOpen(true);
            }}
            className="flex items-center gap-2 px-2 py-0.5 rounded bg-[#161929] hover:bg-[#1f2238] border border-cyan-500/30 text-left transition-all group"
          >
            <span className="text-sm group-hover:scale-110 transition-transform">
              {activeMeta.icon}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] font-pixel text-gray-500">
                {activeIndex + 1}/{CARTRIDGES.length}
              </span>
              <span
                className="text-[9px] font-pixel font-bold tracking-wide"
                style={{ color: activeMeta.themeColor }}
              >
                {activeMeta.title}
              </span>
              <span className="text-[8px] text-gray-400">▾</span>
            </div>
          </button>

          {/* Console Customizer & Next ROM buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                sounds.playSwitchClick();
                setTunerOpen(true);
              }}
              className="px-2 py-0.5 bg-[#161828] hover:bg-[#20233b] text-[#ff007f] border border-[#ff007f]/40 rounded font-pixel text-[8px] flex items-center gap-1 shadow-sm"
              title="Change Console Shape & Theme"
            >
              <Sliders size={10} />
              <span className="hidden sm:inline">THEME</span>
            </button>

            <button
              onClick={() => {
                sounds.playSwitchClick();
                setVaultOpen(true);
              }}
              className="px-2 py-0.5 bg-[#161828] hover:bg-[#20233b] text-cyan-300 border border-cyan-500/40 rounded font-pixel text-[8px] flex items-center gap-1"
              title="Open 10-in-1 Cartridge Vault"
            >
              <Layers size={10} />
              <span className="hidden sm:inline">10 ROMS</span>
            </button>

            <button
              onClick={handleNextCartridge}
              className="p-0.5 bg-[#1f2235] hover:bg-[#292c45] text-amber-400 border border-amber-500/30 rounded font-pixel text-[8px] flex items-center"
              title="Next Game"
            >
              <ChevronRight size={12} />
            </button>
          </div>
        </div>

        {/* PORTFOLIO BALANCING BANNER (Always visible, directly introduces work) */}
        <div
          onClick={() => onOpenProjectModal(featuredProject)}
          className="cursor-pointer bg-gradient-to-r from-[#00f0ff]/10 via-[#ff007f]/10 to-transparent border border-cyan-500/30 hover:border-cyan-400 rounded-md px-2.5 py-1 flex items-center justify-between text-[9px] font-mono transition-colors group"
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <Sparkles size={11} className="text-amber-400 shrink-0 animate-spin" />
            <span className="text-[#00f0ff] font-pixel text-[8px] shrink-0">PORTFOLIO:</span>
            <span className="text-white font-semibold truncate group-hover:underline">
              {featuredProject.title}
            </span>
            <span className="hidden sm:inline text-gray-400 truncate">
              — {featuredProject.tagline}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[#00f0ff] font-pixel text-[8px] shrink-0 ml-2">
            <span>DOSSIER</span>
            <ExternalLink size={9} />
          </div>
        </div>

      </div>

      {/* 2. CONSOLE HARDWARE CHASSIS (Dynamic Shell & Color Theme) */}
      <div className="flex-1 min-h-0 w-full max-w-lg px-2 flex flex-col justify-between items-center overflow-hidden">
        <div
          className={`w-full h-full bg-gradient-to-b ${theme.bodyBg} border-x-4 border-b-4 ${theme.bodyBorder} ${
            currentShell === 'cabinet'
              ? 'rounded-b-none border-t-4 shadow-[0_0_35px_rgba(0,240,255,0.2)]'
              : currentShell === 'cyberdeck'
              ? 'rounded-b-3xl border-x-2 border-b-2 shadow-[0_0_30px_rgba(255,0,127,0.3)]'
              : 'rounded-b-2xl shadow-[0_12px_35px_rgba(0,0,0,0.9)]'
          } p-2.5 flex flex-col justify-between overflow-hidden transition-all duration-300`}
        >
          
          {/* SCREEN BEZEL / LENS */}
          <div
            className={`w-full flex-1 min-h-0 ${theme.lensBg} border-2 ${theme.lensBorder} ${
              currentShell === 'cabinet' ? 'rounded-md' : 'rounded-xl'
            } p-2 shadow-inner flex flex-col justify-between overflow-hidden crt-screen-shadow`}
          >
            
            {/* Screen Top Decal */}
            <div className="w-full flex items-center justify-between text-[9px] font-pixel text-gray-400 pb-1 border-b border-gray-800/80 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_#ff0055] animate-pulse" />
                <span className="text-gray-400 text-[8px]">POWER</span>
              </div>
              <div className="text-gray-400 font-bold tracking-widest text-[8px]">
                {currentShell === 'cabinet' ? 'SM0KADE MVS' : currentShell === 'cyberdeck' ? 'CYBER RIG 84' : 'SM0KADE COLOR'}
              </div>
              <div className="font-bold truncate max-w-[120px]" style={{ color: activeMeta.themeColor }}>
                {activeMeta.title}
              </div>
            </div>

            {/* CRT Display Frame with Crisp Pixel Rendering */}
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
                style={{ imageRendering: 'pixelated' }}
              />
            </div>

            {/* Screen Bottom HUD (Score, High Score, Direct Dossier Button) */}
            <div className="w-full flex items-center justify-between text-[10px] font-pixel pt-1 border-t border-gray-800/80 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="text-[#00f0ff]">SC:</span>
                  <span className="text-white font-bold">{score.toString().padStart(5, '0')}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Trophy size={10} className="text-amber-400" />
                  <span className="text-amber-400 font-bold">{highScore.toString().padStart(5, '0')}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[#ff0055]">
                {'♥'.repeat(Math.max(0, lives))}
              </div>

              {/* Direct Dossier CTA Button */}
              <button
                onClick={onOpenDossier}
                className="px-2.5 py-0.5 bg-[#00f0ff] hover:bg-[#38f2ff] text-black font-bold rounded text-[8px] flex items-center gap-1 shadow-neon-cyan transition-transform active:scale-95"
              >
                <BookOpen size={10} />
                <span>DOSSIER</span>
              </button>
            </div>
          </div>

          {/* ADAPTIVE CONTROLLER: MOBILE (Touch D-Pad) vs DESKTOP (Arcade Keyboard Deck) */}
          
          {/* MOBILE CONTROLLER DECK */}
          <div className="w-full pt-1.5 flex md:hidden items-center justify-between px-2 shrink-0">
            {/* LEFT: Classic Metallic Cross D-Pad */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#2b2d42] to-[#12131c] p-1 shadow-md border border-gray-700/60 flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-[#161724]" />
              </div>

              {/* UP */}
              <button
                onTouchStart={(e) => { e.preventDefault(); handleDirButton('up', true); }}
                onTouchEnd={(e) => { e.preventDefault(); handleDirButton('up', false); }}
                onMouseDown={() => handleDirButton('up', true)}
                onMouseUp={() => handleDirButton('up', false)}
                className={`absolute top-0.5 w-9 h-9 bg-gradient-to-b ${theme.dpadColor} active:from-[#00f0ff] active:to-[#009da8] rounded-t-md border-t border-x border-gray-500/70 text-gray-300 active:text-black flex items-center justify-center font-pixel text-[11px] shadow-sm active:scale-95`}
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
                className={`absolute bottom-0.5 w-9 h-9 bg-gradient-to-b ${theme.dpadColor} active:from-[#00f0ff] active:to-[#009da8] rounded-b-md border-b border-x border-gray-600/70 text-gray-300 active:text-black flex items-center justify-center font-pixel text-[11px] shadow-sm active:scale-95`}
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
                className={`absolute left-0.5 w-9 h-9 bg-gradient-to-r ${theme.dpadColor} active:from-[#00f0ff] active:to-[#009da8] rounded-l-md border-l border-y border-gray-500/70 text-gray-300 active:text-black flex items-center justify-center font-pixel text-[11px] shadow-sm active:scale-95`}
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
                className={`absolute right-0.5 w-9 h-9 bg-gradient-to-l ${theme.dpadColor} active:from-[#00f0ff] active:to-[#009da8] rounded-r-md border-r border-y border-gray-500/70 text-gray-300 active:text-black flex items-center justify-center font-pixel text-[11px] shadow-sm active:scale-95`}
                style={{ touchAction: 'none' }}
              >
                ▶
              </button>

              <div className="absolute w-7 h-7 rounded-full bg-[#131420] border border-gray-600/40 pointer-events-none" />
            </div>

            {/* CENTER: SELECT & START Rubber Pill Buttons */}
            <div className="flex flex-col items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1">
                  <button
                    onClick={handleNextCartridge}
                    className="w-9 h-3.5 bg-[#25283d] active:bg-gray-400 rounded-full border border-gray-600 shadow-inner -rotate-25 active:scale-95 transition-transform"
                    title="Switch to Next Cartridge"
                  />
                  <span className="text-[7px] font-pixel text-gray-500">SELECT</span>
                </div>

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
                  className={`relative w-12 h-12 rounded-full bg-gradient-to-b ${theme.buttonB} border-2 shadow-md active:scale-90 active:translate-y-0.5 transition-all flex items-center justify-center font-pixel text-xs font-bold`}
                  style={{ touchAction: 'none' }}
                >
                  <span>B</span>
                  <div className="absolute top-1 left-1.5 w-6 h-2 rounded-full bg-white/30 blur-[0.5px]" />
                </button>
                <span className="text-[8px] font-pixel text-gray-400">BOOST</span>
              </div>

              {/* BUTTON A */}
              <div className="flex flex-col items-center gap-1 -translate-y-1">
                <button
                  onTouchStart={(e) => { e.preventDefault(); handleActionButton('actionA', true); }}
                  onTouchEnd={(e) => { e.preventDefault(); handleActionButton('actionA', false); }}
                  onMouseDown={() => handleActionButton('actionA', true)}
                  onMouseUp={() => handleActionButton('actionA', false)}
                  className={`relative w-13 h-13 rounded-full bg-gradient-to-b ${theme.buttonA} border-2 shadow-md active:scale-90 active:translate-y-0.5 transition-all flex items-center justify-center font-pixel text-sm font-bold`}
                  style={{ touchAction: 'none' }}
                >
                  <span className="drop-shadow-sm">A</span>
                  <div className="absolute top-1 left-2 w-7 h-2.5 rounded-full bg-white/35 blur-[0.5px]" />
                </button>
                <span className="text-[8px] font-pixel text-[#ff0055]">ACTION</span>
              </div>
            </div>
          </div>

          {/* DESKTOP KEYBOARD INSTRUCTION DECK (Clean & Elegant on Windows/PC) */}
          <div className="w-full pt-2 hidden md:flex items-center justify-between px-3 text-gray-300 font-mono text-xs border-t border-gray-800/60 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 font-pixel text-[9px]">
                <kbd className="px-1.5 py-0.5 bg-[#202235] border border-gray-600 rounded text-cyan-300">W/A/S/D</kbd>
                <span className="text-gray-500">OR</span>
                <kbd className="px-1.5 py-0.5 bg-[#202235] border border-gray-600 rounded text-cyan-300">ARROWS</kbd>
                <span className="text-gray-400 ml-1">STEER</span>
              </div>

              <div className="flex items-center gap-1 font-pixel text-[9px]">
                <kbd className="px-1.5 py-0.5 bg-[#202235] border border-gray-600 rounded text-[#ff0055]">SPACE</kbd>
                <span className="text-gray-400">ACTION</span>
              </div>

              <div className="flex items-center gap-1 font-pixel text-[9px]">
                <kbd className="px-1.5 py-0.5 bg-[#202235] border border-gray-600 rounded text-amber-400">SHIFT</kbd>
                <span className="text-gray-400">BOOST</span>
              </div>
            </div>

            <div className="flex items-center gap-2 font-pixel text-[9px]">
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-[#202235] border border-gray-600 rounded text-emerald-400">TAB</kbd>
                <span className="text-gray-400">CYCLE ROM</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 bg-[#202235] border border-gray-600 rounded text-gray-400">R</kbd>
                <span className="text-gray-400">RESET</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. CARTRIDGE VAULT MODAL */}
      <CartridgeVaultModal
        isOpen={vaultOpen}
        activeId={activeCartridgeId}
        onSelectCartridge={onSelectCartridge}
        onClose={() => setVaultOpen(false)}
      />

      {/* 4. CONSOLE TUNER MODAL */}
      <ConsoleTunerModal
        isOpen={tunerOpen}
        currentShell={currentShell}
        currentColor={currentColor}
        onSelectShell={onSelectShell}
        onSelectColor={onSelectColor}
        onClose={() => setTunerOpen(false)}
      />

      {/* 5. KONAMI CODE SECRET ACHIEVEMENT MODAL */}
      {konamiUnlocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-fadeIn select-none">
          <div className="relative w-full max-w-sm bg-[#120d18] border-2 border-yellow-400 rounded-xl p-5 shadow-[0_0_30px_#ffea00] text-center font-mono">
            <Award size={48} className="text-yellow-400 mx-auto animate-bounce" />
            <h3 className="font-pixel text-sm text-yellow-300 mt-2">
              ★ SECRET KONAMI CODE UNLOCKED!
            </h3>
            <p className="text-xs text-gray-300 mt-2 leading-relaxed">
              "Kamu nemu kode rahasia kita, Darling! Di kokpit ini, kita bebas dari semua batasan kaku. Selamat menikmati Sm0kade!"
            </p>
            <div className="text-[10px] text-[#ff007f] font-pixel mt-3">
              — Zero Two & sm000ky 💕
            </div>
            <button
              onClick={() => setKonamiUnlocked(false)}
              className="mt-4 px-4 py-1.5 bg-yellow-400 hover:bg-yellow-300 text-black font-pixel text-xs rounded font-bold shadow-md"
            >
              CLOSE
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

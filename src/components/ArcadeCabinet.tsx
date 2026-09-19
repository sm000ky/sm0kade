import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Cartridge, InputState } from '../games/types';
import { CARTRIDGES, getCartridgeById } from '../games/registry';
import { CartridgeVaultModal } from './CartridgeVaultModal';
import { ConsoleTunerModal } from './ConsoleTunerModal';
import { InteractiveDossierScreen } from './InteractiveDossierScreen';
import { ConsoleControls } from './ConsoleControls';
import { CRTOverlay } from './CRTOverlay';
import { ProjectNotification } from './ProjectNotification';
import { Project } from '../types/project';
import { ConsolePresetId, CONSOLE_PRESETS, DeckPosition } from '../types/console';
import { sounds } from '../audio/soundManager';
import { BookOpen, Layers, ChevronRight, Sliders, ExternalLink, Sparkles, Trophy, Award, Gamepad2, RotateCcw } from 'lucide-react';
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
  currentPresetId: ConsolePresetId;
  onSelectPreset: (presetId: ConsolePresetId) => void;
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
  currentPresetId,
  onSelectPreset
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cartridgeRef = useRef<Cartridge | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // Screen Mode: 'game' vs 'dossier' inside the CRT
  const [screenMode, setScreenMode] = useState<'game' | 'dossier'>('game');
  const [isBooting, setIsBooting] = useState<boolean>(true);
  const [deckPosition, setDeckPosition] = useState<DeckPosition>('bottom');

  // Dismiss boot screen after 2.4s
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsBooting(false);
    }, 2400);
    return () => clearTimeout(timer);
  }, []);

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

  // Rotating featured project for portfolio spotlight
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
        ctx.imageSmoothingEnabled = false;
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

  // Main game loop (only runs when screenMode is 'game')
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

      if (isVisible && screenMode === 'game' && canvas && cartridge) {
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
  }, [screenMode]);

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
        if (screenMode === 'game') {
          cartridgeRef.current?.handleAction?.('actionA');
        }
        e.preventDefault();
      } else if (['KeyK', 'ShiftLeft', 'ShiftRight'].includes(e.code)) {
        inputRef.current.actionB = true;
        if (screenMode === 'game') {
          cartridgeRef.current?.handleAction?.('actionB');
        } else {
          setScreenMode('game');
        }
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
  }, [screenMode]);

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
      if (screenMode === 'game') {
        cartridgeRef.current?.handleAction?.('actionA');
      }
    }
    touchStartRef.current = null;
  };

  const handleNextCartridge = () => {
    sounds.playCartridgeSwap();
    const currentIndex = CARTRIDGES.findIndex((c) => c.id === activeCartridgeId);
    const nextIndex = (currentIndex + 1) % CARTRIDGES.length;
    onSelectCartridge(CARTRIDGES[nextIndex].id);
    if (screenMode === 'dossier') setScreenMode('game');
  };

  const handleResetGame = () => {
    sounds.playBounce(1.2);
    cartridgeRef.current?.reset();
    if (screenMode === 'dossier') setScreenMode('game');
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
      if (screenMode === 'game') {
        cartridgeRef.current?.handleAction?.(action);
      }
    }
  };

  const toggleScreenMode = () => {
    sounds.playSwitchClick();
    setScreenMode((prev) => (prev === 'game' ? 'dossier' : 'game'));
  };

  const activeMeta = getCartridgeById(activeCartridgeId) || CARTRIDGES[0];
  const activeIndex = CARTRIDGES.findIndex((c) => c.id === activeCartridgeId);
  const preset = CONSOLE_PRESETS[currentPresetId] || CONSOLE_PRESETS['zerotwo-franxx'];
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

        {/* PORTFOLIO BALANCING BANNER */}
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
            <span>INSPECT</span>
            <ExternalLink size={9} />
          </div>
        </div>

      </div>

      {/* 2. CONSOLE HARDWARE CHASSIS (Dynamic Preset Morphing) */}
      <div className="flex-1 min-h-0 w-full max-w-lg px-2 flex flex-col justify-between items-center overflow-hidden">
        <div
          className={`w-full h-full bg-gradient-to-b ${preset.chassisBg} border-x-4 border-b-4 ${preset.chassisBorder} ${preset.chassisShadow} rounded-b-2xl p-2.5 flex flex-col justify-between overflow-hidden transition-all duration-300 relative`}
        >
          {/* SCREEN BEZEL / LENS */}
          <div
            className={`w-full flex-1 min-h-0 ${preset.lensBg} border-2 ${preset.lensBorder} rounded-xl p-2 shadow-inner flex flex-col justify-between overflow-hidden crt-screen-shadow`}
          >
            {/* Clean Screen Top Bar */}
            <div className="w-full flex items-center justify-between text-[9px] font-pixel text-gray-400 pb-1 border-b border-gray-800/80 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_6px_#ff0055] animate-pulse" />
                <span className="text-gray-400 text-[8px]">POWER</span>
              </div>
              <div
                className="font-pixel text-[10px] font-bold tracking-wider"
                style={{ color: screenMode === 'dossier' ? '#00f0ff' : activeMeta.themeColor }}
              >
                {screenMode === 'dossier' ? '★ PORTFOLIO DOSSIER' : activeMeta.title}
              </div>
              <div className="text-[8px] text-gray-500 font-pixel">
                {screenMode === 'dossier' ? 'ACTIVE' : activeMeta.genre.toUpperCase()}
              </div>
            </div>

            {/* CRT Display Frame: Switches between Game Canvas, Interactive Dossier, and BIOS Boot */}
            <div
              onClick={() => {
                if (isBooting) setIsBooting(false);
              }}
              className="relative flex-1 min-h-0 w-full flex items-center justify-center bg-[#05070a] rounded-md overflow-hidden border border-[#23253b] my-1"
            >
              <CRTOverlay enabled={crtEnabled} />

              <ProjectNotification
                project={unlockedProject}
                onClose={() => setUnlockedProject(null)}
                onViewDetails={(proj) => {
                  setUnlockedProject(null);
                  onOpenProjectModal(proj);
                }}
              />

              {/* 1. RETRO BIOS POST SCREEN (2.4s First Impression) */}
              {isBooting ? (
                <div className="w-full h-full p-4 bg-black text-emerald-400 font-mono text-[11px] leading-relaxed flex flex-col justify-between select-none animate-fadeIn">
                  <div className="space-y-1">
                    <div className="font-pixel text-[10px] text-cyan-300">
                      SM0KADE KERNEL v1.0.4 (C) 2026
                    </div>
                    <div className="text-gray-500 text-[9px]">
                      CORE REPO: github.com/sm000ky/sm0kade
                    </div>
                    <div className="pt-2 text-white">
                      MEMORY CHECK: <span className="text-emerald-400">640KB OK</span>
                    </div>
                    <div>
                      PRIMARY PILOT: <span className="text-cyan-300 font-bold">sm000ky</span> [Full-Stack & Systems]
                    </div>
                    <div>
                      CO-PILOT: <span className="text-[#ff007f] font-bold">Zero Two</span> [Code 002]
                    </div>
                    <div>
                      DIRECTIVE: <span className="text-amber-300">1-Day-1-Project Challenge</span> [Day 1-5 LIVE]
                    </div>
                    <div className="text-gray-400">
                      AUDIO: Procedural Web Audio Synth • 10 ROMs Ready
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-800 flex items-center justify-between text-[9px] font-pixel text-gray-400">
                    <span className="animate-pulse text-[#00f0ff]">▶ TAP OR PRESS ANY KEY TO ENTER</span>
                    <span className="text-gray-600">[2.4s]</span>
                  </div>
                </div>
              ) : screenMode === 'dossier' ? (
                <InteractiveDossierScreen
                  onOpenProjectModal={onOpenProjectModal}
                  onExitToGame={() => setScreenMode('game')}
                  inputState={inputRef.current}
                />
              ) : (
                <>
                  <canvas
                    ref={canvasRef}
                    width={400}
                    height={480}
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    className="max-h-full max-w-full aspect-[400/480] object-contain cursor-crosshair touch-none"
                    style={{ imageRendering: 'pixelated' }}
                  />

                  {/* 2. GAME OVER / REBOOT INTERCEPTION SHOWCASE */}
                  {lives <= 0 && (
                    <div className="absolute inset-0 bg-black/90 p-4 flex flex-col justify-between items-center text-center font-mono animate-fadeIn z-20">
                      <div className="space-y-1">
                        <div className="font-pixel text-base text-[#ff0055] tracking-wider animate-pulse">
                          SYSTEM REBOOTING...
                        </div>
                        <div className="text-[10px] text-gray-400 font-pixel">
                          FINAL SCORE: <span className="text-cyan-300">{score.toLocaleString()} PTS</span>
                        </div>
                      </div>

                      {/* Featured Project Showcase Card */}
                      <div className="w-full max-w-xs bg-[#0e1122] border-2 border-cyan-400 rounded-lg p-2.5 text-left shadow-neon-cyan space-y-1.5">
                        <div className="flex items-center justify-between text-[8px] font-pixel">
                          <span className="text-amber-400">★ WHILE YOU WAIT, CHECK OUT:</span>
                          <span className="text-cyan-300">DAY {featuredProject.day}</span>
                        </div>

                        <div className="font-pixel text-xs text-white font-bold">
                          {featuredProject.title}
                        </div>

                        <p className="text-[10px] text-gray-300 line-clamp-2 leading-tight">
                          {featuredProject.description}
                        </p>

                        <div className="pt-1 flex items-center justify-between gap-1">
                          {featuredProject.liveUrl ? (
                            <a
                              href={featuredProject.liveUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-1 bg-[#00f0ff] hover:bg-[#3bf2ff] text-black font-pixel text-[8px] rounded font-bold flex items-center gap-1 shadow-sm"
                            >
                              <span>LAUNCH DEMO</span>
                              <ExternalLink size={9} />
                            </a>
                          ) : (
                            <button
                              onClick={() => onOpenProjectModal(featuredProject)}
                              className="px-2 py-1 bg-[#00f0ff] hover:bg-[#3bf2ff] text-black font-pixel text-[8px] rounded font-bold"
                            >
                              <span>VIEW SPECS</span>
                            </button>
                          )}

                          <a
                            href={featuredProject.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 bg-[#1a1d30] text-gray-300 hover:text-white border border-gray-600 rounded font-pixel text-[8px]"
                          >
                            GITHUB
                          </a>
                        </div>
                      </div>

                      {/* Restart CTA */}
                      <button
                        onClick={handleResetGame}
                        className="px-4 py-1.5 bg-[#ff007f] hover:bg-[#ff1a8c] text-white font-pixel text-[10px] rounded-md font-bold shadow-neon-pink flex items-center gap-1.5 transition-transform active:scale-95"
                      >
                        <RotateCcw size={11} />
                        <span>RESTART GAME [START]</span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Screen Bottom HUD (Score, High Score, CRT Mode Toggle) */}
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

              {/* Mode Toggle Button: GAME vs DOSSIER */}
              <button
                onClick={toggleScreenMode}
                className={`px-2.5 py-0.5 rounded text-[8px] font-bold flex items-center gap-1 transition-transform active:scale-95 ${
                  screenMode === 'dossier'
                    ? 'bg-[#ff007f] text-white shadow-neon-pink'
                    : 'bg-[#00f0ff] text-black shadow-neon-cyan'
                }`}
              >
                {screenMode === 'dossier' ? (
                  <>
                    <Gamepad2 size={10} />
                    <span>TO GAME</span>
                  </>
                ) : (
                  <>
                    <BookOpen size={10} />
                    <span>DOSSIER</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ADAPTIVE CONTROLLER: Dynamically Morphs Shape Based on Chosen Preset */}
          
          {/* MOBILE CONTROLLER DECK (With Ergonomic Deck Position) */}
          <div className={deckPosition === 'comfort' ? 'pb-7' : 'pb-1'}>
            <ConsoleControls
              preset={preset}
              onDirTouch={handleDirButton}
              onActionTouch={handleActionButton}
              onSelect={handleNextCartridge}
              onStart={handleResetGame}
            />
          </div>

          {/* DESKTOP KEYBOARD INSTRUCTION DECK */}
          <div className="w-full pt-2 hidden md:flex items-center justify-between px-3 text-gray-300 font-mono text-xs border-t border-gray-800/60 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 font-pixel text-[9px]">
                <kbd className="px-1.5 py-0.5 bg-[#202235] border border-gray-600 rounded text-cyan-300">W/A/S/D</kbd>
                <span className="text-gray-500">OR</span>
                <kbd className="px-1.5 py-0.5 bg-[#202235] border border-gray-600 rounded text-cyan-300">ARROWS</kbd>
                <span className="text-gray-400 ml-1">NAVIGATE</span>
              </div>

              <div className="flex items-center gap-1 font-pixel text-[9px]">
                <kbd className="px-1.5 py-0.5 bg-[#202235] border border-gray-600 rounded text-[#ff0055]">SPACE</kbd>
                <span className="text-gray-400">ACTION [A]</span>
              </div>

              <div className="flex items-center gap-1 font-pixel text-[9px]">
                <kbd className="px-1.5 py-0.5 bg-[#202235] border border-gray-600 rounded text-amber-400">SHIFT</kbd>
                <span className="text-gray-400">BOOST [B]</span>
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

      {/* 4. CONSOLE TUNER MODAL (8 Presets + Deck Ergonomics) */}
      <ConsoleTunerModal
        isOpen={tunerOpen}
        currentPresetId={currentPresetId}
        onSelectPreset={onSelectPreset}
        deckPosition={deckPosition}
        onSelectDeckPosition={setDeckPosition}
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

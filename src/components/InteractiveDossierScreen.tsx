import React, { useState, useEffect } from 'react';
import { Project } from '../types/project';
import { PROJECTS } from '../data/projects';
import { sounds } from '../audio/soundManager';
import { ExternalLink, Github, Sparkles, Terminal, CheckCircle2, ChevronLeft, ChevronRight, Play } from 'lucide-react';

interface InteractiveDossierScreenProps {
  onOpenProjectModal: (project: Project) => void;
  onExitToGame: () => void;
  inputState: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
    actionA: boolean;
    actionB: boolean;
  };
}

export const InteractiveDossierScreen: React.FC<InteractiveDossierScreenProps> = ({
  onOpenProjectModal,
  onExitToGame,
  inputState
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Controller Navigation Effect
  useEffect(() => {
    if (inputState.left || inputState.up) {
      sounds.playBounce(1.1);
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : PROJECTS.length - 1));
      inputState.left = false;
      inputState.up = false;
    } else if (inputState.right || inputState.down) {
      sounds.playBounce(1.3);
      setCurrentIndex((prev) => (prev < PROJECTS.length - 1 ? prev + 1 : 0));
      inputState.right = false;
      inputState.down = false;
    } else if (inputState.actionA) {
      sounds.playProjectDiscovered();
      const proj = PROJECTS[currentIndex];
      if (proj.liveUrl) {
        window.open(proj.liveUrl, '_blank', 'noopener,noreferrer');
      } else {
        onOpenProjectModal(proj);
      }
      inputState.actionA = false;
    } else if (inputState.actionB) {
      sounds.playSwitchClick();
      onExitToGame();
      inputState.actionB = false;
    }
  }, [inputState, currentIndex, onOpenProjectModal, onExitToGame]);

  const current = PROJECTS[currentIndex] || PROJECTS[0];

  // Distinct Theme Accents per Project
  const projectAccents = [
    { border: 'border-[#00f0ff]', glow: 'shadow-[0_0_25px_rgba(0,240,255,0.4)]', color: '#00f0ff', badge: 'DAY 5 // ARCADE' },
    { border: 'border-[#ff007f]', glow: 'shadow-[0_0_25px_rgba(255,0,127,0.4)]', color: '#ff007f', badge: 'DAY 4 // CREATIVE' },
    { border: 'border-[#00ff66]', glow: 'shadow-[0_0_25px_rgba(0,255,102,0.4)]', color: '#00ff66', badge: 'DAY 3 // CLI ENGINE' },
    { border: 'border-[#ffaa00]', glow: 'shadow-[0_0_25px_rgba(255,170,0,0.4)]', color: '#ffaa00', badge: 'DAY 2 // GAMIFIED' },
    { border: 'border-[#38bdf8]', glow: 'shadow-[0_0_25px_rgba(56,189,248,0.4)]', color: '#38bdf8', badge: 'DAY 1 // SAK EMKM' }
  ][currentIndex % 5];

  return (
    <div className="w-full h-full bg-[#060810] text-gray-200 p-2.5 flex flex-col justify-between overflow-hidden font-mono select-none">
      
      {/* 1. TOP ARCADE STAGE MARQUEE */}
      <div className="flex items-center justify-between border-b border-gray-800/80 pb-1.5 shrink-0">
        <div className="flex items-center gap-1.5 font-pixel text-[9px]">
          <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-ping" />
          <span className="text-white tracking-wide">SOFTWARE SHOWCASE</span>
          <span className="text-gray-500">[{currentIndex + 1}/{PROJECTS.length}]</span>
        </div>

        {/* Quick Back to Game Button */}
        <button
          onClick={onExitToGame}
          className="px-2 py-0.5 bg-[#161828] hover:bg-[#22253c] text-gray-300 hover:text-white border border-gray-700 rounded font-pixel text-[8px] flex items-center gap-1 transition-all"
        >
          <span>GAME [B]</span>
        </button>
      </div>

      {/* 2. THE MAIN SHOWCASE CARD (Hero Stage) */}
      <div className="flex-1 min-h-0 py-1.5 flex flex-col justify-between">
        
        {/* Holographic Card Container */}
        <div
          className={`w-full flex-1 min-h-0 bg-gradient-to-b from-[#0e1222] via-[#090b16] to-[#04050a] border-2 ${projectAccents.border} ${projectAccents.glow} rounded-xl p-3 flex flex-col justify-between transition-all duration-300 relative overflow-hidden`}
        >
          {/* Top Tag & Rank */}
          <div className="flex items-center justify-between shrink-0">
            <span
              className="px-2 py-0.5 rounded font-pixel text-[8px] font-bold tracking-wider"
              style={{ backgroundColor: `${projectAccents.color}20`, color: projectAccents.color, border: `1px solid ${projectAccents.color}50` }}
            >
              {projectAccents.badge}
            </span>
            <span className="font-pixel text-[9px] text-[#ffea00]">
              RANK {current.rank}
            </span>
          </div>

          {/* Project Title & Tagline */}
          <div className="shrink-0 my-1">
            <h2 className="font-pixel text-sm sm:text-base text-white font-bold tracking-wide drop-shadow-md">
              {current.title}
            </h2>
            <p className="text-[10px] text-cyan-300 italic mt-0.5 line-clamp-1">
              "{current.tagline}"
            </p>
          </div>

          {/* Tactical Overview */}
          <div className="flex-1 min-h-0 bg-[#05060d]/80 border border-gray-800/80 rounded-lg p-2 overflow-y-auto space-y-1.5 text-[10px] leading-relaxed">
            <p className="text-gray-300">
              {current.description}
            </p>

            {/* Highlights */}
            <div className="space-y-1 pt-1 border-t border-gray-800/60">
              {current.features.slice(0, 2).map((f, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[9px] text-gray-400">
                  <CheckCircle2 size={11} className="text-[#00ff66] shrink-0 mt-0.5" />
                  <span className="truncate">{f}</span>
                </div>
              ))}
            </div>

            {/* Tech Stack Chips */}
            <div className="flex flex-wrap gap-1 pt-1">
              {current.techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-1.5 py-0.2 bg-[#101322] border border-gray-700/60 text-gray-400 rounded text-[8px]"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Big Action Buttons: Launch Live Demo / GitHub */}
          <div className="flex items-center justify-between gap-2 pt-2 shrink-0">
            {current.liveUrl ? (
              <a
                href={current.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-1.5 bg-[#00f0ff] hover:bg-[#43f3ff] text-black font-pixel text-[9px] rounded-lg font-bold flex items-center justify-center gap-1.5 shadow-neon-cyan transition-transform active:scale-95"
              >
                <Play size={10} className="fill-black" />
                <span>LAUNCH DEMO [A]</span>
                <ExternalLink size={10} />
              </a>
            ) : (
              <button
                onClick={() => onOpenProjectModal(current)}
                className="flex-1 py-1.5 bg-[#00f0ff] hover:bg-[#43f3ff] text-black font-pixel text-[9px] rounded-lg font-bold flex items-center justify-center gap-1.5 shadow-neon-cyan transition-transform active:scale-95"
              >
                <Terminal size={10} />
                <span>INSPECT SPECS [A]</span>
              </button>
            )}

            <a
              href={current.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-[#181a2b] hover:bg-[#23263d] text-white border border-gray-600 rounded-lg font-pixel text-[9px] flex items-center gap-1.5 transition-colors"
              title="View GitHub Repository"
            >
              <Github size={12} />
              <span className="hidden sm:inline">REPO</span>
            </a>
          </div>

        </div>

      </div>

      {/* 3. BOTTOM CAROUSEL DOCK (Thumbnail Selector) */}
      <div className="shrink-0 pt-1 border-t border-gray-800/80 flex items-center justify-between gap-1">
        <button
          onClick={() => {
            sounds.playBounce(1.1);
            setCurrentIndex((prev) => (prev > 0 ? prev - 1 : PROJECTS.length - 1));
          }}
          className="p-1 rounded bg-[#131524] hover:bg-[#1f2238] text-gray-300"
          title="Previous Project (Left / Up)"
        >
          <ChevronLeft size={13} />
        </button>

        {/* 5 Project Thumbnails */}
        <div className="flex-1 flex items-center justify-center gap-1.5 overflow-hidden">
          {PROJECTS.map((p, idx) => {
            const isSelected = idx === currentIndex;
            return (
              <button
                key={p.id}
                onClick={() => {
                  sounds.playSwitchClick();
                  setCurrentIndex(idx);
                }}
                className={`px-2 py-1 rounded font-pixel text-[8px] transition-all flex items-center gap-1 ${
                  isSelected
                    ? 'bg-[#00f0ff] text-black font-bold shadow-neon-cyan scale-105'
                    : 'bg-[#121422] text-gray-500 hover:text-gray-300 border border-gray-800'
                }`}
              >
                <span>D{p.day}</span>
              </button>
            );
          })}
        </div>

        <button
          onClick={() => {
            sounds.playBounce(1.3);
            setCurrentIndex((prev) => (prev < PROJECTS.length - 1 ? prev + 1 : 0));
          }}
          className="p-1 rounded bg-[#131524] hover:bg-[#1f2238] text-gray-300"
          title="Next Project (Right / Down)"
        >
          <ChevronRight size={13} />
        </button>
      </div>

    </div>
  );
};

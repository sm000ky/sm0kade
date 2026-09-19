import React, { useState, useEffect } from 'react';
import { Project } from '../types/project';
import { PROJECTS } from '../data/projects';
import { sounds } from '../audio/soundManager';
import { ExternalLink, Github, Terminal, Sparkles, ChevronUp, ChevronDown, CheckCircle2 } from 'lucide-react';

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
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const categories = ['ALL', 'Finance', 'Gamification', 'Media CLI', 'Creative Lab', 'Arcade & Portfolio'];

  // Filtered projects
  const filteredProjects = categoryFilter === 'ALL'
    ? PROJECTS
    : PROJECTS.filter((p) => p.category === categoryFilter);

  // Controller Navigation Effect
  useEffect(() => {
    if (inputState.up) {
      sounds.playSwitchClick();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredProjects.length - 1));
      inputState.up = false;
    } else if (inputState.down) {
      sounds.playSwitchClick();
      setSelectedIndex((prev) => (prev < filteredProjects.length - 1 ? prev + 1 : 0));
      inputState.down = false;
    } else if (inputState.left) {
      sounds.playBounce(0.8);
      const catIdx = categories.indexOf(categoryFilter);
      const prevCat = categories[(catIdx - 1 + categories.length) % categories.length];
      setCategoryFilter(prevCat);
      setSelectedIndex(0);
      inputState.left = false;
    } else if (inputState.right) {
      sounds.playBounce(1.2);
      const catIdx = categories.indexOf(categoryFilter);
      const nextCat = categories[(catIdx + 1) % categories.length];
      setCategoryFilter(nextCat);
      setSelectedIndex(0);
      inputState.right = false;
    } else if (inputState.actionA) {
      sounds.playProjectDiscovered();
      const current = filteredProjects[selectedIndex];
      if (current) onOpenProjectModal(current);
      inputState.actionA = false;
    } else if (inputState.actionB) {
      sounds.playSwitchClick();
      onExitToGame();
      inputState.actionB = false;
    }
  }, [inputState, filteredProjects, selectedIndex, categoryFilter, categories, onOpenProjectModal, onExitToGame]);

  const currentProject = filteredProjects[selectedIndex] || PROJECTS[0];

  return (
    <div className="w-full h-full bg-[#05070d] text-gray-200 p-2.5 flex flex-col justify-between overflow-hidden font-mono select-none">
      
      {/* Top Interactive HUD Bar */}
      <div className="flex items-center justify-between border-b border-[#00f0ff]/40 pb-1.5 shrink-0 text-[9px] font-pixel">
        <div className="flex items-center gap-1.5 text-[#00f0ff]">
          <Terminal size={11} />
          <span>PILOT DOSSIER // {selectedIndex + 1}/{filteredProjects.length}</span>
        </div>

        {/* Category Filter Pills (Controlled via Left/Right) */}
        <div className="flex items-center gap-1">
          <span className="text-gray-500">TAG:</span>
          <span className="px-1.5 py-0.5 bg-[#141829] text-amber-300 border border-amber-500/40 rounded truncate max-w-[85px]">
            {categoryFilter}
          </span>
        </div>
      </div>

      {/* Main Interactive Project Showcase Card */}
      <div className="flex-1 min-h-0 py-1.5 flex flex-col justify-between overflow-hidden">
        
        {/* Project Header & Rank */}
        <div className="bg-[#0c0f1e] border border-[#212642] rounded p-2 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-1.5 py-0.5 bg-[#00f0ff]/20 text-[#00f0ff] font-pixel text-[8px] rounded border border-[#00f0ff]/40">
                DAY {currentProject.day}
              </span>
              <h3 className="font-pixel text-xs text-white font-bold tracking-wide">
                {currentProject.title}
              </h3>
            </div>
            <span className="text-[8px] font-pixel text-[#ffea00]">
              RANK {currentProject.rank}
            </span>
          </div>

          <p className="text-[10px] text-cyan-300 mt-1 italic line-clamp-1">
            "{currentProject.tagline}"
          </p>
        </div>

        {/* Description & Features Box */}
        <div className="flex-1 min-h-0 bg-[#080912] border border-[#1b1e33] rounded p-2 my-1 overflow-y-auto space-y-1.5 text-[10px] leading-relaxed">
          <p className="text-gray-300">
            {currentProject.description}
          </p>

          {/* Key Capabilities */}
          <div className="pt-1 border-t border-gray-800/80 space-y-1">
            {currentProject.features.slice(0, 2).map((feat, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-[9px] text-gray-400">
                <CheckCircle2 size={11} className="text-[#00ff66] shrink-0 mt-0.5" />
                <span className="truncate">{feat}</span>
              </div>
            ))}
          </div>

          {/* Compiled Stack Pills */}
          <div className="flex flex-wrap gap-1 pt-1">
            {currentProject.techStack.map((tech) => (
              <span
                key={tech}
                className="px-1.5 py-0.5 bg-[#121524] text-gray-400 border border-gray-700/60 rounded text-[8px]"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons inside CRT */}
        <div className="flex items-center justify-between gap-1.5 shrink-0 pt-1">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onOpenProjectModal(currentProject)}
              className="px-2.5 py-1 bg-[#00f0ff] hover:bg-[#3bf2ff] text-black font-pixel text-[8px] rounded font-bold flex items-center gap-1 shadow-neon-cyan"
            >
              <span>INSPECT [A]</span>
              <ExternalLink size={9} />
            </button>

            {currentProject.liveUrl && (
              <a
                href={currentProject.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1 bg-[#ff007f] hover:bg-[#ff1a8c] text-white font-pixel text-[8px] rounded font-bold flex items-center gap-1"
              >
                <span>DEMO</span>
                <ExternalLink size={9} />
              </a>
            )}

            <a
              href={currentProject.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 bg-[#161828] text-gray-300 hover:text-white border border-gray-700 rounded"
              title="GitHub Repo"
            >
              <Github size={11} />
            </a>
          </div>

          <button
            onClick={onExitToGame}
            className="px-2 py-1 bg-[#1a1c2b] text-gray-400 hover:text-white border border-gray-700 rounded font-pixel text-[8px]"
          >
            PLAY [B]
          </button>
        </div>

      </div>

      {/* Bottom Controller Navigation Prompt */}
      <div className="border-t border-[#1f2238] pt-1 flex items-center justify-between text-[8px] font-pixel text-gray-500 shrink-0">
        <div className="flex items-center gap-1 text-cyan-400">
          <span>▲▼: BROWSE</span>
          <span className="text-gray-600">|</span>
          <span>◀▶: FILTER</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[#ff0055]">A: OPEN</span>
          <span className="text-gray-600">|</span>
          <span className="text-amber-400">B: GAME</span>
        </div>
      </div>

    </div>
  );
};

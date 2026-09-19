import React, { useState } from 'react';
import { ArcadeMarquee } from './components/ArcadeMarquee';
import { ArcadeCabinet } from './components/ArcadeCabinet';
import { DossierCatalog } from './components/DossierCatalog';
import { ProjectModal } from './components/ProjectModal';
import { CARTRIDGES, getCartridgeById } from './games/registry';
import { PROJECTS } from './data/projects';
import { Project } from './types/project';
import { sounds } from './audio/soundManager';
import { Gamepad2, Layers } from 'lucide-react';

export const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'arcade' | 'dossier'>('arcade');
  const [activeCartridgeId, setActiveCartridgeId] = useState<string>(CARTRIDGES[0].id);
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [credits, setCredits] = useState<number>(1);
  const [crtEnabled, setCrtEnabled] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleToggleMute = () => {
    const nextMute = sounds.toggleMute();
    setIsMuted(nextMute);
  };

  const handleToggleCRT = () => {
    setCrtEnabled(!crtEnabled);
  };

  const handleInsertCoin = () => {
    setCredits((prev) => prev + 1);
  };

  const activeCartMeta = getCartridgeById(activeCartridgeId) || CARTRIDGES[0];

  return (
    <div className={`${viewMode === 'arcade' ? 'h-[100dvh] max-h-[100dvh] overflow-hidden' : 'min-h-screen overflow-y-auto'} bg-[#07080f] text-gray-100 flex flex-col font-mono selection:bg-[#ff007f] selection:text-white`}>
      {/* Arcade Header Marquee */}
      <div className="w-full shrink-0">
        <ArcadeMarquee
          score={score}
          lives={lives}
          activeCartridgeTitle={activeCartMeta.title}
          credits={credits}
          onInsertCoin={handleInsertCoin}
          crtEnabled={crtEnabled}
          onToggleCRT={handleToggleCRT}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      </div>

      {/* Main View Switcher (Tab Bar) */}
      <nav className="w-full bg-[#0a0c16] border-b border-[#1c1e2e] py-1 px-4 select-none shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-center gap-3">
          <button
            onClick={() => {
              sounds.playCoin();
              setViewMode('arcade');
            }}
            className={`flex items-center gap-2 px-3.5 py-1 rounded-md font-pixel text-[11px] transition-all ${
              viewMode === 'arcade'
                ? 'bg-[#00f0ff] text-black shadow-neon-cyan font-bold scale-102'
                : 'bg-[#141624] text-gray-400 hover:text-white border border-[#2a2d42]'
            }`}
          >
            <Gamepad2 size={13} />
            <span>ARCADE CABINET</span>
          </button>

          <button
            onClick={() => {
              sounds.playCoin();
              setViewMode('dossier');
            }}
            className={`flex items-center gap-2 px-3.5 py-1 rounded-md font-pixel text-[11px] transition-all ${
              viewMode === 'dossier'
                ? 'bg-[#ff007f] text-white shadow-neon-pink font-bold scale-102'
                : 'bg-[#141624] text-gray-400 hover:text-white border border-[#2a2d42]'
            }`}
          >
            <Layers size={13} />
            <span>PORTFOLIO DOSSIER</span>
          </button>
        </div>
      </nav>

      {/* Dynamic Content View */}
      <main className={`${viewMode === 'arcade' ? 'flex-1 min-h-0 overflow-hidden' : 'flex-1'} flex flex-col items-center justify-start w-full`}>
        {viewMode === 'arcade' ? (
          <ArcadeCabinet
            activeCartridgeId={activeCartridgeId}
            onSelectCartridge={(id) => {
              setActiveCartridgeId(id);
              setScore(0);
              setLives(3);
            }}
            onScoreChange={setScore}
            onLivesChange={setLives}
            crtEnabled={crtEnabled}
            score={score}
            lives={lives}
            onOpenDossier={() => setViewMode('dossier')}
            onOpenProjectModal={setSelectedProject}
          />
        ) : (
          <DossierCatalog
            projects={PROJECTS}
            onSelectProject={setSelectedProject}
            onBackToArcade={() => setViewMode('arcade')}
          />
        )}
      </main>

      {/* Project Detail Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </div>
  );
};

export default App;

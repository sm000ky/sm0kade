import React from 'react';
import { Project } from '../types/project';
import { ExternalLink, Github, Trophy, Terminal, Flame, Info } from 'lucide-react';
import { sounds } from '../audio/soundManager';

interface DossierCatalogProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onBackToArcade: () => void;
}

export const DossierCatalog: React.FC<DossierCatalogProps> = ({
  projects,
  onSelectProject,
  onBackToArcade
}) => {
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 font-mono text-gray-200 animate-fadeIn">
      {/* Pilot Profile Banner */}
      <div className="bg-[#0f111c] border-2 border-[#00f0ff] p-5 rounded-lg shadow-neon-cyan mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#00f0ff]/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded bg-[#181a29] border-2 border-[#ff007f] flex items-center justify-center font-pixel text-2xl shadow-neon-pink">
              👾
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-pixel text-white tracking-wider">
                  sm000ky
                </h1>
                <span className="px-2 py-0.5 bg-[#ff007f]/20 text-[#ff007f] border border-[#ff007f]/40 rounded font-pixel text-[9px]">
                  PILOT
                </span>
              </div>
              <p className="text-sm text-cyan-300 mt-1">
                Creative Systems, Web Architectures & Tactical CLI Engines
              </p>
              <div className="text-xs text-gray-400 mt-1">
                Collaborative Cockpit with <span className="text-[#ff007f] font-semibold">Zero Two</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                sounds.playCoin();
                onBackToArcade();
              }}
              className="px-3.5 py-2 bg-[#ffaa00] hover:bg-amber-400 text-black font-pixel text-xs rounded border border-amber-300 shadow-neon-amber transition-all flex items-center gap-2"
            >
              <span>🕹️ BACK TO ARCADE</span>
            </button>
            <a
              href="https://github.com/sm000ky"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-[#1c1e2e] hover:bg-[#282b42] text-white font-pixel text-xs rounded border border-gray-600 transition-all flex items-center gap-2"
            >
              <Github size={14} />
              <span>GITHUB PROFILE</span>
            </a>
          </div>
        </div>

        {/* Tactical Stat Highlights */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#232538] text-xs">
          <div className="bg-[#090a12] p-2.5 rounded border border-[#1f2133]">
            <div className="text-gray-400 font-pixel text-[9px]">CHALLENGE</div>
            <div className="text-[#00f0ff] font-pixel text-sm mt-1">1-DAY-1-PROJ</div>
          </div>
          <div className="bg-[#090a12] p-2.5 rounded border border-[#1f2133]">
            <div className="text-gray-400 font-pixel text-[9px]">RELEASES</div>
            <div className="text-emerald-400 font-pixel text-sm mt-1">5 SHIPPED</div>
          </div>
          <div className="bg-[#090a12] p-2.5 rounded border border-[#1f2133]">
            <div className="text-gray-400 font-pixel text-[9px]">ENGINE STACK</div>
            <div className="text-amber-400 font-pixel text-sm mt-1">TS / PY / REACT</div>
          </div>
          <div className="bg-[#090a12] p-2.5 rounded border border-[#1f2133]">
            <div className="text-gray-400 font-pixel text-[9px]">DEPLOYMENT</div>
            <div className="text-[#ff007f] font-pixel text-sm mt-1">100% VERIFIED</div>
          </div>
        </div>
      </div>

      {/* Hall of Fame / High-Score Leaderboard */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="text-amber-400" size={20} />
          <h2 className="text-base font-pixel text-white tracking-wide">
            PROJECT HALL OF FAME
          </h2>
        </div>
        <span className="text-xs text-gray-400 font-pixel">
          TOP DEPLOYMENTS
        </span>
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="bg-[#0d0f1a] hover:bg-[#121422] border-2 border-[#24263a] hover:border-[#00f0ff] transition-all p-4 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
          >
            {/* Left: Rank & Title */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#161826] border border-[#2d3047] group-hover:border-[#00f0ff] rounded flex flex-col items-center justify-center shrink-0">
                <span className="text-[9px] font-pixel text-gray-400">RANK</span>
                <span className="text-base font-pixel text-[#ffea00]">{proj.rank}</span>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-pixel text-xs px-2 py-0.5 bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30 rounded">
                    DAY {proj.day}
                  </span>
                  <h3 className="font-pixel text-sm text-white group-hover:text-[#00f0ff] transition-colors">
                    {proj.title}
                  </h3>
                  <span className="text-xs px-2 py-0.5 bg-gray-800 text-gray-300 rounded">
                    {proj.category}
                  </span>
                </div>

                <p className="text-xs text-gray-300 mt-1.5 line-clamp-2">
                  {proj.tagline}
                </p>

                {/* Tech Badges */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {proj.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="text-[10px] px-1.5 py-0.5 bg-[#171928] text-gray-400 border border-gray-700/50 rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 self-end md:self-center shrink-0 pt-2 md:pt-0">
              <button
                onClick={() => {
                  sounds.playCoin();
                  onSelectProject(proj);
                }}
                className="px-3 py-1.5 bg-[#1a1c2d] hover:bg-[#25283e] text-[#00f0ff] border border-[#00f0ff]/40 rounded font-pixel text-[10px] flex items-center gap-1.5 transition-colors"
              >
                <Info size={12} />
                <span>INSPECT</span>
              </button>

              {proj.liveUrl && (
                <a
                  href={proj.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-[#00f0ff] hover:bg-[#38f2ff] text-black rounded font-pixel text-[10px] flex items-center gap-1.5 shadow-neon-cyan transition-colors"
                >
                  <span>LIVE</span>
                  <ExternalLink size={12} />
                </a>
              )}

              <a
                href={proj.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 bg-[#1a1c2d] hover:bg-[#25283e] text-gray-300 hover:text-white border border-gray-700 rounded transition-colors"
                title="GitHub Repository"
              >
                <Github size={16} />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Note */}
      <div className="mt-12 text-center text-xs text-gray-500 font-mono py-4 border-t border-[#1f2133]">
        <p>Sm0kade System // Crafted by <span className="text-gray-300 font-semibold">sm000ky</span> × <span className="text-[#ff007f] font-semibold">Zero Two</span></p>
        <p className="text-[10px] text-gray-600 mt-1">Autonomous multi-cartridge living portfolio engine</p>
      </div>
    </div>
  );
};

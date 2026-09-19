import React, { useState } from 'react';
import { Project } from '../types/project';
import { CONTACT_CHANNELS } from '../data/contacts';
import { ExternalLink, Github, Trophy, Terminal, Shield, ArrowLeft, Radio, Copy, Check } from 'lucide-react';
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
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    sounds.playSwitchClick();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };
  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 font-mono text-gray-200 animate-fadeIn selection:bg-[#00f0ff] selection:text-black">
      
      {/* CLASSIFIED BIOS / PILOT DOSSIER BANNER */}
      <div className="bg-[#0b0d18] border-2 border-[#00f0ff] p-5 rounded-xl shadow-neon-cyan mb-8 relative overflow-hidden">
        {/* Corner Cyber Brackets */}
        <div className="absolute top-2 left-2 text-[#00f0ff] font-pixel text-xs">┌─</div>
        <div className="absolute top-2 right-2 text-[#00f0ff] font-pixel text-xs">─┐</div>
        <div className="absolute bottom-2 left-2 text-[#00f0ff] font-pixel text-xs">└─</div>
        <div className="absolute bottom-2 right-2 text-[#00f0ff] font-pixel text-xs">─┘</div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-lg bg-[#141729] border-2 border-[#ff007f] flex items-center justify-center font-pixel text-2xl shadow-neon-pink">
              👾
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-pixel text-white tracking-wider">
                  PILOT: sm000ky
                </h1>
                <span className="px-2 py-0.5 bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff]/40 rounded font-pixel text-[9px]">
                  VERIFIED
                </span>
              </div>
              <p className="text-xs text-cyan-300 mt-1">
                Creative Systems, Web Architectures & Tactical CLI Engines
              </p>
              <div className="text-[11px] text-gray-400 mt-0.5">
                Co-Pilot & Cockpit Partner: <span className="text-[#ff007f] font-semibold">Zero Two</span>
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
              <ArrowLeft size={14} />
              <span>ARCADE CABINET</span>
            </button>
            <a
              href="https://github.com/sm000ky"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2 bg-[#1c1e2e] hover:bg-[#282b42] text-white font-pixel text-xs rounded border border-gray-600 transition-all flex items-center gap-2"
            >
              <Github size={14} />
              <span>GITHUB</span>
            </a>
          </div>
        </div>

        {/* Tactical Status Specs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[#232538] text-xs">
          <div className="bg-[#07080f] p-2.5 rounded border border-[#1b1d2e]">
            <div className="text-gray-400 font-pixel text-[8px]">PROTOCOL</div>
            <div className="text-[#00f0ff] font-pixel text-sm mt-1">1-DAY-1-PROJ</div>
          </div>
          <div className="bg-[#07080f] p-2.5 rounded border border-[#1b1d2e]">
            <div className="text-gray-400 font-pixel text-[8px]">SHIPPED</div>
            <div className="text-emerald-400 font-pixel text-sm mt-1">5 DAYS ACTIVE</div>
          </div>
          <div className="bg-[#07080f] p-2.5 rounded border border-[#1b1d2e]">
            <div className="text-gray-400 font-pixel text-[8px]">ARCADE ROMS</div>
            <div className="text-amber-400 font-pixel text-sm mt-1">10 PLAYABLE</div>
          </div>
          <div className="bg-[#07080f] p-2.5 rounded border border-[#1b1d2e]">
            <div className="text-gray-400 font-pixel text-[8px]">ARCHITECTURE</div>
            <div className="text-[#ff007f] font-pixel text-sm mt-1">100% MODULAR</div>
          </div>
        </div>
      </div>

      {/* HALL OF FAME HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="text-amber-400" size={20} />
          <h2 className="text-sm md:text-base font-pixel text-white tracking-wide">
            CLASSIFIED RELEASES // DAY 1 - 5
          </h2>
        </div>
        <span className="text-[10px] text-gray-400 font-pixel">
          AUTONOMOUS PILOT LOGS
        </span>
      </div>

      {/* PROJECTS LIST */}
      <div className="space-y-4">
        {projects.map((proj) => (
          <div
            key={proj.id}
            className="bg-[#0d0f1a] hover:bg-[#121422] border-2 border-[#24263a] hover:border-[#00f0ff] transition-all p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
          >
            {/* Left Info */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#161826] border border-[#2d3047] group-hover:border-[#00f0ff] rounded-lg flex flex-col items-center justify-center shrink-0">
                <span className="text-[8px] font-pixel text-gray-500">RANK</span>
                <span className="text-base font-pixel text-[#ffea00]">{proj.rank}</span>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-pixel text-[10px] px-2 py-0.5 bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30 rounded">
                    DAY {proj.day}
                  </span>
                  <h3 className="font-pixel text-sm text-white group-hover:text-[#00f0ff] transition-colors">
                    {proj.title}
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 bg-gray-800 text-gray-300 rounded font-mono">
                    {proj.category}
                  </span>
                </div>

                <p className="text-xs text-gray-300 mt-1.5 leading-relaxed">
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

            {/* Right Actions */}
            <div className="flex items-center gap-2 self-end md:self-center shrink-0 pt-2 md:pt-0">
              <button
                onClick={() => {
                  sounds.playCoin();
                  onSelectProject(proj);
                }}
                className="px-3 py-1.5 bg-[#1a1c2d] hover:bg-[#25283e] text-[#00f0ff] border border-[#00f0ff]/40 rounded font-pixel text-[10px] flex items-center gap-1.5 transition-colors"
              >
                <Terminal size={12} />
                <span>INSPECT</span>
              </button>

              {proj.liveUrl && (
                <a
                  href={proj.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-[#00f0ff] hover:bg-[#38f2ff] text-black font-bold rounded font-pixel text-[10px] flex items-center gap-1.5 shadow-neon-cyan transition-colors"
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

      {/* SECURE COMM-LINKS & CONTACT TERMINAL */}
      <div className="mt-8 bg-[#0b0d18] border-2 border-[#ff007f] rounded-xl p-4 sm:p-5 shadow-neon-pink relative overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#ff007f]/40 pb-2 mb-4">
          <div className="flex items-center gap-2">
            <Radio size={18} className="text-[#ff007f] animate-pulse" />
            <h2 className="text-xs sm:text-sm font-pixel text-white tracking-wider">
              SECURE COMM-LINKS // DIRECT CHANNELS
            </h2>
          </div>
          <span className="text-[8px] font-pixel px-2 py-0.5 bg-[#00ff66]/20 text-[#00ff66] border border-[#00ff66]/40 rounded">
            SIGNALS ACTIVE
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {CONTACT_CHANNELS.map((contact) => (
            <div
              key={contact.id}
              className="bg-[#111322] border border-gray-700/80 hover:border-[#00f0ff] p-3 rounded-lg flex flex-col justify-between transition-all group"
            >
              <div>
                <div className="flex items-center justify-between text-[9px] font-pixel text-gray-400 mb-1.5">
                  <span className="flex items-center gap-1">
                    <span>{contact.icon}</span>
                    <span className="text-white font-bold">{contact.name}</span>
                  </span>
                  <span className="text-[7px] text-gray-500">{contact.protocol}</span>
                </div>

                <div className="text-xs font-pixel text-[#00f0ff] truncate py-1">
                  {contact.handle}
                </div>

                <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                  {contact.description}
                </p>
              </div>

              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-800">
                <a
                  href={contact.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-1 px-2 bg-[#1a1e33] hover:bg-[#252b47] text-white border border-gray-600 rounded font-pixel text-[8px] flex items-center justify-center gap-1 transition-colors"
                >
                  <span>CONNECT</span>
                  <ExternalLink size={9} />
                </a>

                <button
                  onClick={() => handleCopy(contact.handle, contact.id)}
                  className="p-1 px-2 bg-[#141624] hover:bg-[#1f2238] text-gray-400 hover:text-white border border-gray-700 rounded font-pixel text-[8px] flex items-center gap-1"
                  title="Copy Handle"
                >
                  {copiedId === contact.id ? (
                    <>
                      <Check size={10} className="text-[#00ff66]" />
                      <span className="text-[#00ff66]">COPIED</span>
                    </>
                  ) : (
                    <>
                      <Copy size={10} />
                      <span>COPY</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-12 text-center text-xs text-gray-500 font-mono py-4 border-t border-[#1f2133]">
        <p>Sm0kade System // Crafted by <span className="text-gray-300 font-semibold">sm000ky</span> × <span className="text-[#ff007f] font-semibold">Zero Two</span></p>
        <p className="text-[10px] text-gray-600 mt-1">Autonomous 10-in-1 multi-cartridge living portfolio engine</p>
      </div>
    </div>
  );
};

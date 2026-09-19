import React from 'react';
import { Project } from '../types/project';
import { ExternalLink, Github, X, Terminal, CheckCircle2 } from 'lucide-react';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0c0d17] border-2 border-[#00f0ff] rounded-lg shadow-neon-cyan overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="bg-[#141624] px-4 py-3 border-b border-[#2a2b3d] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal size={16} className="text-[#00f0ff]" />
            <span className="font-pixel text-xs text-[#00f0ff]">
              DOSSIER // DAY {project.day}: {project.title.toUpperCase()}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 font-mono text-gray-300">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded text-[10px] font-pixel">
                {project.category}
              </span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded text-[10px] font-pixel">
                {project.status}
              </span>
              <span className="text-gray-500 text-xs">
                Score: {project.score.toLocaleString()} PTS
              </span>
            </div>
            <h2 className="text-xl font-bold text-white font-pixel mt-2">
              {project.title}
            </h2>
            <p className="text-sm text-cyan-300 italic mt-1">
              "{project.tagline}"
            </p>
          </div>

          <div className="bg-[#05070a] border border-[#232538] p-3 rounded">
            <h4 className="text-xs font-pixel text-gray-400 mb-2">SYSTEM SPECS & OVERVIEW:</h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Key Features */}
          <div>
            <h4 className="text-xs font-pixel text-gray-400 mb-2">TACTICAL CAPABILITIES:</h4>
            <div className="space-y-1.5">
              {project.features.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs">
                  <CheckCircle2 size={13} className="text-[#00ff66] mt-0.5 shrink-0" />
                  <span className="text-gray-300">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          <div>
            <h4 className="text-xs font-pixel text-gray-400 mb-2">COMPILED STACK:</h4>
            <div className="flex flex-wrap gap-1.5">
              {project.techStack.map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-1 bg-[#1a1c2b] border border-[#2f324d] rounded text-[11px] text-gray-300"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Attribution Footnote */}
          <div className="pt-2 border-t border-[#232538] text-[11px] text-gray-500 flex items-center justify-between">
            <span>Built by <span className="text-gray-300 font-semibold">sm000ky</span> × <span className="text-[#ff007f] font-semibold">Zero Two</span></span>
            <span className="text-[10px] text-amber-500">1-Day-1-Project Protocol</span>
          </div>
        </div>

        {/* Modal Footer / Action Buttons */}
        <div className="bg-[#141624] px-4 py-3 border-t border-[#2a2b3d] flex items-center justify-end gap-3">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 bg-[#00f0ff] hover:bg-[#33f3ff] text-black font-pixel text-[10px] rounded flex items-center gap-1.5 shadow-neon-cyan transition-all"
            >
              <span>LAUNCH LIVE DEMO</span>
              <ExternalLink size={12} />
            </a>
          )}
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 bg-[#25283d] hover:bg-[#323652] text-white font-pixel text-[10px] rounded flex items-center gap-1.5 border border-gray-600 transition-all"
          >
            <Github size={12} />
            <span>SOURCE REPO</span>
          </a>
        </div>
      </div>
    </div>
  );
};

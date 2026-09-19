import React from 'react';
import { Project } from '../types/project';
import { ExternalLink, Sparkles, X } from 'lucide-react';

interface ProjectNotificationProps {
  project: Project | null;
  onClose: () => void;
  onViewDetails: (project: Project) => void;
}

export const ProjectNotification: React.FC<ProjectNotificationProps> = ({
  project,
  onClose,
  onViewDetails
}) => {
  if (!project) return null;

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-11/12 max-w-md bg-[#0f111d]/95 border-2 border-[#00f0ff] p-3 rounded-md shadow-neon-cyan backdrop-blur animate-bounce-short">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="text-amber-400 animate-spin" size={18} />
          <div>
            <div className="text-[10px] font-pixel text-[#00f0ff] tracking-wider">
              ★ DATA PACKET DISCOVERED!
            </div>
            <div className="text-sm font-pixel text-white mt-0.5">
              {project.title}
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white p-1 rounded"
        >
          <X size={16} />
        </button>
      </div>

      <p className="text-xs text-gray-300 font-mono mt-2 leading-relaxed">
        {project.tagline}
      </p>

      <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-[#2a2b3d]">
        <span className="text-[9px] font-pixel text-amber-400">
          DAY {project.day} • {project.category}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewDetails(project)}
            className="px-2.5 py-1 bg-[#ff007f] hover:bg-[#ff1a8c] text-white font-pixel text-[9px] rounded flex items-center gap-1 shadow-neon-pink"
          >
            <span>DOSSIER</span>
            <ExternalLink size={10} />
          </button>
        </div>
      </div>
    </div>
  );
};

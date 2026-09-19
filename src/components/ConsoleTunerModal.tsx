import React from 'react';
import { ConsoleShell, ConsoleColor, CONSOLE_THEMES } from '../types/console';
import { sounds } from '../audio/soundManager';
import { X, Palette, Sliders, Check } from 'lucide-react';

interface ConsoleTunerModalProps {
  isOpen: boolean;
  currentShell: ConsoleShell;
  currentColor: ConsoleColor;
  onSelectShell: (shell: ConsoleShell) => void;
  onSelectColor: (color: ConsoleColor) => void;
  onClose: () => void;
}

export const ConsoleTunerModal: React.FC<ConsoleTunerModalProps> = ({
  isOpen,
  currentShell,
  currentColor,
  onSelectShell,
  onSelectColor,
  onClose
}) => {
  if (!isOpen) return null;

  const handleShellChange = (shell: ConsoleShell) => {
    sounds.playSwitchClick();
    onSelectShell(shell);
  };

  const handleColorChange = (color: ConsoleColor) => {
    sounds.playSwitchClick();
    onSelectColor(color);
  };

  const shells: { id: ConsoleShell; title: string; desc: string; icon: string }[] = [
    { id: 'handheld', title: 'POCKET HANDHELD', desc: 'Game Boy / Analogue Pocket vertical layout', icon: '📱' },
    { id: 'cabinet', title: 'ARCADE CABINET', desc: 'Classic coin-op standup with deep bevels & side-art', icon: '🕹️' },
    { id: 'cyberdeck', title: 'CYBERDECK RIG', desc: 'Futuristic angular cyber rig with neon vents', icon: '💻' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-fadeIn select-none">
      <div className="relative w-full max-w-md bg-[#0d0f1c] border-2 border-[#ff007f] rounded-xl shadow-neon-pink overflow-hidden max-h-[92vh] flex flex-col font-mono text-gray-200">
        
        {/* Header */}
        <div className="bg-[#141728] px-4 py-3 border-b border-[#2a2d48] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders size={18} className="text-[#ff007f]" />
            <div>
              <h3 className="font-pixel text-xs text-[#ff007f] tracking-wider">
                CONSOLE WORKSHOP // CUSTOMIZER
              </h3>
              <p className="text-[10px] text-gray-400">
                Tune hardware chassis shape & retro shell paint
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playSwitchClick();
              onClose();
            }}
            className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-5">
          
          {/* Section 1: Form Factor */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-pixel text-gray-300 mb-2.5">
              <span className="text-[#00f0ff]">1.</span>
              <span>HARDWARE FORM FACTOR:</span>
            </div>

            <div className="space-y-2">
              {shells.map((s) => {
                const isSelected = s.id === currentShell;
                return (
                  <button
                    key={s.id}
                    onClick={() => handleShellChange(s.id)}
                    className={`w-full p-2.5 rounded-lg border-2 text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-[#181d33] border-[#00f0ff] shadow-neon-cyan'
                        : 'bg-[#111322] border-[#22253c] hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{s.icon}</span>
                      <div>
                        <div className="font-pixel text-[11px] text-white flex items-center gap-2">
                          <span>{s.title}</span>
                          {isSelected && <Check size={14} className="text-[#00f0ff]" />}
                        </div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{s.desc}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Shell Paint / Color Palette */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-pixel text-gray-300 mb-2.5">
              <span className="text-[#ff007f]">2.</span>
              <span>CHASSIS SHELL PAINT:</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {(Object.keys(CONSOLE_THEMES) as ConsoleColor[]).map((colKey) => {
                const theme = CONSOLE_THEMES[colKey];
                const isSelected = colKey === currentColor;
                return (
                  <button
                    key={colKey}
                    onClick={() => handleColorChange(colKey)}
                    className={`p-2 rounded-lg border-2 flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-[#181d33] border-[#ff007f] shadow-neon-pink'
                        : 'bg-[#111322] border-[#22253c] hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Color Preview Swatch */}
                      <div
                        className={`w-7 h-7 rounded-md bg-gradient-to-br ${theme.bodyBg} border ${theme.bodyBorder} shadow-sm flex items-center justify-center`}
                      >
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: theme.accentColor }} />
                      </div>
                      <div>
                        <div className="font-pixel text-[10px] text-white flex items-center gap-2">
                          <span>{theme.name}</span>
                          <span className="text-[8px] px-1 py-0.2 bg-gray-800 text-gray-400 rounded">
                            {theme.badge}
                          </span>
                        </div>
                      </div>
                    </div>

                    {isSelected && <Check size={14} className="text-[#ff007f]" />}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-[#121424] px-4 py-2.5 border-t border-[#22253c] flex items-center justify-between">
          <span className="text-[10px] text-gray-500">
            Instant live preview on console
          </span>
          <button
            onClick={() => {
              sounds.playSwitchClick();
              onClose();
            }}
            className="px-3 py-1 bg-[#ff007f] hover:bg-[#ff1a8c] text-white font-pixel text-[9px] rounded shadow-neon-pink"
          >
            CONFIRM TUNE
          </button>
        </div>

      </div>
    </div>
  );
};

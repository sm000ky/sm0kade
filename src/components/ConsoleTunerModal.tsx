import React from 'react';
import { ConsolePresetId, CONSOLE_PRESETS, DeckPosition } from '../types/console';
import { sounds } from '../audio/soundManager';
import { X, Sliders, Check, Sparkles, Smartphone } from 'lucide-react';

interface ConsoleTunerModalProps {
  isOpen: boolean;
  currentPresetId: ConsolePresetId;
  onSelectPreset: (presetId: ConsolePresetId) => void;
  deckPosition: DeckPosition;
  onSelectDeckPosition: (pos: DeckPosition) => void;
  onClose: () => void;
}

export const ConsoleTunerModal: React.FC<ConsoleTunerModalProps> = ({
  isOpen,
  currentPresetId,
  onSelectPreset,
  deckPosition,
  onSelectDeckPosition,
  onClose
}) => {
  if (!isOpen) return null;

  const handleSelect = (id: ConsolePresetId) => {
    sounds.playCartridgeSwap();
    onSelectPreset(id);
  };

  const presetList = Object.values(CONSOLE_PRESETS);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm animate-fadeIn select-none font-mono">
      <div className="relative w-full max-w-lg bg-[#0d0f1c] border-2 border-[#ff007f] rounded-xl shadow-neon-pink overflow-hidden max-h-[92vh] flex flex-col text-gray-200">
        
        {/* Header */}
        <div className="bg-[#141728] px-4 py-3 border-b border-[#2a2d48] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders size={18} className="text-[#ff007f]" />
            <div>
              <h3 className="font-pixel text-xs text-[#ff007f] tracking-wider">
                CONSOLE WORKSHOP // 8 RETRO PRESETS
              </h3>
              <p className="text-[10px] text-gray-400">
                Transform chassis, button shapes, D-pad & authentic textures
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

        {/* Presets List */}
        <div className="p-3 overflow-y-auto space-y-3">
          
          {/* Deck Ergonomics Toggle */}
          <div className="bg-[#111322] border border-[#262a42] rounded-lg p-2.5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 font-pixel text-[10px] text-cyan-300">
                <Smartphone size={13} />
                <span>MOBILE DECK ERGONOMICS:</span>
              </div>
              <span className="text-[8px] text-gray-400 font-pixel">Poco/AMOLED 20:9</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-pixel">
              <button
                onClick={() => {
                  sounds.playSwitchClick();
                  onSelectDeckPosition('bottom');
                }}
                className={`py-1.5 px-2 rounded border text-center transition-all ${
                  deckPosition === 'bottom'
                    ? 'bg-[#00f0ff] text-black font-bold border-white shadow-neon-cyan'
                    : 'bg-[#181a28] text-gray-400 border-gray-700 hover:text-white'
                }`}
              >
                CLASSIC BOTTOM
              </button>

              <button
                onClick={() => {
                  sounds.playSwitchClick();
                  onSelectDeckPosition('comfort');
                }}
                className={`py-1.5 px-2 rounded border text-center transition-all ${
                  deckPosition === 'comfort'
                    ? 'bg-[#ff007f] text-white font-bold border-white shadow-neon-pink'
                    : 'bg-[#181a28] text-gray-400 border-gray-700 hover:text-white'
                }`}
              >
                COMFORT MID-LIFT
              </button>
            </div>
          </div>

          <div className="text-[10px] font-pixel text-gray-400 pt-1">
            SELECT RETRO CHASSIS PRESET:
          </div>

          {presetList.map((p) => {
            const isSelected = p.id === currentPresetId;
            return (
              <button
                key={p.id}
                onClick={() => handleSelect(p.id)}
                className={`w-full p-3 rounded-lg border-2 text-left transition-all flex items-center justify-between group ${
                  isSelected
                    ? 'bg-[#181d33] border-[#00f0ff] shadow-neon-cyan'
                    : 'bg-[#111322] border-[#22253c] hover:border-gray-500 hover:bg-[#151829]'
                }`}
              >
                {/* Left Info */}
                <div className="flex items-start gap-3">
                  {/* Theme Swatch with Button Shape Preview */}
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-br ${p.chassisBg} border-2 ${p.chassisBorder} flex flex-col items-center justify-center p-1 shadow-inner shrink-0 group-hover:scale-105 transition-transform`}
                  >
                    <div className="flex gap-1 mb-1">
                      {/* Button A Shape Preview */}
                      <div
                        className={`w-3 h-3 bg-gradient-to-b ${p.btnABg} border ${p.btnABorder} ${
                          p.buttonShape === 'square'
                            ? 'rounded-none'
                            : p.buttonShape === 'diamond'
                            ? 'rotate-45 rounded-xs'
                            : p.buttonShape === 'hexagon'
                            ? 'rounded-xs scale-90'
                            : 'rounded-full'
                        }`}
                      />
                      {/* Button B Shape Preview */}
                      <div
                        className={`w-3 h-3 bg-gradient-to-b ${p.btnBBg} border ${p.btnBBorder} ${
                          p.buttonShape === 'square'
                            ? 'rounded-none'
                            : p.buttonShape === 'diamond'
                            ? 'rotate-45 rounded-xs'
                            : p.buttonShape === 'hexagon'
                            ? 'rounded-xs scale-90'
                            : 'rounded-full'
                        }`}
                      />
                    </div>
                    <span className="text-[7px] font-pixel text-gray-400">{p.decalBadge}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4
                        className="font-pixel text-xs font-bold tracking-wide"
                        style={{ color: p.accentColor }}
                      >
                        {p.name}
                      </h4>
                      <span className="text-[8px] font-pixel px-1.5 py-0.2 bg-gray-800 text-gray-300 rounded">
                        {p.eraBadge}
                      </span>
                    </div>

                    <p className="text-[10px] text-gray-400 mt-1 leading-tight">
                      {p.tagline}
                    </p>

                    {/* Specs Tags */}
                    <div className="flex items-center gap-1.5 mt-1.5 text-[8px] font-pixel text-gray-500">
                      <span className="text-gray-400">D-PAD:</span>
                      <span className="text-cyan-300">{p.dpadShape.toUpperCase()}</span>
                      <span>•</span>
                      <span className="text-gray-400">BTNS:</span>
                      <span className="text-pink-400">{p.buttonShape.toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                {/* Right Selection Indicator */}
                <div className="shrink-0 ml-2">
                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-[#00f0ff]/20 text-[#00f0ff] border border-[#00f0ff] flex items-center justify-center">
                      <Check size={14} />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-gray-700 group-hover:border-gray-400" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-[#121424] px-4 py-2.5 border-t border-[#22253c] flex items-center justify-between text-[10px]">
          <div className="flex items-center gap-1 text-gray-400">
            <Sparkles size={12} className="text-amber-400" />
            <span>Instant live morphing on console</span>
          </div>
          <button
            onClick={() => {
              sounds.playSwitchClick();
              onClose();
            }}
            className="px-3.5 py-1 bg-[#ff007f] hover:bg-[#ff1a8c] text-white font-pixel text-[9px] rounded shadow-neon-pink"
          >
            APPLY THEME
          </button>
        </div>

      </div>
    </div>
  );
};

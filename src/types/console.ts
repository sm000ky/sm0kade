export type ConsolePresetId =
  | 'zerotwo-franxx'
  | 'classic-dmg'
  | 'atomic-purple'
  | 'atari-woodgrain'
  | 'cyberdeck-2077'
  | 'famicom-gold'
  | 'sega-genesis'
  | 'obsidian-stealth';

export type DpadShape = 'cross' | 'disc' | 'separate' | 'diamond';
export type ButtonShape = 'circle' | 'square' | 'diamond' | 'hexagon';
export type TextureStyle = 'matte' | 'woodgrain' | 'carbon' | 'translucent' | 'brushed-metal';

export interface ConsolePreset {
  id: ConsolePresetId;
  name: string;
  eraBadge: string;
  tagline: string;
  dpadShape: DpadShape;
  buttonShape: ButtonShape;
  textureStyle: TextureStyle;
  
  // Outer Chassis
  chassisBg: string;
  chassisBorder: string;
  chassisShadow: string;
  
  // Screen Lens Bezel
  lensBg: string;
  lensBorder: string;
  lensLabel: string;
  lensLabelColor: string;
  
  // D-Pad Styling
  dpadBg: string;
  dpadBorder: string;
  dpadTextColor: string;
  dpadActiveBg: string;
  
  // Action Buttons
  btnABg: string;
  btnABorder: string;
  btnAText: string;
  btnBBg: string;
  btnBBorder: string;
  btnBText: string;
  
  // Accent & Decals
  accentColor: string;
  decalBadge: string;
  decalText: string;
}

export const CONSOLE_PRESETS: Record<ConsolePresetId, ConsolePreset> = {
  'zerotwo-franxx': {
    id: 'zerotwo-franxx',
    name: 'Zero Two FranXX',
    eraBadge: 'CODE 002',
    tagline: 'Strelizia Cockpit Chassis • Crimson & Candy Pink',
    dpadShape: 'diamond',
    buttonShape: 'diamond',
    textureStyle: 'matte',
    chassisBg: 'from-[#380410] via-[#22020a] to-[#120005]',
    chassisBorder: 'border-[#ff0055]',
    chassisShadow: 'shadow-[0_0_40px_rgba(255,0,85,0.4)]',
    lensBg: 'bg-[#1a0208]',
    lensBorder: 'border-[#ff0055]/70',
    lensLabel: 'STRELIZIA // FRANXX MATRIX',
    lensLabelColor: 'text-[#ff007f]',
    dpadBg: 'from-[#4a0618] to-[#25020c]',
    dpadBorder: 'border-[#ff0055]/50',
    dpadTextColor: 'text-[#ff7aa3]',
    dpadActiveBg: 'active:from-[#ff0055] active:to-[#b3003b]',
    btnABg: 'from-[#ff0055] to-[#990033]',
    btnABorder: 'border-pink-300',
    btnAText: 'text-white',
    btnBBg: 'from-[#ff7aa3] to-[#cc4c74]',
    btnBBorder: 'border-white/80',
    btnBText: 'text-black',
    accentColor: '#ff0055',
    decalBadge: '002',
    decalText: 'DARLING × ZERO TWO'
  },
  'classic-dmg': {
    id: 'classic-dmg',
    name: 'GameBoy DMG-1989',
    eraBadge: '1989 RETRO',
    tagline: 'Iconic Off-White Textured Plastic & Magenta Buttons',
    dpadShape: 'cross',
    buttonShape: 'circle',
    textureStyle: 'matte',
    chassisBg: 'from-[#d2d2c7] via-[#bcbcb1] to-[#a3a398]',
    chassisBorder: 'border-[#75756a]',
    chassisShadow: 'shadow-[0_12px_35px_rgba(0,0,0,0.8)]',
    lensBg: 'bg-[#3b3e54]',
    lensBorder: 'border-[#222433]',
    lensLabel: 'DOT MATRIX WITH STEREO SOUND',
    lensLabelColor: 'text-[#8b1538]',
    dpadBg: 'from-[#303030] to-[#141414]',
    dpadBorder: 'border-gray-700',
    dpadTextColor: 'text-gray-400',
    dpadActiveBg: 'active:from-[#505050] active:to-[#222222]',
    btnABg: 'from-[#8b1538] to-[#590a20]',
    btnABorder: 'border-rose-900',
    btnAText: 'text-white',
    btnBBg: 'from-[#8b1538] to-[#590a20]',
    btnBBorder: 'border-rose-900',
    btnBText: 'text-white',
    accentColor: '#8b1538',
    decalBadge: 'DMG-01',
    decalText: 'NINTENDO COMPATIBLE'
  },
  'atomic-purple': {
    id: 'atomic-purple',
    name: 'Atomic Purple 90s',
    eraBadge: 'TRANSLUCENT',
    tagline: 'Visible PCB Traces & Translucent 90s Grape Shell',
    dpadShape: 'disc',
    buttonShape: 'circle',
    textureStyle: 'translucent',
    chassisBg: 'from-[#2e1045]/90 via-[#200b33]/90 to-[#12041f]/95',
    chassisBorder: 'border-[#7e22ce]',
    chassisShadow: 'shadow-[0_0_35px_rgba(168,85,247,0.35)]',
    lensBg: 'bg-[#150724]',
    lensBorder: 'border-[#9333ea]',
    lensLabel: 'COLOR MATRIX // Y2K EDITION',
    lensLabelColor: 'text-[#c084fc]',
    dpadBg: 'from-[#4c1d95] to-[#2e1065]',
    dpadBorder: 'border-[#a855f7]/60',
    dpadTextColor: 'text-purple-300',
    dpadActiveBg: 'active:from-[#a855f7] active:to-[#6b21a8]',
    btnABg: 'from-[#ec4899] to-[#be185d]',
    btnABorder: 'border-pink-300',
    btnAText: 'text-white',
    btnBBg: 'from-[#38bdf8] to-[#0284c7]',
    btnBBorder: 'border-cyan-300',
    btnBText: 'text-black',
    accentColor: '#a855f7',
    decalBadge: 'GBC-98',
    decalText: 'CLEAR SHELL PCB'
  },
  'cyberdeck-2077': {
    id: 'cyberdeck-2077',
    name: 'Cyberdeck Rig 2077',
    eraBadge: 'CYBERPUNK',
    tagline: 'Carbon Fiber Weave • Hexagonal Military Matrix',
    dpadShape: 'separate',
    buttonShape: 'hexagon',
    textureStyle: 'carbon',
    chassisBg: 'from-[#080b12] via-[#04060a] to-[#000000]',
    chassisBorder: 'border-[#00f0ff]',
    chassisShadow: 'shadow-[0_0_40px_rgba(0,240,255,0.4)]',
    lensBg: 'bg-[#03060c]',
    lensBorder: 'border-[#00f0ff]/80',
    lensLabel: 'NEURAL DECK // ICE BREAKER',
    lensLabelColor: 'text-[#00f0ff]',
    dpadBg: 'from-[#0c1424] to-[#050912]',
    dpadBorder: 'border-[#00f0ff]/60',
    dpadTextColor: 'text-[#00f0ff]',
    dpadActiveBg: 'active:from-[#00f0ff] active:to-[#0099aa]',
    btnABg: 'from-[#ffea00] to-[#b3a400]',
    btnABorder: 'border-yellow-200',
    btnAText: 'text-black',
    btnBBg: 'from-[#00f0ff] to-[#008899]',
    btnBBorder: 'border-cyan-200',
    btnBText: 'text-black',
    accentColor: '#00f0ff',
    decalBadge: 'RIG-77',
    decalText: 'NETRUNNER HARDWARE'
  },
  'atari-woodgrain': {
    id: 'atari-woodgrain',
    name: 'Atari 1977 Woodgrain',
    eraBadge: 'WOODGRAIN',
    tagline: 'Vintage Walnut Wood Faceplate & Orange Rocker Switches',
    dpadShape: 'disc',
    buttonShape: 'square',
    textureStyle: 'woodgrain',
    chassisBg: 'from-[#3b220c] via-[#261506] to-[#150a02]',
    chassisBorder: 'border-[#8c4f1c]',
    chassisShadow: 'shadow-[0_10px_35px_rgba(140,79,28,0.3)]',
    lensBg: 'bg-[#150d06]',
    lensBorder: 'border-[#5c3514]',
    lensLabel: 'VIDEO COMPUTER SYSTEM // 2600',
    lensLabelColor: 'text-[#ffaa00]',
    dpadBg: 'from-[#28180c] to-[#120a04]',
    dpadBorder: 'border-[#ffaa00]/40',
    dpadTextColor: 'text-amber-400',
    dpadActiveBg: 'active:from-[#ffaa00] active:to-[#b37700]',
    btnABg: 'from-[#ff5500] to-[#b33c00]',
    btnABorder: 'border-orange-300',
    btnAText: 'text-white',
    btnBBg: 'from-[#ffaa00] to-[#b37700]',
    btnBBorder: 'border-amber-300',
    btnBText: 'text-black',
    accentColor: '#ffaa00',
    decalBadge: 'VCS-77',
    decalText: 'REAL WALNUT ACCENT'
  },
  'famicom-gold': {
    id: 'famicom-gold',
    name: 'Famicom Crimson & Gold',
    eraBadge: '1983 JPN',
    tagline: 'Brushed Golden Aluminum & Deep Burgundy Red',
    dpadShape: 'cross',
    buttonShape: 'square',
    textureStyle: 'brushed-metal',
    chassisBg: 'from-[#540812] via-[#38040b] to-[#1f0105]',
    chassisBorder: 'border-[#d4af37]',
    chassisShadow: 'shadow-[0_0_35px_rgba(212,175,55,0.3)]',
    lensBg: 'bg-[#1a0306]',
    lensBorder: 'border-[#d4af37]/80',
    lensLabel: 'FAMILY COMPUTER // 8-BIT',
    lensLabelColor: 'text-[#ffd700]',
    dpadBg: 'from-[#2b2b2b] to-[#141414]',
    dpadBorder: 'border-gray-600',
    dpadTextColor: 'text-[#d4af37]',
    dpadActiveBg: 'active:from-[#d4af37] active:to-[#997d26]',
    btnABg: 'from-[#d4af37] to-[#8c7423]',
    btnABorder: 'border-yellow-200',
    btnAText: 'text-black',
    btnBBg: 'from-[#8c121e] to-[#4d070e]',
    btnBBorder: 'border-red-400',
    btnBText: 'text-white',
    accentColor: '#ffd700',
    decalBadge: 'HVC-001',
    decalText: 'FAMILY COMPUTER'
  },
  'sega-genesis': {
    id: 'sega-genesis',
    name: 'Sega 16-Bit Genesis',
    eraBadge: '16-BIT MEGA',
    tagline: 'Matte Charcoal Chassis with Iconic 16-BIT Golden Decal',
    dpadShape: 'disc',
    buttonShape: 'circle',
    textureStyle: 'matte',
    chassisBg: 'from-[#1a1b22] via-[#111217] to-[#090a0d]',
    chassisBorder: 'border-[#3f4152]',
    chassisShadow: 'shadow-[0_10px_35px_rgba(0,0,0,0.9)]',
    lensBg: 'bg-[#0a0b10]',
    lensBorder: 'border-[#0088ff]',
    lensLabel: 'HIGH DEFINITION GRAPHICS // 16-BIT',
    lensLabelColor: 'text-[#0088ff]',
    dpadBg: 'from-[#282a36] to-[#12131a]',
    dpadBorder: 'border-gray-600',
    dpadTextColor: 'text-blue-400',
    dpadActiveBg: 'active:from-[#0088ff] active:to-[#0055aa]',
    btnABg: 'from-[#0088ff] to-[#004488]',
    btnABorder: 'border-blue-300',
    btnAText: 'text-white',
    btnBBg: 'from-[#ff0033] to-[#99001f]',
    btnBBorder: 'border-red-300',
    btnBText: 'text-white',
    accentColor: '#0088ff',
    decalBadge: '16-BIT',
    decalText: 'BLAST PROCESSING'
  },
  'obsidian-stealth': {
    id: 'obsidian-stealth',
    name: 'Obsidian Stealth MVS',
    eraBadge: 'NEO-GEO MVS',
    tagline: 'Midnight Matte Armor with Quad Neo-Geo Arcade Colors',
    dpadShape: 'cross',
    buttonShape: 'circle',
    textureStyle: 'matte',
    chassisBg: 'from-[#141624] via-[#0e0f19] to-[#07080d]',
    chassisBorder: 'border-[#2d3047]',
    chassisShadow: 'shadow-[0_0_35px_rgba(0,240,255,0.25)]',
    lensBg: 'bg-[#080911]',
    lensBorder: 'border-[#00f0ff]/60',
    lensLabel: 'PRO-GEAR SPEC // ADVANCED 24-BIT',
    lensLabelColor: 'text-[#00f0ff]',
    dpadBg: 'from-[#25283d] to-[#151724]',
    dpadBorder: 'border-gray-600',
    dpadTextColor: 'text-[#00f0ff]',
    dpadActiveBg: 'active:from-[#00f0ff] active:to-[#009da8]',
    btnABg: 'from-[#ff0055] to-[#990033]',
    btnABorder: 'border-pink-300',
    btnAText: 'text-white',
    btnBBg: 'from-[#ffaa00] to-[#b37700]',
    btnBBorder: 'border-amber-300',
    btnBText: 'text-black',
    accentColor: '#00f0ff',
    decalBadge: 'MVS-04',
    decalText: 'NEO-GEO ARCADE'
  }
};

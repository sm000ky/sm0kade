export type ConsoleShell = 'handheld' | 'cabinet' | 'cyberdeck';

export type ConsoleColor = 'obsidian' | 'atomic-purple' | 'retro-dmg' | 'zerotwo-crimson' | 'neon-gold';

export interface ConsoleTheme {
  id: ConsoleColor;
  name: string;
  badge: string;
  bodyBg: string;
  bodyBorder: string;
  lensBg: string;
  lensBorder: string;
  dpadColor: string;
  buttonA: string;
  buttonB: string;
  accentColor: string;
}

export const CONSOLE_THEMES: Record<ConsoleColor, ConsoleTheme> = {
  'obsidian': {
    id: 'obsidian',
    name: 'Obsidian Stealth',
    badge: 'DARK MATTE',
    bodyBg: 'from-[#181a28] via-[#12131f] to-[#0c0d16]',
    bodyBorder: 'border-[#2c2f48]',
    lensBg: 'bg-[#0c0e18]',
    lensBorder: 'border-[#33364f]',
    dpadColor: 'from-[#343750] to-[#202235]',
    buttonA: 'from-[#ff0055] to-[#a80038] border-pink-300/90 text-white',
    buttonB: 'from-[#ffaa00] to-[#b37400] border-amber-300/80 text-black',
    accentColor: '#00f0ff'
  },
  'atomic-purple': {
    id: 'atomic-purple',
    name: 'Atomic Purple',
    badge: '90s GLOSS',
    bodyBg: 'from-[#2e1045] via-[#200b33] to-[#12041f]',
    bodyBorder: 'border-[#6b21a8]',
    lensBg: 'bg-[#150724]',
    lensBorder: 'border-[#7e22ce]',
    dpadColor: 'from-[#4c1d95] to-[#2e1065]',
    buttonA: 'from-[#ec4899] to-[#be185d] border-pink-400 text-white',
    buttonB: 'from-[#38bdf8] to-[#0284c7] border-cyan-300 text-black',
    accentColor: '#c084fc'
  },
  'retro-dmg': {
    id: 'retro-dmg',
    name: 'Classic DMG-01',
    badge: '1989 RETRO',
    bodyBg: 'from-[#cfcfc4] via-[#b8b8ad] to-[#9c9c91]',
    bodyBorder: 'border-[#6e6e65]',
    lensBg: 'bg-[#3b3d4f]',
    lensBorder: 'border-[#20212e]',
    dpadColor: 'from-[#2b2b2b] to-[#141414]',
    buttonA: 'from-[#8b1538] to-[#590a20] border-rose-900 text-white',
    buttonB: 'from-[#8b1538] to-[#590a20] border-rose-900 text-white',
    accentColor: '#ff0055'
  },
  'zerotwo-crimson': {
    id: 'zerotwo-crimson',
    name: 'Zero Two 002',
    badge: 'CO-PILOT',
    bodyBg: 'from-[#3f0817] via-[#2a040e] to-[#170107]',
    bodyBorder: 'border-[#e11d48]',
    lensBg: 'bg-[#1a0208]',
    lensBorder: 'border-[#f43f5e]',
    dpadColor: 'from-[#4c0519] to-[#25020c]',
    buttonA: 'from-[#ff0055] to-[#9f1239] border-red-300 text-white',
    buttonB: 'from-[#f472b6] to-[#db2777] border-pink-300 text-white',
    accentColor: '#ff0055'
  },
  'neon-gold': {
    id: 'neon-gold',
    name: 'Neo-Geo MVS Gold',
    badge: 'ARCADE GOLD',
    bodyBg: 'from-[#3a2800] via-[#241900] to-[#140e00]',
    bodyBorder: 'border-[#ca8a04]',
    lensBg: 'bg-[#1a1200]',
    lensBorder: 'border-[#eab308]',
    dpadColor: 'from-[#422006] to-[#1c0d02]',
    buttonA: 'from-[#eab308] to-[#a16207] border-yellow-200 text-black',
    buttonB: 'from-[#00f0ff] to-[#0284c7] border-cyan-300 text-black',
    accentColor: '#facc15'
  }
};

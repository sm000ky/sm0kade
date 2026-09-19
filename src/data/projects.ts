import { Project } from '../types/project';

export const PROJECTS: Project[] = [
  {
    day: 5,
    id: 'sm0kade',
    title: 'Sm0kade',
    tagline: 'Multi-Cartridge Living Retro Arcade & Portfolio Cabinet',
    description: 'An interactive 8-bit arcade machine that doubles as a living software portfolio. Features modular hot-swappable game cartridges (Pac-Man, Space Invaders, Breakout), authentic Web Audio chiptune synthesis, and unified project leaderboard.',
    category: 'Arcade & Portfolio',
    techStack: ['React 18', 'TypeScript', 'HTML5 Canvas', 'Web Audio API', 'Tailwind CSS'],
    githubUrl: 'https://github.com/sm000ky/sm0kade',
    liveUrl: 'https://sm0kade.vercel.app',
    score: 99990,
    rank: '01',
    status: 'Production',
    releaseDate: 'Day 5',
    features: [
      'Modular plug-and-play cartridge architecture',
      'Playable Pac-Man, Byte Invaders, and Tech Breakout engines',
      '100% procedural Web Audio synthesizer (zero audio bloat)',
      'High-Score Leaderboard & Cartridge Dock for portfolio viewing',
      'Universal touch virtual D-Pad for mobile & keyboard controls for PC'
    ]
  },
  {
    day: 4,
    id: 'komorebi',
    title: 'Komorebi Studio',
    tagline: 'Anime Wallpaper Lab & Neural Palette Forge',
    description: 'Specialized canvas studio for anime wallpapers featuring dual aspect-ratio rendering (16:9 desktop & 20:9 mobile), neural 4K reconstruction filters, micro-nudge directional pad, and dynamic palette extraction.',
    category: 'Creative Lab',
    techStack: ['React', 'HTML5 Canvas', 'Tailwind CSS', 'Web Audio', 'Vite'],
    githubUrl: 'https://github.com/sm000ky/komorebi',
    liveUrl: 'https://komorebi-studio.vercel.app',
    score: 88500,
    rank: '02',
    status: 'Production',
    releaseDate: 'Day 4',
    features: [
      'Edge-clamping canvas with tactile micro-nudge d-pad',
      'Dual-format export: 20:9 Ultra-Tall & 16:9 Landscape',
      'Palette forge with instant hex color extraction',
      'Lightweight neural sharpening and scanline overlays'
    ]
  },
  {
    day: 3,
    id: 'sedot-cli',
    title: 'SEDOT.CLI',
    tagline: 'Cyberpunk Terminal Media Engine & Stream Extractor',
    description: 'High-speed command-line media harvester and transcoder for YouTube, TikTok, Twitter/X, and Instagram. Built with Rich terminal visuals, asynchronous chunking, and instant FFmpeg audio extraction.',
    category: 'Media CLI',
    techStack: ['Python 3.12', 'Rich TUI', 'FFmpeg', 'yt-dlp', 'Asyncio'],
    githubUrl: 'https://github.com/sm000ky/sedot-cli',
    score: 77400,
    rank: '03',
    status: 'Production',
    releaseDate: 'Day 3',
    features: [
      'Multi-platform streaming media extraction',
      'Real-time cyberpunk progress visualizer & byte counter',
      'Lossless automated MP3/FLAC conversion pipelines',
      'Resilient network retry with auto-fallback'
    ]
  },
  {
    day: 2,
    id: 'fiscalia',
    title: 'Fiscalia RPG',
    tagline: 'Gamified Indonesian Tax Architecture & Rogue Quest',
    description: 'Turn-based educational tax roguelike translating complex fiscal regulations (UU HPP, TER PPh 21 PP 58/2023) into dungeon crawler mechanics. Defeat Tax Audit bosses and optimize business expense equipment.',
    category: 'Gamification',
    techStack: ['TypeScript', 'React', 'Tailwind CSS', 'Lucide Icons'],
    githubUrl: 'https://github.com/sm000ky/fiscalia',
    liveUrl: 'https://fiscalia.vercel.app',
    score: 66200,
    rank: '04',
    status: 'Production',
    releaseDate: 'Day 2',
    features: [
      'Accurate Indonesian PPh 21 calculation engine with TER tiers',
      'Turn-based dungeon encounters against tax penalty bosses',
      'Interactive audit logbook with exportable tax simulations'
    ]
  },
  {
    day: 1,
    id: 'finora',
    title: 'Finora Studio',
    tagline: 'Accounting Studio & SAK EMKM Financial Ledger',
    description: 'Precision financial bookkeeping studio designed for Indonesian MSMEs (UMKM). Features compliant SAK EMKM ledgers, automatic balance sheets, income statements, and rich visual cashflow analytics.',
    category: 'Finance',
    techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Chart.js'],
    githubUrl: 'https://github.com/sm000ky/finora',
    liveUrl: 'https://finora.vercel.app',
    score: 55100,
    rank: '05',
    status: 'Production',
    releaseDate: 'Day 1',
    features: [
      'Full double-entry bookkeeping engine adhering to SAK EMKM',
      'Instant balance sheet and profit-loss statement generator',
      'Local-first offline storage with exportable financial reports'
    ]
  }
];

export const getProjectById = (id: string): Project | undefined => {
  return PROJECTS.find((p) => p.id === id);
};

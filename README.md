# 🕹️ Sm0kade // Multi-Cartridge Retro Arcade & Portfolio Cabinet

> **A living retro arcade cabinet and interactive software portfolio.**
> Built with zero-dependency procedural Web Audio synthesis, pure HTML5 Canvas 2D render loops, and a plug-and-play cartridge architecture.

---

## ⚡ Overview

**Sm0kade** bridges classic 8-bit arcade gameplay with a high-contrast developer portfolio. Rather than burying work in static resume bullet points, visitors can play authentic arcade games, discover project floppy shards in-game, or switch seamlessly into the **Hall of Fame Dossier** view.

### 🎮 The 3 Initial Cartridges
1. 🟡 **DEV LABYRINTH (Pac-Man Engine):** Navigate the memory maze, collect XP pellets, avoid bug ghosts (`404`, `LMK`, `MERGE`, `SYNTAX`), and grab center floppy disks to unlock project cards.
2. 👾 **BYTE INVADERS (Space Shooter):** Pilot the defense cannon, destroy waves of marching runtime errors, shoot the mystery tech UFO, and defend defensive firewalls.
3. 🧱 **TECH BREAKOUT (Brick Smasher):** Deflect the energy ball through stacks of TypeScript, Python, Linux, and React bricks; smash golden bricks to catch dropping data shards.

---

## 🛠️ Open-Code & Modular Cartridge Architecture

Sm0kade is built with an **open, decoupled plugin pattern**. You never have to rewrite or hack the core cabinet to add new games or projects.

### 1. Adding a New Project
Edit `src/data/projects.ts` and append a new entry to `PROJECTS`:
```typescript
{
  day: 6,
  id: 'new-engine',
  title: 'Project Name',
  tagline: 'Short Punchy Tagline',
  description: 'Detailed specs & overview...',
  category: 'Creative Lab',
  techStack: ['Rust', 'WebAssembly'],
  githubUrl: 'https://github.com/sm000ky/new-engine',
  liveUrl: 'https://new-engine.vercel.app',
  score: 95000,
  rank: '06',
  status: 'Production',
  releaseDate: 'Day 6',
  features: ['Feature 1', 'Feature 2']
}
```

### 2. Adding a New Game Cartridge
1. Create your game class implementing the `Cartridge` interface in `src/games/yourgame/YourGame.ts`:
```typescript
import { Cartridge, GameCallbacks, InputState } from '../types';

export class YourGame implements Cartridge {
  id = 'yourgame';
  title = 'YOUR GAME';
  subtitle = 'GENRE // SUBTITLE';
  genre = 'Arcade';
  themeColor = '#00ff66';
  icon = '🎯';
  instructions = {
    desktop: 'ARROW KEYS to move • SPACE to action',
    mobile: 'Virtual D-Pad • Tap A'
  };

  init(canvas, ctx, callbacks) { /* setup */ }
  update(deltaTime, input) { /* math & physics */ }
  render(ctx, width, height) { /* draw */ }
  destroy() { /* cleanup */ }
  reset() { /* reset */ }
  getScore() { return this.score; }
  getLives() { return this.lives; }
  isPaused() { return false; }
  setPaused(p) { }
}
```
2. Register it in `src/games/registry.ts`:
```typescript
import { YourGame } from './yourgame/YourGame';

export const CARTRIDGES: CartridgeMetadata[] = [
  // ... existing cartridges ...
  {
    id: 'yourgame',
    title: 'YOUR GAME',
    subtitle: 'RETRO // ENGINE',
    genre: 'Arcade',
    themeColor: '#00ff66',
    icon: '🎯',
    factory: () => new YourGame()
  }
];
```
The arcade console will automatically add it to the cartridge selection slot!

---

## 🕹️ Controls

| Control | Windows / PC Keyboard | Android / Mobile Touch |
| :--- | :--- | :--- |
| **Direction** | `Arrow Keys` or `W / A / S / D` | 4-Way Virtual D-Pad / Swipe |
| **Action [A]** | `Spacebar` / `J` | Button [A] |
| **Special [B]** | `Shift` / `K` | Button [B] |
| **Restart Game** | `R` key | Reset icon on HUD |
| **Insert Coin** | `Enter` key or Header button | `COIN` button on Marquee |
| **Scanlines Toggle**| Monitor icon | Monitor icon |

---

## 🎨 Tech Stack
- **Frontend Engine:** React 18 + Vite
- **Language:** TypeScript
- **Styling & FX:** Tailwind CSS with custom CRT scanline shaders & neon glow
- **Canvas Rendering:** HTML5 Canvas 2D context (60 FPS smooth rendering)
- **Audio Synthesizer:** Pure Web Audio API (procedural square, triangle, and noise waveforms)
- **Icons:** Lucide React

---

## 👑 Attribution & Credits

**Crafted by sm000ky × Zero Two**  
*Part of the 1-Day-1-Project Protocol.*

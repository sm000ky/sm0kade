# 🕹️ Sm0kade // 6-in-1 Retro Arcade & Living Portfolio Cabinet

> **An interactive 8-bit multi-cartridge arcade console and living software portfolio.**
> Built with zero-dependency procedural Web Audio synthesis, pure HTML5 Canvas 2D render loops, and a modular plug-and-play cartridge architecture.

---

## ⚡ Overview

**Sm0kade** bridges classic 8-bit arcade gameplay with a high-contrast developer portfolio. Rather than burying work in static resume bullet points, visitors can play 6 authentic arcade games, discover project floppy shards in-game, or switch seamlessly into the **Hall of Fame Dossier** view.

### 🎮 The 6 Classic Cartridges
1. 🟡 **DEV LABYRINTH (Pac-Man Engine):** Integer tile-stepping memory maze. Eat dots & power pellets, avoid bugs (`404`, `LMK`, `MERGE`, `SYNTAX`), and collect floppy disks to unlock project cards.
2. 👾 **BYTE INVADERS (Space Shooter):** Pilot the defense cannon, destroy waves of marching runtime errors, shoot the mystery tech UFO, and defend defensive firewalls.
3. 🧱 **TECH BREAKOUT (Brick Smasher):** Deflect the energy ball through stacks of TypeScript, Python, Linux, and React bricks; smash golden bricks to catch dropping data shards.
4. 🐍 **CYBER SNAKE (Matrix Snake):** Classic Nokia/arcade snake. Navigate the neon grid, gobble data nodes, dodge the perimeter, and grab portfolio floppy discs.
5. 🧩 **BLOCK STACKER (Tetris Engine):** Standard 10x20 matrix falling tetrominoes with classic rotations, ghost piece projection, line clear multipliers, and portfolio drops.
6. 🚀 **CYBER FLAP (Flappy Flight):** Physics-based rocket flight dodging scrolling server stacks. Addictive, high-velocity reflex test.

---

## 🛠️ Open-Code & Modular Cartridge Architecture

Sm0kade is built with an **open, decoupled plugin pattern**. Adding a new game or project requires zero refactoring of existing code.

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
1. Create your game class implementing the `Cartridge` interface in `src/games/yourgame/YourGame.ts`.
2. Register it in `src/games/registry.ts`.
The arcade console automatically adds it to the **Cartridge Vault** and the controller's `SELECT` cycle.

---

## 🕹️ Controls

| Control | Windows / PC Keyboard | Android / Mobile Touch |
| :--- | :--- | :--- |
| **Direction** | `Arrow Keys` or `W / A / S / D` | 4-Way Virtual D-Pad / Canvas Swipe |
| **Action [A]** | `Spacebar` / `J` | Button [A] |
| **Boost / Alt [B]** | `Shift` / `K` | Button [B] |
| **Quick Cartridge Cycle** | `Tab` / Bezel Button | Rubber `[SELECT]` button |
| **Restart Game** | `R` key | Rubber `[START]` button |
| **Cartridge Vault (6-in-1)** | Click `[VAULT]` on dock | Tap `[SLOT X/6]` pill |
| **Insert Coin** | `Enter` key or Header button | `COIN` button on Marquee |
| **8-Bit BGM Toggle** | Click `BGM` on Header | Tap `BGM` on Header |
| **Scanlines Toggle** | Monitor icon | Monitor icon |

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

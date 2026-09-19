import { Cartridge, GameCallbacks, InputState } from '../types';
import { sounds } from '../../audio/soundManager';
import { PROJECTS } from '../../data/projects';

// 19 cols x 21 rows
// 0: Walkable Corridor
// 1: Wall
// 2: Dot
// 3: Power Pellet
// 4: Ghost Gate
const BASE_MAP: number[][] = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,3,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,3,1],
  [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
  [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
  [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,2,1],
  [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
  [1,1,1,1,2,1,1,1,0,0,0,1,1,1,2,1,1,1,1],
  [0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0],
  [1,1,1,1,2,1,0,1,1,0,1,1,0,1,2,1,1,1,1],
  [0,0,0,0,2,0,0,1,0,0,0,1,0,0,2,0,0,0,0],
  [1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1],
  [0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0],
  [1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1],
  [1,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,1],
  [1,2,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,2,1],
  [1,3,2,1,2,2,2,2,2,0,2,2,2,2,2,1,2,3,1],
  [1,1,2,1,2,1,2,1,1,1,1,1,2,1,2,1,2,1,1],
  [1,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,1],
  [1,2,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,2,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

interface TileEntity {
  tileX: number;
  tileY: number;
  targetX: number;
  targetY: number;
  progress: number; // 0 to 1
  dirX: number;
  dirY: number;
  speed: number;
}

interface Ghost extends TileEntity {
  color: string;
  name: string;
  isFrightened: boolean;
  startX: number;
  startY: number;
}

export class PacmanGame implements Cartridge {
  id = 'pacman';
  title = 'DEV LABYRINTH';
  subtitle = 'PAC-MAN ENGINE // CODE HUNTER';
  genre = 'Maze Action';
  themeColor = '#ffea00';
  icon = '🟡';
  instructions = {
    desktop: 'ARROW KEYS / WASD to move • Eat dots, avoid bugs, collect Floppy Disks!',
    mobile: 'Swipe screen or use Virtual D-Pad • Tap A for speed boost'
  };

  private callbacks: GameCallbacks | null = null;
  private map: number[][] = [];
  private score: number = 0;
  private lives: number = 3;
  private isGameOver: boolean = false;
  private paused: boolean = false;

  // Pacman State (Tile-Stepping Model)
  private pacman: TileEntity = {
    tileX: 9,
    tileY: 16,
    targetX: 8,
    targetY: 16,
    progress: 0,
    dirX: -1,
    dirY: 0,
    speed: 4.8 // tiles per second
  };
  private desiredDirX: number = -1;
  private desiredDirY: number = 0;
  private mouthAngle: number = 0.2;
  private mouthDir: number = 1;

  // Ghosts
  private ghosts: Ghost[] = [];
  private frightenedTimer: number = 0;
  private ghostStreak: number = 0;

  // Floppy Project Item
  private floppy: { active: boolean; x: number; y: number; projectIndex: number } = {
    active: false,
    x: 9,
    y: 10,
    projectIndex: 0
  };
  private dotsEaten: number = 0;
  private totalDots: number = 0;

  init(_canvas: HTMLCanvasElement, _ctx: CanvasRenderingContext2D, callbacks: GameCallbacks) {
    this.callbacks = callbacks;
    this.reset();
  }

  reset() {
    this.score = 0;
    this.lives = 3;
    this.isGameOver = false;
    this.paused = false;
    this.dotsEaten = 0;
    this.totalDots = 0;
    this.ghostStreak = 0;

    this.map = BASE_MAP.map((row) =>
      row.map((cell) => {
        if (cell === 2 || cell === 3) this.totalDots++;
        return cell;
      })
    );

    this.resetPositions();

    if (this.callbacks) {
      this.callbacks.onScoreUpdate(this.score);
      this.callbacks.onLivesUpdate(this.lives);
    }
  }

  private resetPositions() {
    this.pacman = {
      tileX: 9,
      tileY: 16,
      targetX: 8,
      targetY: 16,
      progress: 0,
      dirX: -1,
      dirY: 0,
      speed: 4.8
    };
    this.desiredDirX = -1;
    this.desiredDirY = 0;

    // 4 Ghosts placed at clear open corridor positions
    this.ghosts = [
      { tileX: 9, tileY: 8, targetX: 8, targetY: 8, progress: 0, dirX: -1, dirY: 0, speed: 3.2, color: '#ff0033', name: '404', isFrightened: false, startX: 9, startY: 8 },
      { tileX: 8, tileY: 8, targetX: 9, targetY: 8, progress: 0, dirX: 1, dirY: 0, speed: 3.0, color: '#ff69b4', name: 'LMK', isFrightened: false, startX: 8, startY: 8 },
      { tileX: 10, tileY: 8, targetX: 11, targetY: 8, progress: 0, dirX: 1, dirY: 0, speed: 2.8, color: '#00ffff', name: 'MERGE', isFrightened: false, startX: 10, startY: 8 },
      { tileX: 6, tileY: 8, targetX: 5, targetY: 8, progress: 0, dirX: -1, dirY: 0, speed: 2.6, color: '#ffaa00', name: 'SYNTAX', isFrightened: false, startX: 6, startY: 8 }
    ];

    this.floppy.active = false;
    this.frightenedTimer = 0;
    this.ghostStreak = 0;
  }

  private isTileWalkable(x: number, y: number): boolean {
    // Tunnel wrap rows
    if ((y === 8 || y === 10 || y === 12) && (x < 0 || x >= 19)) return true;
    if (x < 0 || x >= 19 || y < 0 || y >= 21) return false;
    return this.map[y][x] !== 1;
  }

  update(deltaTime: number, input: InputState) {
    if (this.isGameOver || this.paused) return;
    const dt = Math.min(deltaTime, 0.05);

    // 1. Capture desired input direction
    if (input.up) { this.desiredDirX = 0; this.desiredDirY = -1; }
    else if (input.down) { this.desiredDirX = 0; this.desiredDirY = 1; }
    else if (input.left) { this.desiredDirX = -1; this.desiredDirY = 0; }
    else if (input.right) { this.desiredDirX = 1; this.desiredDirY = 0; }

    // 2. Chomp animation
    this.mouthAngle += this.mouthDir * dt * 6;
    if (this.mouthAngle > 0.45) {
      this.mouthAngle = 0.45;
      this.mouthDir = -1;
    } else if (this.mouthAngle < 0.05) {
      this.mouthAngle = 0.05;
      this.mouthDir = 1;
    }

    // 3. Frightened timer
    if (this.frightenedTimer > 0) {
      this.frightenedTimer -= dt;
      if (this.frightenedTimer <= 0) {
        this.frightenedTimer = 0;
        this.ghostStreak = 0;
        this.ghosts.forEach((g) => (g.isFrightened = false));
      }
    }

    // 4. Update Pac-Man (Tile Engine)
    this.updatePacman(dt, input.actionA);

    // 5. Update Ghosts (Tile Engine)
    this.updateGhosts(dt);

    // 6. Check Collisions
    this.checkCollisions();

    // 7. Check Level Clear
    if (this.dotsEaten >= this.totalDots) {
      sounds.playProjectDiscovered();
      this.reset();
    }
  }

  private updatePacman(dt: number, isBoosted: boolean) {
    const p = this.pacman;
    const currentSpeed = isBoosted ? p.speed * 1.35 : p.speed;

    // Instant 180-degree reversal check:
    // If the user presses opposite to current movement, turn back immediately!
    if (this.desiredDirX === -p.dirX && this.desiredDirY === -p.dirY && (p.dirX !== 0 || p.dirY !== 0)) {
      const tempX = p.tileX;
      const tempY = p.tileY;
      p.tileX = p.targetX;
      p.tileY = p.targetY;
      p.targetX = tempX;
      p.targetY = tempY;
      p.dirX = this.desiredDirX;
      p.dirY = this.desiredDirY;
      p.progress = 1 - p.progress;
    }

    // Advance progress towards target tile
    p.progress += currentSpeed * dt;

    if (p.progress >= 1) {
      // Arrived at target tile!
      p.tileX = p.targetX;
      p.tileY = p.targetY;
      p.progress = 0;

      // Handle Tunnel Wrap
      if (p.tileX < 0) p.tileX = 18;
      if (p.tileX > 18) p.tileX = 0;

      // Check eating item on this tile
      if (p.tileX >= 0 && p.tileX < 19 && p.tileY >= 0 && p.tileY < 21) {
        const cell = this.map[p.tileY][p.tileX];
        if (cell === 2) {
          this.map[p.tileY][p.tileX] = 0;
          this.score += 10;
          this.dotsEaten++;
          sounds.playDot();
          if (this.callbacks) this.callbacks.onScoreUpdate(this.score);

          if (this.dotsEaten % 25 === 0 && !this.floppy.active) {
            this.floppy.active = true;
            this.floppy.projectIndex = Math.floor(Math.random() * PROJECTS.length);
          }
        } else if (cell === 3) {
          this.map[p.tileY][p.tileX] = 0;
          this.score += 50;
          this.dotsEaten++;
          this.frightenedTimer = 8.0;
          this.ghostStreak = 0;
          this.ghosts.forEach((g) => (g.isFrightened = true));
          sounds.playPowerPellet();
          if (this.callbacks) this.callbacks.onScoreUpdate(this.score);
        }

        // Collect Floppy
        if (this.floppy.active && p.tileX === this.floppy.x && p.tileY === this.floppy.y) {
          this.floppy.active = false;
          this.score += 300;
          sounds.playProjectDiscovered();
          const unlocked = PROJECTS[this.floppy.projectIndex % PROJECTS.length];
          if (this.callbacks) {
            this.callbacks.onScoreUpdate(this.score);
            this.callbacks.onProjectUnlocked(unlocked);
          }
        }
      }

      // Pick next target tile:
      // First try desired direction:
      const desiredNextX = p.tileX + this.desiredDirX;
      const desiredNextY = p.tileY + this.desiredDirY;

      if ((this.desiredDirX !== 0 || this.desiredDirY !== 0) && this.isTileWalkable(desiredNextX, desiredNextY)) {
        p.targetX = desiredNextX;
        p.targetY = desiredNextY;
        p.dirX = this.desiredDirX;
        p.dirY = this.desiredDirY;
      } else {
        // Try continuing in current direction:
        const contNextX = p.tileX + p.dirX;
        const contNextY = p.tileY + p.dirY;

        if ((p.dirX !== 0 || p.dirY !== 0) && this.isTileWalkable(contNextX, contNextY)) {
          p.targetX = contNextX;
          p.targetY = contNextY;
        } else {
          // Wall ahead and no new direction: stop!
          p.targetX = p.tileX;
          p.targetY = p.tileY;
          p.dirX = 0;
          p.dirY = 0;
        }
      }
    }
  }

  private updateGhosts(dt: number) {
    for (const ghost of this.ghosts) {
      const speed = ghost.isFrightened ? ghost.speed * 0.55 : ghost.speed;
      ghost.progress += speed * dt;

      if (ghost.progress >= 1) {
        ghost.tileX = ghost.targetX;
        ghost.tileY = ghost.targetY;
        ghost.progress = 0;

        // Tunnel Wrap
        if (ghost.tileX < 0) ghost.tileX = 18;
        if (ghost.tileX > 18) ghost.tileX = 0;

        // Find available neighbor tiles
        const neighbors = [
          { dx: 0, dy: -1 },
          { dx: 0, dy: 1 },
          { dx: -1, dy: 0 },
          { dx: 1, dy: 0 }
        ];

        // Filter out walls and the opposite direction (ghosts don't 180 unless dead-end)
        const validNeighbors = neighbors.filter((n) => {
          if (n.dx === -ghost.dirX && n.dy === -ghost.dirY) return false;
          return this.isTileWalkable(ghost.tileX + n.dx, ghost.tileY + n.dy);
        });

        let chosen = validNeighbors[0];

        if (validNeighbors.length > 0) {
          if (!ghost.isFrightened && Math.random() < 0.6) {
            // Target Pac-Man
            validNeighbors.sort((a, b) => {
              const distA = Math.hypot(ghost.tileX + a.dx - this.pacman.tileX, ghost.tileY + a.dy - this.pacman.tileY);
              const distB = Math.hypot(ghost.tileX + b.dx - this.pacman.tileX, ghost.tileY + b.dy - this.pacman.tileY);
              return distA - distB;
            });
            chosen = validNeighbors[0];
          } else {
            chosen = validNeighbors[Math.floor(Math.random() * validNeighbors.length)];
          }
        } else {
          // Dead end: reverse
          chosen = { dx: -ghost.dirX, dy: -ghost.dirY };
        }

        ghost.dirX = chosen.dx;
        ghost.dirY = chosen.dy;
        ghost.targetX = ghost.tileX + chosen.dx;
        ghost.targetY = ghost.tileY + chosen.dy;
      }
    }
  }

  private checkCollisions() {
    // Current interpolated positions
    const pacX = this.pacman.tileX + (this.pacman.targetX - this.pacman.tileX) * this.pacman.progress;
    const pacY = this.pacman.tileY + (this.pacman.targetY - this.pacman.tileY) * this.pacman.progress;

    for (const ghost of this.ghosts) {
      const gx = ghost.tileX + (ghost.targetX - ghost.tileX) * ghost.progress;
      const gy = ghost.tileY + (ghost.targetY - ghost.tileY) * ghost.progress;

      const dist = Math.hypot(gx - pacX, gy - pacY);

      if (dist < 0.75) {
        if (ghost.isFrightened) {
          // Eat Ghost!
          ghost.tileX = ghost.startX;
          ghost.tileY = ghost.startY;
          ghost.targetX = ghost.startX;
          ghost.targetY = ghost.startY;
          ghost.progress = 0;
          ghost.isFrightened = false;
          this.ghostStreak++;
          this.score += 200 * Math.min(4, this.ghostStreak);
          sounds.playEatGhost(this.ghostStreak);
          if (this.callbacks) this.callbacks.onScoreUpdate(this.score);
        } else {
          // Pacman Dies!
          this.lives--;
          sounds.playExplosion();
          if (this.callbacks) this.callbacks.onLivesUpdate(this.lives);

          if (this.lives <= 0) {
            this.isGameOver = true;
            sounds.playGameOver();
            if (this.callbacks) this.callbacks.onGameOver(this.score);
          } else {
            this.resetPositions();
          }
          break;
        }
      }
    }
  }

  render(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.fillStyle = '#05070a';
    ctx.fillRect(0, 0, width, height);

    const cols = 19;
    const rows = 21;
    const cellSize = Math.min(width / cols, height / rows);
    const offsetX = (width - cols * cellSize) / 2;
    const offsetY = (height - rows * cellSize) / 2;

    ctx.save();
    ctx.translate(offsetX, offsetY);

    // 1. Draw Maze Walls & Dots
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = this.map[r][c];
        const x = c * cellSize;
        const y = r * cellSize;

        if (cell === 1) {
          ctx.fillStyle = '#0e1424';
          ctx.fillRect(x, y, cellSize, cellSize);
          ctx.strokeStyle = '#00f0ff';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
        } else if (cell === 2) {
          ctx.fillStyle = '#ffea00';
          ctx.beginPath();
          ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize * 0.12, 0, Math.PI * 2);
          ctx.fill();
        } else if (cell === 3) {
          const pulse = (Math.sin(Date.now() * 0.008) + 1) / 2;
          ctx.fillStyle = pulse > 0.3 ? '#ff007f' : '#ffffff';
          ctx.beginPath();
          ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize * 0.28, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 2. Draw Floppy Project Pickup
    if (this.floppy.active) {
      const fx = this.floppy.x * cellSize + cellSize / 2;
      const fy = this.floppy.y * cellSize + cellSize / 2;
      const pulse = 1 + Math.sin(Date.now() * 0.01) * 0.15;

      ctx.save();
      ctx.translate(fx, fy);
      ctx.scale(pulse, pulse);

      ctx.fillStyle = '#00ff66';
      ctx.fillRect(-cellSize * 0.4, -cellSize * 0.4, cellSize * 0.8, cellSize * 0.8);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-cellSize * 0.3, -cellSize * 0.3, cellSize * 0.6, cellSize * 0.35);
      ctx.fillStyle = '#111827';
      ctx.fillRect(-cellSize * 0.25, cellSize * 0.1, cellSize * 0.5, cellSize * 0.25);

      ctx.restore();
    }

    // 3. Draw Pac-Man
    const pacX = (this.pacman.tileX + (this.pacman.targetX - this.pacman.tileX) * this.pacman.progress) * cellSize + cellSize / 2;
    const pacY = (this.pacman.tileY + (this.pacman.targetY - this.pacman.tileY) * this.pacman.progress) * cellSize + cellSize / 2;

    let rotation = 0;
    if (this.pacman.dirX === 1) rotation = 0;
    else if (this.pacman.dirX === -1) rotation = Math.PI;
    else if (this.pacman.dirY === -1) rotation = -Math.PI / 2;
    else if (this.pacman.dirY === 1) rotation = Math.PI / 2;

    ctx.save();
    ctx.translate(pacX, pacY);
    ctx.rotate(rotation);

    ctx.fillStyle = '#ffea00';
    ctx.beginPath();
    ctx.arc(0, 0, cellSize * 0.42, this.mouthAngle * Math.PI, (2 - this.mouthAngle) * Math.PI);
    ctx.lineTo(0, 0);
    ctx.fill();

    // Eye
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(cellSize * 0.1, -cellSize * 0.2, cellSize * 0.07, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // 4. Draw Ghosts
    for (const ghost of this.ghosts) {
      const gx = (ghost.tileX + (ghost.targetX - ghost.tileX) * ghost.progress) * cellSize + cellSize / 2;
      const gy = (ghost.tileY + (ghost.targetY - ghost.tileY) * ghost.progress) * cellSize + cellSize / 2;

      ctx.save();
      ctx.translate(gx, gy);

      if (ghost.isFrightened) {
        const flash = this.frightenedTimer < 2.5 && Math.floor(Date.now() / 150) % 2 === 0;
        ctx.fillStyle = flash ? '#ffffff' : '#0055ff';
      } else {
        ctx.fillStyle = ghost.color;
      }

      const r = cellSize * 0.4;
      ctx.beginPath();
      ctx.arc(0, -r * 0.2, r, Math.PI, 0, false);
      ctx.lineTo(r, r * 0.8);
      ctx.lineTo(r * 0.5, r * 0.5);
      ctx.lineTo(0, r * 0.8);
      ctx.lineTo(-r * 0.5, r * 0.5);
      ctx.lineTo(-r, r * 0.8);
      ctx.closePath();
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-r * 0.35, -r * 0.2, r * 0.28, 0, Math.PI * 2);
      ctx.arc(r * 0.35, -r * 0.2, r * 0.28, 0, Math.PI * 2);
      ctx.fill();

      // Pupils
      ctx.fillStyle = ghost.isFrightened ? '#ff0000' : '#000088';
      const eyeDx = ghost.dirX * r * 0.12;
      const eyeDy = ghost.dirY * r * 0.12;
      ctx.beginPath();
      ctx.arc(-r * 0.35 + eyeDx, -r * 0.2 + eyeDy, r * 0.14, 0, Math.PI * 2);
      ctx.arc(r * 0.35 + eyeDx, -r * 0.2 + eyeDy, r * 0.14, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    ctx.restore();

    // Game Over Overlay
    if (this.isGameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#ff0055';
      ctx.font = '22px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', width / 2, height / 2 - 20);

      ctx.fillStyle = '#00f0ff';
      ctx.font = '12px "Press Start 2P", monospace';
      ctx.fillText(`SCORE: ${this.score}`, width / 2, height / 2 + 15);

      ctx.fillStyle = '#aaaaaa';
      ctx.font = '11px "VT323", monospace';
      ctx.fillText('PRESS [A] OR SPACE TO RESTART', width / 2, height / 2 + 45);
    }
  }

  handleAction(actionName: string) {
    if (actionName === 'restart' || actionName === 'fire' || actionName === 'actionA') {
      if (this.isGameOver) {
        this.reset();
      }
    }
  }

  destroy() {
    this.callbacks = null;
  }

  getScore(): number {
    return this.score;
  }

  getLives(): number {
    return this.lives;
  }

  isPaused(): boolean {
    return this.paused;
  }

  setPaused(paused: boolean) {
    this.paused = paused;
  }
}

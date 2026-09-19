import { Cartridge, GameCallbacks, InputState } from '../types';
import { sounds } from '../../audio/soundManager';
import { PROJECTS } from '../../data/projects';
import { Project } from '../../types/project';

// 19 cols x 21 rows
// 0: Walkable Empty
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
  [1,1,1,1,2,1,1,1,0,1,0,1,1,1,2,1,1,1,1],
  [0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0],
  [1,1,1,1,2,1,0,1,1,4,1,1,0,1,2,1,1,1,1],
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

interface Ghost {
  x: number;
  y: number;
  startX: number;
  startY: number;
  dx: number;
  dy: number;
  color: string;
  name: string;
  isFrightened: boolean;
  speed: number;
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

  // Pacman State
  private px: number = 9;
  private py: number = 16;
  private pdx: number = -1; // Start moving LEFT automatically
  private pdy: number = 0;
  private desiredDx: number = -1;
  private desiredDy: number = 0;
  private mouthAngle: number = 0.2;
  private mouthDir: number = 1;
  private pacmanSpeed: number = 4.2; // Grid cells per second

  // Ghosts
  private ghosts: Ghost[] = [];
  private frightenedTimer: number = 0;

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

    // Deep copy base map
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
    this.px = 9;
    this.py = 16;
    this.pdx = -1;
    this.pdy = 0;
    this.desiredDx = -1;
    this.desiredDy = 0;

    this.ghosts = [
      { x: 9, y: 7, startX: 9, startY: 7, dx: 1, dy: 0, color: '#ff0033', name: '404', isFrightened: false, speed: 2.8 },
      { x: 9, y: 10, startX: 9, startY: 10, dx: 0, dy: -1, color: '#ff69b4', name: 'LMK', isFrightened: false, speed: 2.5 },
      { x: 8, y: 10, startX: 8, startY: 10, dx: -1, dy: 0, color: '#00ffff', name: 'MERGE', isFrightened: false, speed: 2.4 },
      { x: 10, y: 10, startX: 10, startY: 10, dx: 1, dy: 0, color: '#ffaa00', name: 'SYNTAX', isFrightened: false, speed: 2.2 }
    ];

    this.floppy.active = false;
    this.frightenedTimer = 0;
  }

  private isPassable(x: number, y: number): boolean {
    // Tunnel wrap check
    if ((y === 10 || y === 8 || y === 12) && (x < 0 || x >= 19)) return true;
    if (x < 0 || x >= 19 || y < 0 || y >= 21) return false;
    const cell = this.map[y][x];
    return cell !== 1 && cell !== 4;
  }

  update(deltaTime: number, input: InputState) {
    if (this.isGameOver || this.paused) return;
    const dt = Math.min(deltaTime, 0.05);

    // 1. Capture Input into desired direction
    if (input.up) { this.desiredDx = 0; this.desiredDy = -1; }
    else if (input.down) { this.desiredDx = 0; this.desiredDy = 1; }
    else if (input.left) { this.desiredDx = -1; this.desiredDy = 0; }
    else if (input.right) { this.desiredDx = 1; this.desiredDy = 0; }

    // 2. Mouth animation
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
        this.ghosts.forEach((g) => (g.isFrightened = false));
      }
    }

    // 4. Update Pacman Movement
    this.updatePacman(dt, input.actionA);

    // 5. Update Ghosts
    this.updateGhosts(dt);

    // 6. Check Ghost Collisions
    this.checkCollisions();

    // 7. Check Win Condition
    if (this.dotsEaten >= this.totalDots) {
      sounds.playProjectDiscovered();
      this.reset();
    }
  }

  private updatePacman(dt: number, isBoosted: boolean) {
    const speed = (isBoosted ? this.pacmanSpeed * 1.35 : this.pacmanSpeed) * dt;

    // IMMEDIATE 180-DEGREE REVERSAL CHECK
    // If the user wants to go directly opposite to current direction, allow it instantly!
    if (this.desiredDx === -this.pdx && this.desiredDy === -this.pdy && (this.desiredDx !== 0 || this.desiredDy !== 0)) {
      this.pdx = this.desiredDx;
      this.pdy = this.desiredDy;
    }

    // Check turning into perpendicular corridor
    if (this.desiredDx !== this.pdx || this.desiredDy !== this.pdy) {
      const isAlignedX = Math.abs(this.px - Math.round(this.px)) < 0.28;
      const isAlignedY = Math.abs(this.py - Math.round(this.py)) < 0.28;

      if (isAlignedX && isAlignedY) {
        const roundedX = Math.round(this.px);
        const roundedY = Math.round(this.py);
        const checkTurnX = roundedX + this.desiredDx;
        const checkTurnY = roundedY + this.desiredDy;

        if (this.isPassable(checkTurnX, checkTurnY)) {
          this.px = roundedX;
          this.py = roundedY;
          this.pdx = this.desiredDx;
          this.pdy = this.desiredDy;
        }
      }
    }

    // Move in current direction if passable ahead
    if (this.pdx !== 0) {
      this.py = Math.round(this.py); // Snap to row
      const nextX = this.px + this.pdx * speed;
      const targetTileX = this.pdx > 0 ? Math.floor(this.px) + 1 : Math.ceil(this.px) - 1;

      if (!this.isPassable(targetTileX, this.py)) {
        // Wall ahead
        const limitX = Math.round(this.px);
        if ((this.pdx > 0 && nextX >= limitX) || (this.pdx < 0 && nextX <= limitX)) {
          this.px = limitX;
          this.pdx = 0;
        } else {
          this.px = nextX;
        }
      } else {
        this.px = nextX;
      }
    } else if (this.pdy !== 0) {
      this.px = Math.round(this.px); // Snap to col
      const nextY = this.py + this.pdy * speed;
      const targetTileY = this.pdy > 0 ? Math.floor(this.py) + 1 : Math.ceil(this.py) - 1;

      if (!this.isPassable(this.px, targetTileY)) {
        // Wall ahead
        const limitY = Math.round(this.py);
        if ((this.pdy > 0 && nextY >= limitY) || (this.pdy < 0 && nextY <= limitY)) {
          this.py = limitY;
          this.pdy = 0;
        } else {
          this.py = nextY;
        }
      } else {
        this.py = nextY;
      }
    }

    // Tunnel Wrap
    if (this.px < -0.5) this.px = 18.5;
    if (this.px > 18.5) this.px = -0.5;

    // Eat Dot / Pellet at current tile
    const currentGridX = Math.round(this.px);
    const currentGridY = Math.round(this.py);

    if (currentGridX >= 0 && currentGridX < 19 && currentGridY >= 0 && currentGridY < 21) {
      const cell = this.map[currentGridY][currentGridX];
      if (cell === 2) {
        this.map[currentGridY][currentGridX] = 0;
        this.score += 10;
        this.dotsEaten++;
        sounds.playDot();
        if (this.callbacks) this.callbacks.onScoreUpdate(this.score);

        // Spawn floppy every 25 dots
        if (this.dotsEaten % 25 === 0 && !this.floppy.active) {
          this.floppy.active = true;
          this.floppy.projectIndex = Math.floor(Math.random() * PROJECTS.length);
        }
      } else if (cell === 3) {
        this.map[currentGridY][currentGridX] = 0;
        this.score += 50;
        this.dotsEaten++;
        this.frightenedTimer = 7.0;
        this.ghosts.forEach((g) => (g.isFrightened = true));
        sounds.playPowerPellet();
        if (this.callbacks) this.callbacks.onScoreUpdate(this.score);
      }

      // Check Floppy Collect
      if (this.floppy.active && currentGridX === this.floppy.x && currentGridY === this.floppy.y) {
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
  }

  private updateGhosts(dt: number) {
    this.ghosts.forEach((ghost) => {
      const speed = (ghost.isFrightened ? ghost.speed * 0.55 : ghost.speed) * dt;

      // When near center of grid cell, pick direction
      const isAlignedX = Math.abs(ghost.x - Math.round(ghost.x)) < 0.15;
      const isAlignedY = Math.abs(ghost.y - Math.round(ghost.y)) < 0.15;

      if (isAlignedX && isAlignedY) {
        const gx = Math.round(ghost.x);
        const gy = Math.round(ghost.y);
        ghost.x = gx;
        ghost.y = gy;

        const dirs = [
          { dx: 0, dy: -1 },
          { dx: 0, dy: 1 },
          { dx: -1, dy: 0 },
          { dx: 1, dy: 0 }
        ];

        const validDirs = dirs.filter((d) => {
          if (d.dx === -ghost.dx && d.dy === -ghost.dy) return false; // No immediate reversal
          return this.isPassable(gx + d.dx, gy + d.dy);
        });

        if (validDirs.length > 0) {
          if (!ghost.isFrightened && Math.random() < 0.45) {
            // Chase Pacman
            validDirs.sort((a, b) => {
              const distA = Math.hypot(gx + a.dx - this.px, gy + a.dy - this.py);
              const distB = Math.hypot(gx + b.dx - this.px, gy + b.dy - this.py);
              return distA - distB;
            });
            ghost.dx = validDirs[0].dx;
            ghost.dy = validDirs[0].dy;
          } else {
            const picked = validDirs[Math.floor(Math.random() * validDirs.length)];
            ghost.dx = picked.dx;
            ghost.dy = picked.dy;
          }
        } else {
          ghost.dx = -ghost.dx;
          ghost.dy = -ghost.dy;
        }
      }

      ghost.x += ghost.dx * speed;
      ghost.y += ghost.dy * speed;

      // Tunnel wrap
      if (ghost.x < -0.5) ghost.x = 18.5;
      if (ghost.x > 18.5) ghost.x = -0.5;
    });
  }

  private checkCollisions() {
    for (const ghost of this.ghosts) {
      const dist = Math.hypot(ghost.x - this.px, ghost.y - this.py);
      if (dist < 0.65) {
        if (ghost.isFrightened) {
          // Eat Ghost
          ghost.x = ghost.startX;
          ghost.y = ghost.startY;
          ghost.isFrightened = false;
          this.score += 200;
          sounds.playEatGhost();
          if (this.callbacks) this.callbacks.onScoreUpdate(this.score);
        } else {
          // Pacman Dies
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
          // Wall
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x, y, cellSize, cellSize);
          ctx.strokeStyle = '#00f0ff';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
        } else if (cell === 2) {
          // Dot
          ctx.fillStyle = '#ffea00';
          ctx.beginPath();
          ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize * 0.12, 0, Math.PI * 2);
          ctx.fill();
        } else if (cell === 3) {
          // Power Pellet
          const pulse = (Math.sin(Date.now() * 0.008) + 1) / 2;
          ctx.fillStyle = pulse > 0.3 ? '#ff007f' : '#ffffff';
          ctx.beginPath();
          ctx.arc(x + cellSize / 2, y + cellSize / 2, cellSize * 0.28, 0, Math.PI * 2);
          ctx.fill();
        } else if (cell === 4) {
          // Gate
          ctx.fillStyle = '#ff007f';
          ctx.fillRect(x, y + cellSize * 0.4, cellSize, cellSize * 0.2);
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
    const px = this.px * cellSize + cellSize / 2;
    const py = this.py * cellSize + cellSize / 2;

    let rotation = 0;
    if (this.pdx === 1) rotation = 0;
    else if (this.pdx === -1) rotation = Math.PI;
    else if (this.pdy === -1) rotation = -Math.PI / 2;
    else if (this.pdy === 1) rotation = Math.PI / 2;

    ctx.save();
    ctx.translate(px, py);
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
      const gx = ghost.x * cellSize + cellSize / 2;
      const gy = ghost.y * cellSize + cellSize / 2;

      ctx.save();
      ctx.translate(gx, gy);

      if (ghost.isFrightened) {
        const flash = this.frightenedTimer < 2 && Math.floor(Date.now() / 150) % 2 === 0;
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

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-r * 0.35, -r * 0.2, r * 0.28, 0, Math.PI * 2);
      ctx.arc(r * 0.35, -r * 0.2, r * 0.28, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = ghost.isFrightened ? '#ff0000' : '#000088';
      const eyeDx = ghost.dx * r * 0.12;
      const eyeDy = ghost.dy * r * 0.12;
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

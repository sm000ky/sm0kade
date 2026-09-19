import { Cartridge, GameCallbacks, InputState } from '../types';
import { sounds } from '../../audio/soundManager';
import { PROJECTS } from '../../data/projects';

interface Invader {
  x: number;
  y: number;
  row: number;
  col: number;
  type: number; // 0: Top, 1: Middle, 2: Bottom
  alive: boolean;
  color: string;
}

interface Bullet {
  x: number;
  y: number;
  dy: number;
  isPlayer: boolean;
}

interface Bunker {
  x: number;
  y: number;
  health: number; // 0 to 4
}

export class InvadersGame implements Cartridge {
  id = 'invaders';
  title = 'BYTE INVADERS';
  subtitle = 'DEFEND CODEBASE // BUG CRUSHER';
  genre = 'Space Shooter';
  themeColor = '#00f0ff';
  icon = '👾';
  instructions = {
    desktop: 'LEFT / RIGHT or A / D to steer • SPACEBAR to fire laser cannons',
    mobile: 'Use Left / Right on D-Pad • Tap [A] to fire missiles'
  };

  private callbacks: GameCallbacks | null = null;
  private score: number = 0;
  private lives: number = 3;
  private isGameOver: boolean = false;
  private paused: boolean = false;

  // Player state
  private playerX: number = 200;
  private playerSpeed: number = 240; // px/sec
  private playerWidth: number = 32;
  private playerHeight: number = 18;
  private shootCooldown: number = 0;

  // Invaders fleet
  private invaders: Invader[] = [];
  private fleetDx: number = 30;
  private fleetStepDown: number = 14;
  private fleetSpeed: number = 40;
  private invaderCols: number = 8;
  private invaderRows: number = 4;

  // Projectiles & Bunkers
  private bullets: Bullet[] = [];
  private bunkers: Bunker[] = [];

  // Mystery UFO (Tech Payload)
  private ufo: { active: boolean; x: number; y: number; speed: number; projectIndex: number } = {
    active: false,
    x: 0,
    y: 25,
    speed: 120,
    projectIndex: 0
  };
  private ufoTimer: number = 12;

  init(_canvas: HTMLCanvasElement, _ctx: CanvasRenderingContext2D, callbacks: GameCallbacks) {
    this.callbacks = callbacks;
    this.reset();
  }

  reset() {
    this.score = 0;
    this.lives = 3;
    this.isGameOver = false;
    this.paused = false;
    this.playerX = 200;
    this.bullets = [];
    this.fleetDx = 30;
    this.fleetSpeed = 40;
    this.ufo.active = false;
    this.ufoTimer = 10;

    this.spawnFleet();
    this.spawnBunkers();

    if (this.callbacks) {
      this.callbacks.onScoreUpdate(this.score);
      this.callbacks.onLivesUpdate(this.lives);
    }
  }

  private spawnFleet() {
    this.invaders = [];
    const colors = ['#ff007f', '#00f0ff', '#00ff66', '#ffaa00'];

    for (let r = 0; r < this.invaderRows; r++) {
      for (let c = 0; c < this.invaderCols; c++) {
        this.invaders.push({
          x: 40 + c * 38,
          y: 60 + r * 28,
          row: r,
          col: c,
          type: r,
          alive: true,
          color: colors[r % colors.length]
        });
      }
    }
  }

  private spawnBunkers() {
    this.bunkers = [];
    const count = 4;
    const bunkerY = 380;
    for (let i = 0; i < count; i++) {
      const bx = 50 + i * 90;
      this.bunkers.push({ x: bx, y: bunkerY, health: 4 });
      this.bunkers.push({ x: bx + 16, y: bunkerY, health: 4 });
    }
  }

  update(deltaTime: number, input: InputState) {
    if (this.isGameOver || this.paused) return;
    const dt = Math.min(deltaTime, 0.1);

    // Player controls
    if (input.left) {
      this.playerX -= this.playerSpeed * dt;
    }
    if (input.right) {
      this.playerX += this.playerSpeed * dt;
    }
    this.playerX = Math.max(20, Math.min(400 - this.playerWidth - 20, this.playerX));

    // Shooting
    this.shootCooldown -= dt;
    if ((input.actionA || input.up) && this.shootCooldown <= 0) {
      this.shootCooldown = 0.35;
      this.bullets.push({
        x: this.playerX + this.playerWidth / 2,
        y: 430,
        dy: -400,
        isPlayer: true
      });
      sounds.playLaser();
    }

    // Update Fleet
    let reverseFleet = false;
    const livingInvaders = this.invaders.filter((inv) => inv.alive);

    if (livingInvaders.length === 0) {
      // Wave cleared! Respawn with higher speed
      this.fleetSpeed += 15;
      this.spawnFleet();
      sounds.playProjectDiscovered();
      return;
    }

    // Dynamic speed based on remaining enemies
    const speedRatio = 1 + (1 - livingInvaders.length / (this.invaderRows * this.invaderCols)) * 1.5;
    const currentSpeed = this.fleetSpeed * speedRatio;

    for (const inv of livingInvaders) {
      inv.x += (this.fleetDx > 0 ? 1 : -1) * currentSpeed * dt;
      if (inv.x > 380 - 24 || inv.x < 20) {
        reverseFleet = true;
      }

      // Check if invaders reached bottom
      if (inv.y >= 410) {
        this.isGameOver = true;
        sounds.playGameOver();
        if (this.callbacks) this.callbacks.onGameOver(this.score);
        return;
      }
    }

    if (reverseFleet) {
      this.fleetDx = -this.fleetDx;
      for (const inv of livingInvaders) {
        inv.y += this.fleetStepDown;
      }
    }

    // Alien fire bullets
    if (Math.random() < 0.035 && livingInvaders.length > 0) {
      const shooter = livingInvaders[Math.floor(Math.random() * livingInvaders.length)];
      this.bullets.push({
        x: shooter.x + 10,
        y: shooter.y + 16,
        dy: 180,
        isPlayer: false
      });
    }

    // Mystery UFO Logic
    this.ufoTimer -= dt;
    if (this.ufoTimer <= 0 && !this.ufo.active) {
      this.ufo.active = true;
      this.ufo.x = -40;
      this.ufo.projectIndex = Math.floor(Math.random() * PROJECTS.length);
      this.ufoTimer = 18;
    }

    if (this.ufo.active) {
      this.ufo.x += this.ufo.speed * dt;
      if (this.ufo.x > 420) {
        this.ufo.active = false;
      }
    }

    // Update Projectiles
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      b.y += b.dy * dt;

      // Despawn off-screen
      if (b.y < 0 || b.y > 480) {
        this.bullets.splice(i, 1);
        continue;
      }

      // Player bullet hit bunker
      let bulletRemoved = false;
      for (const bunker of this.bunkers) {
        if (bunker.health > 0) {
          if (b.x >= bunker.x && b.x <= bunker.x + 16 && b.y >= bunker.y && b.y <= bunker.y + 14) {
            bunker.health--;
            this.bullets.splice(i, 1);
            bulletRemoved = true;
            break;
          }
        }
      }
      if (bulletRemoved) continue;

      if (b.isPlayer) {
        // Check hit UFO
        if (this.ufo.active && Math.abs(b.x - (this.ufo.x + 20)) < 22 && Math.abs(b.y - this.ufo.y) < 14) {
          this.ufo.active = false;
          this.score += 300;
          sounds.playEatGhost();
          this.bullets.splice(i, 1);
          const unlocked = PROJECTS[this.ufo.projectIndex % PROJECTS.length];
          if (this.callbacks) {
            this.callbacks.onScoreUpdate(this.score);
            this.callbacks.onProjectUnlocked(unlocked);
          }
          continue;
        }

        // Check hit Invader
        for (const inv of livingInvaders) {
          if (b.x >= inv.x && b.x <= inv.x + 24 && b.y >= inv.y && b.y <= inv.y + 18) {
            inv.alive = false;
            this.bullets.splice(i, 1);
            this.score += (4 - inv.type) * 20;
            sounds.playExplosion();
            if (this.callbacks) this.callbacks.onScoreUpdate(this.score);
            break;
          }
        }
      } else {
        // Alien bullet hit Player
        if (b.x >= this.playerX && b.x <= this.playerX + this.playerWidth && b.y >= 430 && b.y <= 430 + this.playerHeight) {
          this.bullets.splice(i, 1);
          this.lives--;
          sounds.playExplosion();
          if (this.callbacks) this.callbacks.onLivesUpdate(this.lives);

          if (this.lives <= 0) {
            this.isGameOver = true;
            sounds.playGameOver();
            if (this.callbacks) this.callbacks.onGameOver(this.score);
          }
        }
      }
    }
  }

  render(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.fillStyle = '#05070a';
    ctx.fillRect(0, 0, width, height);

    // Starfield background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 35; i++) {
      const sx = ((i * 47) % width);
      const sy = ((i * 73 + Date.now() * 0.02) % height);
      ctx.fillRect(sx, sy, 1.5, 1.5);
    }

    const scaleX = width / 400;
    const scaleY = height / 480;

    ctx.save();
    ctx.scale(scaleX, scaleY);

    // Draw Bunkers
    for (const b of this.bunkers) {
      if (b.health > 0) {
        ctx.fillStyle = `rgba(0, 240, 255, ${b.health * 0.25})`;
        ctx.fillRect(b.x, b.y, 15, 12);
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 1;
        ctx.strokeRect(b.x, b.y, 15, 12);
      }
    }

    // Draw Mystery UFO
    if (this.ufo.active) {
      ctx.fillStyle = '#ff007f';
      ctx.beginPath();
      ctx.ellipse(this.ufo.x + 18, this.ufo.y + 7, 18, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(this.ufo.x + 18, this.ufo.y + 4, 6, Math.PI, 0);
      ctx.fill();

      // Bonus Floppy Icon on UFO
      ctx.fillStyle = '#ffea00';
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillText('FLOPPY', this.ufo.x + 2, this.ufo.y - 4);
    }

    // Draw Invaders
    for (const inv of this.invaders) {
      if (!inv.alive) continue;
      ctx.fillStyle = inv.color;

      // Pixel-art Alien shape
      const w = 20;
      const h = 14;
      ctx.fillRect(inv.x + 4, inv.y, w - 8, h);
      ctx.fillRect(inv.x, inv.y + 3, w, h - 6);
      ctx.fillRect(inv.x + 2, inv.y + h - 2, 4, 4);
      ctx.fillRect(inv.x + w - 6, inv.y + h - 2, 4, 4);

      // Alien Eyes
      ctx.fillStyle = '#05070a';
      ctx.fillRect(inv.x + 4, inv.y + 4, 3, 3);
      ctx.fillRect(inv.x + w - 7, inv.y + 4, 3, 3);
    }

    // Draw Bullets
    for (const b of this.bullets) {
      ctx.fillStyle = b.isPlayer ? '#00ff66' : '#ff0055';
      ctx.fillRect(b.x - 1.5, b.y, 3, 8);
    }

    // Draw Player Ship (Retro Arcade Tank/Gun)
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(this.playerX + 13, 424, 6, 6); // Cannon nozzle
    ctx.fillRect(this.playerX + 6, 430, 20, 8); // Cannon base
    ctx.fillRect(this.playerX, 436, this.playerWidth, 8); // Tank treads

    ctx.restore();

    // Game Over Overlay
    if (this.isGameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#ff0055';
      ctx.font = '22px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('SYSTEM OVERRUN', width / 2, height / 2 - 20);

      ctx.fillStyle = '#00f0ff';
      ctx.font = '12px "Press Start 2P", monospace';
      ctx.fillText(`SCORE: ${this.score}`, width / 2, height / 2 + 15);

      ctx.fillStyle = '#aaaaaa';
      ctx.font = '11px "VT323", monospace';
      ctx.fillText('PRESS [A] OR SPACE TO REBOOT FLEET', width / 2, height / 2 + 45);
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

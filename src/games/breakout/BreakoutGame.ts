import { Cartridge, GameCallbacks, InputState } from '../types';
import { sounds } from '../../audio/soundManager';
import { PROJECTS } from '../../data/projects';
import { Project } from '../../types/project';

interface Brick {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  label: string;
  alive: boolean;
  isSpecial: boolean;
  projectIndex?: number;
}

interface PowerDrop {
  x: number;
  y: number;
  project: Project;
}

export class BreakoutGame implements Cartridge {
  id = 'breakout';
  title = 'TECH BREAKOUT';
  subtitle = 'BLOCK SMASHER // STACK BREAKER';
  genre = 'Brick Breaker';
  themeColor = '#ff007f';
  icon = '🧱';
  instructions = {
    desktop: 'LEFT / RIGHT or A / D to slide paddle • SPACEBAR to launch energy ball',
    mobile: 'Slide D-Pad or swipe to move paddle • Tap [A] to launch ball'
  };

  private callbacks: GameCallbacks | null = null;
  private score: number = 0;
  private lives: number = 3;
  private isGameOver: boolean = false;
  private paused: boolean = false;

  // Paddle
  private paddleX: number = 160;
  private paddleWidth: number = 72;
  private paddleHeight: number = 10;
  private paddleSpeed: number = 300;

  // Ball
  private ballX: number = 200;
  private ballY: number = 420;
  private ballVx: number = 0;
  private ballVy: number = 0;
  private ballRadius: number = 5;
  private ballAttached: boolean = true;

  // Bricks & Drops
  private bricks: Brick[] = [];
  private powerDrops: PowerDrop[] = [];

  init(_canvas: HTMLCanvasElement, _ctx: CanvasRenderingContext2D, callbacks: GameCallbacks) {
    this.callbacks = callbacks;
    this.reset();
  }

  reset() {
    this.score = 0;
    this.lives = 3;
    this.isGameOver = false;
    this.paused = false;
    this.paddleX = 160;
    this.resetBall();
    this.powerDrops = [];
    this.spawnBricks();

    if (this.callbacks) {
      this.callbacks.onScoreUpdate(this.score);
      this.callbacks.onLivesUpdate(this.lives);
    }
  }

  private resetBall() {
    this.ballAttached = true;
    this.ballX = this.paddleX + this.paddleWidth / 2;
    this.ballY = 430 - this.ballRadius - 2;
    this.ballVx = 0;
    this.ballVy = 0;
  }

  private launchBall() {
    if (!this.ballAttached) return;
    this.ballAttached = false;
    const angle = (Math.random() * 0.6 - 0.3) - Math.PI / 2; // Roughly upward
    const speed = 260;
    this.ballVx = Math.cos(angle) * speed;
    this.ballVy = Math.sin(angle) * speed;
    sounds.playBounce(1.2);
  }

  private spawnBricks() {
    this.bricks = [];
    const rows = 5;
    const cols = 6;
    const brickW = 54;
    const brickH = 18;
    const gap = 8;
    const startX = 20;
    const startY = 60;

    const rowConfigs = [
      { color: '#ff007f', label: 'REACT' },
      { color: '#00f0ff', label: 'TYPESCRIPT' },
      { color: '#00ff66', label: 'PYTHON' },
      { color: '#ffaa00', label: 'LINUX' },
      { color: '#a855f7', label: 'CANVAS' }
    ];

    let specialAssigned = 0;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const isSpecial = (r === 2 && (c === 1 || c === 4)) || (r === 0 && c === 2);
        const bx = startX + c * (brickW + gap);
        const by = startY + r * (brickH + gap);

        this.bricks.push({
          x: bx,
          y: by,
          w: brickW,
          h: brickH,
          color: isSpecial ? '#ffea00' : rowConfigs[r].color,
          label: isSpecial ? '★ DATA' : rowConfigs[r].label,
          alive: true,
          isSpecial,
          projectIndex: isSpecial ? specialAssigned++ : undefined
        });
      }
    }
  }

  update(deltaTime: number, input: InputState) {
    if (this.isGameOver || this.paused) return;
    const dt = Math.min(deltaTime, 0.1);

    // Paddle move
    if (input.left) {
      this.paddleX -= this.paddleSpeed * dt;
    }
    if (input.right) {
      this.paddleX += this.paddleSpeed * dt;
    }
    this.paddleX = Math.max(15, Math.min(400 - this.paddleWidth - 15, this.paddleX));

    // Launch Ball
    if (input.actionA || input.up) {
      this.launchBall();
    }

    if (this.ballAttached) {
      this.ballX = this.paddleX + this.paddleWidth / 2;
      this.ballY = 430 - this.ballRadius - 2;
      return;
    }

    // Ball movement
    this.ballX += this.ballVx * dt;
    this.ballY += this.ballVy * dt;

    // Wall bounces
    if (this.ballX - this.ballRadius <= 15) {
      this.ballX = 15 + this.ballRadius;
      this.ballVx = Math.abs(this.ballVx);
      sounds.playBounce(0.9);
    } else if (this.ballX + this.ballRadius >= 385) {
      this.ballX = 385 - this.ballRadius;
      this.ballVx = -Math.abs(this.ballVx);
      sounds.playBounce(0.9);
    }

    if (this.ballY - this.ballRadius <= 25) {
      this.ballY = 25 + this.ballRadius;
      this.ballVy = Math.abs(this.ballVy);
      sounds.playBounce(0.9);
    }

    // Ball fall through bottom
    if (this.ballY > 480) {
      this.lives--;
      sounds.playExplosion();
      if (this.callbacks) this.callbacks.onLivesUpdate(this.lives);

      if (this.lives <= 0) {
        this.isGameOver = true;
        sounds.playGameOver();
        if (this.callbacks) this.callbacks.onGameOver(this.score);
      } else {
        this.resetBall();
      }
      return;
    }

    // Paddle collision
    const paddleTop = 430;
    if (
      this.ballY + this.ballRadius >= paddleTop &&
      this.ballY - this.ballRadius <= paddleTop + this.paddleHeight &&
      this.ballX >= this.paddleX - 4 &&
      this.ballX <= this.paddleX + this.paddleWidth + 4 &&
      this.ballVy > 0
    ) {
      // Angle based on where ball struck paddle (-1 to 1)
      const hitOffset = (this.ballX - (this.paddleX + this.paddleWidth / 2)) / (this.paddleWidth / 2);
      const angle = hitOffset * (Math.PI / 3); // Max 60 deg bounce
      const speed = Math.hypot(this.ballVx, this.ballVy) * 1.02; // slight acceleration
      this.ballVx = Math.sin(angle) * speed;
      this.ballVy = -Math.cos(angle) * speed;
      sounds.playBounce(1.1);
    }

    // Brick collisions
    let livingBricks = 0;
    for (const b of this.bricks) {
      if (!b.alive) continue;
      livingBricks++;

      // AABB vs Circle
      const closestX = Math.max(b.x, Math.min(this.ballX, b.x + b.w));
      const closestY = Math.max(b.y, Math.min(this.ballY, b.y + b.h));
      const distX = this.ballX - closestX;
      const distY = this.ballY - closestY;

      if (distX * distX + distY * distY <= this.ballRadius * this.ballRadius) {
        b.alive = false;
        sounds.playBrickSmash();

        // Rebound direction
        if (Math.abs(distX) > Math.abs(distY)) {
          this.ballVx = -this.ballVx;
        } else {
          this.ballVy = -this.ballVy;
        }

        this.score += b.isSpecial ? 150 : 50;
        if (this.callbacks) this.callbacks.onScoreUpdate(this.score);

        // Special Brick drops Project Floppy Shard
        if (b.isSpecial && b.projectIndex !== undefined) {
          const p = PROJECTS[b.projectIndex % PROJECTS.length];
          this.powerDrops.push({
            x: b.x + b.w / 2,
            y: b.y + b.h,
            project: p
          });
        }
        break;
      }
    }

    // Respawn bricks if all cleared
    if (livingBricks === 0) {
      this.spawnBricks();
      this.resetBall();
      sounds.playProjectDiscovered();
    }

    // Update Power Drops
    for (let i = this.powerDrops.length - 1; i >= 0; i--) {
      const drop = this.powerDrops[i];
      drop.y += 120 * dt;

      // Caught by paddle
      if (
        drop.y >= paddleTop &&
        drop.y <= paddleTop + this.paddleHeight + 8 &&
        drop.x >= this.paddleX &&
        drop.x <= this.paddleX + this.paddleWidth
      ) {
        sounds.playProjectDiscovered();
        this.score += 300;
        if (this.callbacks) {
          this.callbacks.onScoreUpdate(this.score);
          this.callbacks.onProjectUnlocked(drop.project);
        }
        this.powerDrops.splice(i, 1);
      } else if (drop.y > 480) {
        this.powerDrops.splice(i, 1);
      }
    }
  }

  render(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.fillStyle = '#05070a';
    ctx.fillRect(0, 0, width, height);

    const scaleX = width / 400;
    const scaleY = height / 480;

    ctx.save();
    ctx.scale(scaleX, scaleY);

    // Subtle Grid
    ctx.strokeStyle = 'rgba(255, 0, 127, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 20; x < 380; x += 30) {
      ctx.beginPath();
      ctx.moveTo(x, 20);
      ctx.lineTo(x, 460);
      ctx.stroke();
    }

    // Draw Bricks
    for (const b of this.bricks) {
      if (!b.alive) continue;

      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, b.y, b.w, b.h);

      // Neon border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(b.x + 1, b.y + 1, b.w - 2, b.h - 2);

      // Label
      ctx.fillStyle = '#05070a';
      ctx.font = '7px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(b.label, b.x + b.w / 2, b.y + b.h / 2 + 3);
    }

    // Draw Power Drops
    for (const drop of this.powerDrops) {
      ctx.fillStyle = '#ffea00';
      ctx.fillRect(drop.x - 7, drop.y - 7, 14, 14);
      ctx.fillStyle = '#05070a';
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('★', drop.x, drop.y + 3);
    }

    // Draw Paddle
    ctx.fillStyle = '#ff007f';
    ctx.fillRect(this.paddleX, 430, this.paddleWidth, this.paddleHeight);
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(this.paddleX + 6, 432, this.paddleWidth - 12, 3);

    // Draw Ball
    ctx.fillStyle = '#ffea00';
    ctx.beginPath();
    ctx.arc(this.ballX, this.ballY, this.ballRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Game Over Overlay
    if (this.isGameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#ff0055';
      ctx.font = '22px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('BREAKOUT FAILED', width / 2, height / 2 - 20);

      ctx.fillStyle = '#00f0ff';
      ctx.font = '12px "Press Start 2P", monospace';
      ctx.fillText(`SCORE: ${this.score}`, width / 2, height / 2 + 15);

      ctx.fillStyle = '#aaaaaa';
      ctx.font = '11px "VT323", monospace';
      ctx.fillText('PRESS [A] OR SPACE TO REBUILD BLOCKS', width / 2, height / 2 + 45);
    }
  }

  handleAction(actionName: string) {
    if (actionName === 'restart' || actionName === 'fire' || actionName === 'actionA') {
      if (this.isGameOver) {
        this.reset();
      } else if (this.ballAttached) {
        this.launchBall();
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

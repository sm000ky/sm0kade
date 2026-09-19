import { Cartridge, GameCallbacks, InputState } from '../types';
import { sounds } from '../../audio/soundManager';
import { PROJECTS } from '../../data/projects';

interface Pipe {
  x: number;
  topHeight: number;
  bottomY: number;
  passed: boolean;
}

export class FlappyGame implements Cartridge {
  id = 'flappy';
  title = 'CYBER FLAP';
  subtitle = 'PIXEL FLIGHT // SERVER DODGER';
  genre = 'Flappy Flight';
  themeColor = '#ffaa00';
  icon = '🚀';
  instructions = {
    desktop: 'SPACEBAR / UP / CLICK to thrust engine • Dodge server pillars!',
    mobile: 'Tap screen or [A] button to thrust • Dodge server pillars!'
  };

  private callbacks: GameCallbacks | null = null;
  private score: number = 0;
  private lives: number = 1;
  private isGameOver: boolean = false;
  private paused: boolean = false;

  // Ship Physics
  private shipY: number = 240;
  private shipVy: number = 0;
  private readonly gravity: number = 750; // px/sec^2
  private readonly flapStrength: number = -260; // px/sec
  private readonly shipRadius: number = 10;

  // Pipes / Server Pillars
  private pipes: Pipe[] = [];
  private pipeSpawnTimer: number = 0;
  private readonly pipeInterval: number = 1.6; // seconds
  private readonly pipeSpeed: number = 140; // px/sec
  private readonly pipeGap: number = 120; // px gap between top and bottom

  // Flap debounce
  private flapTriggered: boolean = false;

  init(_canvas: HTMLCanvasElement, _ctx: CanvasRenderingContext2D, callbacks: GameCallbacks) {
    this.callbacks = callbacks;
    this.reset();
  }

  reset() {
    this.score = 0;
    this.lives = 1;
    this.isGameOver = false;
    this.paused = false;
    this.shipY = 240;
    this.shipVy = 0;
    this.pipes = [];
    this.pipeSpawnTimer = 0.5;

    if (this.callbacks) {
      this.callbacks.onScoreUpdate(this.score);
      this.callbacks.onLivesUpdate(this.lives);
    }
  }

  private flap() {
    if (this.isGameOver) return;
    this.shipVy = this.flapStrength;
    sounds.playBounce(1.5);
  }

  update(deltaTime: number, input: InputState) {
    if (this.isGameOver || this.paused) return;
    const dt = Math.min(deltaTime, 0.05);

    // Flap input
    if (input.actionA || input.up) {
      if (!this.flapTriggered) {
        this.flapTriggered = true;
        this.flap();
      }
    } else {
      this.flapTriggered = false;
    }

    // Physics
    this.shipVy += this.gravity * dt;
    this.shipY += this.shipVy * dt;

    // Floor / Ceiling Collision
    if (this.shipY - this.shipRadius <= 10 || this.shipY + this.shipRadius >= 470) {
      this.gameOver();
      return;
    }

    // Spawn Pipes
    this.pipeSpawnTimer += dt;
    if (this.pipeSpawnTimer >= this.pipeInterval) {
      this.pipeSpawnTimer = 0;
      const minHeight = 60;
      const maxHeight = 480 - this.pipeGap - minHeight - 20;
      const topHeight = minHeight + Math.random() * (maxHeight - minHeight);

      this.pipes.push({
        x: 420,
        topHeight,
        bottomY: topHeight + this.pipeGap,
        passed: false
      });
    }

    // Update Pipes & Check Collisions
    const shipX = 80;
    for (let i = this.pipes.length - 1; i >= 0; i--) {
      const p = this.pipes[i];
      p.x -= this.pipeSpeed * dt;

      // Score passing
      if (!p.passed && p.x + 36 < shipX) {
        p.passed = true;
        this.score += 50;
        sounds.playDot();

        // Unlock portfolio every 5 pipes
        if (this.score % 250 === 0) {
          sounds.playProjectDiscovered();
          const proj = PROJECTS[Math.floor(Math.random() * PROJECTS.length)];
          if (this.callbacks) this.callbacks.onProjectUnlocked(proj);
        }

        if (this.callbacks) this.callbacks.onScoreUpdate(this.score);
      }

      // Check collision with ship
      const pipeWidth = 40;
      if (shipX + this.shipRadius > p.x && shipX - this.shipRadius < p.x + pipeWidth) {
        // Inside X range of pipe
        if (this.shipY - this.shipRadius < p.topHeight || this.shipY + this.shipRadius > p.bottomY) {
          this.gameOver();
          return;
        }
      }

      // Despawn offscreen
      if (p.x < -50) {
        this.pipes.splice(i, 1);
      }
    }
  }

  private gameOver() {
    this.isGameOver = true;
    this.lives = 0;
    sounds.playExplosion();
    sounds.playGameOver();
    if (this.callbacks) {
      this.callbacks.onLivesUpdate(0);
      this.callbacks.onGameOver(this.score);
    }
  }

  render(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.fillStyle = '#05070a';
    ctx.fillRect(0, 0, width, height);

    // Stars scrolling in background
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 30; i++) {
      const sx = (i * 53 + Date.now() * 0.05) % width;
      const sy = (i * 97) % height;
      ctx.fillRect(sx, sy, 1.5, 1.5);
    }

    const scaleX = width / 400;
    const scaleY = height / 480;

    ctx.save();
    ctx.scale(scaleX, scaleY);

    // Draw Pipes (Server Pillars)
    for (const p of this.pipes) {
      // Top Server Pillar
      ctx.fillStyle = '#0d1629';
      ctx.fillRect(p.x, 0, 40, p.topHeight);
      ctx.strokeStyle = '#ffaa00';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(p.x, 0, 40, p.topHeight);

      // Server LED blinkers on top
      ctx.fillStyle = '#00ff66';
      ctx.fillRect(p.x + 6, p.topHeight - 12, 6, 4);
      ctx.fillStyle = '#ff0055';
      ctx.fillRect(p.x + 16, p.topHeight - 12, 6, 4);

      // Bottom Server Pillar
      ctx.fillStyle = '#0d1629';
      ctx.fillRect(p.x, p.bottomY, 40, 480 - p.bottomY);
      ctx.strokeStyle = '#ffaa00';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(p.x, p.bottomY, 40, 480 - p.bottomY);

      // Server LED blinkers on bottom
      ctx.fillStyle = '#00f0ff';
      ctx.fillRect(p.x + 6, p.bottomY + 8, 6, 4);
      ctx.fillStyle = '#ffea00';
      ctx.fillRect(p.x + 16, p.bottomY + 8, 6, 4);
    }

    // Draw Pixel Rocket Ship
    const shipX = 80;
    ctx.save();
    ctx.translate(shipX, this.shipY);

    // Tilt based on velocity
    const tilt = Math.max(-0.5, Math.min(0.7, this.shipVy / 300));
    ctx.rotate(tilt);

    // Rocket Body
    ctx.fillStyle = '#ff007f';
    ctx.beginPath();
    ctx.moveTo(14, 0);
    ctx.lineTo(-8, -9);
    ctx.lineTo(-4, 0);
    ctx.lineTo(-8, 9);
    ctx.closePath();
    ctx.fill();

    // Window Cockpit
    ctx.fillStyle = '#00f0ff';
    ctx.beginPath();
    ctx.arc(2, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    // Engine Flame (animated)
    const flameLen = 6 + Math.random() * 8;
    ctx.fillStyle = '#ffea00';
    ctx.beginPath();
    ctx.moveTo(-6, -4);
    ctx.lineTo(-6 - flameLen, 0);
    ctx.lineTo(-6, 4);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    ctx.restore();

    // Game Over Overlay
    if (this.isGameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#ff0055';
      ctx.font = '22px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('CRASH DETECTED', width / 2, height / 2 - 20);

      ctx.fillStyle = '#ffaa00';
      ctx.font = '12px "Press Start 2P", monospace';
      ctx.fillText(`SCORE: ${this.score}`, width / 2, height / 2 + 15);

      ctx.fillStyle = '#aaaaaa';
      ctx.font = '11px "VT323", monospace';
      ctx.fillText('PRESS [A] OR TAP TO RESTART', width / 2, height / 2 + 45);
    }
  }

  handleAction(actionName: string) {
    if (actionName === 'restart' || actionName === 'fire' || actionName === 'actionA') {
      if (this.isGameOver) {
        this.reset();
      } else {
        this.flap();
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

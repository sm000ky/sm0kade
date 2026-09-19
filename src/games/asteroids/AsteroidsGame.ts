import { Cartridge, GameCallbacks, InputState } from '../types';
import { sounds } from '../../audio/soundManager';
import { PROJECTS } from '../../data/projects';

interface Asteroid {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  tier: number; // 3: big, 2: medium, 1: small
}

interface Laser {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

export class AsteroidsGame implements Cartridge {
  id = 'asteroids';
  title = 'ASTRO ROCKS';
  subtitle = '1979 VECTOR SHOOTER // INERTIA';
  genre = 'Vector Space';
  themeColor = '#ff007f';
  icon = '☄️';
  instructions = {
    desktop: 'LEFT / RIGHT to rotate • UP to thrust • SPACE to shoot',
    mobile: 'LEFT / RIGHT to steer • Button [B] to thrust • [A] to fire'
  };

  private callbacks: GameCallbacks | null = null;
  private score: number = 0;
  private lives: number = 3;
  private isGameOver: boolean = false;
  private paused: boolean = false;

  // Ship State
  private shipX: number = 200;
  private shipY: number = 240;
  private shipVx: number = 0;
  private shipVy: number = 0;
  private shipAngle: number = -Math.PI / 2;
  private readonly shipRadius: number = 10;
  private shootCooldown: number = 0;

  // Asteroids & Lasers
  private asteroids: Asteroid[] = [];
  private lasers: Laser[] = [];

  init(_canvas: HTMLCanvasElement, _ctx: CanvasRenderingContext2D, callbacks: GameCallbacks) {
    this.callbacks = callbacks;
    this.reset();
  }

  reset() {
    this.score = 0;
    this.lives = 3;
    this.isGameOver = false;
    this.paused = false;
    this.shipX = 200;
    this.shipY = 240;
    this.shipVx = 0;
    this.shipVy = 0;
    this.shipAngle = -Math.PI / 2;
    this.lasers = [];
    this.spawnAsteroids(4);

    if (this.callbacks) {
      this.callbacks.onScoreUpdate(this.score);
      this.callbacks.onLivesUpdate(this.lives);
    }
  }

  private spawnAsteroids(count: number) {
    this.asteroids = [];
    for (let i = 0; i < count; i++) {
      let x: number, y: number;
      do {
        x = Math.random() * 400;
        y = Math.random() * 480;
      } while (Math.hypot(x - this.shipX, y - this.shipY) < 90);

      const angle = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 40;
      this.asteroids.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 24,
        tier: 3
      });
    }
  }

  update(deltaTime: number, input: InputState) {
    if (this.isGameOver || this.paused) return;
    const dt = Math.min(deltaTime, 0.05);

    // Rotation
    if (input.left) this.shipAngle -= 4.2 * dt;
    if (input.right) this.shipAngle += 4.2 * dt;

    // Thrust
    if (input.up || input.actionB) {
      const thrust = 180 * dt;
      this.shipVx += Math.cos(this.shipAngle) * thrust;
      this.shipVy += Math.sin(this.shipAngle) * thrust;
    }

    // Inertia drag
    this.shipVx *= 0.985;
    this.shipVy *= 0.985;

    this.shipX += this.shipVx * dt;
    this.shipY += this.shipVy * dt;

    // Screen Wrap
    if (this.shipX < 0) this.shipX = 400;
    if (this.shipX > 400) this.shipX = 0;
    if (this.shipY < 0) this.shipY = 480;
    if (this.shipY > 480) this.shipY = 0;

    // Shoot Laser
    this.shootCooldown -= dt;
    if ((input.actionA || input.down) && this.shootCooldown <= 0) {
      this.shootCooldown = 0.22;
      const speed = 360;
      this.lasers.push({
        x: this.shipX + Math.cos(this.shipAngle) * 12,
        y: this.shipY + Math.sin(this.shipAngle) * 12,
        vx: Math.cos(this.shipAngle) * speed,
        vy: Math.sin(this.shipAngle) * speed,
        life: 1.2
      });
      sounds.playLaser();
    }

    // Update Lasers
    for (let i = this.lasers.length - 1; i >= 0; i--) {
      const l = this.lasers[i];
      l.x += l.vx * dt;
      l.y += l.vy * dt;
      l.life -= dt;

      // Screen Wrap
      if (l.x < 0) l.x = 400;
      if (l.x > 400) l.x = 0;
      if (l.y < 0) l.y = 480;
      if (l.y > 480) l.y = 0;

      if (l.life <= 0) {
        this.lasers.splice(i, 1);
        continue;
      }

      // Check Laser Hit Asteroid
      for (let j = this.asteroids.length - 1; j >= 0; j--) {
        const a = this.asteroids[j];
        if (Math.hypot(l.x - a.x, l.y - a.y) < a.radius) {
          // Hit!
          this.lasers.splice(i, 1);
          this.score += a.tier * 50;
          sounds.playExplosion();

          // Split asteroid if tier > 1
          if (a.tier > 1) {
            const nextTier = a.tier - 1;
            const nextRad = a.radius * 0.65;
            for (let k = 0; k < 2; k++) {
              const ang = Math.random() * Math.PI * 2;
              const spd = 60 + Math.random() * 50;
              this.asteroids.push({
                x: a.x,
                y: a.y,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                radius: nextRad,
                tier: nextTier
              });
            }
          }

          this.asteroids.splice(j, 1);

          if (this.callbacks) {
            this.callbacks.onScoreUpdate(this.score);
          }
          break;
        }
      }
    }

    // Update Asteroids & Check Ship Collisions
    for (const a of this.asteroids) {
      a.x += a.vx * dt;
      a.y += a.vy * dt;

      if (a.x < 0) a.x = 400;
      if (a.x > 400) a.x = 0;
      if (a.y < 0) a.y = 480;
      if (a.y > 480) a.y = 0;

      // Ship Collision
      if (Math.hypot(a.x - this.shipX, a.y - this.shipY) < a.radius + this.shipRadius) {
        this.lives--;
        sounds.playExplosion();
        if (this.callbacks) this.callbacks.onLivesUpdate(this.lives);

        if (this.lives <= 0) {
          this.isGameOver = true;
          sounds.playGameOver();
          if (this.callbacks) this.callbacks.onGameOver(this.score);
        } else {
          this.shipX = 200;
          this.shipY = 240;
          this.shipVx = 0;
          this.shipVy = 0;
        }
        return;
      }
    }

    // Respawn wave if cleared
    if (this.asteroids.length === 0) {
      sounds.playProjectDiscovered();
      const proj = PROJECTS[Math.floor(Math.random() * PROJECTS.length)];
      if (this.callbacks) this.callbacks.onProjectUnlocked(proj);
      this.spawnAsteroids(5);
    }
  }

  render(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.fillStyle = '#05070a';
    ctx.fillRect(0, 0, width, height);

    const scaleX = width / 400;
    const scaleY = height / 480;

    ctx.save();
    ctx.scale(scaleX, scaleY);

    // Draw Asteroids (Geometric wireframe)
    ctx.strokeStyle = '#ff007f';
    ctx.lineWidth = 1.5;
    for (const a of this.asteroids) {
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.radius, 0, Math.PI * 2);
      ctx.stroke();

      // Inner polygon accent
      ctx.fillStyle = 'rgba(255, 0, 127, 0.1)';
      ctx.fill();
    }

    // Draw Lasers
    ctx.fillStyle = '#00ff66';
    for (const l of this.lasers) {
      ctx.beginPath();
      ctx.arc(l.x, l.y, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw Ship
    ctx.save();
    ctx.translate(this.shipX, this.shipY);
    ctx.rotate(this.shipAngle);

    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(-10, -8);
    ctx.lineTo(-6, 0);
    ctx.lineTo(-10, 8);
    ctx.closePath();
    ctx.stroke();

    ctx.restore();

    ctx.restore();

    // Game Over Overlay
    if (this.isGameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#ff0055';
      ctx.font = '20px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('HULL DESTROYED', width / 2, height / 2 - 20);

      ctx.fillStyle = '#00f0ff';
      ctx.font = '12px "Press Start 2P", monospace';
      ctx.fillText(`SCORE: ${this.score}`, width / 2, height / 2 + 15);

      ctx.fillStyle = '#aaaaaa';
      ctx.font = '11px "VT323", monospace';
      ctx.fillText('PRESS [A] OR SPACE TO REBOOT', width / 2, height / 2 + 45);
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

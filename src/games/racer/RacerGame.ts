import { Cartridge, GameCallbacks, InputState } from '../types';
import { sounds } from '../../audio/soundManager';
import { PROJECTS } from '../../data/projects';

interface TrafficCar {
  lane: number; // 0, 1, 2
  y: number;
  speed: number;
  color: string;
}

export class RacerGame implements Cartridge {
  id = 'racer';
  title = 'NEON RACER';
  subtitle = '80s HIGHWAY // TRAFFIC DODGER';
  genre = 'Highway Drift';
  themeColor = '#ffaa00';
  icon = '🏎️';
  instructions = {
    desktop: 'LEFT / RIGHT to switch lanes • UP / [A] to turbo boost!',
    mobile: 'Swipe or use Left / Right on D-Pad • Tap [A] to boost'
  };

  private callbacks: GameCallbacks | null = null;
  private score: number = 0;
  private lives: number = 1;
  private isGameOver: boolean = false;
  private paused: boolean = false;

  // 3 Lanes (x: 100, 200, 300)
  private readonly lanes = [110, 200, 290];
  private currentLane: number = 1; // Start in middle lane
  private targetX: number = 200;
  private currentX: number = 200;

  private roadSpeed: number = 220; // px/sec
  private roadOffset: number = 0;

  // Traffic
  private traffic: TrafficCar[] = [];
  private spawnTimer: number = 0;

  // Floppy Project Shard on Highway
  private floppyShard: { active: boolean; lane: number; y: number; projectIndex: number } = {
    active: false,
    lane: 1,
    y: -40,
    projectIndex: 0
  };

  // Visual Juice: Turbo Exhaust Sparks & Speed lines
  private exhaustSparks: { x: number; y: number; vx: number; vy: number; life: number }[] = [];

  init(_canvas: HTMLCanvasElement, _ctx: CanvasRenderingContext2D, callbacks: GameCallbacks) {
    this.callbacks = callbacks;
    this.reset();
  }

  reset() {
    this.score = 0;
    this.lives = 1;
    this.isGameOver = false;
    this.paused = false;
    this.currentLane = 1;
    this.currentX = this.lanes[1];
    this.targetX = this.lanes[1];
    this.roadSpeed = 220;
    this.traffic = [];
    this.spawnTimer = 0.5;
    this.floppyShard.active = false;

    if (this.callbacks) {
      this.callbacks.onScoreUpdate(this.score);
      this.callbacks.onLivesUpdate(this.lives);
    }
  }

  update(deltaTime: number, input: InputState) {
    if (this.isGameOver || this.paused) return;
    const dt = Math.min(deltaTime, 0.05);

    // Lane shifts
    if (input.left && this.currentLane > 0) {
      this.currentLane--;
      this.targetX = this.lanes[this.currentLane];
      sounds.playSwitchClick();
      input.left = false;
    } else if (input.right && this.currentLane < 2) {
      this.currentLane++;
      this.targetX = this.lanes[this.currentLane];
      sounds.playSwitchClick();
      input.right = false;
    }

    // Smooth lane glide
    this.currentX += (this.targetX - this.currentX) * 18 * dt;

    // Turbo boost
    const effectiveSpeed = input.actionA || input.up ? this.roadSpeed * 1.6 : this.roadSpeed;
    this.roadOffset = (this.roadOffset + effectiveSpeed * dt) % 80;

    // Spawn exhaust sparks when boosting
    if (input.actionA || input.up) {
      this.exhaustSparks.push({
        x: this.currentX + (Math.random() - 0.5) * 16,
        y: 415,
        vx: (Math.random() - 0.5) * 30,
        vy: 120 + Math.random() * 80,
        life: 0.3
      });
    }

    // Update Exhaust Sparks
    for (let i = this.exhaustSparks.length - 1; i >= 0; i--) {
      const s = this.exhaustSparks[i];
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.life -= dt;
      if (s.life <= 0) this.exhaustSparks.splice(i, 1);
    }

    // Increment distance score
    this.score += Math.floor(effectiveSpeed * dt * 0.4);
    if (this.callbacks) this.callbacks.onScoreUpdate(this.score);

    // Spawn Traffic
    this.spawnTimer += dt;
    if (this.spawnTimer >= 1.2) {
      this.spawnTimer = 0;
      const lane = Math.floor(Math.random() * 3);
      const colors = ['#ff0055', '#a855f7', '#00ff66', '#ffffff'];
      this.traffic.push({
        lane,
        y: -60,
        speed: 80 + Math.random() * 60,
        color: colors[Math.floor(Math.random() * colors.length)]
      });

      // Spawn Floppy every 10 cars
      if (Math.random() < 0.25 && !this.floppyShard.active) {
        this.floppyShard = {
          active: true,
          lane: (lane + 1) % 3,
          y: -80,
          projectIndex: Math.floor(Math.random() * PROJECTS.length)
        };
      }
    }

    // Update Traffic
    const playerY = 390;
    const carW = 34;
    const carH = 50;

    for (let i = this.traffic.length - 1; i >= 0; i--) {
      const car = this.traffic[i];
      car.y += (effectiveSpeed - car.speed) * dt;

      // Check Collision with Player
      const carX = this.lanes[car.lane];
      if (
        Math.abs(this.currentX - carX) < carW - 6 &&
        Math.abs(playerY - car.y) < carH - 8
      ) {
        // Crash!
        this.isGameOver = true;
        sounds.playExplosion();
        sounds.playGameOver();
        if (this.callbacks) {
          this.callbacks.onLivesUpdate(0);
          this.callbacks.onGameOver(this.score);
        }
        return;
      }

      // Despawn offscreen
      if (car.y > 520) {
        this.traffic.splice(i, 1);
      }
    }

    // Update Floppy Shard
    if (this.floppyShard.active) {
      this.floppyShard.y += effectiveSpeed * dt;
      const shardX = this.lanes[this.floppyShard.lane];

      if (Math.abs(this.currentX - shardX) < carW && Math.abs(playerY - this.floppyShard.y) < carH) {
        this.floppyShard.active = false;
        this.score += 500;
        sounds.playProjectDiscovered();
        const proj = PROJECTS[this.floppyShard.projectIndex % PROJECTS.length];
        if (this.callbacks) {
          this.callbacks.onScoreUpdate(this.score);
          this.callbacks.onProjectUnlocked(proj);
        }
      } else if (this.floppyShard.y > 520) {
        this.floppyShard.active = false;
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

    // Highway Road Surface
    ctx.fillStyle = '#0b0d18';
    ctx.fillRect(50, 0, 300, 480);

    // Highway Neon Guardrails
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 3;
    ctx.strokeRect(50, 0, 300, 480);

    // Dashed Lane Dividers (Scrolling)
    ctx.strokeStyle = 'rgba(255, 234, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.setLineDash([20, 20]);
    ctx.lineDashOffset = -this.roadOffset;

    // Divider 1 (between lane 0 and 1)
    ctx.beginPath();
    ctx.moveTo(150, 0);
    ctx.lineTo(150, 480);
    ctx.stroke();

    // Divider 2 (between lane 1 and 2)
    ctx.beginPath();
    ctx.moveTo(250, 0);
    ctx.lineTo(250, 480);
    ctx.stroke();

    ctx.setLineDash([]);

    // Draw Floppy Shard
    if (this.floppyShard.active) {
      const fx = this.lanes[this.floppyShard.lane];
      ctx.fillStyle = '#00ff66';
      ctx.fillRect(fx - 12, this.floppyShard.y - 12, 24, 24);
      ctx.fillStyle = '#000000';
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('★', fx, this.floppyShard.y + 4);
    }

    // Draw Traffic Cars
    for (const car of this.traffic) {
      const cx = this.lanes[car.lane];
      ctx.fillStyle = car.color;
      ctx.fillRect(cx - 15, car.y - 25, 30, 50);

      // Windshield
      ctx.fillStyle = '#05070a';
      ctx.fillRect(cx - 11, car.y - 10, 22, 14);

      // Tail lights
      ctx.fillStyle = '#ff0033';
      ctx.fillRect(cx - 13, car.y + 20, 8, 4);
      ctx.fillRect(cx + 5, car.y + 20, 8, 4);
    }

    // Draw Player Neon Racer (Cyan & Amber)
    const px = this.currentX;
    const py = 390;

    // Car Body
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(px - 16, py - 26, 32, 52);

    // Hood Stripes
    ctx.fillStyle = '#ffaa00';
    ctx.fillRect(px - 4, py - 26, 8, 52);

    // Cockpit
    ctx.fillStyle = '#05070a';
    ctx.fillRect(px - 11, py - 12, 22, 16);

    // Headlights
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(px - 14, py - 26, 6, 4);
    ctx.fillRect(px + 8, py - 26, 6, 4);

    // Draw Turbo Exhaust Sparks
    for (const s of this.exhaustSparks) {
      ctx.fillStyle = '#ffaa00';
      ctx.fillRect(s.x, s.y, 2.5, 2.5);
    }

    ctx.restore();

    // Game Over Overlay
    if (this.isGameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#ff0055';
      ctx.font = '20px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('HIGHWAY PILEUP', width / 2, height / 2 - 20);

      ctx.fillStyle = '#ffaa00';
      ctx.font = '12px "Press Start 2P", monospace';
      ctx.fillText(`DISTANCE: ${this.score} M`, width / 2, height / 2 + 15);

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

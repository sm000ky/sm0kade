import { Cartridge, GameCallbacks, InputState } from '../types';
import { sounds } from '../../audio/soundManager';
import { PROJECTS } from '../../data/projects';

interface Point {
  x: number;
  y: number;
}

export class SnakeGame implements Cartridge {
  id = 'snake';
  title = 'CYBER SNAKE';
  subtitle = 'RETRO NOKIA // CODE VIPER';
  genre = 'Matrix Snake';
  themeColor = '#00ff66';
  icon = '🐍';
  instructions = {
    desktop: 'ARROW KEYS / WASD to turn • Eat data nodes, avoid walls & tail!',
    mobile: 'Swipe screen or use Virtual D-Pad to steer • Tap A for turbo boost'
  };

  private callbacks: GameCallbacks | null = null;
  private score: number = 0;
  private lives: number = 1;
  private isGameOver: boolean = false;
  private paused: boolean = false;

  // Grid configuration: 20 cols x 24 rows
  private readonly cols = 20;
  private readonly rows = 24;

  private snake: Point[] = [];
  private dir: Point = { x: 1, y: 0 };
  private nextDir: Point = { x: 1, y: 0 };
  private food: Point = { x: 10, y: 12 };
  private floppy: { active: boolean; x: number; y: number; projectIndex: number } = {
    active: false,
    x: 0,
    y: 0,
    projectIndex: 0
  };

  private moveTimer: number = 0;
  private moveInterval: number = 0.12; // seconds per step
  private foodEaten: number = 0;

  init(_canvas: HTMLCanvasElement, _ctx: CanvasRenderingContext2D, callbacks: GameCallbacks) {
    this.callbacks = callbacks;
    this.reset();
  }

  reset() {
    this.score = 0;
    this.lives = 1;
    this.isGameOver = false;
    this.paused = false;
    this.foodEaten = 0;
    this.moveInterval = 0.12;

    // Start with 4 segments in the middle
    this.snake = [
      { x: 8, y: 12 },
      { x: 7, y: 12 },
      { x: 6, y: 12 },
      { x: 5, y: 12 }
    ];
    this.dir = { x: 1, y: 0 };
    this.nextDir = { x: 1, y: 0 };
    this.spawnFood();
    this.floppy.active = false;

    if (this.callbacks) {
      this.callbacks.onScoreUpdate(this.score);
      this.callbacks.onLivesUpdate(this.lives);
    }
  }

  private spawnFood() {
    let newFood: Point;
    let collision: boolean;
    do {
      newFood = {
        x: Math.floor(Math.random() * this.cols),
        y: Math.floor(Math.random() * this.rows)
      };
      collision = this.snake.some((seg) => seg.x === newFood.x && seg.y === newFood.y);
    } while (collision);

    this.food = newFood;
  }

  private spawnFloppy() {
    let newFloppy: Point;
    let collision: boolean;
    do {
      newFloppy = {
        x: Math.floor(Math.random() * this.cols),
        y: Math.floor(Math.random() * this.rows)
      };
      collision = this.snake.some((seg) => seg.x === newFloppy.x && seg.y === newFloppy.y) ||
        (newFloppy.x === this.food.x && newFloppy.y === this.food.y);
    } while (collision);

    this.floppy = {
      active: true,
      x: newFloppy.x,
      y: newFloppy.y,
      projectIndex: Math.floor(Math.random() * PROJECTS.length)
    };
  }

  update(deltaTime: number, input: InputState) {
    if (this.isGameOver || this.paused) return;

    // Buffer directional input (prevent 180 reverse)
    if (input.up && this.dir.y === 0) this.nextDir = { x: 0, y: -1 };
    else if (input.down && this.dir.y === 0) this.nextDir = { x: 0, y: 1 };
    else if (input.left && this.dir.x === 0) this.nextDir = { x: -1, y: 0 };
    else if (input.right && this.dir.x === 0) this.nextDir = { x: 1, y: 0 };

    const speedMultiplier = input.actionA ? 0.6 : 1.0;
    this.moveTimer += deltaTime;

    if (this.moveTimer >= this.moveInterval * speedMultiplier) {
      this.moveTimer = 0;
      this.step();
    }
  }

  private step() {
    this.dir = this.nextDir;
    const head = this.snake[0];
    const newHead: Point = {
      x: head.x + this.dir.x,
      y: head.y + this.dir.y
    };

    // Wall collision (Death)
    if (newHead.x < 0 || newHead.x >= this.cols || newHead.y < 0 || newHead.y >= this.rows) {
      this.gameOver();
      return;
    }

    // Self collision
    if (this.snake.some((seg) => seg.x === newHead.x && seg.y === newHead.y)) {
      this.gameOver();
      return;
    }

    this.snake.unshift(newHead);

    // Eat Food
    if (newHead.x === this.food.x && newHead.y === this.food.y) {
      this.score += 100;
      this.foodEaten++;
      sounds.playDot();
      this.moveInterval = Math.max(0.06, 0.12 - this.foodEaten * 0.002);
      this.spawnFood();

      // Spawn floppy project shard every 4 foods
      if (this.foodEaten % 4 === 0 && !this.floppy.active) {
        this.spawnFloppy();
      }

      if (this.callbacks) this.callbacks.onScoreUpdate(this.score);
    } else if (this.floppy.active && newHead.x === this.floppy.x && newHead.y === this.floppy.y) {
      // Eat Floppy Project Shard
      this.floppy.active = false;
      this.score += 400;
      sounds.playProjectDiscovered();
      const proj = PROJECTS[this.floppy.projectIndex % PROJECTS.length];
      if (this.callbacks) {
        this.callbacks.onScoreUpdate(this.score);
        this.callbacks.onProjectUnlocked(proj);
      }
    } else {
      this.snake.pop(); // Remove tail if not eating
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

    const cellW = width / this.cols;
    const cellH = height / this.rows;

    // Subtle green phosphor grid lines
    ctx.strokeStyle = 'rgba(0, 255, 102, 0.06)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += cellW) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += cellH) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Draw Food (Pulsing Energy Pellet)
    const pulse = (Math.sin(Date.now() * 0.01) + 1) / 2;
    ctx.fillStyle = pulse > 0.4 ? '#00ff66' : '#ffffff';
    ctx.fillRect(this.food.x * cellW + 2, this.food.y * cellH + 2, cellW - 4, cellH - 4);

    // Draw Floppy Shard
    if (this.floppy.active) {
      ctx.fillStyle = '#ffea00';
      ctx.fillRect(this.floppy.x * cellW + 1, this.floppy.y * cellH + 1, cellW - 2, cellH - 2);
      ctx.fillStyle = '#05070a';
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('★', (this.floppy.x + 0.5) * cellW, (this.floppy.y + 0.7) * cellH);
    }

    // Draw Snake
    this.snake.forEach((seg, i) => {
      if (i === 0) {
        // Head
        ctx.fillStyle = '#00f0ff';
        ctx.fillRect(seg.x * cellW + 1, seg.y * cellH + 1, cellW - 2, cellH - 2);

        // Head Eyes
        ctx.fillStyle = '#000000';
        const eyeSize = 3;
        ctx.fillRect(seg.x * cellW + 4, seg.y * cellH + 4, eyeSize, eyeSize);
        ctx.fillRect(seg.x * cellW + cellW - 7, seg.y * cellH + 4, eyeSize, eyeSize);
      } else {
        // Body (Gradient green to cyan)
        ctx.fillStyle = i % 2 === 0 ? '#00ff66' : '#00dd55';
        ctx.fillRect(seg.x * cellW + 1.5, seg.y * cellH + 1.5, cellW - 3, cellH - 3);
      }
    });

    // Game Over Overlay
    if (this.isGameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#ff0055';
      ctx.font = '22px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('VIPER CRASH', width / 2, height / 2 - 20);

      ctx.fillStyle = '#00ff66';
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

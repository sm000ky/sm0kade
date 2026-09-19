import { Cartridge, GameCallbacks, InputState } from '../types';
import { sounds } from '../../audio/soundManager';
import { PROJECTS } from '../../data/projects';

export class MemoryGame implements Cartridge {
  id = 'memory';
  title = 'MATRIX MEMORY';
  subtitle = 'CYBER PATTERN // NEURAL RECALL';
  genre = 'Pattern Recall';
  themeColor = '#00ff66';
  icon = '🧠';
  instructions = {
    desktop: 'UP (Green), RIGHT (Amber), DOWN (Cyan), LEFT (Pink) • Repeat pattern!',
    mobile: 'Tap illuminated sector or use D-Pad • Repeat neural pattern!'
  };

  private callbacks: GameCallbacks | null = null;
  private score: number = 0;
  private lives: number = 1;
  private isGameOver: boolean = false;
  private paused: boolean = false;

  // 4 Sectors: 0: UP (Green), 1: RIGHT (Amber), 2: DOWN (Cyan), 3: LEFT (Pink)
  private sequence: number[] = [];
  private playerStep: number = 0;
  private isShowingSequence: boolean = true;
  private activeSector: number | null = null;
  private flashTimer: number = 0;
  private seqIndex: number = 0;

  init(_canvas: HTMLCanvasElement, _ctx: CanvasRenderingContext2D, callbacks: GameCallbacks) {
    this.callbacks = callbacks;
    this.reset();
  }

  reset() {
    this.score = 0;
    this.lives = 1;
    this.isGameOver = false;
    this.paused = false;
    this.sequence = [Math.floor(Math.random() * 4)];
    this.playerStep = 0;
    this.isShowingSequence = true;
    this.seqIndex = 0;
    this.flashTimer = 0.6;
    this.activeSector = null;

    if (this.callbacks) {
      this.callbacks.onScoreUpdate(this.score);
      this.callbacks.onLivesUpdate(this.lives);
    }
  }

  private playTone(sector: number) {
    const tones = [523.25, 659.25, 783.99, 1046.50];
    sounds.playBounce(tones[sector] / 500);
  }

  update(deltaTime: number, input: InputState) {
    if (this.isGameOver || this.paused) return;

    if (this.isShowingSequence) {
      this.flashTimer -= deltaTime;
      if (this.flashTimer <= 0) {
        if (this.activeSector !== null) {
          // Turn off flash
          this.activeSector = null;
          this.flashTimer = 0.25;
          this.seqIndex++;

          if (this.seqIndex >= this.sequence.length) {
            // Finished sequence display, player's turn!
            this.isShowingSequence = false;
            this.playerStep = 0;
          }
        } else {
          // Turn on next sector flash
          this.activeSector = this.sequence[this.seqIndex];
          this.playTone(this.activeSector);
          this.flashTimer = 0.45;
        }
      }
      return;
    }

    // Player Input Check
    let chosen: number | null = null;
    if (input.up) chosen = 0;
    else if (input.right) chosen = 1;
    else if (input.down) chosen = 2;
    else if (input.left) chosen = 3;

    if (chosen !== null) {
      // Clear input
      input.up = false;
      input.right = false;
      input.down = false;
      input.left = false;

      this.activeSector = chosen;
      this.playTone(chosen);

      // Verify correct step
      if (chosen === this.sequence[this.playerStep]) {
        this.playerStep++;
        this.score += 50;
        if (this.callbacks) this.callbacks.onScoreUpdate(this.score);

        // Completed sequence!
        if (this.playerStep >= this.sequence.length) {
          sounds.playProjectDiscovered();
          this.score += 150;

          // Unlock project every 3 rounds
          if (this.sequence.length % 3 === 0) {
            const proj = PROJECTS[Math.floor(Math.random() * PROJECTS.length)];
            if (this.callbacks) this.callbacks.onProjectUnlocked(proj);
          }

          if (this.callbacks) this.callbacks.onScoreUpdate(this.score);

          // Add next step to sequence
          this.sequence.push(Math.floor(Math.random() * 4));
          this.isShowingSequence = true;
          this.seqIndex = 0;
          this.flashTimer = 0.8;
          this.activeSector = null;
        }
      } else {
        // Wrong step!
        this.isGameOver = true;
        sounds.playExplosion();
        sounds.playGameOver();
        if (this.callbacks) {
          this.callbacks.onLivesUpdate(0);
          this.callbacks.onGameOver(this.score);
        }
      }
    }
  }

  render(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.fillStyle = '#05070a';
    ctx.fillRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const outerR = Math.min(width, height) * 0.38;
    const innerR = outerR * 0.35;

    // Sector Colors: [UP, RIGHT, DOWN, LEFT]
    const baseColors = ['#00aa44', '#cc8800', '#0099cc', '#cc0055'];
    const litColors = ['#00ff66', '#ffaa00', '#00f0ff', '#ff007f'];

    // Draw 4 Arc Sectors
    for (let i = 0; i < 4; i++) {
      const isLit = this.activeSector === i;
      const startAngle = (i * Math.PI) / 2 - Math.PI / 4 + 0.05;
      const endAngle = startAngle + Math.PI / 2 - 0.1;

      ctx.beginPath();
      ctx.arc(centerX, centerY, outerR, startAngle, endAngle);
      ctx.arc(centerX, centerY, innerR, endAngle, startAngle, true);
      ctx.closePath();

      ctx.fillStyle = isLit ? litColors[i] : baseColors[i];
      ctx.fill();

      if (isLit) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.stroke();
      }
    }

    // Center Console Hub
    ctx.fillStyle = '#121422';
    ctx.beginPath();
    ctx.arc(centerX, centerY, innerR - 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#2b2d42';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Center Round Status
    ctx.fillStyle = '#00f0ff';
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(this.isShowingSequence ? 'WATCH' : 'REPEAT', centerX, centerY - 4);

    ctx.fillStyle = '#ffffff';
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.fillText(`LVL ${this.sequence.length}`, centerX, centerY + 12);

    // Game Over Overlay
    if (this.isGameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#ff0055';
      ctx.font = '20px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('NEURAL MISMATCH', width / 2, height / 2 - 20);

      ctx.fillStyle = '#00ff66';
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

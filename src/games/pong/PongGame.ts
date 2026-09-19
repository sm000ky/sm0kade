import { Cartridge, GameCallbacks, InputState } from '../types';
import { sounds } from '../../audio/soundManager';
import { PROJECTS } from '../../data/projects';

export class PongGame implements Cartridge {
  id = 'pong';
  title = 'CYBER PONG';
  subtitle = '1972 TABLE TENNIS // AI DUEL';
  genre = 'Paddle Duel';
  themeColor = '#00f0ff';
  icon = '🏓';
  instructions = {
    desktop: 'UP / DOWN or W / S to slide paddle • First to 5 points wins!',
    mobile: 'Swipe or use UP / DOWN on D-Pad • First to 5 points wins!'
  };

  private callbacks: GameCallbacks | null = null;
  private score: number = 0;
  private lives: number = 3;
  private isGameOver: boolean = false;
  private paused: boolean = false;

  // Paddles
  private playerY: number = 200;
  private aiY: number = 200;
  private readonly paddleH: number = 70;
  private readonly paddleW: number = 10;
  private readonly paddleSpeed: number = 280;

  // Ball
  private ballX: number = 200;
  private ballY: number = 240;
  private ballVx: number = 240;
  private ballVy: number = 120;
  private readonly ballSize: number = 8;

  // Match Scores
  private playerScore: number = 0;
  private aiScore: number = 0;

  init(_canvas: HTMLCanvasElement, _ctx: CanvasRenderingContext2D, callbacks: GameCallbacks) {
    this.callbacks = callbacks;
    this.reset();
  }

  reset() {
    this.score = 0;
    this.lives = 3;
    this.playerScore = 0;
    this.aiScore = 0;
    this.isGameOver = false;
    this.paused = false;
    this.playerY = 200;
    this.aiY = 200;
    this.resetBall(1);

    if (this.callbacks) {
      this.callbacks.onScoreUpdate(this.score);
      this.callbacks.onLivesUpdate(this.lives);
    }
  }

  private resetBall(direction: number) {
    this.ballX = 200;
    this.ballY = 240;
    const speed = 250;
    const angle = (Math.random() * 0.8 - 0.4);
    this.ballVx = Math.cos(angle) * speed * direction;
    this.ballVy = Math.sin(angle) * speed;
  }

  update(deltaTime: number, input: InputState) {
    if (this.isGameOver || this.paused) return;
    const dt = Math.min(deltaTime, 0.05);

    // Player paddle move
    if (input.up) this.playerY -= this.paddleSpeed * dt;
    if (input.down) this.playerY += this.paddleSpeed * dt;
    this.playerY = Math.max(10, Math.min(480 - this.paddleH - 10, this.playerY));

    // AI paddle move with slight reaction delay
    const targetAiY = this.ballY - this.paddleH / 2;
    const aiSpeed = 230 * dt;
    if (this.aiY < targetAiY - 5) this.aiY += Math.min(aiSpeed, targetAiY - this.aiY);
    else if (this.aiY > targetAiY + 5) this.aiY -= Math.min(aiSpeed, this.aiY - targetAiY);
    this.aiY = Math.max(10, Math.min(480 - this.paddleH - 10, this.aiY));

    // Ball movement
    this.ballX += this.ballVx * dt;
    this.ballY += this.ballVy * dt;

    // Top / Bottom Wall Bounce
    if (this.ballY <= 10) {
      this.ballY = 10;
      this.ballVy = Math.abs(this.ballVy);
      sounds.playBounce(1);
    } else if (this.ballY >= 470) {
      this.ballY = 470;
      this.ballVy = -Math.abs(this.ballVy);
      sounds.playBounce(1);
    }

    // Player Paddle Collision (Left, x = 25)
    if (
      this.ballX <= 25 + this.paddleW &&
      this.ballX >= 25 - 4 &&
      this.ballY >= this.playerY - 4 &&
      this.ballY <= this.playerY + this.paddleH + 4 &&
      this.ballVx < 0
    ) {
      const offset = (this.ballY - (this.playerY + this.paddleH / 2)) / (this.paddleH / 2);
      this.ballVx = Math.abs(this.ballVx) * 1.05; // slight speedup
      this.ballVy = offset * 280;
      sounds.playBounce(1.4);
    }

    // AI Paddle Collision (Right, x = 365)
    if (
      this.ballX >= 365 - this.paddleW &&
      this.ballX <= 365 + 4 &&
      this.ballY >= this.aiY - 4 &&
      this.ballY <= this.aiY + this.paddleH + 4 &&
      this.ballVx > 0
    ) {
      const offset = (this.ballY - (this.aiY + this.paddleH / 2)) / (this.paddleH / 2);
      this.ballVx = -Math.abs(this.ballVx) * 1.05;
      this.ballVy = offset * 280;
      sounds.playBounce(1.2);
    }

    // Scoring
    if (this.ballX < 0) {
      // AI scored
      this.aiScore++;
      sounds.playExplosion();
      if (this.aiScore >= 5) {
        this.isGameOver = true;
        sounds.playGameOver();
        if (this.callbacks) this.callbacks.onGameOver(this.score);
      } else {
        this.resetBall(1);
      }
    } else if (this.ballX > 400) {
      // Player scored!
      this.playerScore++;
      this.score += 250;
      sounds.playProjectDiscovered();

      // Trigger portfolio spotlight on score
      const proj = PROJECTS[Math.floor(Math.random() * PROJECTS.length)];
      if (this.callbacks) {
        this.callbacks.onScoreUpdate(this.score);
        this.callbacks.onProjectUnlocked(proj);
      }

      if (this.playerScore >= 5) {
        this.isGameOver = true;
        sounds.playProjectDiscovered();
        if (this.callbacks) this.callbacks.onGameOver(this.score);
      } else {
        this.resetBall(-1);
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

    // Center Dashed Net
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(200, 0);
    ctx.lineTo(200, 480);
    ctx.stroke();
    ctx.setLineDash([]);

    // Score Board
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '28px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${this.playerScore}`, 140, 50);
    ctx.fillText(`${this.aiScore}`, 260, 50);

    // Player Paddle (Cyan)
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(25, this.playerY, this.paddleW, this.paddleH);

    // AI Paddle (Pink)
    ctx.fillStyle = '#ff007f';
    ctx.fillRect(365, this.aiY, this.paddleW, this.paddleH);

    // Ball (Square arcade pellet)
    ctx.fillStyle = '#ffea00';
    ctx.fillRect(this.ballX - this.ballSize / 2, this.ballY - this.ballSize / 2, this.ballSize, this.ballSize);

    ctx.restore();

    // Game Over Overlay
    if (this.isGameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = this.playerScore >= 5 ? '#00ff66' : '#ff0055';
      ctx.font = '20px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(this.playerScore >= 5 ? 'VICTORY' : 'DEFEATED', width / 2, height / 2 - 20);

      ctx.fillStyle = '#00f0ff';
      ctx.font = '12px "Press Start 2P", monospace';
      ctx.fillText(`MATCH: ${this.playerScore} - ${this.aiScore}`, width / 2, height / 2 + 15);

      ctx.fillStyle = '#aaaaaa';
      ctx.font = '11px "VT323", monospace';
      ctx.fillText('PRESS [A] OR SPACE TO REMATCH', width / 2, height / 2 + 45);
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

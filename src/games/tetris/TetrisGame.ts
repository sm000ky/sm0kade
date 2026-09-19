import { Cartridge, GameCallbacks, InputState } from '../types';
import { sounds } from '../../audio/soundManager';
import { PROJECTS } from '../../data/projects';

// 10 cols x 20 rows
const COLS = 10;
const ROWS = 20;

// Tetromino definitions
const SHAPES: number[][][] = [
  // I
  [[1, 1, 1, 1]],
  // J
  [[1, 0, 0], [1, 1, 1]],
  // L
  [[0, 0, 1], [1, 1, 1]],
  // O
  [[1, 1], [1, 1]],
  // S
  [[0, 1, 1], [1, 1, 0]],
  // T
  [[0, 1, 0], [1, 1, 1]],
  // Z
  [[1, 1, 0], [0, 1, 1]]
];

const COLORS = [
  '#00f0ff', // I (Cyan)
  '#0055ff', // J (Blue)
  '#ffaa00', // L (Orange)
  '#ffea00', // O (Yellow)
  '#00ff66', // S (Green)
  '#a855f7', // T (Purple)
  '#ff0055'  // Z (Red)
];

export class TetrisGame implements Cartridge {
  id = 'tetris';
  title = 'BLOCK STACKER';
  subtitle = 'FALLING MATRIX // TETROMINO';
  genre = 'Falling Blocks';
  themeColor = '#a855f7';
  icon = '🧱';
  instructions = {
    desktop: 'LEFT / RIGHT to shift • UP / SPACE to rotate • DOWN for soft drop',
    mobile: 'Swipe or use D-Pad to shift • Tap [A] to rotate tetromino'
  };

  private callbacks: GameCallbacks | null = null;
  private score: number = 0;
  private lives: number = 1;
  private isGameOver: boolean = false;
  private paused: boolean = false;

  private board: (string | null)[][] = [];
  private currentShape: number[][] = [];
  private currentColor: string = '';
  private currentX: number = 3;
  private currentY: number = 0;

  private dropTimer: number = 0;
  private dropInterval: number = 0.6; // seconds per drop
  private linesCleared: number = 0;

  // Key debounce for rotate
  private rotatePressed: boolean = false;

  init(_canvas: HTMLCanvasElement, _ctx: CanvasRenderingContext2D, callbacks: GameCallbacks) {
    this.callbacks = callbacks;
    this.reset();
  }

  reset() {
    this.score = 0;
    this.lives = 1;
    this.isGameOver = false;
    this.paused = false;
    this.linesCleared = 0;
    this.dropInterval = 0.6;

    // Create empty 10x20 board
    this.board = Array.from({ length: ROWS }, () => Array(COLS).fill(null));

    this.spawnPiece();

    if (this.callbacks) {
      this.callbacks.onScoreUpdate(this.score);
      this.callbacks.onLivesUpdate(this.lives);
    }
  }

  private spawnPiece() {
    const idx = Math.floor(Math.random() * SHAPES.length);
    this.currentShape = SHAPES[idx];
    this.currentColor = COLORS[idx];
    this.currentX = Math.floor((COLS - this.currentShape[0].length) / 2);
    this.currentY = 0;

    // Game over check
    if (this.collides(this.currentX, this.currentY, this.currentShape)) {
      this.isGameOver = true;
      sounds.playGameOver();
      if (this.callbacks) {
        this.callbacks.onLivesUpdate(0);
        this.callbacks.onGameOver(this.score);
      }
    }
  }

  private collides(x: number, y: number, shape: number[][]): boolean {
    for (let r = 0; r < shape.length; r++) {
      for (let c = 0; c < shape[r].length; c++) {
        if (shape[r][c]) {
          const newX = x + c;
          const newY = y + r;
          if (newX < 0 || newX >= COLS || newY >= ROWS) return true;
          if (newY >= 0 && this.board[newY][newX] !== null) return true;
        }
      }
    }
    return false;
  }

  private rotate(matrix: number[][]): number[][] {
    return matrix[0].map((_, i) => matrix.map((row) => row[i]).reverse());
  }

  update(deltaTime: number, input: InputState) {
    if (this.isGameOver || this.paused) return;

    // Horizontal movement with soft step
    if (input.left) {
      if (!this.collides(this.currentX - 1, this.currentY, this.currentShape)) {
        this.currentX--;
        sounds.playSwitchClick();
      }
      input.left = false; // single shift per tap
    } else if (input.right) {
      if (!this.collides(this.currentX + 1, this.currentY, this.currentShape)) {
        this.currentX++;
        sounds.playSwitchClick();
      }
      input.right = false;
    }

    // Rotation
    if ((input.up || input.actionA) && !this.rotatePressed) {
      this.rotatePressed = true;
      const rotated = this.rotate(this.currentShape);
      if (!this.collides(this.currentX, this.currentY, rotated)) {
        this.currentShape = rotated;
        sounds.playBounce(1.3);
      } else if (!this.collides(this.currentX - 1, this.currentY, rotated)) {
        // Wall kick left
        this.currentX--;
        this.currentShape = rotated;
        sounds.playBounce(1.3);
      } else if (!this.collides(this.currentX + 1, this.currentY, rotated)) {
        // Wall kick right
        this.currentX++;
        this.currentShape = rotated;
        sounds.playBounce(1.3);
      }
    } else if (!input.up && !input.actionA) {
      this.rotatePressed = false;
    }

    // Soft drop
    const effectiveDropInterval = input.down ? 0.05 : this.dropInterval;
    this.dropTimer += deltaTime;

    if (this.dropTimer >= effectiveDropInterval) {
      this.dropTimer = 0;
      if (!this.collides(this.currentX, this.currentY + 1, this.currentShape)) {
        this.currentY++;
      } else {
        this.lockPiece();
      }
    }
  }

  private lockPiece() {
    sounds.playBrickSmash();

    // Lock to board
    for (let r = 0; r < this.currentShape.length; r++) {
      for (let c = 0; c < this.currentShape[r].length; c++) {
        if (this.currentShape[r][c]) {
          const by = this.currentY + r;
          const bx = this.currentX + c;
          if (by >= 0 && by < ROWS && bx >= 0 && bx < COLS) {
            this.board[by][bx] = this.currentColor;
          }
        }
      }
    }

    // Clear full rows
    let rowsCleared = 0;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (this.board[r].every((cell) => cell !== null)) {
        this.board.splice(r, 1);
        this.board.unshift(Array(COLS).fill(null));
        rowsCleared++;
        r++; // check row again since rows shifted down
      }
    }

    if (rowsCleared > 0) {
      const lineScores = [0, 100, 300, 500, 800];
      this.score += lineScores[rowsCleared] || 1000;
      this.linesCleared += rowsCleared;
      sounds.playEatGhost(rowsCleared);

      // Increase speed
      this.dropInterval = Math.max(0.15, 0.6 - this.linesCleared * 0.02);

      // Every 4 lines unlock a project!
      if (this.linesCleared % 4 === 0) {
        sounds.playProjectDiscovered();
        const proj = PROJECTS[Math.floor(Math.random() * PROJECTS.length)];
        if (this.callbacks) this.callbacks.onProjectUnlocked(proj);
      }

      if (this.callbacks) this.callbacks.onScoreUpdate(this.score);
    }

    this.spawnPiece();
  }

  render(ctx: CanvasRenderingContext2D, width: number, height: number) {
    ctx.fillStyle = '#05070a';
    ctx.fillRect(0, 0, width, height);

    const cellW = width / COLS;
    const cellH = height / ROWS;

    // Grid background
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.08)';
    ctx.lineWidth = 1;
    for (let c = 0; c <= COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(c * cellW, 0);
      ctx.lineTo(c * cellW, height);
      ctx.stroke();
    }
    for (let r = 0; r <= ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * cellH);
      ctx.lineTo(width, r * cellH);
      ctx.stroke();
    }

    // Draw Locked Board
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const color = this.board[r][c];
        if (color) {
          ctx.fillStyle = color;
          ctx.fillRect(c * cellW + 1, r * cellH + 1, cellW - 2, cellH - 2);

          // Top bevel highlight
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.fillRect(c * cellW + 1, r * cellH + 1, cellW - 2, 2);
        }
      }
    }

    // Draw Ghost Piece Projection
    let ghostY = this.currentY;
    while (!this.collides(this.currentX, ghostY + 1, this.currentShape)) {
      ghostY++;
    }

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1.5;
    for (let r = 0; r < this.currentShape.length; r++) {
      for (let c = 0; c < this.currentShape[r].length; c++) {
        if (this.currentShape[r][c]) {
          ctx.strokeRect((this.currentX + c) * cellW + 2, (ghostY + r) * cellH + 2, cellW - 4, cellH - 4);
        }
      }
    }

    // Draw Falling Piece
    for (let r = 0; r < this.currentShape.length; r++) {
      for (let c = 0; c < this.currentShape[r].length; c++) {
        if (this.currentShape[r][c]) {
          ctx.fillStyle = this.currentColor;
          ctx.fillRect((this.currentX + c) * cellW + 1, (this.currentY + r) * cellH + 1, cellW - 2, cellH - 2);

          // Bevel highlight
          ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
          ctx.fillRect((this.currentX + c) * cellW + 1, (this.currentY + r) * cellH + 1, cellW - 2, 2);
        }
      }
    }

    // Game Over Overlay
    if (this.isGameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#ff0055';
      ctx.font = '22px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('STACK OVERFLOW', width / 2, height / 2 - 20);

      ctx.fillStyle = '#a855f7';
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

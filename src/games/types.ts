import { Project } from '../types/project';

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  actionA: boolean; // Primary button (Fire / Select / Boost)
  actionB: boolean; // Secondary button (Special / Jump)
}

export interface GameCallbacks {
  onScoreUpdate: (score: number) => void;
  onLivesUpdate: (lives: number) => void;
  onGameOver: (finalScore: number) => void;
  onVictory?: (finalScore: number) => void;
  onProjectUnlocked: (project: Project) => void;
}

export interface Cartridge {
  id: string;
  title: string;
  subtitle: string;
  genre: string;
  instructions: {
    desktop: string;
    mobile: string;
  };
  themeColor: string;
  icon: string; // Emoji / Icon identifier

  init: (canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, callbacks: GameCallbacks) => void;
  update: (deltaTime: number, input: InputState) => void;
  render: (ctx: CanvasRenderingContext2D, width: number, height: number) => void;
  handleAction?: (actionName: string) => void;
  destroy: () => void;
  reset: () => void;
  getScore: () => number;
  getLives: () => number;
  isPaused: () => boolean;
  setPaused: (paused: boolean) => void;
}

export interface CartridgeMetadata {
  id: string;
  title: string;
  subtitle: string;
  genre: string;
  themeColor: string;
  icon: string;
  factory: () => Cartridge;
}

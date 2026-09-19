import { Cartridge, CartridgeMetadata } from './types';
import { PacmanGame } from './pacman/PacmanGame';
import { InvadersGame } from './invaders/InvadersGame';
import { BreakoutGame } from './breakout/BreakoutGame';
import { SnakeGame } from './snake/SnakeGame';
import { TetrisGame } from './tetris/TetrisGame';
import { FlappyGame } from './flappy/FlappyGame';

export const CARTRIDGES: CartridgeMetadata[] = [
  {
    id: 'pacman',
    title: 'DEV LABYRINTH',
    subtitle: 'PAC-MAN // CODE HUNTER',
    genre: 'Maze Action',
    themeColor: '#ffea00',
    icon: '🟡',
    factory: () => new PacmanGame()
  },
  {
    id: 'invaders',
    title: 'BYTE INVADERS',
    subtitle: 'SPACE SHOOTER // BUG CRUSHER',
    genre: 'Fixed Shooter',
    themeColor: '#00f0ff',
    icon: '👾',
    factory: () => new InvadersGame()
  },
  {
    id: 'breakout',
    title: 'TECH BREAKOUT',
    subtitle: 'BRICK SMASHER // STACK BREAKER',
    genre: 'Paddle & Ball',
    themeColor: '#ff007f',
    icon: '🧱',
    factory: () => new BreakoutGame()
  },
  {
    id: 'snake',
    title: 'CYBER SNAKE',
    subtitle: 'RETRO NOKIA // CODE VIPER',
    genre: 'Matrix Snake',
    themeColor: '#00ff66',
    icon: '🐍',
    factory: () => new SnakeGame()
  },
  {
    id: 'tetris',
    title: 'BLOCK STACKER',
    subtitle: 'FALLING MATRIX // TETROMINO',
    genre: 'Falling Blocks',
    themeColor: '#a855f7',
    icon: '🧩',
    factory: () => new TetrisGame()
  },
  {
    id: 'flappy',
    title: 'CYBER FLAP',
    subtitle: 'PIXEL FLIGHT // SERVER DODGER',
    genre: 'Flappy Flight',
    themeColor: '#ffaa00',
    icon: '🚀',
    factory: () => new FlappyGame()
  }
];

export const getCartridgeById = (id: string): CartridgeMetadata | undefined => {
  return CARTRIDGES.find((c) => c.id === id);
};

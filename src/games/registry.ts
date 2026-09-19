import { Cartridge, CartridgeMetadata } from './types';
import { PacmanGame } from './pacman/PacmanGame';
import { InvadersGame } from './invaders/InvadersGame';
import { BreakoutGame } from './breakout/BreakoutGame';

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
  }
];

export const getCartridgeById = (id: string): CartridgeMetadata | undefined => {
  return CARTRIDGES.find((c) => c.id === id);
};

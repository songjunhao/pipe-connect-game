import { Direction, OPPOSITE, DIR_OFFSET } from './constants';

export function calculateStars(currentSteps: number, optimalSteps: number): number {
  if (currentSteps <= optimalSteps) return 3;
  if (currentSteps <= Math.ceil(optimalSteps * 1.5)) return 2;
  return 1;
}

export function getOpposite(dir: Direction): Direction {
  return OPPOSITE[dir];
}

export function getNeighborPos(row: number, col: number, dir: Direction): { row: number; col: number } {
  const offset = DIR_OFFSET[dir];
  return { row: row + offset.dr, col: col + offset.dc };
}

export function isInBounds(row: number, col: number, gridSize: number): boolean {
  return row >= 0 && row < gridSize && col >= 0 && col < gridSize;
}

export function colorToHex(colorName: string): number {
  const map: Record<string, number> = {
    blue: 0x4a9eff,
    orange: 0xff8c42,
    white: 0xe8e8e8,
    lightblue: 0x7ec8e3,
    green: 0x5cb85c,
    pink: 0xff69b4,
  };
  return map[colorName] ?? 0x888888;
}

export function glowColor(colorName: string): number {
  const map: Record<string, number> = {
    blue: 0x6ab8ff,
    orange: 0xffaa66,
    white: 0xffffff,
    lightblue: 0x9ee0f5,
    green: 0x7dd87d,
    pink: 0xff8ec8,
  };
  return map[colorName] ?? 0xaaaaaa;
}

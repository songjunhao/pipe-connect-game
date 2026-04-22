export const COLORS = {
  BLUE: 0x4a9eff,
  ORANGE: 0xff8c42,
  WHITE: 0xe8e8e8,
  LIGHTBLUE: 0x7ec8e3,
  GREEN: 0x5cb85c,
  PINK: 0xff69b4,
  GRAY: 0x555566,
  DARK_GRAY: 0x333344,
  BG_DARK: 0x0f0f23,
  CELL_DARK: 0x1a1a2e,
  CELL_LIGHT: 0x16162a,
  HIGHLIGHT: 0xffff00,
  GLOW_BLUE: 0x6ab8ff,
  GLOW_ORANGE: 0xffaa66,
  GLOW_WHITE: 0xffffff,
  GLOW_LIGHTBLUE: 0x9ee0f5,
  GLOW_GREEN: 0x7dd87d,
  GLOW_PINK: 0xff8ec8,
};

export const COLOR_MAP: Record<string, number> = {
  blue: COLORS.BLUE,
  orange: COLORS.ORANGE,
  white: COLORS.WHITE,
  lightblue: COLORS.LIGHTBLUE,
  green: COLORS.GREEN,
  pink: COLORS.PINK,
};

export const GLOW_MAP: Record<string, number> = {
  blue: COLORS.GLOW_BLUE,
  orange: COLORS.GLOW_ORANGE,
  white: COLORS.GLOW_WHITE,
  lightblue: COLORS.GLOW_LIGHTBLUE,
  green: COLORS.GLOW_GREEN,
  pink: COLORS.GLOW_PINK,
};

export const CELL_SIZE = 56;
export const GRID_PADDING = 20;
export const PIPE_WIDTH = 16;
export const ENDPOINT_RADIUS = 18;

export const HINT_COST = 50;
export const LEVEL_REWARD = 30;

export const GAME_WIDTH = 480;
export const GAME_HEIGHT = 854;

export const DIRECTIONS = ['up', 'down', 'left', 'right'] as const;
export type Direction = typeof DIRECTIONS[number];

export const OPPOSITE: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

export const DIR_OFFSET: Record<Direction, { dr: number; dc: number }> = {
  up: { dr: -1, dc: 0 },
  down: { dr: 1, dc: 0 },
  left: { dr: 0, dc: -1 },
  right: { dr: 0, dc: 1 },
};

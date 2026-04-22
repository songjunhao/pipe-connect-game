import { Direction } from '../utils/constants';

export interface CellData {
  row: number;
  col: number;
  type: 'empty' | 'pipe' | 'endpoint';
  color?: string;
  connections?: Direction[];
  isFixed?: boolean;
  isActive?: boolean; // true = colored/activated, false = gray/disconnected
}

export interface LevelData {
  id: number;
  gridSize: number;
  cells: CellData[];
  optimalSteps: number;
  reward: number;
}

export class Grid {
  public size: number;
  public cells: CellData[][];

  constructor(levelData: LevelData) {
    this.size = levelData.gridSize;
    this.cells = [];

    // Initialize empty grid
    for (let r = 0; r < this.size; r++) {
      this.cells[r] = [];
      for (let c = 0; c < this.size; c++) {
        this.cells[r][c] = {
          row: r,
          col: c,
          type: 'empty',
          isActive: false,
        };
      }
    }

    // Fill in cells from level data
    for (const cell of levelData.cells) {
      this.cells[cell.row][cell.col] = { ...cell };
    }
  }

  getCell(row: number, col: number): CellData | null {
    if (row < 0 || row >= this.size || col < 0 || col >= this.size) return null;
    return this.cells[row][col];
  }

  toggleActive(row: number, col: number): boolean {
    const cell = this.getCell(row, col);
    if (!cell || cell.type === 'empty' || cell.isFixed) return false;
    cell.isActive = !cell.isActive;
    return true;
  }

  setActive(row: number, col: number, active: boolean): void {
    const cell = this.getCell(row, col);
    if (cell && cell.type !== 'empty' && !cell.isFixed) {
      cell.isActive = active;
    }
  }

  reset(): void {
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const cell = this.cells[r][c];
        if (cell.type !== 'empty' && !cell.isFixed) {
          cell.isActive = false;
        }
      }
    }
  }

  getColors(): string[] {
    const colorSet = new Set<string>();
    for (let r = 0; r < this.size; r++) {
      for (let c = 0; c < this.size; c++) {
        const cell = this.cells[r][c];
        if (cell.color) {
          colorSet.add(cell.color);
        }
      }
    }
    return Array.from(colorSet);
  }
}

import { CellData } from './Grid';
import { Pipe } from './Pipe';

export class ConnectionChecker {
  static checkColor(grid: CellData[][], gridSize: number, color: string): boolean {
    // Find all active cells of this color
    const colorCells: { row: number; col: number }[] = [];
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const cell = grid[r][c];
        if (cell.color === color && cell.isActive && cell.type !== 'empty') {
          colorCells.push({ row: r, col: c });
        }
      }
    }

    if (colorCells.length === 0) return false;

    // BFS from first cell
    const visited = new Set<string>();
    const queue: { row: number; col: number }[] = [colorCells[0]];
    visited.add(`${colorCells[0].row},${colorCells[0].col}`);

    while (queue.length > 0) {
      const current = queue.shift()!;
      const neighbors = Pipe.getConnectedNeighbors(grid, current.row, current.col, gridSize);

      for (const neighbor of neighbors) {
        const key = `${neighbor.row},${neighbor.col}`;
        if (!visited.has(key)) {
          visited.add(key);
          queue.push(neighbor);
        }
      }
    }

    // All cells of this color must be visited
    return colorCells.every(c => visited.has(`${c.row},${c.col}`));
  }

  static checkAll(grid: CellData[][], gridSize: number, colors: string[]): boolean {
    return colors.every(color => this.checkColor(grid, gridSize, color));
  }

  static findDisconnectedPipe(
    grid: CellData[][],
    gridSize: number,
    color: string
  ): { row: number; col: number } | null {
    // Find a gray (inactive) pipe of this color that should be activated
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const cell = grid[r][c];
        if (cell.color === color && !cell.isActive && cell.type === 'pipe' && !cell.isFixed) {
          return { row: r, col: c };
        }
      }
    }
    return null;
  }

  static findHint(grid: CellData[][], gridSize: number, colors: string[]): { row: number; col: number } | null {
    // Find a color that isn't fully connected, then find a gray pipe of that color
    for (const color of colors) {
      if (!this.checkColor(grid, gridSize, color)) {
        const hint = this.findDisconnectedPipe(grid, gridSize, color);
        if (hint) return hint;
      }
    }
    return null;
  }
}

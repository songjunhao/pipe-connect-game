import { Direction, OPPOSITE, DIR_OFFSET } from '../utils/constants';
import { CellData } from './Grid';

export class Pipe {
  static canConnect(cellA: CellData, cellB: CellData, dirFromA: Direction): boolean {
    if (!cellA.connections || !cellB.connections) return false;
    if (!cellA.isActive || !cellB.isActive) return false;
    if (cellA.color !== cellB.color) return false;

    const hasDirA = cellA.connections.includes(dirFromA);
    const hasDirB = cellB.connections.includes(OPPOSITE[dirFromA]);

    return hasDirA && hasDirB;
  }

  static getConnectedNeighbors(
    grid: CellData[][],
    row: number,
    col: number,
    gridSize: number
  ): { row: number; col: number }[] {
    const cell = grid[row][col];
    if (!cell || !cell.isActive || !cell.connections) return [];

    const neighbors: { row: number; col: number }[] = [];

    for (const dir of cell.connections) {
      const offset = DIR_OFFSET[dir];
      const nr = row + offset.dr;
      const nc = col + offset.dc;

      if (nr < 0 || nr >= gridSize || nc < 0 || nc >= gridSize) continue;

      const neighbor = grid[nr][nc];
      if (this.canConnect(cell, neighbor, dir)) {
        neighbors.push({ row: nr, col: nc });
      }
    }

    return neighbors;
  }
}

import { Direction, DIR_OFFSET } from '../utils/constants';
import { CellData, LevelData } from './Grid';

export class LevelGenerator {
  static generate(id: number, gridSize: number, colorCount: number, difficulty: number): LevelData {
    const cells: CellData[] = [];
    const colorNames = ['blue', 'orange', 'white', 'lightblue', 'green', 'pink'];
    const usedColors = colorNames.slice(0, colorCount);

    // Create empty grid
    const grid: (CellData | null)[][] = [];
    for (let r = 0; r < gridSize; r++) {
      grid[r] = [];
      for (let c = 0; c < gridSize; c++) {
        grid[r][c] = null;
      }
    }

    // For each color, generate a random path connecting 2 endpoints
    const occupied = new Set<string>();
    let optimalSteps = 0;

    for (const color of usedColors) {
      // Find start position
      let startR: number, startC: number;
      do {
        startR = Math.floor(Math.random() * gridSize);
        startC = Math.floor(Math.random() * gridSize);
      } while (occupied.has(`${startR},${startC}`));

      occupied.add(`${startR},${startC}`);

      // Random walk to create path
      const path: { r: number; c: number }[] = [{ r: startR, c: startC }];
      const pathLength = 3 + Math.floor(Math.random() * (difficulty + 2));
      const pathSet = new Set<string>([`${startR},${startC}`]);

      let currentR = startR;
      let currentC = startC;

      for (let step = 0; step < pathLength; step++) {
        const dirs: Direction[] = ['up', 'down', 'left', 'right'];
        // Shuffle directions
        for (let i = dirs.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [dirs[i], dirs[j]] = [dirs[j], dirs[i]];
        }

        let moved = false;
        for (const dir of dirs) {
          const nr = currentR + DIR_OFFSET[dir].dr;
          const nc = currentC + DIR_OFFSET[dir].dc;
          if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize && !occupied.has(`${nr},${nc}`)) {
            currentR = nr;
            currentC = nc;
            path.push({ r: nr, c: nc });
            pathSet.add(`${nr},${nc}`);
            occupied.add(`${nr},${nc}`);
            moved = true;
            break;
          }
        }
        if (!moved) break;
      }

      if (path.length < 2) continue;

      // Convert path to cells
      const connections: Record<string, Direction[]> = {};
      for (let i = 0; i < path.length; i++) {
        const key = `${path[i].r},${path[i].c}`;
        connections[key] = [];

        if (i > 0) {
          const prev = path[i - 1];
          if (prev.r < path[i].r) connections[key].push('up');
          if (prev.r > path[i].r) connections[key].push('down');
          if (prev.c < path[i].c) connections[key].push('left');
          if (prev.c > path[i].c) connections[key].push('right');
        }
        if (i < path.length - 1) {
          const next = path[i + 1];
          if (next.r < path[i].r) connections[key].push('up');
          if (next.r > path[i].r) connections[key].push('down');
          if (next.c < path[i].c) connections[key].push('left');
          if (next.c > path[i].c) connections[key].push('right');
        }
      }

      // Create endpoint cells for first and last
      const startKey = `${path[0].r},${path[0].c}`;
      const endKey = `${path[path.length - 1].r},${path[path.length - 1].c}`;

      grid[path[0].r][path[0].c] = {
        row: path[0].r,
        col: path[0].c,
        type: 'endpoint',
        color,
        connections: connections[startKey],
        isFixed: true,
        isActive: true,
      };

      grid[path[path.length - 1].r][path[path.length - 1].c] = {
        row: path[path.length - 1].r,
        col: path[path.length - 1].c,
        type: 'endpoint',
        color,
        connections: connections[endKey],
        isFixed: true,
        isActive: true,
      };

      // Create pipe cells for middle
      const numToDeactivate = Math.min(difficulty + 1, path.length - 2);
      const deactivateIndices = new Set<number>();
      while (deactivateIndices.size < numToDeactivate && deactivateIndices.size < path.length - 2) {
        const idx = 1 + Math.floor(Math.random() * (path.length - 2));
        deactivateIndices.add(idx);
      }
      optimalSteps += deactivateIndices.size;

      for (let i = 1; i < path.length - 1; i++) {
        const p = path[i];
        const key = `${p.r},${p.c}`;
        grid[p.r][p.c] = {
          row: p.r,
          col: p.c,
          type: 'pipe',
          color,
          connections: connections[key],
          isFixed: false,
          isActive: !deactivateIndices.has(i),
        };
      }
    }

    // Flatten grid to cells array
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (grid[r][c]) {
          cells.push(grid[r][c]!);
        }
      }
    }

    return {
      id,
      gridSize,
      cells,
      optimalSteps: Math.max(1, optimalSteps),
      reward: 30,
    };
  }
}

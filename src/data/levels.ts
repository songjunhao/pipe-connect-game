import { CellData, LevelData } from '../logic/Grid';

// Levels 1-3: 5x5 grid, 2 colors, simple straight connections
// Levels 4-6: 5x5 grid, 3 colors, need turns
// Levels 7-10: 7x7 grid, 4 colors, medium difficulty
// Levels 11-12: 7x7 grid, 4-5 colors, harder

function e(row: number, col: number, color: string, connections: string[], isFixed = true, isActive = true): CellData {
  return { row, col, type: 'endpoint', color, connections: connections as any, isFixed, isActive };
}

function p(row: number, col: number, color: string, connections: string[], isFixed = false, isActive = false): CellData {
  return { row, col, type: 'pipe', color, connections: connections as any, isFixed, isActive };
}

function fp(row: number, col: number, color: string, connections: string[]): CellData {
  return { row, col, type: 'pipe', color, connections: connections as any, isFixed: true, isActive: true };
}

export const levels: LevelData[] = [
  // Level 1: 5x5, 2 colors (blue, orange) - very simple
  {
    id: 1,
    gridSize: 5,
    cells: [
      // Blue path: endpoint(0,0) -> pipe(0,1) -> pipe(0,2) -> endpoint(0,3)
      e(0, 0, 'blue', ['right']),
      p(0, 1, 'blue', ['left', 'right']),
      p(0, 2, 'blue', ['left', 'right']),
      e(0, 3, 'blue', ['left']),
      // Orange path: endpoint(2,1) -> pipe(2,2) -> pipe(2,3) -> endpoint(2,4)
      e(2, 1, 'orange', ['right']),
      p(2, 2, 'orange', ['left', 'right']),
      p(2, 3, 'orange', ['left', 'right']),
      e(2, 4, 'orange', ['left']),
    ],
    optimalSteps: 4,
    reward: 30,
  },

  // Level 2: 5x5, 2 colors - with one turn each
  {
    id: 2,
    gridSize: 5,
    cells: [
      // Blue: endpoint(0,0) -> pipe(1,0) -> pipe(1,1) -> endpoint(1,2)
      e(0, 0, 'blue', ['down']),
      p(1, 0, 'blue', ['up', 'right']),
      p(1, 1, 'blue', ['left', 'right']),
      e(1, 2, 'blue', ['left']),
      // Orange: endpoint(3,2) -> pipe(3,3) -> pipe(4,3) -> endpoint(4,4)
      e(3, 2, 'orange', ['right']),
      p(3, 3, 'orange', ['left', 'down']),
      p(4, 3, 'orange', ['up', 'right']),
      e(4, 4, 'orange', ['left']),
    ],
    optimalSteps: 4,
    reward: 30,
  },

  // Level 3: 5x5, 2 colors - longer paths
  {
    id: 3,
    gridSize: 5,
    cells: [
      // Blue: endpoint(0,4) -> pipe(1,4) -> pipe(2,4) -> pipe(2,3) -> pipe(2,2) -> endpoint(2,1)
      e(0, 4, 'blue', ['down']),
      p(1, 4, 'blue', ['up', 'down']),
      p(2, 4, 'blue', ['up', 'left']),
      p(2, 3, 'blue', ['right', 'left']),
      p(2, 2, 'blue', ['right', 'left']),
      e(2, 1, 'blue', ['right']),
      // Orange: endpoint(4,0) -> pipe(3,0) -> pipe(3,1) -> pipe(3,2) -> endpoint(3,3)
      e(4, 0, 'orange', ['up']),
      p(3, 0, 'orange', ['down', 'right']),
      p(3, 1, 'orange', ['left', 'right']),
      p(3, 2, 'orange', ['left', 'right']),
      e(3, 3, 'orange', ['left']),
    ],
    optimalSteps: 5,
    reward: 30,
  },

  // Level 4: 5x5, 3 colors (blue, orange, white) - need turns
  {
    id: 4,
    gridSize: 5,
    cells: [
      // Blue: endpoint(0,0) -> pipe(0,1) -> pipe(1,1) -> endpoint(2,1)
      e(0, 0, 'blue', ['right']),
      p(0, 1, 'blue', ['left', 'down']),
      p(1, 1, 'blue', ['up', 'down']),
      e(2, 1, 'blue', ['up']),
      // Orange: endpoint(0,3) -> pipe(0,4) -> pipe(1,4) -> endpoint(2,4)
      e(0, 3, 'orange', ['right']),
      p(0, 4, 'orange', ['left', 'down']),
      p(1, 4, 'orange', ['up', 'down']),
      e(2, 4, 'orange', ['up']),
      // White: endpoint(3,0) -> pipe(3,1) -> pipe(4,1) -> endpoint(4,2)
      e(3, 0, 'white', ['right']),
      p(3, 1, 'white', ['left', 'down']),
      p(4, 1, 'white', ['up', 'right']),
      e(4, 2, 'white', ['left']),
    ],
    optimalSteps: 6,
    reward: 30,
  },

  // Level 5: 5x5, 3 colors - more complex turns
  {
    id: 5,
    gridSize: 5,
    cells: [
      // Blue: endpoint(0,2) -> pipe(1,2) -> pipe(1,1) -> endpoint(1,0)
      e(0, 2, 'blue', ['down']),
      p(1, 2, 'blue', ['up', 'left']),
      p(1, 1, 'blue', ['right', 'left']),
      e(1, 0, 'blue', ['right']),
      // Orange: endpoint(0,4) -> pipe(1,4) -> pipe(2,4) -> pipe(2,3) -> endpoint(2,2)
      e(0, 4, 'orange', ['down']),
      p(1, 4, 'orange', ['up', 'down']),
      p(2, 4, 'orange', ['up', 'left']),
      p(2, 3, 'orange', ['right', 'left']),
      e(2, 2, 'orange', ['right']),
      // White: endpoint(3,0) -> pipe(4,0) -> pipe(4,1) -> pipe(4,2) -> endpoint(4,3)
      e(3, 0, 'white', ['down']),
      p(4, 0, 'white', ['up', 'right']),
      p(4, 1, 'white', ['left', 'right']),
      p(4, 2, 'white', ['left', 'right']),
      e(4, 3, 'white', ['left']),
    ],
    optimalSteps: 7,
    reward: 30,
  },

  // Level 6: 5x5, 3 colors - intertwined paths
  {
    id: 6,
    gridSize: 5,
    cells: [
      // Blue: endpoint(0,0) -> pipe(0,1) -> pipe(1,1) -> pipe(2,1) -> endpoint(3,1)
      e(0, 0, 'blue', ['right']),
      p(0, 1, 'blue', ['left', 'down']),
      p(1, 1, 'blue', ['up', 'down']),
      p(2, 1, 'blue', ['up', 'down']),
      e(3, 1, 'blue', ['up']),
      // Orange: endpoint(0,3) -> pipe(1,3) -> pipe(1,2) -> pipe(1,1) is taken, use pipe(2,3) -> pipe(2,2) -> endpoint(2,1)
      // Let me redesign - avoid overlap
      // Orange: endpoint(0,3) -> pipe(0,4) -> pipe(1,4) -> pipe(2,4) -> endpoint(3,4)
      e(0, 3, 'orange', ['right']),
      p(0, 4, 'orange', ['left', 'down']),
      p(1, 4, 'orange', ['up', 'down']),
      p(2, 4, 'orange', ['up', 'down']),
      e(3, 4, 'orange', ['up']),
      // White: endpoint(4,0) -> pipe(4,1) -> pipe(4,2) -> pipe(3,2) -> endpoint(3,3)
      e(4, 0, 'white', ['right']),
      p(4, 1, 'white', ['left', 'right']),
      p(4, 2, 'white', ['left', 'up']),
      p(3, 2, 'white', ['down', 'right']),
      e(3, 3, 'white', ['left']),
    ],
    optimalSteps: 7,
    reward: 30,
  },

  // Level 7: 7x7, 4 colors (blue, orange, white, lightblue) - medium
  {
    id: 7,
    gridSize: 7,
    cells: [
      // Blue: endpoint(0,0) -> pipe(1,0) -> pipe(1,1) -> pipe(1,2) -> endpoint(1,3)
      e(0, 0, 'blue', ['down']),
      p(1, 0, 'blue', ['up', 'right']),
      p(1, 1, 'blue', ['left', 'right']),
      p(1, 2, 'blue', ['left', 'right']),
      e(1, 3, 'blue', ['left']),
      // Orange: endpoint(0,5) -> pipe(0,6) -> pipe(1,6) -> pipe(2,6) -> endpoint(3,6)
      e(0, 5, 'orange', ['right']),
      p(0, 6, 'orange', ['left', 'down']),
      p(1, 6, 'orange', ['up', 'down']),
      p(2, 6, 'orange', ['up', 'down']),
      e(3, 6, 'orange', ['up']),
      // White: endpoint(4,0) -> pipe(4,1) -> pipe(4,2) -> pipe(3,2) -> endpoint(3,3)
      e(4, 0, 'white', ['right']),
      p(4, 1, 'white', ['left', 'right']),
      p(4, 2, 'white', ['left', 'up']),
      p(3, 2, 'white', ['down', 'right']),
      e(3, 3, 'white', ['left']),
      // Lightblue: endpoint(5,4) -> pipe(5,5) -> pipe(5,6) -> pipe(6,6) -> endpoint(6,5)
      e(5, 4, 'lightblue', ['right']),
      p(5, 5, 'lightblue', ['left', 'right']),
      p(5, 6, 'lightblue', ['left', 'down']),
      p(6, 6, 'lightblue', ['up', 'left']),
      e(6, 5, 'lightblue', ['right']),
    ],
    optimalSteps: 8,
    reward: 30,
  },

  // Level 8: 7x7, 4 colors - more complex
  {
    id: 8,
    gridSize: 7,
    cells: [
      // Blue: endpoint(0,1) -> pipe(0,2) -> pipe(1,2) -> pipe(2,2) -> pipe(2,1) -> endpoint(2,0)
      e(0, 1, 'blue', ['right']),
      p(0, 2, 'blue', ['left', 'down']),
      p(1, 2, 'blue', ['up', 'down']),
      p(2, 2, 'blue', ['up', 'left']),
      p(2, 1, 'blue', ['right', 'left']),
      e(2, 0, 'blue', ['right']),
      // Orange: endpoint(0,4) -> pipe(0,5) -> pipe(1,5) -> pipe(1,4) -> pipe(1,3) -> endpoint(1,2)
      // 1,2 is taken by blue. Redesign:
      // Orange: endpoint(0,4) -> pipe(0,5) -> pipe(0,6) -> pipe(1,6) -> endpoint(2,6)
      e(0, 4, 'orange', ['right']),
      p(0, 5, 'orange', ['left', 'right']),
      p(0, 6, 'orange', ['left', 'down']),
      p(1, 6, 'orange', ['up', 'down']),
      e(2, 6, 'orange', ['up']),
      // White: endpoint(3,0) -> pipe(3,1) -> pipe(4,1) -> pipe(4,2) -> pipe(4,3) -> endpoint(4,4)
      e(3, 0, 'white', ['right']),
      p(3, 1, 'white', ['left', 'down']),
      p(4, 1, 'white', ['up', 'right']),
      p(4, 2, 'white', ['left', 'right']),
      p(4, 3, 'white', ['left', 'right']),
      e(4, 4, 'white', ['left']),
      // Lightblue: endpoint(5,0) -> pipe(5,1) -> pipe(5,2) -> pipe(6,2) -> pipe(6,3) -> endpoint(6,4)
      e(5, 0, 'lightblue', ['right']),
      p(5, 1, 'lightblue', ['left', 'right']),
      p(5, 2, 'lightblue', ['left', 'down']),
      p(6, 2, 'lightblue', ['up', 'right']),
      p(6, 3, 'lightblue', ['left', 'right']),
      e(6, 4, 'lightblue', ['left']),
    ],
    optimalSteps: 10,
    reward: 30,
  },

  // Level 9: 7x7, 4 colors - longer paths
  {
    id: 9,
    gridSize: 7,
    cells: [
      // Blue: endpoint(0,0) -> pipe(0,1) -> pipe(0,2) -> pipe(0,3) -> pipe(1,3) -> pipe(2,3) -> endpoint(3,3)
      e(0, 0, 'blue', ['right']),
      p(0, 1, 'blue', ['left', 'right']),
      p(0, 2, 'blue', ['left', 'right']),
      p(0, 3, 'blue', ['left', 'down']),
      p(1, 3, 'blue', ['up', 'down']),
      p(2, 3, 'blue', ['up', 'down']),
      e(3, 3, 'blue', ['up']),
      // Orange: endpoint(0,5) -> pipe(1,5) -> pipe(2,5) -> pipe(2,4) -> endpoint(2,3)
      // 2,3 is taken. Redesign:
      // Orange: endpoint(0,5) -> pipe(1,5) -> pipe(2,5) -> pipe(3,5) -> pipe(3,4) -> endpoint(3,3)
      // 3,3 is taken. Redesign again:
      // Orange: endpoint(0,6) -> pipe(1,6) -> pipe(2,6) -> pipe(3,6) -> pipe(4,6) -> endpoint(5,6)
      e(0, 6, 'orange', ['down']),
      p(1, 6, 'orange', ['up', 'down']),
      p(2, 6, 'orange', ['up', 'down']),
      p(3, 6, 'orange', ['up', 'down']),
      p(4, 6, 'orange', ['up', 'down']),
      e(5, 6, 'orange', ['up']),
      // White: endpoint(4,0) -> pipe(4,1) -> pipe(5,1) -> pipe(5,2) -> pipe(5,3) -> pipe(5,4) -> endpoint(5,5)
      e(4, 0, 'white', ['right']),
      p(4, 1, 'white', ['left', 'down']),
      p(5, 1, 'white', ['up', 'right']),
      p(5, 2, 'white', ['left', 'right']),
      p(5, 3, 'white', ['left', 'right']),
      p(5, 4, 'white', ['left', 'right']),
      e(5, 5, 'white', ['left']),
      // Lightblue: endpoint(6,0) -> pipe(6,1) -> pipe(6,2) -> pipe(6,3) -> pipe(6,4) -> endpoint(6,5)
      e(6, 0, 'lightblue', ['right']),
      p(6, 1, 'lightblue', ['left', 'right']),
      p(6, 2, 'lightblue', ['left', 'right']),
      p(6, 3, 'lightblue', ['left', 'right']),
      p(6, 4, 'lightblue', ['left', 'right']),
      e(6, 5, 'lightblue', ['left']),
    ],
    optimalSteps: 10,
    reward: 30,
  },

  // Level 10: 7x7, 4 colors - challenging
  {
    id: 10,
    gridSize: 7,
    cells: [
      // Blue: endpoint(0,0) -> pipe(1,0) -> pipe(2,0) -> pipe(2,1) -> pipe(2,2) -> endpoint(2,3)
      e(0, 0, 'blue', ['down']),
      p(1, 0, 'blue', ['up', 'down']),
      p(2, 0, 'blue', ['up', 'right']),
      p(2, 1, 'blue', ['left', 'right']),
      p(2, 2, 'blue', ['left', 'right']),
      e(2, 3, 'blue', ['left']),
      // Orange: endpoint(0,3) -> pipe(0,4) -> pipe(1,4) -> pipe(1,5) -> pipe(1,6) -> endpoint(2,6)
      // Wait, let me check: 1,4 -> 1,5 needs right, 1,5 -> 1,6 needs right, 1,6 -> 2,6 needs down
      // But 2,6 is endpoint with up. Let me fix:
      e(0, 3, 'orange', ['right']),
      p(0, 4, 'orange', ['left', 'down']),
      p(1, 4, 'orange', ['up', 'right']),
      p(1, 5, 'orange', ['left', 'right']),
      p(1, 6, 'orange', ['left', 'down']),
      e(2, 6, 'orange', ['up']),
      // White: endpoint(3,0) -> pipe(3,1) -> pipe(4,1) -> pipe(4,2) -> pipe(4,3) -> pipe(3,3) -> endpoint(3,4)
      // 3,3 is not taken. Good.
      e(3, 0, 'white', ['right']),
      p(3, 1, 'white', ['left', 'down']),
      p(4, 1, 'white', ['up', 'right']),
      p(4, 2, 'white', ['left', 'right']),
      p(4, 3, 'white', ['left', 'up']),
      p(3, 3, 'white', ['down', 'right']),
      e(3, 4, 'white', ['left']),
      // Lightblue: endpoint(5,0) -> pipe(5,1) -> pipe(5,2) -> pipe(6,2) -> pipe(6,3) -> pipe(6,4) -> endpoint(6,5)
      e(5, 0, 'lightblue', ['right']),
      p(5, 1, 'lightblue', ['left', 'right']),
      p(5, 2, 'lightblue', ['left', 'down']),
      p(6, 2, 'lightblue', ['up', 'right']),
      p(6, 3, 'lightblue', ['left', 'right']),
      p(6, 4, 'lightblue', ['left', 'right']),
      e(6, 5, 'lightblue', ['left']),
    ],
    optimalSteps: 11,
    reward: 30,
  },

  // Level 11: 7x7, 5 colors - harder
  {
    id: 11,
    gridSize: 7,
    cells: [
      // Blue: endpoint(0,0) -> pipe(0,1) -> pipe(1,1) -> endpoint(2,1)
      e(0, 0, 'blue', ['right']),
      p(0, 1, 'blue', ['left', 'down']),
      p(1, 1, 'blue', ['up', 'down']),
      e(2, 1, 'blue', ['up']),
      // Orange: endpoint(0,3) -> pipe(0,4) -> pipe(0,5) -> endpoint(0,6)
      e(0, 3, 'orange', ['right']),
      p(0, 4, 'orange', ['left', 'right']),
      p(0, 5, 'orange', ['left', 'right']),
      e(0, 6, 'orange', ['left']),
      // White: endpoint(2,3) -> pipe(2,4) -> pipe(2,5) -> pipe(3,5) -> endpoint(4,5)
      e(2, 3, 'white', ['right']),
      p(2, 4, 'white', ['left', 'right']),
      p(2, 5, 'white', ['left', 'down']),
      p(3, 5, 'white', ['up', 'down']),
      e(4, 5, 'white', ['up']),
      // Lightblue: endpoint(3,0) -> pipe(4,0) -> pipe(4,1) -> pipe(4,2) -> endpoint(4,3)
      e(3, 0, 'lightblue', ['down']),
      p(4, 0, 'lightblue', ['up', 'right']),
      p(4, 1, 'lightblue', ['left', 'right']),
      p(4, 2, 'lightblue', ['left', 'right']),
      e(4, 3, 'lightblue', ['left']),
      // Green: endpoint(5,4) -> pipe(5,5) -> pipe(5,6) -> pipe(6,6) -> endpoint(6,5)
      e(5, 4, 'green', ['right']),
      p(5, 5, 'green', ['left', 'right']),
      p(5, 6, 'green', ['left', 'down']),
      p(6, 6, 'green', ['up', 'left']),
      e(6, 5, 'green', ['right']),
    ],
    optimalSteps: 8,
    reward: 30,
  },

  // Level 12: 7x7, 5 colors - most complex
  {
    id: 12,
    gridSize: 7,
    cells: [
      // Blue: endpoint(0,0) -> pipe(0,1) -> pipe(1,1) -> pipe(1,2) -> pipe(1,3) -> endpoint(1,4)
      e(0, 0, 'blue', ['right']),
      p(0, 1, 'blue', ['left', 'down']),
      p(1, 1, 'blue', ['up', 'right']),
      p(1, 2, 'blue', ['left', 'right']),
      p(1, 3, 'blue', ['left', 'right']),
      e(1, 4, 'blue', ['left']),
      // Orange: endpoint(0,5) -> pipe(0,6) -> pipe(1,6) -> pipe(2,6) -> endpoint(3,6)
      e(0, 5, 'orange', ['right']),
      p(0, 6, 'orange', ['left', 'down']),
      p(1, 6, 'orange', ['up', 'down']),
      p(2, 6, 'orange', ['up', 'down']),
      e(3, 6, 'orange', ['up']),
      // White: endpoint(3,0) -> pipe(3,1) -> pipe(3,2) -> pipe(4,2) -> pipe(4,3) -> endpoint(4,4)
      e(3, 0, 'white', ['right']),
      p(3, 1, 'white', ['left', 'right']),
      p(3, 2, 'white', ['left', 'down']),
      p(4, 2, 'white', ['up', 'right']),
      p(4, 3, 'white', ['left', 'right']),
      e(4, 4, 'white', ['left']),
      // Lightblue: endpoint(5,0) -> pipe(5,1) -> pipe(6,1) -> pipe(6,2) -> endpoint(6,3)
      e(5, 0, 'lightblue', ['right']),
      p(5, 1, 'lightblue', ['left', 'down']),
      p(6, 1, 'lightblue', ['up', 'right']),
      p(6, 2, 'lightblue', ['left', 'right']),
      e(6, 3, 'lightblue', ['left']),
      // Green: endpoint(5,5) -> pipe(5,6) -> pipe(6,6) -> endpoint(6,5)
      e(5, 5, 'green', ['right']),
      p(5, 6, 'green', ['left', 'down']),
      p(6, 6, 'green', ['up', 'left']),
      e(6, 5, 'green', ['right']),
    ],
    optimalSteps: 10,
    reward: 30,
  },
];

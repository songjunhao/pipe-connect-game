export interface LevelSaveData {
  completed: boolean;
  stars: number;
  bestSteps: number;
}

export interface SaveData {
  currentLevel: number;
  coins: number;
  levels: Record<number, LevelSaveData>;
}

const SAVE_KEY = 'pipe-connect-save';

export class SaveManager {
  private data: SaveData;

  constructor() {
    this.data = this.load();
  }

  private getDefault(): SaveData {
    return {
      currentLevel: 1,
      coins: 0,
      levels: {},
    };
  }

  private load(): SaveData {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        return JSON.parse(raw) as SaveData;
      }
    } catch {
      // ignore parse errors
    }
    return this.getDefault();
  }

  private persist(): void {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
    } catch {
      // ignore storage errors
    }
  }

  getCurrentLevel(): number {
    return this.data.currentLevel;
  }

  setCurrentLevel(level: number): void {
    this.data.currentLevel = level;
    this.persist();
  }

  getCoins(): number {
    return this.data.coins;
  }

  addCoins(amount: number): void {
    this.data.coins += amount;
    this.persist();
  }

  spendCoins(amount: number): boolean {
    if (this.data.coins >= amount) {
      this.data.coins -= amount;
      this.persist();
      return true;
    }
    return false;
  }

  getLevelData(levelId: number): LevelSaveData {
    return this.data.levels[levelId] ?? { completed: false, stars: 0, bestSteps: 0 };
  }

  updateLevel(levelId: number, stars: number, steps: number): void {
    const existing = this.getLevelData(levelId);
    const betterStars = Math.max(existing.stars, stars);
    const betterSteps = existing.completed ? Math.min(existing.bestSteps, steps) : steps;

    this.data.levels[levelId] = {
      completed: true,
      stars: betterStars,
      bestSteps: betterSteps,
    };

    // Unlock next level
    if (levelId >= this.data.currentLevel) {
      this.data.currentLevel = levelId + 1;
    }

    this.persist();
  }

  isLevelUnlocked(levelId: number): boolean {
    return levelId <= this.data.currentLevel;
  }

  reset(): void {
    this.data = this.getDefault();
    this.persist();
  }
}

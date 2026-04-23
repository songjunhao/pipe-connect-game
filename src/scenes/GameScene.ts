import Phaser from 'phaser';
import { Grid, CellData } from '../logic/Grid';
import { ConnectionChecker } from '../logic/ConnectionChecker';
import { SaveManager } from '../save/SaveManager';
import { TopBar } from '../ui/TopBar';
import { BottomBar } from '../ui/BottomBar';
import { levels } from '../data/levels';
import {
  CELL_SIZE,
  GRID_PADDING,
  PIPE_WIDTH,
  ENDPOINT_RADIUS,
  COLORS,
  COLOR_MAP,
  GLOW_MAP,
  Direction,
  DIR_OFFSET,
  OPPOSITE,
  HINT_COST,
  GAME_WIDTH,
  GAME_HEIGHT,
} from '../utils/constants';
import { calculateStars, colorToHex, glowColor } from '../utils/helpers';

export class GameScene extends Phaser.Scene {
  private grid!: Grid;
  private levelId: number = 1;
  private currentSteps: number = 0;
  private optimalSteps: number = 0;
  private saveManager: SaveManager;
  private topBar!: TopBar;
  private bottomBar!: BottomBar;
  private gridGraphics!: Phaser.GameObjects.Graphics;
  private pipeGraphics!: Phaser.GameObjects.Graphics;
  private glowGraphics!: Phaser.GameObjects.Graphics;
  private hintGraphics!: Phaser.GameObjects.Graphics;
  private cellContainers: Phaser.GameObjects.Container[][] = [];
  private gridOffsetX: number = 0;
  private gridOffsetY: number = 0;
  private isComplete: boolean = false;
  private hintCell: { row: number; col: number } | null = null;
  private connectedColors: Set<string> = new Set();
  private particles: Phaser.GameObjects.Arc[] = [];

  constructor() {
    super({ key: 'GameScene' });
    this.saveManager = new SaveManager();
  }

  init(data?: { levelId?: number }): void {
    this.levelId = data?.levelId ?? 1;
    this.currentSteps = 0;
    this.isComplete = false;
    this.hintCell = null;
    this.connectedColors = new Set();
    this.particles = [];
  }

  create(): void {
    const { width, height } = this.scale;

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x0f0f23, 1);
    bg.fillRect(0, 0, width, height);

    // Load level data
    const levelData = levels.find(l => l.id === this.levelId);
    if (!levelData) {
      this.scene.start('LevelSelectScene');
      return;
    }

    this.optimalSteps = levelData.optimalSteps;
    this.grid = new Grid(levelData);

    // Calculate grid positioning (centered)
    const gridPixelW = this.grid.size * CELL_SIZE;
    const gridPixelH = this.grid.size * CELL_SIZE;
    this.gridOffsetX = (width - gridPixelW) / 2;
    this.gridOffsetY = 60 + (height - 60 - 50 - gridPixelH) / 2;

    // Top bar
    this.topBar = new TopBar(this, this.levelId, this.saveManager, () => {
      this.scene.start('LevelSelectScene');
    });

    // Bottom bar
    this.bottomBar = new BottomBar(
      this,
      this.saveManager,
      this.currentSteps,
      this.optimalSteps,
      () => this.resetLevel(),
      () => this.useHint()
    );

    // Draw grid background
    this.gridGraphics = this.add.graphics();
    this.drawGridBackground();

    // Draw pipes
    this.pipeGraphics = this.add.graphics();
    this.glowGraphics = this.add.graphics();
    this.hintGraphics = this.add.graphics();
    this.drawAllPipes();

    // Create interactive zones for each cell
    this.createInteractiveZones();

    // Check initial connections
    this.checkConnections();
  }

  private drawGridBackground(): void {
    this.gridGraphics.clear();

    for (let r = 0; r < this.grid.size; r++) {
      for (let c = 0; c < this.grid.size; c++) {
        const x = this.gridOffsetX + c * CELL_SIZE;
        const y = this.gridOffsetY + r * CELL_SIZE;
        const isDark = (r + c) % 2 === 0;
        this.gridGraphics.fillStyle(isDark ? COLORS.CELL_DARK : COLORS.CELL_LIGHT, 1);
        this.gridGraphics.fillRoundedRect(x + 1, y + 1, CELL_SIZE - 2, CELL_SIZE - 2, 3);
      }
    }

    // Grid border
    this.gridGraphics.lineStyle(2, 0x3a3a5c, 1);
    this.gridGraphics.strokeRoundedRect(
      this.gridOffsetX - 2,
      this.gridOffsetY - 2,
      this.grid.size * CELL_SIZE + 4,
      this.grid.size * CELL_SIZE + 4,
      4
    );
  }

  private drawAllPipes(): void {
    this.pipeGraphics.clear();
    this.glowGraphics.clear();

    for (let r = 0; r < this.grid.size; r++) {
      for (let c = 0; c < this.grid.size; c++) {
        const cell = this.grid.getCell(r, c);
        if (cell && cell.type !== 'empty') {
          this.drawPipeCell(cell);
        }
      }
    }
  }

  private drawPipeCell(cell: CellData): void {
    const cx = this.gridOffsetX + cell.col * CELL_SIZE + CELL_SIZE / 2;
    const cy = this.gridOffsetY + cell.row * CELL_SIZE + CELL_SIZE / 2;
    const isActive = cell.isActive ?? false;
    const color = isActive ? colorToHex(cell.color!) : COLORS.GRAY;
    const halfCell = CELL_SIZE / 2;
    const halfPipe = PIPE_WIDTH / 2;

    if (cell.type === 'endpoint') {
      this.drawEndpoint(cx, cy, color, isActive, cell.color!);
      // Also draw connections from endpoint
      if (cell.connections) {
        for (const dir of cell.connections) {
          this.drawPipeSegment(cx, cy, dir, color, isActive);
        }
      }
      return;
    }

    // Draw pipe segments
    if (cell.connections) {
      for (const dir of cell.connections) {
        this.drawPipeSegment(cx, cy, dir, color, isActive);
      }

      // Draw center junction
      this.pipeGraphics.fillStyle(color, 1);
      this.pipeGraphics.fillRoundedRect(cx - halfPipe, cy - halfPipe, PIPE_WIDTH, PIPE_WIDTH, 3);

      // Highlight on center
      if (isActive) {
        this.pipeGraphics.fillStyle(0xffffff, 0.15);
        this.pipeGraphics.fillRoundedRect(cx - halfPipe, cy - halfPipe, PIPE_WIDTH, halfPipe, 2);
      }
    }
  }

  private drawPipeSegment(cx: number, cy: number, dir: Direction, color: number, isActive: boolean): void {
    const halfCell = CELL_SIZE / 2;
    const halfPipe = PIPE_WIDTH / 2;

    let x: number, y: number, w: number, h: number;

    switch (dir) {
      case 'up':
        x = cx - halfPipe;
        y = cy - halfCell;
        w = PIPE_WIDTH;
        h = halfCell + halfPipe;
        break;
      case 'down':
        x = cx - halfPipe;
        y = cy - halfPipe;
        w = PIPE_WIDTH;
        h = halfCell + halfPipe;
        break;
      case 'left':
        x = cx - halfCell;
        y = cy - halfPipe;
        w = halfCell + halfPipe;
        h = PIPE_WIDTH;
        break;
      case 'right':
        x = cx - halfPipe;
        y = cy - halfPipe;
        w = halfCell + halfPipe;
        h = PIPE_WIDTH;
        break;
    }

    // Main pipe body
    this.pipeGraphics.fillStyle(color, 1);
    this.pipeGraphics.fillRoundedRect(x, y, w, h, 2);

    // Highlight (top/left edge)
    if (isActive) {
      this.pipeGraphics.fillStyle(0xffffff, 0.15);
      if (dir === 'up' || dir === 'down') {
        this.pipeGraphics.fillRect(x, y, w, 3);
      } else {
        this.pipeGraphics.fillRect(x, y, 3, h);
      }
    }

    // Shadow (bottom/right edge)
    this.pipeGraphics.fillStyle(0x000000, 0.2);
    if (dir === 'up' || dir === 'down') {
      this.pipeGraphics.fillRect(x, y + h - 2, w, 2);
    } else {
      this.pipeGraphics.fillRect(x + w - 2, y, 2, h);
    }
  }

  private drawEndpoint(cx: number, cy: number, color: number, isActive: boolean, colorName: string): void {
    // Outer glow
    if (isActive) {
      this.glowGraphics.fillStyle(glowColor(colorName), 0.3);
      this.glowGraphics.fillCircle(cx, cy, ENDPOINT_RADIUS + 6);
    }

    // Main circle
    this.pipeGraphics.fillStyle(color, 1);
    this.pipeGraphics.fillCircle(cx, cy, ENDPOINT_RADIUS);

    // Inner highlight
    this.pipeGraphics.fillStyle(0xffffff, isActive ? 0.25 : 0.08);
    this.pipeGraphics.fillCircle(cx - 3, cy - 3, ENDPOINT_RADIUS * 0.5);

    // Border
    this.pipeGraphics.lineStyle(2, isActive ? glowColor(colorName) : 0x444455, isActive ? 0.8 : 0.5);
    this.pipeGraphics.strokeCircle(cx, cy, ENDPOINT_RADIUS);
  }

  private createInteractiveZones(): void {
    this.cellContainers = [];

    for (let r = 0; r < this.grid.size; r++) {
      this.cellContainers[r] = [];
      for (let c = 0; c < this.grid.size; c++) {
        const cell = this.grid.getCell(r, c);
        if (!cell || cell.type === 'empty' || cell.isFixed) continue;

        const cx = this.gridOffsetX + c * CELL_SIZE + CELL_SIZE / 2;
        const cy = this.gridOffsetY + r * CELL_SIZE + CELL_SIZE / 2;

        const zone = this.add.zone(cx, cy, CELL_SIZE, CELL_SIZE);
        zone.setInteractive();

        const row = r;
        const col = c;

        zone.on('pointerdown', () => {
          this.onCellClick(row, col);
        });

        // Touch support - also handle pointermove for swipe
        zone.on('pointerover', () => {
          if (this.input.activePointer.isDown) {
            this.onCellClick(row, col);
          }
        });

        this.cellContainers[r][c] = this.add.container(cx, cy);
        this.cellContainers[r][c].add(zone);
      }
    }
  }

  private onCellClick(row: number, col: number): void {
    if (this.isComplete) return;

    const cell = this.grid.getCell(row, col);
    if (!cell || cell.type === 'empty' || cell.isFixed) return;

    // Toggle active state
    const wasActive = cell.isActive;
    this.grid.toggleActive(row, col);

    // Only count step when activating (gray -> colored)
    if (!wasActive) {
      this.currentSteps++;
    }

    // Clear hint
    this.hintCell = null;
    this.hintGraphics.clear();

    // Redraw
    this.drawAllPipes();

    // Animate the toggle
    this.animateToggle(row, col, !wasActive);

    // Update UI
    this.bottomBar.updateSteps(this.currentSteps, this.optimalSteps);

    // Check connections
    this.checkConnections();
  }

  private animateToggle(row: number, col: number, activated: boolean): void {
    const cx = this.gridOffsetX + col * CELL_SIZE + CELL_SIZE / 2;
    const cy = this.gridOffsetY + row * CELL_SIZE + CELL_SIZE / 2;

    // Create a brief flash effect
    const flash = this.add.graphics();
    const color = activated ? 0xffffff : 0x333344;
    flash.fillStyle(color, 0.3);
    flash.fillCircle(cx, cy, CELL_SIZE / 2);

    this.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        flash.destroy();
      },
    });
  }

  private checkConnections(): void {
    const colors = this.grid.getColors();
    const newlyConnected = new Set<string>();

    for (const color of colors) {
      if (ConnectionChecker.checkColor(this.grid.cells, this.grid.size, color)) {
        newlyConnected.add(color);
        if (!this.connectedColors.has(color)) {
          // New connection - animate glow
          this.animateConnectionGlow(color);
        }
      }
    }

    this.connectedColors = newlyConnected;

    // Check if all colors connected
    if (ConnectionChecker.checkAll(this.grid.cells, this.grid.size, colors)) {
      this.onLevelComplete();
    }
  }

  private animateConnectionGlow(color: string): void {
    // Find all cells of this color and create a glow pulse
    for (let r = 0; r < this.grid.size; r++) {
      for (let c = 0; c < this.grid.size; c++) {
        const cell = this.grid.getCell(r, c);
        if (cell && cell.color === color && cell.isActive) {
          const cx = this.gridOffsetX + c * CELL_SIZE + CELL_SIZE / 2;
          const cy = this.gridOffsetY + r * CELL_SIZE + CELL_SIZE / 2;

          const glow = this.add.graphics();
          glow.fillStyle(glowColor(color), 0.4);
          glow.fillCircle(cx, cy, CELL_SIZE / 2);

          this.tweens.add({
            targets: glow,
            alpha: 0,
            duration: 800,
            yoyo: true,
            repeat: 2,
            onComplete: () => {
              glow.destroy();
            },
          });
        }
      }
    }
  }

  private onLevelComplete(): void {
    if (this.isComplete) return;
    this.isComplete = true;

    const stars = calculateStars(this.currentSteps, this.optimalSteps);

    // Save progress
    this.saveManager.updateLevel(this.levelId, stars, this.currentSteps);
    this.saveManager.addCoins(this.optimalSteps > 0 ? 30 : 0);

    // Celebration particles
    this.spawnCelebrationParticles();

    // Show level complete popup after a short delay
    this.time.delayedCall(1000, () => {
      this.scene.launch('LevelCompletePopup', {
        levelId: this.levelId,
        stars,
        steps: this.currentSteps,
        optimalSteps: this.optimalSteps,
        reward: 30,
      });
    });
  }

  private spawnCelebrationParticles(): void {
    const { width, height } = this.scale;
    const colors = [0x4a9eff, 0xff8c42, 0x5cb85c, 0xff69b4, 0xffcc00, 0x7ec8e3];

    for (let i = 0; i < 30; i++) {
      const particle = this.add.circle(
        Math.random() * width,
        height + 20,
        3 + Math.random() * 5,
        colors[Math.floor(Math.random() * colors.length)]
      );

      this.tweens.add({
        targets: particle,
        y: -20,
        x: particle.x + (Math.random() - 0.5) * 200,
        alpha: 0,
        duration: 1500 + Math.random() * 1500,
        delay: i * 50,
        ease: 'Sine.easeOut',
        onComplete: () => {
          particle.destroy();
        },
      });
    }
  }

  private resetLevel(): void {
    this.grid.reset();
    this.currentSteps = 0;
    this.isComplete = false;
    this.hintCell = null;
    this.connectedColors = new Set();

    this.hintGraphics.clear();
    this.drawAllPipes();
    this.bottomBar.updateSteps(this.currentSteps, this.optimalSteps);
    this.checkConnections();
  }

  private useHint(): void {
    if (this.isComplete) return;

    if (!this.saveManager.spendCoins(HINT_COST)) {
      // Not enough coins - show brief message
      const msg = this.add.text(this.scale.width / 2, this.scale.height / 2, 'Not enough coins!', {
        fontSize: '20px',
        fontFamily: 'Arial, sans-serif',
        color: '#ff4444',
        fontStyle: 'bold',
      });
      msg.setOrigin(0.5, 0.5);
      this.tweens.add({
        targets: msg,
        alpha: 0,
        y: msg.y - 30,
        duration: 1500,
        onComplete: () => msg.destroy(),
      });
      return;
    }

    this.topBar.updateCoins();

    const colors = this.grid.getColors();
    const hint = ConnectionChecker.findHint(this.grid.cells, this.grid.size, colors);
    if (hint) {
      this.hintCell = hint;
      this.drawHint();
    }
  }

  private drawHint(): void {
    this.hintGraphics.clear();
    if (!this.hintCell) return;

    const cx = this.gridOffsetX + this.hintCell.col * CELL_SIZE + CELL_SIZE / 2;
    const cy = this.gridOffsetY + this.hintCell.row * CELL_SIZE + CELL_SIZE / 2;

    this.hintGraphics.lineStyle(3, 0xffff00, 0.8);
    this.hintGraphics.strokeRoundedRect(
      cx - CELL_SIZE / 2 + 2,
      cy - CELL_SIZE / 2 + 2,
      CELL_SIZE - 4,
      CELL_SIZE - 4,
      4
    );

    // Pulsing animation
    this.tweens.add({
      targets: this.hintGraphics,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        this.hintGraphics.clear();
        this.hintCell = null;
      },
    });
  }
}

import Phaser from 'phaser';
import { Button } from '../ui/Button';
import { SaveManager } from '../save/SaveManager';
import { levels } from '../data/levels';

export class LevelSelectScene extends Phaser.Scene {
  private saveManager: SaveManager;
  private scrollContainer!: Phaser.GameObjects.Container;
  private contentHeight: number = 0;

  constructor() {
    super({ key: 'LevelSelectScene' });
    this.saveManager = new SaveManager();
  }

  create(): void {
    const { width, height } = this.scale;

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x0f0f23, 1);
    bg.fillRect(0, 0, width, height);

    // Header
    const header = this.add.graphics();
    header.fillStyle(0x0a0a1a, 0.9);
    header.fillRect(0, 0, width, 60);
    header.lineStyle(1, 0x3a3a5c, 1);
    header.lineBetween(0, 60, width, 60);

    // Back button
    const backBtn = new Button({
      scene: this,
      x: 40,
      y: 30,
      width: 50,
      height: 34,
      text: '<',
      fontSize: 18,
      fillColor: 0x2a2a4c,
      strokeColor: 0x4a4a7c,
      onClick: () => {
        this.scene.start('MenuScene');
      },
    });

    // Title
    const title = this.add.text(width / 2, 30, 'Select Level', {
      fontSize: '22px',
      fontFamily: 'Arial, sans-serif',
      color: '#e8e8e8',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5, 0.5);

    // Coins display
    const coinIcon = this.add.text(width - 80, 30, '$', {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffcc00',
      fontStyle: 'bold',
    });
    coinIcon.setOrigin(0.5, 0.5);

    const coinsText = this.add.text(width - 40, 30, `${this.saveManager.getCoins()}`, {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffcc00',
      fontStyle: 'bold',
    });
    coinsText.setOrigin(0.5, 0.5);

    // Scrollable level grid
    this.scrollContainer = this.add.container(0, 70);

    const cols = 3;
    const btnW = 120;
    const btnH = 100;
    const gapX = 20;
    const gapY = 20;
    const totalLevels = levels.length;

    const rows = Math.ceil(totalLevels / cols);
    this.contentHeight = rows * (btnH + gapY) + gapY;

    for (let i = 0; i < totalLevels; i++) {
      const levelId = i + 1;
      const row = Math.floor(i / cols);
      const col = i % cols;

      const x = (width - cols * btnW - (cols - 1) * gapX) / 2 + col * (btnW + gapX) + btnW / 2;
      const y = row * (btnH + gapY) + gapY + btnH / 2;

      const levelSave = this.saveManager.getLevelData(levelId);
      const isUnlocked = this.saveManager.isLevelUnlocked(levelId);

      const levelBtn = this.createLevelButton(x, y, btnW, btnH, levelId, levelSave.stars, isUnlocked);
      this.scrollContainer.add(levelBtn);
    }

    // Enable scrolling
    this.setupScroll(width, height);
  }

  private createLevelButton(
    x: number,
    y: number,
    w: number,
    h: number,
    levelId: number,
    stars: number,
    isUnlocked: boolean
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const bg = this.add.graphics();
    if (isUnlocked) {
      bg.fillStyle(0x2a2a4c, 1);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
      bg.lineStyle(2, 0x4a4a7c, 1);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);
    } else {
      bg.fillStyle(0x1a1a2e, 1);
      bg.fillRoundedRect(-w / 2, -h / 2, w, h, 10);
      bg.lineStyle(2, 0x2a2a3c, 1);
      bg.strokeRoundedRect(-w / 2, -h / 2, w, h, 10);
    }
    container.add(bg);

    if (isUnlocked) {
      // Level number
      const numText = this.add.text(0, -15, `${levelId}`, {
        fontSize: '28px',
        fontFamily: 'Arial, sans-serif',
        color: '#e8e8e8',
        fontStyle: 'bold',
      });
      numText.setOrigin(0.5, 0.5);
      container.add(numText);

      // Stars
      const starGraphics = this.add.graphics();
      for (let s = 0; s < 3; s++) {
        this.drawSmallStar(starGraphics, (s - 1) * 22, 20, s < stars ? 0xffcc00 : 0x333344);
      }
      container.add(starGraphics);

      // Make interactive
      container.setSize(w, h);
      container.setInteractive(
        new Phaser.Geom.Rectangle(-w / 2, -h / 2, w, h),
        Phaser.Geom.Rectangle.Contains
      );

      container.on('pointerdown', () => {
        container.setScale(0.95);
      });
      container.on('pointerup', () => {
        container.setScale(1);
        this.scene.start('GameScene', { levelId });
      });
      container.on('pointerout', () => {
        container.setScale(1);
      });
    } else {
      // Lock icon
      const lockText = this.add.text(0, -5, '?', {
        fontSize: '32px',
        fontFamily: 'Arial, sans-serif',
        color: '#333344',
        fontStyle: 'bold',
      });
      lockText.setOrigin(0.5, 0.5);
      container.add(lockText);

      const lockLabel = this.add.text(0, 25, 'Locked', {
        fontSize: '12px',
        fontFamily: 'Arial, sans-serif',
        color: '#333344',
      });
      lockLabel.setOrigin(0.5, 0.5);
      container.add(lockLabel);
    }

    return container;
  }

  private drawSmallStar(graphics: Phaser.GameObjects.Graphics, x: number, y: number, color: number): void {
    graphics.fillStyle(color, 1);
    const points = 5;
    const outerR = 8;
    const innerR = 3;

    graphics.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const angle = (Math.PI / 2 * 3) + (i * Math.PI / points);
      const px = x + Math.cos(angle) * r;
      const py = y + Math.sin(angle) * r;
      if (i === 0) {
        graphics.moveTo(px, py);
      } else {
        graphics.lineTo(px, py);
      }
    }
    graphics.closePath();
    graphics.fillPath();
  }

  private setupScroll(width: number, height: number): void {
    // Use scene-level input for scrolling instead of a zone overlay
    // This avoids blocking pointer events on interactive level buttons
    let startY = 0;
    let startScrollY = 0;
    const minY = Math.min(0, height - 70 - this.contentHeight);

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Only start scroll if pointer is in the scrollable area (below header)
      if (pointer.y > 70) {
        startY = pointer.y;
        startScrollY = this.scrollContainer.y;
      }
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (!pointer.isDown || pointer.y <= 70) return;
      const diff = pointer.y - startY;
      let newY = startScrollY + diff;
      newY = Phaser.Math.Clamp(newY, minY, 0);
      this.scrollContainer.y = newY;
    });
  }
}

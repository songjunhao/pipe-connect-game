import Phaser from 'phaser';
import { Button } from '../ui/Button';
import { SaveManager } from '../save/SaveManager';

export class MenuScene extends Phaser.Scene {
  private saveManager: SaveManager;

  constructor() {
    super({ key: 'MenuScene' });
    this.saveManager = new SaveManager();
  }

  create(): void {
    const { width, height } = this.scale;

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x0f0f23, 1);
    bg.fillRect(0, 0, width, height);

    // Background decoration - flowing pipe lines
    this.createBackgroundDecoration(width, height);

    // Title
    const title = this.add.text(width / 2, height * 0.25, 'Pipe Connect', {
      fontSize: '48px',
      fontFamily: 'Arial, sans-serif',
      color: '#4a9eff',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5, 0.5);

    // Chinese subtitle
    const subtitle = this.add.text(width / 2, height * 0.25 + 50, '管道连通', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#7ec8e3',
    });
    subtitle.setOrigin(0.5, 0.5);

    // Start Game button
    const startBtn = new Button({
      scene: this,
      x: width / 2,
      y: height * 0.5,
      width: 220,
      height: 56,
      text: 'Start Game',
      fontSize: 24,
      fillColor: 0x2a5a2a,
      strokeColor: 0x4a8a4a,
      onClick: () => {
        this.scene.start('LevelSelectScene');
      },
    });

    // Continue Game button
    const currentLevel = this.saveManager.getCurrentLevel();
    const continueBtn = new Button({
      scene: this,
      x: width / 2,
      y: height * 0.5 + 80,
      width: 220,
      height: 56,
      text: 'Continue',
      fontSize: 24,
      fillColor: 0x2a2a5a,
      strokeColor: 0x4a4a8a,
      onClick: () => {
        const level = Math.min(currentLevel, 12);
        this.scene.start('GameScene', { levelId: level });
      },
    });

    if (currentLevel <= 1) {
      continueBtn.setEnabled(false);
    }

    // Version text
    const version = this.add.text(width / 2, height - 30, 'v1.0.0', {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      color: '#444455',
    });
    version.setOrigin(0.5, 0.5);

    // Title animation
    this.tweens.add({
      targets: title,
      y: height * 0.25 - 5,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private createBackgroundDecoration(width: number, height: number): void {
    const colors = [0x4a9eff, 0xff8c42, 0x5cb85c, 0xff69b4, 0x7ec8e3];

    for (let i = 0; i < 8; i++) {
      const g = this.add.graphics();
      const color = colors[i % colors.length];
      g.fillStyle(color, 0.08);

      const x = Math.random() * width;
      const y = Math.random() * height;
      const isHorizontal = Math.random() > 0.5;

      if (isHorizontal) {
        g.fillRoundedRect(x - 60, y - 5, 120, 10, 4);
      } else {
        g.fillRoundedRect(x - 5, y - 60, 10, 120, 4);
      }

      // Slow drift animation
      this.tweens.add({
        targets: g,
        alpha: 0.5,
        duration: 3000 + Math.random() * 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        delay: i * 400,
      });
    }
  }
}

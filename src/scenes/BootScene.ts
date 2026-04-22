import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    const { width, height } = this.scale;

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x0f0f23, 1);
    bg.fillRect(0, 0, width, height);

    // Game title
    const title = this.add.text(width / 2, height / 2 - 80, 'Pipe Connect', {
      fontSize: '42px',
      fontFamily: 'Arial, sans-serif',
      color: '#4a9eff',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5, 0.5);

    // Subtitle
    const subtitle = this.add.text(width / 2, height / 2 - 30, '管道连通', {
      fontSize: '28px',
      fontFamily: 'Arial, sans-serif',
      color: '#7ec8e3',
    });
    subtitle.setOrigin(0.5, 0.5);

    // Loading text
    const loadingText = this.add.text(width / 2, height / 2 + 40, 'Loading...', {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#888899',
    });
    loadingText.setOrigin(0.5, 0.5);

    // Decorative pipes
    this.drawDecorativePipe(width / 2 - 120, height / 2 + 100, 'horizontal', 0x4a9eff);
    this.drawDecorativePipe(width / 2 - 40, height / 2 + 100, 'horizontal', 0xff8c42);
    this.drawDecorativePipe(width / 2 + 40, height / 2 + 100, 'horizontal', 0x5cb85c);
    this.drawDecorativePipe(width / 2 + 120, height / 2 + 100, 'horizontal', 0xff69b4);

    // Pulsing animation on title
    this.tweens.add({
      targets: title,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Auto transition to menu after a short delay
    this.time.delayedCall(1500, () => {
      this.scene.start('MenuScene');
    });
  }

  private drawDecorativePipe(x: number, y: number, direction: string, color: number): void {
    const g = this.add.graphics();
    g.fillStyle(color, 0.6);

    if (direction === 'horizontal') {
      g.fillRoundedRect(x - 30, y - 6, 60, 12, 4);
    } else {
      g.fillRoundedRect(x - 6, y - 30, 12, 60, 4);
    }

    // Highlight
    g.fillStyle(0xffffff, 0.15);
    if (direction === 'horizontal') {
      g.fillRoundedRect(x - 28, y - 5, 56, 4, 2);
    } else {
      g.fillRoundedRect(x - 5, y - 28, 4, 56, 2);
    }
  }
}

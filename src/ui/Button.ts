import Phaser from 'phaser';

export interface ButtonConfig {
  scene: Phaser.Scene;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  fontSize?: number;
  fillColor?: number;
  strokeColor?: number;
  textColor?: string;
  onClick: () => void;
}

export class Button extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Graphics;
  private label: Phaser.GameObjects.Text;
  private config: ButtonConfig;

  constructor(config: ButtonConfig) {
    super(config.scene, config.x, config.y);

    this.config = config;
    const fillColor = config.fillColor ?? 0x3a3a5c;
    const strokeColor = config.strokeColor ?? 0x5a5a8c;
    const textColor = config.textColor ?? '#ffffff';
    const fontSize = config.fontSize ?? 20;

    this.bg = config.scene.add.graphics();
    this.drawBg(fillColor, strokeColor);

    this.label = config.scene.add.text(0, 0, config.text, {
      fontSize: `${fontSize}px`,
      fontFamily: 'Arial, sans-serif',
      color: textColor,
      fontStyle: 'bold',
    });
    this.label.setOrigin(0.5, 0.5);

    this.add([this.bg, this.label]);

    this.setSize(config.width, config.height);
    this.setInteractive(
      new Phaser.Geom.Rectangle(0, 0, config.width, config.height),
      Phaser.Geom.Rectangle.Contains
    );

    this.on('pointerdown', () => {
      this.setScale(0.95);
    });

    this.on('pointerup', () => {
      this.setScale(1);
      config.onClick();
    });

    this.on('pointerout', () => {
      this.setScale(1);
    });

    config.scene.add.existing(this);
  }

  private drawBg(fillColor: number, strokeColor: number): void {
    const w = this.config.width;
    const h = this.config.height;
    const r = 10;

    this.bg.clear();
    this.bg.fillStyle(fillColor, 1);
    this.bg.fillRoundedRect(-w / 2, -h / 2, w, h, r);
    this.bg.lineStyle(2, strokeColor, 1);
    this.bg.strokeRoundedRect(-w / 2, -h / 2, w, h, r);
  }

  setText(text: string): void {
    this.label.setText(text);
  }

  setEnabled(enabled: boolean): void {
    this.setAlpha(enabled ? 1 : 0.5);
    if (enabled) {
      this.setInteractive();
    } else {
      this.removeInteractive();
    }
  }
}

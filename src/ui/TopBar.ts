import Phaser from 'phaser';
import { Button } from './Button';
import { SaveManager } from '../save/SaveManager';

export class TopBar {
  public container: Phaser.GameObjects.Container;
  private coinsText: Phaser.GameObjects.Text;
  private levelText: Phaser.GameObjects.Text;
  private backButton: Button;
  private saveManager: SaveManager;

  constructor(scene: Phaser.Scene, levelId: number, saveManager: SaveManager, onBack: () => void) {
    this.saveManager = saveManager;
    this.container = scene.add.container(0, 0);

    // Background bar
    const bg = scene.add.graphics();
    bg.fillStyle(0x0a0a1a, 0.9);
    bg.fillRect(0, 0, 480, 50);
    bg.lineStyle(1, 0x3a3a5c, 1);
    bg.lineBetween(0, 50, 480, 50);
    this.container.add(bg);

    // Back button
    this.backButton = new Button({
      scene,
      x: 40,
      y: 25,
      width: 50,
      height: 34,
      text: '<',
      fontSize: 18,
      fillColor: 0x2a2a4c,
      strokeColor: 0x4a4a7c,
      onClick: onBack,
    });
    this.container.add(this.backButton);

    // Level text
    this.levelText = scene.add.text(240, 25, `Level ${levelId}`, {
      fontSize: '20px',
      fontFamily: 'Arial, sans-serif',
      color: '#e8e8e8',
      fontStyle: 'bold',
    });
    this.levelText.setOrigin(0.5, 0.5);
    this.container.add(this.levelText);

    // Coins
    const coinIcon = scene.add.text(410, 25, '$', {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffcc00',
      fontStyle: 'bold',
    });
    coinIcon.setOrigin(0.5, 0.5);
    this.container.add(coinIcon);

    this.coinsText = scene.add.text(450, 25, `${saveManager.getCoins()}`, {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffcc00',
      fontStyle: 'bold',
    });
    this.coinsText.setOrigin(0.5, 0.5);
    this.container.add(this.coinsText);
  }

  updateCoins(): void {
    this.coinsText.setText(`${this.saveManager.getCoins()}`);
  }
}

import Phaser from 'phaser';
import { Button } from '../ui/Button';
import { StarDisplay } from '../ui/StarDisplay';
import { SaveManager } from '../save/SaveManager';
import { levels } from '../data/levels';

export class LevelCompletePopup extends Phaser.Scene {
  private levelId: number = 1;
  private stars: number = 1;
  private steps: number = 0;
  private optimalSteps: number = 0;
  private reward: number = 30;
  private saveManager: SaveManager;

  constructor() {
    super({ key: 'LevelCompletePopup' });
    this.saveManager = new SaveManager();
  }

  init(data: { levelId: number; stars: number; steps: number; optimalSteps: number; reward: number }): void {
    this.levelId = data.levelId;
    this.stars = data.stars;
    this.steps = data.steps;
    this.optimalSteps = data.optimalSteps;
    this.reward = data.reward;
  }

  create(): void {
    const { width, height } = this.scale;

    // Semi-transparent overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.7);
    overlay.fillRect(0, 0, width, height);

    // Popup panel
    const panelW = 340;
    const panelH = 380;
    const panelX = (width - panelW) / 2;
    const panelY = (height - panelH) / 2;

    const panel = this.add.graphics();
    panel.fillStyle(0x1a1a3e, 1);
    panel.fillRoundedRect(panelX, panelY, panelW, panelH, 16);
    panel.lineStyle(2, 0x4a4a8c, 1);
    panel.strokeRoundedRect(panelX, panelY, panelW, panelH, 16);

    // Title
    const title = this.add.text(width / 2, panelY + 40, 'Level Complete!', {
      fontSize: '28px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffcc00',
      fontStyle: 'bold',
    });
    title.setOrigin(0.5, 0.5);

    // Level number
    const levelText = this.add.text(width / 2, panelY + 75, `Level ${this.levelId}`, {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#aaaacc',
    });
    levelText.setOrigin(0.5, 0.5);

    // Stars display
    const starDisplay = new StarDisplay(this, width / 2, panelY + 130, 0, 3);
    starDisplay.animateStars(this.stars);

    // Steps info
    const stepsText = this.add.text(
      width / 2,
      panelY + 185,
      `Steps: ${this.steps} / ${this.optimalSteps}`,
      {
        fontSize: '18px',
        fontFamily: 'Arial, sans-serif',
        color: '#e8e8e8',
      }
    );
    stepsText.setOrigin(0.5, 0.5);

    // Reward
    const rewardText = this.add.text(width / 2, panelY + 220, `+$${this.reward}`, {
      fontSize: '22px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffcc00',
      fontStyle: 'bold',
    });
    rewardText.setOrigin(0.5, 0.5);

    // Animate reward text
    this.tweens.add({
      targets: rewardText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 300,
      yoyo: true,
      delay: 800,
    });

    // Next Level button
    const hasNextLevel = this.levelId < levels.length;
    const nextBtn = new Button({
      scene: this,
      x: width / 2,
      y: panelY + 280,
      width: 180,
      height: 48,
      text: hasNextLevel ? 'Next Level' : 'Back to Menu',
      fontSize: 18,
      fillColor: 0x2a5a2a,
      strokeColor: 0x4a8a4a,
      onClick: () => {
        this.stopPopup();
        if (hasNextLevel) {
          this.scene.stop('GameScene');
          this.scene.start('GameScene', { levelId: this.levelId + 1 });
        } else {
          this.scene.stop('GameScene');
          this.scene.start('LevelSelectScene');
        }
      },
    });

    // Replay button
    const replayBtn = new Button({
      scene: this,
      x: width / 2,
      y: panelY + 340,
      width: 180,
      height: 48,
      text: 'Replay',
      fontSize: 18,
      fillColor: 0x2a2a5a,
      strokeColor: 0x4a4a8a,
      onClick: () => {
        this.stopPopup();
        this.scene.stop('GameScene');
        this.scene.start('GameScene', { levelId: this.levelId });
      },
    });

    // Celebration particles
    this.spawnCelebration(width, height);
  }

  private stopPopup(): void {
    this.scene.stop('LevelCompletePopup');
  }

  private spawnCelebration(width: number, height: number): void {
    const colors = [0x4a9eff, 0xff8c42, 0x5cb85c, 0xff69b4, 0xffcc00, 0x7ec8e3];

    for (let i = 0; i < 20; i++) {
      const particle = this.add.circle(
        width / 2 + (Math.random() - 0.5) * 200,
        height / 2 + 50,
        2 + Math.random() * 4,
        colors[Math.floor(Math.random() * colors.length)]
      );

      this.tweens.add({
        targets: particle,
        y: particle.y - 100 - Math.random() * 200,
        x: particle.x + (Math.random() - 0.5) * 150,
        alpha: 0,
        duration: 1200 + Math.random() * 800,
        delay: i * 80,
        ease: 'Sine.easeOut',
        onComplete: () => {
          particle.destroy();
        },
      });
    }
  }
}

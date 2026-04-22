import Phaser from 'phaser';
import { Button } from './Button';
import { HINT_COST } from '../utils/constants';
import { SaveManager } from '../save/SaveManager';

export class BottomBar {
  public container: Phaser.GameObjects.Container;
  private stepsText: Phaser.GameObjects.Text;
  private hintButton: Button;

  constructor(
    scene: Phaser.Scene,
    saveManager: SaveManager,
    currentSteps: number,
    optimalSteps: number,
    onReset: () => void,
    onHint: () => void
  ) {
    this.container = scene.add.container(0, 804);

    // Background bar
    const bg = scene.add.graphics();
    bg.fillStyle(0x0a0a1a, 0.9);
    bg.fillRect(0, 0, 480, 50);
    bg.lineStyle(1, 0x3a3a5c, 1);
    bg.lineBetween(0, 0, 480, 0);
    this.container.add(bg);

    // Steps display
    this.stepsText = scene.add.text(120, 25, `Steps: ${currentSteps} / ${optimalSteps}`, {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#aaaacc',
    });
    this.stepsText.setOrigin(0.5, 0.5);
    this.container.add(this.stepsText);

    // Reset button
    const resetBtn = new Button({
      scene,
      x: 260,
      y: 25,
      width: 70,
      height: 34,
      text: 'Reset',
      fontSize: 14,
      fillColor: 0x2a2a4c,
      strokeColor: 0x4a4a7c,
      onClick: onReset,
    });
    this.container.add(resetBtn);

    // Hint button
    this.hintButton = new Button({
      scene,
      x: 380,
      y: 25,
      width: 90,
      height: 34,
      text: `Hint($${HINT_COST})`,
      fontSize: 12,
      fillColor: 0x2a4a2a,
      strokeColor: 0x4a7a4a,
      onClick: onHint,
    });
    this.container.add(this.hintButton);
  }

  updateSteps(current: number, optimal: number): void {
    this.stepsText.setText(`Steps: ${current} / ${optimal}`);
  }
}

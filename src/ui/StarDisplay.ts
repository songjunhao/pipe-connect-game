import Phaser from 'phaser';

export class StarDisplay {
  public container: Phaser.GameObjects.Container;
  private stars: Phaser.GameObjects.Graphics[] = [];

  constructor(scene: Phaser.Scene, x: number, y: number, count: number, maxStars: number = 3) {
    this.container = scene.add.container(x, y);

    for (let i = 0; i < maxStars; i++) {
      const star = scene.add.graphics();
      const sx = (i - (maxStars - 1) / 2) * 50;
      this.drawStar(star, sx, 0, i < count ? 0xffcc00 : 0x333344);
      this.container.add(star);
      this.stars.push(star);
    }
  }

  private drawStar(graphics: Phaser.GameObjects.Graphics, x: number, y: number, color: number): void {
    graphics.fillStyle(color, 1);
    const points = 5;
    const outerR = 18;
    const innerR = 8;

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

  animateStars(earnedCount: number, onComplete?: () => void): void {
    this.stars.forEach((star, i) => {
      if (i < earnedCount) {
        star.setAlpha(0);
        star.setScale(0);

        this.stars[i].scene.tweens.add({
          targets: star,
          alpha: 1,
          scaleX: 1,
          scaleY: 1,
          duration: 400,
          delay: i * 300,
          ease: 'Back.easeOut',
          onComplete: i === earnedCount - 1 ? onComplete : undefined,
        });
      }
    });
  }
}

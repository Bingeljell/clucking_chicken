import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  private finalScore = 0;

  constructor() {
    super('GameOverScene');
  }

  init(data: { score: number }) {
    this.finalScore = data.score || 0;
  }

  create() {
    this.add.text(400, 200, 'Game Over', { fontSize: '48px', color: '#8E2800' }).setOrigin(0.5);
    this.add.text(400, 300, `Final Score: ${this.finalScore}`, { fontSize: '32px', color: '#E27D60' }).setOrigin(0.5);
    this.add.text(400, 450, 'Click to Restart', { fontSize: '24px', color: '#8E2800' }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      this.scene.start('GameScene');
    });
  }
}

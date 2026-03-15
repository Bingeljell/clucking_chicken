import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create() {
    this.add.text(400, 300, 'Game Over', { fontSize: '48px', color: '#8E2800' }).setOrigin(0.5);
    this.add.text(400, 400, 'Click to Restart', { fontSize: '24px', color: '#E27D60' }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      this.scene.start('GameScene');
    });
  }
}

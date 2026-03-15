import Phaser from 'phaser';

export class StartScene extends Phaser.Scene {
  constructor() {
    super('StartScene');
  }

  create() {
    this.add.text(400, 300, 'Clucking Chicken', { fontSize: '48px', color: '#E27D60' }).setOrigin(0.5);
    this.add.text(400, 400, 'Click to Start', { fontSize: '24px', color: '#8E2800' }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      this.scene.start('GameScene');
    });
  }
}

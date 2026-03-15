import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    this.add.text(16, 16, 'Game Started', { fontSize: '24px', color: '#8E2800' });
    
    // Placeholder for Chicken
    const player = this.add.rectangle(100, 300, 40, 40, 0xE27D60);
    this.physics.add.existing(player);
    (player.body as Phaser.Physics.Arcade.Body).setCollideWorldBounds(true);
    (player.body as Phaser.Physics.Arcade.Body).setGravityY(800);

    // Placeholder floor
    const floor = this.add.rectangle(400, 580, 800, 40, 0xFDF6E3);
    this.physics.add.existing(floor, true);
    this.physics.add.collider(player, floor);

    this.input.on('pointerdown', () => {
      // Mock jump
      (player.body as Phaser.Physics.Arcade.Body).setVelocityY(-400);
    });
  }
}

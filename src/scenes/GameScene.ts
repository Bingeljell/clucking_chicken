import Phaser from 'phaser';
import { audioController } from '../AudioInputController';

export class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private volumeText!: Phaser.GameObjects.Text;
  
  // Audio Thresholds
  private readonly WALK_THRESHOLD = 0.05;
  private readonly JUMP_THRESHOLD = 0.15;
  private readonly HORIZONTAL_SPEED = 150;
  private readonly JUMP_FORCE = -400;

  constructor() {
    super('GameScene');
  }

  create() {
    this.add.text(16, 16, 'Game Started', { fontSize: '24px', color: '#8E2800' });
    this.volumeText = this.add.text(16, 50, 'Volume: 0', { fontSize: '18px', color: '#8E2800' });
    
    // Placeholder for Chicken (Sunset Glow: Terracotta #E27D60)
    this.player = this.add.rectangle(100, 300, 40, 40, 0xE27D60);
    this.physics.add.existing(this.player);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setGravityY(800);

    // Placeholder floor (Sunset Glow: Sand #FDF6E3)
    const floor = this.add.rectangle(400, 580, 800, 40, 0xFDF6E3);
    this.physics.add.existing(floor, true);
    this.physics.add.collider(this.player, floor);
  }

  update() {
    const volume = audioController.getVolume();
    this.volumeText.setText(`Volume: ${volume.toFixed(4)}`);

    const body = this.player.body as Phaser.Physics.Arcade.Body;

    // Reset horizontal velocity
    body.setVelocityX(0);

    if (volume > this.JUMP_THRESHOLD && body.blocked.down) {
      // Squawk to Jump
      body.setVelocityY(this.JUMP_FORCE);
    } else if (volume > this.WALK_THRESHOLD) {
      // Cluck to Walk
      body.setVelocityX(this.HORIZONTAL_SPEED);
    }
    
    // Resume audio context if it was suspended (common in browsers)
    audioController.resume();
  }
}

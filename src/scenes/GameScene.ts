import Phaser from 'phaser';
import { audioController } from '../AudioInputController';

export class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private obstacles!: Phaser.Physics.Arcade.Group;
  private volumeText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private score = 0;
  private nextObstacleTime = 0;
  
  // Audio Thresholds
  private readonly WALK_THRESHOLD = 0.05;
  private readonly JUMP_THRESHOLD = 0.15;
  private readonly HORIZONTAL_SPEED = 150;
  private readonly JUMP_FORCE = -400;

  constructor() {
    super('GameScene');
  }

  create() {
    this.score = 0;
    this.add.text(16, 16, 'Game Started', { fontSize: '24px', color: '#8E2800' });
    this.volumeText = this.add.text(16, 50, 'Volume: 0', { fontSize: '18px', color: '#8E2800' });
    this.scoreText = this.add.text(16, 80, 'Score: 0', { fontSize: '24px', color: '#8E2800' });
    
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

    // Obstacles Group
    this.obstacles = this.physics.add.group();
    this.physics.add.collider(this.player, this.obstacles, this.handleGameOver, undefined, this);

    this.nextObstacleTime = this.time.now + 2000;
  }

  update(time: number) {
    const volume = audioController.getVolume();
    this.volumeText.setText(`Volume: ${volume.toFixed(4)}`);

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(0);

    if (volume > this.JUMP_THRESHOLD && body.blocked.down) {
      body.setVelocityY(this.JUMP_FORCE);
    } else if (volume > this.WALK_THRESHOLD) {
      body.setVelocityX(this.HORIZONTAL_SPEED);
      this.score += 1;
      this.scoreText.setText(`Score: ${Math.floor(this.score / 10)}`);
    }
    
    // Obstacle Spawning
    if (time > this.nextObstacleTime) {
      this.spawnObstacle();
      this.nextObstacleTime = time + Phaser.Math.Between(1500, 3000);
    }

    // Cleanup old obstacles
    this.obstacles.getChildren().forEach((child) => {
      const obstacle = child as Phaser.Physics.Arcade.Body;
      if (obstacle.x < -50) {
        this.obstacles.remove(child, true, true);
      }
    });

    audioController.resume();
  }

  private spawnObstacle() {
    const x = 850;
    const y = 540; // Just above the floor
    const obstacle = this.add.rectangle(x, y, 40, 40, 0x8E2800); // Burgundy
    this.obstacles.add(obstacle);
    (obstacle.body as Phaser.Physics.Arcade.Body).setVelocityX(-200);
  }

  private handleGameOver() {
    this.scene.start('GameOverScene');
  }
}

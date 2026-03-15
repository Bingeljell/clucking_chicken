import Phaser from 'phaser';
import { audioController } from '../AudioInputController';

export class GameScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private hazards!: Phaser.Physics.Arcade.StaticGroup;
  private volumeText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private score = 0;
  
  // Audio Thresholds
  private readonly WALK_THRESHOLD = 0.03; // More sensitive walk
  private readonly JUMP_THRESHOLD = 0.12; // More sensitive jump
  private readonly MAX_VOLUME = 0.4; // Lower cap for easier max jumps
  
  // Movement Constants
  private readonly HORIZONTAL_SPEED = 250; // Faster movement to bridge gaps
  private readonly MIN_JUMP_FORCE = -400; // Stronger base jump
  private readonly MAX_JUMP_FORCE = -950; // Stronger max jump

  constructor() {
    super('GameScene');
  }

  create() {
    this.score = 0;
    const worldWidth = 4000; // Slightly longer level
    const worldHeight = 600;

    // Set world and camera bounds
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

    // Background / Lava (Sunset Glow: Burgundy #8E2800)
    this.add.rectangle(worldWidth / 2, 590, worldWidth, 20, 0x8E2800).setOrigin(0.5);

    this.volumeText = this.add.text(16, 50, 'Volume: 0', { fontSize: '18px', color: '#8E2800' }).setScrollFactor(0);
    this.scoreText = this.add.text(16, 80, 'Score: 0', { fontSize: '24px', color: '#8E2800' }).setScrollFactor(0);
    
    // Groups for collision
    this.platforms = this.physics.add.staticGroup();
    this.hazards = this.physics.add.staticGroup();

    // Create level content
    this.createLevel(worldWidth);

    // Player (Chicken) (Sunset Glow: Terracotta #E27D60)
    this.player = this.add.rectangle(100, 450, 40, 40, 0xE27D60);
    this.physics.add.existing(this.player);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    body.setGravityY(1400); // Slightly higher gravity for tighter control

    // Colliders
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.player, this.hazards, this.handleGameOver, undefined, this);

    // Camera follow
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  }

  private createLevel(worldWidth: number) {
    // Starting platform
    this.addPlatform(0, 500, 500);

    // Sequence of platforms and gaps (Gaps reduced to 100-150px)
    this.addPlatform(600, 500, 300);
    this.addPlatform(1000, 400, 300); // Step up
    this.addPlatform(1400, 400, 400);
    
    // Add a hazard on this platform
    this.addHazard(1600, 370);

    this.addPlatform(1900, 300, 300); // Step up again
    this.addPlatform(2300, 500, 500); // Drop
    
    this.addPlatform(2900, 400, 400);
    this.addHazard(3000, 370);
    this.addHazard(3200, 370);

    this.addPlatform(3400, 500, 600); // Final stretch
  }

  private addPlatform(x: number, y: number, width: number) {
    // Using Burgundy (#8E2800) for platforms to be visible against Sand background
    const platform = this.add.rectangle(x + width / 2, y, width, 40, 0x8E2800);
    this.platforms.add(platform);
  }

  private addHazard(x: number, y: number) {
    // Using Peach (#FAD0C4) for hazards
    const hazard = this.add.rectangle(x, y, 30, 30, 0xFAD0C4);
    this.hazards.add(hazard);
  }

  update() {
    const volume = audioController.getVolume();
    this.volumeText.setText(`Volume: ${volume.toFixed(4)}`);

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setVelocityX(0);

    // Logic for walking and jumping
    if (volume > this.JUMP_THRESHOLD && body.blocked.down) {
      // Dynamic Jump Scaling
      const range = this.MAX_VOLUME - this.JUMP_THRESHOLD;
      const normalizedVolume = Math.min(Math.max((volume - this.JUMP_THRESHOLD) / range, 0), 1);
      
      // Map to jump force range: louder = stronger
      const jumpForce = this.MIN_JUMP_FORCE + (this.MAX_JUMP_FORCE - this.MIN_JUMP_FORCE) * normalizedVolume;
      body.setVelocityY(jumpForce);
    } else if (volume > this.WALK_THRESHOLD) {
      body.setVelocityX(this.HORIZONTAL_SPEED);
      
      // Update score based on X position progression
      const currentScore = Math.floor(this.player.x / 10);
      if (currentScore > this.score) {
        this.score = currentScore;
        this.scoreText.setText(`Score: ${this.score}`);
      }
    }

    // Fall to Death (Lava Check)
    if (this.player.y > 570) {
      this.handleGameOver();
    }
    
    audioController.resume();
  }

  private handleGameOver() {
    this.scene.start('GameOverScene', { score: this.score });
  }
}

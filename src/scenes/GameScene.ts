import Phaser from 'phaser';
import { audioController } from '../AudioInputController';

export class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private platforms!: Phaser.Physics.Arcade.StaticGroup;
  private hazards!: Phaser.Physics.Arcade.StaticGroup;
  private volumeText!: Phaser.GameObjects.Text;
  private scoreText!: Phaser.GameObjects.Text;
  private score = 0;
  private isDead = false;
  
  // Audio Thresholds
  private readonly WALK_THRESHOLD = 0.03;
  private readonly JUMP_THRESHOLD = 0.12;
  private readonly MAX_VOLUME = 0.4;
  
  // Movement Constants
  private readonly HORIZONTAL_SPEED = 250;
  private readonly MIN_JUMP_FORCE = -400;
  private readonly MAX_JUMP_FORCE = -950;

  constructor() {
    super('GameScene');
  }

  preload() {
    // Load the frog sprite sheet (assuming 32x32 based on your requirement)
    // Looking at the grid, it's 4 columns by 4 rows.
    this.load.spritesheet('frog', 'assets/images/frog_sheet.png', { 
        frameWidth: 32, 
        frameHeight: 32,
        margin: 0,
        spacing: 0
    });
  }

  create() {
    this.score = 0;
    this.isDead = false;
    const worldWidth = 4000;
    const worldHeight = 600;

    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

    // Background / Lava
    this.add.rectangle(worldWidth / 2, 590, worldWidth, 20, 0x8E2800).setOrigin(0.5);

    this.volumeText = this.add.text(16, 50, 'Volume: 0', { fontSize: '18px', color: '#8E2800' }).setScrollFactor(0);
    this.scoreText = this.add.text(16, 80, 'Score: 0', { fontSize: '24px', color: '#8E2800' }).setScrollFactor(0);
    
    this.platforms = this.physics.add.staticGroup();
    this.hazards = this.physics.add.staticGroup();

    this.createLevel(worldWidth);

    // Animations based on your description:
    // Row 0: Idle (2 frames)
    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers('frog', { start: 0, end: 1 }),
      frameRate: 4,
      repeat: -1
    });

    // Row 1: Walk (4 frames)
    this.anims.create({
      key: 'walk',
      frames: this.anims.generateFrameNumbers('frog', { start: 4, end: 7 }),
      frameRate: 10,
      repeat: -1
    });

    // Row 2: Jump (4 frames)
    this.anims.create({
      key: 'jump',
      frames: this.anims.generateFrameNumbers('frog', { start: 8, end: 11 }),
      frameRate: 10,
      repeat: 0
    });

    // Row 3: Death (4 frames)
    this.anims.create({
      key: 'die',
      frames: this.anims.generateFrameNumbers('frog', { start: 12, end: 15 }),
      frameRate: 10,
      repeat: 0
    });

    // Create Player Sprite
    this.player = this.physics.add.sprite(100, 450, 'frog');
    this.player.setCollideWorldBounds(true);
    this.player.setGravityY(1400);
    this.player.setScale(1.5); // Making the 32x32 sprite a bit bigger for better visibility

    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.player, this.hazards, this.handleGameOver, undefined, this);

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  }

  private createLevel(worldWidth: number) {
    this.addPlatform(0, 500, 500);
    this.addPlatform(600, 500, 300);
    this.addPlatform(1000, 400, 300);
    this.addPlatform(1400, 400, 400);
    this.addHazard(1600, 370);
    this.addPlatform(1900, 300, 300);
    this.addPlatform(2300, 500, 500);
    this.addPlatform(2900, 400, 400);
    this.addHazard(3000, 370);
    this.addHazard(3200, 370);
    this.addPlatform(3400, 500, 600);
  }

  private addPlatform(x: number, y: number, width: number) {
    const platform = this.add.rectangle(x + width / 2, y, width, 40, 0x8E2800);
    this.platforms.add(platform);
  }

  private addHazard(x: number, y: number) {
    const hazard = this.add.rectangle(x, y, 30, 30, 0xFAD0C4);
    this.hazards.add(hazard);
  }

  update() {
    if (this.isDead) return;

    const volume = audioController.getVolume();
    this.volumeText.setText(`Volume: ${volume.toFixed(4)}`);

    this.player.setVelocityX(0);

    if (volume > this.JUMP_THRESHOLD && this.player.body?.blocked.down) {
      const range = this.MAX_VOLUME - this.JUMP_THRESHOLD;
      const normalizedVolume = Math.min(Math.max((volume - this.JUMP_THRESHOLD) / range, 0), 1);
      const jumpForce = this.MIN_JUMP_FORCE + (this.MAX_JUMP_FORCE - this.MIN_JUMP_FORCE) * normalizedVolume;
      
      this.player.setVelocityY(jumpForce);
      this.player.play('jump', true);
    } else if (volume > this.WALK_THRESHOLD) {
      this.player.setVelocityX(this.HORIZONTAL_SPEED);
      if (this.player.body?.blocked.down) {
        this.player.play('walk', true);
      }
      
      const currentScore = Math.floor(this.player.x / 10);
      if (currentScore > this.score) {
        this.score = currentScore;
        this.scoreText.setText(`Score: ${this.score}`);
      }
    } else {
        if (this.player.body?.blocked.down) {
            this.player.play('idle', true);
        }
    }

    if (this.player.y > 570) {
      this.handleGameOver();
    }
    
    audioController.resume();
  }

  private handleGameOver() {
    if (this.isDead) return;
    this.isDead = true;
    
    this.player.setVelocity(0, 0);
    this.player.play('die', true);
    
    // Delay scene transition to allow death animation to play
    this.time.delayedCall(800, () => {
        this.scene.start('GameOverScene', { score: this.score });
    });
  }
}

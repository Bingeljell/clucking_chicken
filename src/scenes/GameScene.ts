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
  
  private bgClouds!: Phaser.GameObjects.TileSprite;
  private bgMountains!: Phaser.GameObjects.TileSprite;

  private noiseFloor = 0.02;
  private walkThreshold = 0.08;
  private jumpThreshold = 0.25;
  private readonly MAX_VOLUME = 1.0;
  
  private readonly HORIZONTAL_SPEED = 250;
  private readonly MIN_JUMP_FORCE = -400;
  private readonly MAX_JUMP_FORCE = -950;

  constructor() {
    super('GameScene');
  }

  preload() {
    this.load.spritesheet('frog', 'assets/images/frog_sheet.png', { frameWidth: 32, frameHeight: 32 });
    this.load.image('jungle_env', 'assets/images/jungle_env.png');
    this.load.audio('jump_sfx', 'assets/audio/jump.wav');
    this.load.audio('death_sfx', 'assets/audio/death.wav');
  }

  create() {
    const { width, height } = this.scale;
    const worldWidth = 6000;
    this.score = 0;
    this.isDead = false;

    // Define frames from the environment sheet
    const envTexture = this.textures.get('jungle_env');
    if (envTexture) {
        envTexture.add('ground', 0, 0, 0, 256, 128);
        envTexture.add('log', 0, 256, 128, 512, 96);
        envTexture.add('cactus', 0, 0, 224, 128, 128);
        envTexture.add('bg_sunset', 0, 0, 320, 1024, 128);
        envTexture.add('bg_green', 0, 0, 448, 1024, 128);
    }

    const settings = audioController.getThresholds();
    this.noiseFloor = settings.noise;
    this.walkThreshold = settings.walk;
    this.jumpThreshold = settings.jump;

    this.physics.world.setBounds(0, 0, worldWidth, height);
    this.cameras.main.setBounds(0, 0, worldWidth, height);

    // Parallax Backgrounds using the real art
    this.bgClouds = this.add.tileSprite(0, height / 2 - 100, width, 128, 'jungle_env', 'bg_sunset')
        .setOrigin(0).setScrollFactor(0).setAlpha(0.8).setScale(width / 1024 * 2);
    
    this.bgMountains = this.add.tileSprite(0, height - 256, width, 128, 'jungle_env', 'bg_green')
        .setOrigin(0).setScrollFactor(0).setAlpha(0.9).setScale(width / 1024 * 2);

    // Swamp Water at the bottom
    this.add.rectangle(worldWidth / 2, height - 10, worldWidth, 20, 0x051108).setOrigin(0.5);

    this.volumeText = this.add.text(16, 16, 'Vol: 0', { fontSize: '18px', color: '#7FFF00' }).setScrollFactor(0);
    this.scoreText = this.add.text(16, 46, 'Score: 0', { fontSize: '24px', color: '#7FFF00' }).setScrollFactor(0);
    
    const menuBtn = this.add.rectangle(width - 60, 30, 80, 40, 0x2D5A27).setScrollFactor(0).setInteractive({ useHandCursor: true });
    this.add.text(width - 60, 30, 'MENU', { fontSize: '18px', color: '#FDF6E3', fontStyle: 'bold' }).setScrollFactor(0).setOrigin(0.5);
    menuBtn.on('pointerdown', () => { this.scene.start('StartScene'); });

    this.platforms = this.physics.add.staticGroup();
    this.hazards = this.physics.add.staticGroup();

    this.createLevel(worldWidth, height);

    // Animations
    if (!this.anims.exists('idle')) {
        this.anims.create({ key: 'idle', frames: this.anims.generateFrameNumbers('frog', { start: 0, end: 1 }), frameRate: 4, repeat: -1 });
        this.anims.create({ key: 'walk', frames: this.anims.generateFrameNumbers('frog', { start: 4, end: 7 }), frameRate: 10, repeat: -1 });
        this.anims.create({ key: 'jump', frames: this.anims.generateFrameNumbers('frog', { start: 8, end: 11 }), frameRate: 10, repeat: 0 });
        this.anims.create({ key: 'die', frames: this.anims.generateFrameNumbers('frog', { start: 12, end: 15 }), frameRate: 10, repeat: 0 });
    }

    this.player = this.physics.add.sprite(100, -100, 'frog');
    this.player.setCollideWorldBounds(true);
    this.player.setGravityY(1400);
    this.player.setScale(2);

    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.overlap(this.player, this.hazards, this.handleGameOver, undefined, this);

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  }

  private createLevel(worldWidth: number, height: number) {
    const floorY = height - 120;
    let x = 0;
    while (x < worldWidth) {
        const isFirst = x === 0;
        const platWidth = isFirst ? 800 : Phaser.Math.Between(300, 600);
        const platY = isFirst ? floorY : floorY - Phaser.Math.Between(-50, 150);
        this.addPlatform(x, platY, platWidth);
        if (!isFirst && x > 500 && Phaser.Math.Between(0, 10) > 6) {
            this.addHazard(x + platWidth / 2, platY - 60);
        }
        x += platWidth + Phaser.Math.Between(150, 250);
    }
  }

  private addPlatform(x: number, y: number, width: number) {
    // Determine if it's a ground block or a floating log
    const isFloating = y < this.scale.height - 200;
    const texture = isFloating ? 'log' : 'ground';
    
    // We use a TileSprite for ground to repeat the texture, or a simple image for logs
    let platform;
    if (!isFloating) {
        platform = this.add.tileSprite(x + width / 2, y, width, 128, 'jungle_env', 'ground');
        platform.setDisplaySize(width, 128);
    } else {
        platform = this.add.image(x + width / 2, y, 'jungle_env', 'log');
        platform.setDisplaySize(width, 60);
    }
    
    this.platforms.add(platform);
    // Adjust physics body size
    const body = platform.body as Phaser.Physics.Arcade.StaticBody;
    body.updateFromGameObject();
  }

  private addHazard(x: number, y: number) {
    const hazard = this.add.image(x, y, 'jungle_env', 'cactus');
    hazard.setScale(0.5); // The cactus is quite large in the sheet
    this.hazards.add(hazard);
    const body = hazard.body as Phaser.Physics.Arcade.StaticBody;
    body.updateFromGameObject();
  }

  update() {
    if (this.isDead) return;
    const volume = audioController.getVolume();
    this.volumeText.setText(`Vol: ${volume.toFixed(2)}`);

    // Dynamic Parallax
    this.bgClouds.tilePositionX = this.cameras.main.scrollX * 0.1;
    this.bgMountains.tilePositionX = this.cameras.main.scrollX * 0.3;

    this.player.setVelocityX(0);

    if (volume > this.jumpThreshold && this.player.body?.blocked.down) {
      const range = this.MAX_VOLUME - this.jumpThreshold;
      const normalizedVolume = Math.min(Math.max((volume - this.jumpThreshold) / range, 0), 1);
      const jumpForce = this.MIN_JUMP_FORCE + (this.MAX_JUMP_FORCE - this.MIN_JUMP_FORCE) * normalizedVolume;
      this.player.setVelocityY(jumpForce);
      this.player.play('jump', true);
      this.sound.play('jump_sfx', { volume: 0.5 });
    } else if (volume > this.walkThreshold) {
      this.player.setVelocityX(this.HORIZONTAL_SPEED);
      if (this.player.body?.blocked.down) { this.player.play('walk', true); }
      const currentScore = Math.floor(this.player.x / 10);
      if (currentScore > this.score) {
        this.score = currentScore;
        this.scoreText.setText(`Score: ${this.score}`);
      }
    } else {
        if (this.player.body?.blocked.down) { this.player.play('idle', true); }
    }
    if (this.player.y > this.scale.height - 50) { this.handleGameOver(); }
    audioController.resume();
  }

  private handleGameOver() {
    if (this.isDead) return;
    this.isDead = true;
    if (this.player.body) { this.player.body.enable = false; }
    this.player.setVelocity(0, 0);
    this.player.play('die', true);
    this.sound.play('death_sfx', { volume: 0.6 });
    this.time.delayedCall(800, () => { this.scene.start('GameOverScene', { score: this.score }); });
  }
}

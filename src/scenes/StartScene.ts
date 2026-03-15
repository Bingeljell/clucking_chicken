import Phaser from 'phaser';
import { audioController } from '../AudioInputController';

export class StartScene extends Phaser.Scene {
  private statusText!: Phaser.GameObjects.Text;

  constructor() {
    super('StartScene');
  }

  create() {
    const { width, height } = this.scale;
    
    // Background (Sunset Glow: Sand)
    this.add.rectangle(width / 2, height / 2, width, height, 0xFDF6E3);

    // Title
    this.add.text(width / 2, height * 0.25, 'Frog Squawk', { 
      fontSize: '64px', 
      color: '#E27D60',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Instructions Box
    const instructionBox = this.add.rectangle(width / 2, height * 0.5, Math.min(width * 0.8, 600), 200, 0xFAD0C4);
    
    const instructions = [
      '🐸 Use your voice to control the frog!',
      '🚶 Soft sounds (Hum/Cluck) to WALK',
      '🚀 Loud Squawks to JUMP higher',
      '🌊 Watch out for the gaps and hazards!'
    ];

    this.add.text(width / 2, height * 0.5, instructions.join('\n'), {
      fontSize: '24px',
      color: '#8E2800',
      align: 'center',
      lineSpacing: 10
    }).setOrigin(0.5);

    // Start Button
    const startBtn = this.add.rectangle(width / 2, height * 0.75, 250, 60, 0xE27D60)
      .setInteractive({ useHandCursor: true });
    
    this.add.text(width / 2, height * 0.75, 'START GAME', {
      fontSize: '32px',
      color: '#FDF6E3',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.statusText = this.add.text(width / 2, height * 0.85, '', { 
      fontSize: '18px', 
      color: '#8E2800' 
    }).setOrigin(0.5);

    startBtn.on('pointerdown', async () => {
      this.statusText.setText('Requesting Microphone Access...');
      try {
        await audioController.initialize();
        this.scene.start('GameScene');
      } catch (error) {
        this.statusText.setText('Mic Permission Denied! Check browser settings.');
      }
    });

    // Hover effect
    startBtn.on('pointerover', () => startBtn.setFillStyle(0x8E2800));
    startBtn.on('pointerout', () => startBtn.setFillStyle(0xE27D60));
  }
}

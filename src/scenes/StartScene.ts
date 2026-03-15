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

    // Title - Responsive sizing
    const titleSize = Math.min(width * 0.12, 64);
    this.add.text(width / 2, height * 0.2, 'Frog Leap', { 
      fontSize: `${titleSize}px`, 
      color: '#E27D60',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Instructions Box - Responsive sizing
    const boxWidth = Math.min(width * 0.9, 600);
    const boxHeight = Math.min(height * 0.4, 300);
    this.add.rectangle(width / 2, height * 0.5, boxWidth, boxHeight, 0xFAD0C4);
    
    const instructions = [
      '🐸 Use your voice to control the frog!',
      '',
      '🚶 Soft sounds (Hum/Ribbit) to WALK',
      '🚀 Loud CROAKS to JUMP higher',
      '🌊 Watch out for gaps and hazards!'
    ];

    const instructionSize = Math.min(width * 0.05, 24);
    this.add.text(width / 2, height * 0.5, instructions.join('\n'), {
      fontSize: `${instructionSize}px`,
      color: '#8E2800',
      align: 'center',
      lineSpacing: 8,
      wordWrap: { width: boxWidth - 40 }
    }).setOrigin(0.5);

    // Start Button - Responsive sizing
    const btnWidth = Math.min(width * 0.6, 300);
    const btnHeight = Math.min(height * 0.1, 70);
    const startBtn = this.add.rectangle(width / 2, height * 0.8, btnWidth, btnHeight, 0xE27D60)
      .setInteractive({ useHandCursor: true });
    
    this.add.text(width / 2, height * 0.8, 'START GAME', {
      fontSize: `${instructionSize * 1.2}px`,
      color: '#FDF6E3',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.statusText = this.add.text(width / 2, height * 0.92, '', { 
      fontSize: `${instructionSize * 0.7}px`, 
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

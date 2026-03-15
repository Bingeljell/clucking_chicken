import Phaser from 'phaser';
import { audioController } from '../AudioInputController';

export class StartScene extends Phaser.Scene {
  private statusText!: Phaser.GameObjects.Text;
  private isCalibrating = false;
  private peakVolume = 0;

  constructor() {
    super('StartScene');
  }

  create() {
    const { width, height } = this.scale;
    
    this.add.rectangle(width / 2, height / 2, width, height, 0xFDF6E3);

    const titleSize = Math.min(width * 0.12, 64);
    this.add.text(width / 2, height * 0.15, 'Frog Leap', { 
      fontSize: `${titleSize}px`, 
      color: '#E27D60',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Calibration/Instruction Box
    const boxWidth = Math.min(width * 0.9, 600);
    const boxHeight = Math.min(height * 0.5, 350);
    this.add.rectangle(width / 2, height * 0.5, boxWidth, boxHeight, 0xFAD0C4);
    
    this.statusText = this.add.text(width / 2, height * 0.5, this.getInstructionText(), {
      fontSize: `${Math.min(width * 0.045, 20)}px`,
      color: '#8E2800',
      align: 'center',
      lineSpacing: 8,
      wordWrap: { width: boxWidth - 40 }
    }).setOrigin(0.5);

    // Buttons Container
    const btnWidth = Math.min(width * 0.4, 200);
    const btnHeight = 50;
    
    const calibrateBtn = this.add.rectangle(width / 2 - (btnWidth / 2 + 10), height * 0.85, btnWidth, btnHeight, 0x8E2800)
      .setInteractive({ useHandCursor: true });
    this.add.text(width / 2 - (btnWidth / 2 + 10), height * 0.85, 'CALIBRATE', {
      fontSize: '18px', color: '#FDF6E3', fontStyle: 'bold'
    }).setOrigin(0.5);

    const startBtn = this.add.rectangle(width / 2 + (btnWidth / 2 + 10), height * 0.85, btnWidth, btnHeight, 0xE27D60)
      .setInteractive({ useHandCursor: true });
    this.add.text(width / 2 + (btnWidth / 2 + 10), height * 0.85, 'START', {
      fontSize: '18px', color: '#FDF6E3', fontStyle: 'bold'
    }).setOrigin(0.5);

    calibrateBtn.on('pointerdown', async () => {
      if (!this.isCalibrating) {
        await audioController.initialize();
        this.isCalibrating = true;
        this.peakVolume = 0;
        this.statusText.setText('🎤 CALIBRATING...\n\nMake your QUIETEST "walking" sound now.\n\nPeak: 0.0000');
      }
    });

    startBtn.on('pointerdown', async () => {
      await audioController.initialize();
      this.scene.start('GameScene');
    });
  }

  private getInstructionText() {
    return [
      '🐸 CONTROL YOUR FROG WITH SOUND!',
      '',
      '🚶 HUM SOFTLY to Walk forward',
      '🚀 CROAK LOUDLY to Jump high',
      '',
      'Click CALIBRATE to adjust sensitivity',
      'to your environment and voice.'
    ].join('\n');
  }

  update() {
    if (this.isCalibrating) {
      const vol = audioController.getVolume();
      if (vol > this.peakVolume) {
        this.peakVolume = vol;
      }
      
      this.statusText.setText(
        `🎤 CALIBRATING...\n\nHum softly, then Croak loudly!\n\nCurrent Peak: ${vol.toFixed(4)}\nSession Max: ${this.peakVolume.toFixed(4)}\n\nClick START when ready.`
      );

      // Auto-set thresholds based on session max if needed, 
      // but let's just use the calibration to let the user see their levels.
      if (this.peakVolume > 0.01) {
          const walk = Math.max(0.01, this.peakVolume * 0.2);
          const jump = Math.max(0.05, this.peakVolume * 0.6);
          audioController.setThresholds(walk, jump);
      }
    }
  }
}

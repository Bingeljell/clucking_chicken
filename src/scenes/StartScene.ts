import Phaser from 'phaser';
import { audioController } from '../AudioInputController';

type CalibrationStep = 'idle' | 'noise' | 'walk' | 'jump' | 'done';

export class StartScene extends Phaser.Scene {
  private statusText!: Phaser.GameObjects.Text;
  private currentStep: CalibrationStep = 'idle';
  private stepData: { noise: number, walk: number, jump: number } = { noise: 0, walk: 0, jump: 0 };
  private stepTimer = 0;
  private peakValue = 0;

  constructor() {
    super('StartScene');
  }

  create() {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0xFDF6E3);

    const titleSize = Math.min(width * 0.1, 64);
    this.add.text(width / 2, height * 0.15, 'Frog Leap', { 
      fontSize: `${titleSize}px`, color: '#E27D60', fontStyle: 'bold'
    }).setOrigin(0.5);

    // Main Instruction Box
    const boxWidth = Math.min(width * 0.9, 600);
    const boxHeight = Math.min(height * 0.55, 380);
    this.add.rectangle(width / 2, height * 0.5, boxWidth, boxHeight, 0xFAD0C4);
    
    this.statusText = this.add.text(width / 2, height * 0.5, this.getInstructionText(), {
      fontSize: `${Math.min(width * 0.045, 20)}px`,
      color: '#8E2800', align: 'center', lineSpacing: 8, wordWrap: { width: boxWidth - 40 }
    }).setOrigin(0.5);

    // Buttons
    const btnWidth = Math.min(width * 0.4, 180);
    const btnHeight = 50;
    const startY = height * 0.85;

    const calibrateBtn = this.add.rectangle(width / 2 - (btnWidth / 2 + 10), startY, btnWidth, btnHeight, 0x8E2800)
      .setInteractive({ useHandCursor: true });
    this.add.text(width / 2 - (btnWidth / 2 + 10), startY, 'CALIBRATE', {
      fontSize: '18px', color: '#FDF6E3', fontStyle: 'bold'
    }).setOrigin(0.5);

    const startBtn = this.add.rectangle(width / 2 + (btnWidth / 2 + 10), startY, btnWidth, btnHeight, 0xE27D60)
      .setInteractive({ useHandCursor: true });
    this.add.text(width / 2 + (btnWidth / 2 + 10), startY, 'START', {
      fontSize: '18px', color: '#FDF6E3', fontStyle: 'bold'
    }).setOrigin(0.5);

    calibrateBtn.on('pointerdown', async () => {
      await audioController.initialize();
      this.startCalibration();
    });

    startBtn.on('pointerdown', async () => {
      await audioController.initialize();
      this.scene.start('GameScene');
    });
  }

  private startCalibration() {
    this.currentStep = 'noise';
    this.peakValue = 0;
    this.stepTimer = 3000; // 3 seconds per step
  }

  private getInstructionText() {
    return [
      '🐸 CONTROL YOUR FROG WITH SOUND!',
      '',
      '🚶 HUM SOFTLY to Walk forward',
      '🚀 CROAK LOUDLY to Jump high',
      '',
      'Click CALIBRATE to adjust sensitivity.',
      'Recommended for first-time players!'
    ].join('\n');
  }

  update(time: number, delta: number) {
    if (this.currentStep === 'idle' || this.currentStep === 'done') return;

    const vol = audioController.getVolume();
    if (vol > this.peakValue) this.peakValue = vol;
    this.stepTimer -= delta;

    const secondsLeft = Math.ceil(this.stepTimer / 1000);

    if (this.currentStep === 'noise') {
      this.statusText.setText(`STEP 1: BACKGROUND NOISE\n\nBe very quiet...\n\n${secondsLeft}s left\nVolume: ${vol.toFixed(4)}`);
      if (this.stepTimer <= 0) {
        this.stepData.noise = this.peakValue;
        this.currentStep = 'walk';
        this.peakValue = 0;
        this.stepTimer = 4000;
      }
    } else if (this.currentStep === 'walk') {
      this.statusText.setText(`STEP 2: HUM/WALK\n\nHum or make a steady soft sound...\n\n${secondsLeft}s left\nVolume: ${vol.toFixed(4)}`);
      if (this.stepTimer <= 0) {
        this.stepData.walk = this.peakValue;
        this.currentStep = 'jump';
        this.peakValue = 0;
        this.stepTimer = 4000;
      }
    } else if (this.currentStep === 'jump') {
      this.statusText.setText(`STEP 3: CROAK/JUMP\n\nMake a loud short sound (CROAK!)\n\n${secondsLeft}s left\nVolume: ${vol.toFixed(4)}`);
      if (this.stepTimer <= 0) {
        this.stepData.jump = this.peakValue;
        this.finishCalibration();
      }
    }
  }

  private finishCalibration() {
    this.currentStep = 'done';
    
    // Logic to set thresholds based on captured data
    // We want walk to be somewhere above noise, and jump to be between walk and jump peaks.
    const noise = Math.max(0.01, this.stepData.noise);
    const walk = Math.max(noise * 1.5, this.stepData.walk * 0.7);
    const jump = Math.max(walk * 1.5, this.stepData.jump * 0.6);

    audioController.setThresholds(walk, jump, noise);

    this.statusText.setText(
      `CALIBRATION COMPLETE!\n\nNoise Floor: ${noise.toFixed(3)}\nWalk Threshold: ${walk.toFixed(3)}\nJump Threshold: ${jump.toFixed(3)}\n\nClick START to play!`
    );
  }
}

import Phaser from 'phaser';
import { audioController } from '../AudioInputController';

type CalibrationStep = 'idle' | 'noise' | 'walk' | 'jump' | 'done';

export class StartScene extends Phaser.Scene {
  private statusText!: Phaser.GameObjects.Text;
  private isSettingsOpen = false;
  private settingsGroup!: Phaser.GameObjects.Group;
  private volumeBar!: Phaser.GameObjects.Rectangle;
  private sliders: { [key: string]: { bar: Phaser.GameObjects.Rectangle, handle: Phaser.GameObjects.Rectangle, label: Phaser.GameObjects.Text } } = {};
  
  constructor() {
    super('StartScene');
  }

  create() {
    const { width, height } = this.scale;
    
    // Dark Jungle Green Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x0B190E);

    // Title - Lime Green
    const titleSize = Math.min(width * 0.1, 64);
    this.add.text(width / 2, height * 0.15, 'Frog Leap', { 
      fontSize: `${titleSize}px`, color: '#7FFF00', fontStyle: 'bold'
    }).setOrigin(0.5);

    this.settingsGroup = this.add.group();

    this.createMainMenu(width, height);
    this.createSettingsMenu(width, height);
    this.showSettings(false);
  }

  private createMainMenu(width: number, height: number) {
    const boxWidth = Math.min(width * 0.9, 600);
    const boxHeight = Math.min(height * 0.5, 300);
    // Darker translucent box
    const box = this.add.rectangle(width / 2, height * 0.5, boxWidth, boxHeight, 0x1A330B, 0.8);
    
    const instructions = [
      '🐸 CONTROL YOUR FROG WITH SOUND!',
      '',
      '🚶 HUM SOFTLY to Walk forward',
      '🚀 CROAK LOUDLY to Jump high',
      '',
      'Calibrate microphone sensitivity in settings.'
    ].join('\n');

    const instructionText = this.add.text(width / 2, height * 0.5, instructions, {
      fontSize: `${Math.min(width * 0.045, 20)}px`,
      color: '#7FFF00', align: 'center', lineSpacing: 8, wordWrap: { width: boxWidth - 40 }
    }).setOrigin(0.5);

    const btnWidth = Math.min(width * 0.4, 180);
    const btnHeight = 50;
    const startY = height * 0.85;

    const settingsBtn = this.add.rectangle(width / 2 - (btnWidth / 2 + 10), startY, btnWidth, btnHeight, 0x2D5A27)
      .setInteractive({ useHandCursor: true });
    const settingsLabel = this.add.text(width / 2 - (btnWidth / 2 + 10), startY, 'SETTINGS', {
      fontSize: '18px', color: '#FDF6E3', fontStyle: 'bold'
    }).setOrigin(0.5);

    const startBtn = this.add.rectangle(width / 2 + (btnWidth / 2 + 10), startY, btnWidth, btnHeight, 0x7FFF00)
      .setInteractive({ useHandCursor: true });
    const startLabel = this.add.text(width / 2 + (btnWidth / 2 + 10), startY, 'START', {
      fontSize: '18px', color: '#0B190E', fontStyle: 'bold'
    }).setOrigin(0.5);

    const menuItems = [box, instructionText, settingsBtn, settingsLabel, startBtn, startLabel];
    
    settingsBtn.on('pointerdown', async () => {
      await audioController.initialize();
      this.showMainMenu(false, menuItems);
      this.showSettings(true);
    });

    startBtn.on('pointerdown', async () => {
      await audioController.initialize();
      this.scene.start('GameScene');
    });
  }

  private createSettingsMenu(width: number, height: number) {
    const boxWidth = Math.min(width * 0.9, 600);
    const boxHeight = Math.min(height * 0.7, 450);
    const bg = this.add.rectangle(width / 2, height * 0.5, boxWidth, boxHeight, 0x1A330B, 0.9);
    
    const title = this.add.text(width / 2, height * 0.22, 'SENSITIVITY SETTINGS', {
        fontSize: '24px', color: '#7FFF00', fontStyle: 'bold'
    }).setOrigin(0.5);

    const meterX = width / 2 - boxWidth / 2 + 50;
    const meterY = height * 0.5;
    const meterHeight = 250;
    const meterBg = this.add.rectangle(meterX, meterY, 30, meterHeight, 0x0B190E).setOrigin(0.5);
    this.volumeBar = this.add.rectangle(meterX, meterY + meterHeight/2, 30, 0, 0x7FFF00).setOrigin(0.5, 1);
    
    const createMarker = (color: number) => this.add.rectangle(meterX, 0, 40, 4, color).setOrigin(0.5);
    const noiseMarker = createMarker(0x555555);
    const walkMarker = createMarker(0x00ff00);
    const jumpMarker = createMarker(0xff0000);

    const sliderX = width / 2 + 40;
    const sliderWidth = 250;
    
    const createSlider = (label: string, y: number, initialValue: number, min: number, max: number, color: number) => {
        const bar = this.add.rectangle(sliderX, y, sliderWidth, 10, 0x0B190E).setOrigin(0.5);
        const handle = this.add.rectangle(sliderX, y, 20, 30, color).setOrigin(0.5).setInteractive({ draggable: true, useHandCursor: true });
        const txt = this.add.text(sliderX - sliderWidth/2, y - 25, `${label}: ${initialValue.toFixed(2)}`, { fontSize: '16px', color: '#7FFF00' });
        
        const percent = (initialValue - min) / (max - min);
        handle.x = (sliderX - sliderWidth/2) + (percent * sliderWidth);

        handle.on('drag', (_pointer: any, dragX: number) => {
            handle.x = Phaser.Math.Clamp(dragX, sliderX - sliderWidth/2, sliderX + sliderWidth/2);
            const newVal = min + ((handle.x - (sliderX - sliderWidth/2)) / sliderWidth) * (max - min);
            txt.setText(`${label}: ${newVal.toFixed(2)}`);
            this.updateMarkers(meterY, meterHeight, noiseMarker, walkMarker, jumpMarker);
        });

        return { bar, handle, label: txt };
    };

    const settings = audioController.getThresholds();
    this.sliders['gain'] = createSlider('INPUT GAIN', height * 0.35, settings.gain, 1.0, 10.0, 0x7FFF00);
    this.sliders['noise'] = createSlider('NOISE FLOOR', height * 0.48, settings.noise, 0.0, 0.5, 0x555555);
    this.sliders['walk'] = createSlider('WALK THRESHOLD', height * 0.61, settings.walk, 0.0, 1.0, 0x00ff00);
    this.sliders['jump'] = createSlider('JUMP THRESHOLD', height * 0.74, settings.jump, 0.0, 1.0, 0xff0000);

    const backBtn = this.add.rectangle(width / 2, height * 0.88, 150, 40, 0x2D5A27)
        .setInteractive({ useHandCursor: true });
    const backTxt = this.add.text(width / 2, height * 0.88, 'SAVE & BACK', { fontSize: '18px', color: '#FDF6E3', fontStyle: 'bold' }).setOrigin(0.5);

    backBtn.on('pointerdown', () => {
        this.saveAndBack();
    });

    this.settingsGroup.addMultiple([bg, title, meterBg, this.volumeBar, noiseMarker, walkMarker, jumpMarker, backBtn, backTxt]);
    Object.values(this.sliders).forEach(s => this.settingsGroup.addMultiple([s.bar, s.handle, s.label]));
    
    this.updateMarkers(meterY, meterHeight, noiseMarker, walkMarker, jumpMarker);
  }

  private updateMarkers(y: number, height: number, noise: Phaser.GameObjects.Rectangle, walk: Phaser.GameObjects.Rectangle, jump: Phaser.GameObjects.Rectangle) {
    const bottom = y + height/2;
    const getSliderVal = (key: string, min: number, max: number) => {
        const s = this.sliders[key];
        const sliderX = this.scale.width / 2 + 40;
        const sliderWidth = 250;
        const percent = (s.handle.x - (sliderX - sliderWidth/2)) / sliderWidth;
        return min + percent * (max - min);
    };

    const noiseVal = getSliderVal('noise', 0.0, 0.5);
    const walkVal = getSliderVal('walk', 0.0, 1.0);
    const jumpVal = getSliderVal('jump', 0.0, 1.0);

    noise.y = bottom - (noiseVal * height);
    walk.y = bottom - (walkVal * height);
    jump.y = bottom - (jumpVal * height);
  }

  private saveAndBack() {
    const getVal = (key: string, min: number, max: number) => {
        const s = this.sliders[key];
        const sliderX = this.scale.width / 2 + 40;
        const sliderWidth = 250;
        const percent = (s.handle.x - (sliderX - sliderWidth/2)) / sliderWidth;
        return min + percent * (max - min);
    };

    audioController.saveSettings(
        getVal('walk', 0.0, 1.0),
        getVal('jump', 0.0, 1.0),
        getVal('noise', 0.0, 0.5),
        getVal('gain', 1.0, 10.0)
    );

    this.showSettings(false);
    this.scene.restart();
  }

  private showMainMenu(show: boolean, items: any[]) {
    items.forEach(i => i.setVisible(show));
  }

  private showSettings(show: boolean) {
    this.isSettingsOpen = show;
    this.settingsGroup.setVisible(show);
  }

  update() {
    if (this.isSettingsOpen) {
      const vol = audioController.getVolume();
      const meterHeight = 250;
      this.volumeBar.height = vol * meterHeight;
    }
  }
}

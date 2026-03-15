import Phaser from 'phaser';
import { audioController } from '../AudioInputController';

export class StartScene extends Phaser.Scene {
  private statusText!: Phaser.GameObjects.Text;

  constructor() {
    super('StartScene');
  }

  create() {
    this.add.text(400, 300, 'Clucking Chicken', { fontSize: '48px', color: '#E27D60' }).setOrigin(0.5);
    this.add.text(400, 400, 'Click to Enable Mic & Start', { fontSize: '24px', color: '#8E2800' }).setOrigin(0.5);
    
    this.statusText = this.add.text(400, 500, '', { fontSize: '18px', color: '#8E2800' }).setOrigin(0.5);

    this.input.once('pointerdown', async () => {
      this.statusText.setText('Requesting Microphone Access...');
      
      try {
        await audioController.initialize();
        this.scene.start('GameScene');
      } catch (error) {
        this.statusText.setText('Mic Permission Denied! Reload to try again.');
        console.error('Failed to init mic:', error);
      }
    });
  }
}

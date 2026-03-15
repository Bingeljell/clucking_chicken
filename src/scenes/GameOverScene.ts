import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  private finalScore = 0;

  constructor() {
    super('GameOverScene');
  }

  init(data: { score: number }) {
    this.finalScore = data.score || 0;
    
    // Handle High Score in LocalStorage
    const savedHighScore = localStorage.getItem('clucking_high_score');
    const highScore = savedHighScore ? parseInt(savedHighScore) : 0;
    
    if (this.finalScore > highScore) {
      localStorage.setItem('clucking_high_score', this.finalScore.toString());
    }
  }

  create() {
    const highScore = localStorage.getItem('clucking_high_score') || '0';
    
    this.add.text(400, 150, 'Game Over', { fontSize: '48px', color: '#8E2800' }).setOrigin(0.5);
    this.add.text(400, 250, `Final Score: ${this.finalScore}`, { fontSize: '32px', color: '#E27D60' }).setOrigin(0.5);
    this.add.text(400, 310, `Best: ${highScore}`, { fontSize: '24px', color: '#8E2800' }).setOrigin(0.5);
    this.add.text(400, 450, 'Click to Restart', { fontSize: '24px', color: '#8E2800' }).setOrigin(0.5);

    this.input.once('pointerdown', () => {
      this.scene.start('GameScene');
    });
  }
}

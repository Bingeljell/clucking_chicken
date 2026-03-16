import Phaser from 'phaser';

export class GameOverScene extends Phaser.Scene {
  private finalScore = 0;

  constructor() {
    super('GameOverScene');
  }

  init(data: { score: number }) {
    this.finalScore = data.score || 0;
    
    const savedHighScore = localStorage.getItem('clucking_high_score');
    const highScore = savedHighScore ? parseInt(savedHighScore) : 0;
    
    if (this.finalScore > highScore) {
      localStorage.setItem('clucking_high_score', this.finalScore.toString());
    }
  }

  create() {
    const { width, height } = this.scale;
    const highScore = localStorage.getItem('clucking_high_score') || '0';
    
    // Background - Dark Jungle Green
    this.add.rectangle(width / 2, height / 2, width, height, 0x0B190E);

    this.add.text(width / 2, height * 0.25, 'GAME OVER', { 
      fontSize: '64px', 
      color: '#FF4500', // Vibrant Hazard Orange
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.45, `SCORE: ${this.finalScore}`, { 
      fontSize: '40px', 
      color: '#7FFF00' // Lime Green
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.55, `BEST: ${highScore}`, { 
      fontSize: '24px', 
      color: '#2D5A27' 
    }).setOrigin(0.5);

    const restartBtn = this.add.rectangle(width / 2, height * 0.75, 250, 60, 0x7FFF00)
      .setInteractive({ useHandCursor: true });
    
    this.add.text(width / 2, height * 0.75, 'RETRY', {
      fontSize: '32px',
      color: '#0B190E',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    restartBtn.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    restartBtn.on('pointerover', () => restartBtn.setFillStyle(0x2D5A27));
    restartBtn.on('pointerout', () => restartBtn.setFillStyle(0x7FFF00));
  }
}

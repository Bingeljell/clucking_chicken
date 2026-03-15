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
    
    // Background
    this.add.rectangle(width / 2, height / 2, width, height, 0x8E2800);

    this.add.text(width / 2, height * 0.25, 'GAME OVER', { 
      fontSize: '64px', 
      color: '#FAD0C4',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.45, `SCORE: ${this.finalScore}`, { 
      fontSize: '40px', 
      color: '#FDF6E3' 
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.55, `BEST: ${highScore}`, { 
      fontSize: '24px', 
      color: '#E27D60' 
    }).setOrigin(0.5);

    const restartBtn = this.add.rectangle(width / 2, height * 0.75, 250, 60, 0xE27D60)
      .setInteractive({ useHandCursor: true });
    
    this.add.text(width / 2, height * 0.75, 'RETRY', {
      fontSize: '32px',
      color: '#FDF6E3',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    restartBtn.on('pointerdown', () => {
      this.scene.start('GameScene');
    });

    restartBtn.on('pointerover', () => restartBtn.setFillStyle(0xFAD0C4));
    restartBtn.on('pointerout', () => restartBtn.setFillStyle(0xE27D60));
  }
}

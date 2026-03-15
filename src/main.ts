import Phaser from 'phaser';
import { StartScene } from './scenes/StartScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 }, // Individual components handle their own gravity
      debug: false
    }
  },
  scene: [StartScene, GameScene, GameOverScene],
  parent: 'app',
  backgroundColor: '#FDF6E3'
};

new Phaser.Game(config);

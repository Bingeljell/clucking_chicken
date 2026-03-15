# Changelog

- **2026-03-15** > root > n/a > Initialized Vite + TypeScript project with Phaser and vite-plugin-pwa. Configured PWA manifest and project scaffolding. Added initial documentation (progress.md and updated changelog.md).
- **2026-03-15** > src/main.ts, src/scenes/{StartScene.ts, GameScene.ts, GameOverScene.ts} > Phaser game configuration and basic scene scaffolding (Start, Game, GameOver). Implemented basic scene transitions.
- **2026-03-15** > src/AudioInputController.ts, src/scenes/StartScene.ts > Implemented Web Audio API analyzer to measure microphone volume. Integrated microphone permission request flow in StartScene.
- **2026-03-15** > src/scenes/GameScene.ts > Integrated AudioInputController with Phaser update loop. Mapped microphone volume thresholds to player movement (Soft sounds = Walk, Loud sounds = Jump). Implemented physics-based gravity and world collision.
- **2026-03-15** > src/scenes/GameScene.ts > Added obstacle spawning system with random timing. Implemented collision detection between player and obstacles leading to Game Over state. Added basic score tracking based on horizontal movement.
- **2026-03-15** > src/scenes/{GameScene.ts, GameOverScene.ts}, vite.config.ts > Finalized scoring system and score passing between scenes. Polished PWA manifest with "Sunset Glow" theme colors. Verified build compilation.

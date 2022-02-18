const imgPath = './img';
const IMG = {
  BG_WHITE: `${imgPath}/bg-white.svg`,
  BG_BLACK: `${imgPath}/bg-black.svg`,
  BG_S1_L1: `${imgPath}/bg-winter-1-l1.png`,
  BG_S1_L2: `${imgPath}/bg-winter-1-l2.png`,
  BG_S2_L1: `${imgPath}/bg-winter-2-l1.png`,
  BG_S2_L2: `${imgPath}/bg-winter-2-l2.png`,
  BG_S3_L1: `${imgPath}/bg-winter-3-l1.png`,
  BG_S3_L2: `${imgPath}/bg-winter-3-l2.png`,
  BG_S4: `${imgPath}/bg-winter-4.png`,
  BG_NEON_BG: `${imgPath}/bg-neon-bg.png`,
  BG_NEON_GLOW: `${imgPath}/bg-neon-glow.png`,
  BG_NEON_GRID: `${imgPath}/bg-neon-grid.png`,
  SUN: `${imgPath}/sun.png`,
  TOWER: `${imgPath}/tower.png`,
  PLAYER: `${imgPath}/player-pig.png`,
  BALLOON: `${imgPath}/balloon.png`,
  EXPLOSION: `${imgPath}/explosion.png`,
  COIN: `${imgPath}/coin.png`,
};

export function preload() {
  this.load.image('bg-white', IMG.BG_WHITE);
  this.load.image('bg-black', IMG.BG_BLACK);
  this.load.image('bg-s1-l1', IMG.BG_S1_L1);
  this.load.image('bg-s1-l2', IMG.BG_S1_L2);
  this.load.image('bg-s2-l1', IMG.BG_S2_L1);
  this.load.image('bg-s2-l2', IMG.BG_S2_L2);
  this.load.image('bg-s3-l1', IMG.BG_S3_L1);
  this.load.image('bg-s3-l2', IMG.BG_S3_L2);
  this.load.image('bg-s4', IMG.BG_S4);
  this.load.image('bg-neon-bg', IMG.BG_NEON_BG);
  this.load.image('bg-neon-glow', IMG.BG_NEON_GLOW);
  this.load.spritesheet('bg-neon-grid', IMG.BG_NEON_GRID, {
    frameWidth: 1024,
    frameHeight: 108,
  });
  this.load.image('bg-sun', IMG.SUN);
  this.load.image('bg-tower', IMG.TOWER);
  this.load.spritesheet('player', IMG.PLAYER, {
    frameWidth: 80,
    frameHeight: 64,
  });
  this.load.spritesheet('balloon', IMG.BALLOON, {
    frameWidth: 70,
    frameHeight: 100,
  });

  this.load.spritesheet('explosion', IMG.EXPLOSION, {
    frameWidth: 150,
    frameHeight: 150,
  });
  this.load.spritesheet('coin', IMG.COIN, {
    frameWidth: 48,
    frameHeight: 48,
  });
}

import * as Phaser from 'phaser';

import { preload } from './preload';

const SCREEN = {
  WIDTH: 1024,
  HEIGHT: 768,
};

const config = {
  type: Phaser.AUTO,
  width: SCREEN.WIDTH,
  height: SCREEN.HEIGHT,
  useTicker: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {},
      debug: false,
    },
  },
  fps: {
    target: 30,
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

const game = new Phaser.Game(config as Phaser.Types.Core.GameConfig);

let bgWhite;
let bg = {
  stage1: [],
  stage2: [],
  stage3: [],
  stage4: [],
  final: [],
};
let ballons = [];
let player;
let text = { pressEnter: undefined };
let cursors;
let keys;
let mainTimer = 0;
let speedSteps = [1, 2]; // should be 1, 2, 4
let isEnterPressed = false;
let explosion;
let coin;
let bgNeonGrid;
let bgNeonBg;
let bgNeonGlow;
let bgSun;
let bgTower;

const getDeltaAlpha = (t) => 1 / (t / 17);

const timings = {
  bgAppear: 2000,
  balloonsAppear: 4000,
  bgChangeSpeed1: 8000,
  bgChange1: 20000,
  bgChange2: 40000,
  bgChange3: 60000,
  bgChange4: 75000,
  bgChange5: 80000,
  bgSunAppear: 82000,
};

const layers = [];
const layersCount = 6;

function create() {
  // why forEach doesnt work ???
  for (let i = 0; i < layersCount; i++) {
    layers[i] = this.add.layer();
    layers[i].setDepth(i);
  }

  // STAGE BACKGROUNDS --------------------------------------------------------
  bgWhite = this.add
    .tileSprite(0, 0, SCREEN.WIDTH, SCREEN.HEIGHT, 'bg-white')
    .setOrigin(0);
  layers[0].add([bgWhite]);

  bg.stage1[0] = this.add
    .tileSprite(0, 0, SCREEN.WIDTH * 2, SCREEN.HEIGHT, 'bg-s1-l1')
    .setOrigin(0);
  bg.stage1[1] = this.add
    .tileSprite(0, 0, SCREEN.WIDTH * 2, SCREEN.HEIGHT, 'bg-s1-l2')
    .setOrigin(0);

  bg.stage2[0] = this.add
    .tileSprite(SCREEN.WIDTH, 0, SCREEN.WIDTH * 2, SCREEN.HEIGHT, 'bg-s2-l1')
    .setOrigin(0);
  bg.stage2[1] = this.add
    .tileSprite(SCREEN.WIDTH, 0, SCREEN.WIDTH * 2, SCREEN.HEIGHT, 'bg-s2-l2')
    .setOrigin(0);

  bg.stage3[0] = this.add
    .tileSprite(SCREEN.WIDTH, 0, SCREEN.WIDTH * 2, SCREEN.HEIGHT, 'bg-s3-l1')
    .setOrigin(0);
  bg.stage3[1] = this.add
    .tileSprite(SCREEN.WIDTH, 0, SCREEN.WIDTH * 2, SCREEN.HEIGHT, 'bg-s3-l2')
    .setOrigin(0);

  bg.stage4[0] = this.add
    .tileSprite(SCREEN.WIDTH, 0, SCREEN.WIDTH * 2, SCREEN.HEIGHT, 'bg-s4')
    .setOrigin(0);

  layers[1].add([bg.stage1[0], bg.stage2[0], bg.stage3[0], bg.stage4[0]]);
  layers[2].add([bg.stage1[1], bg.stage2[1], bg.stage3[1]]);
  layers[1].alpha = 0;
  layers[2].alpha = 0;

  bgNeonBg = this.add.sprite(0, 0, 'bg-neon-bg').setOrigin(0);
  bgNeonGlow = this.add.sprite(0, 500, 'bg-neon-glow').setOrigin(0);
  bgSun = this.add.sprite(300, 700, 'bg-sun').setOrigin(0);
  bgTower = this.add
    .sprite(1030, SCREEN.HEIGHT - 200 - 108, 'bg-tower')
    .setOrigin(0);
  bgNeonGrid = this.add
    .sprite(0, SCREEN.HEIGHT - 108, 'bg-neon-grid')
    .setOrigin(0);
  this.anims.create({
    key: 'grid-start',
    frames: this.anims.generateFrameNumbers('bg-neon-grid', {
      start: 0,
      end: 1,
    }),
    frameRate: 2,
    repeat: 0,
  });
  layers[3].add([bgNeonBg, bgNeonGlow, bgSun, bgTower, bgNeonGrid]);
  layers[3].alpha = 0;

  // GAME OBJECTS -------------------------------------------------------------
  player = this.physics.add.sprite(32, 320, 'player').setOrigin(0);
  player.setCollideWorldBounds(true);
  this.anims.create({
    key: 'player-up',
    frames: this.anims.generateFrameNumbers('player', { start: 1, end: 0 }),
    frameRate: 10,
    repeat: 0,
  });
  this.anims.create({
    key: 'player-down',
    frames: this.anims.generateFrameNumbers('player', { start: 1, end: 2 }),
    frameRate: 10,
    repeat: 0,
  });

  text.pressEnter = this.add.text(360, 560, 'PRESS ENTER', {
    fontFamily: 'Common Pixel',
    fontSize: '32pt',
  });
  layers[5].add([player, text.pressEnter]);
  layers[5].alpha = 0;

  ballons[0] = this.physics.add
    .sprite(SCREEN.WIDTH, 400, 'balloon1')
    .setOrigin(0);
  ballons[1] = this.physics.add.sprite(1300, 500, 'balloon2').setOrigin(0);
  this.anims.create({
    key: 'balloon1-start',
    frames: this.anims.generateFrameNumbers('balloon1', { start: 0, end: 1 }),
    frameRate: 2,
    repeat: 0,
  });
  this.anims.create({
    key: 'balloon2-start',
    frames: this.anims.generateFrameNumbers('balloon2', { start: 1, end: 0 }),
    frameRate: 2,
    repeat: 0,
  });

  explosion = this.physics.add.sprite(0, 0, 'explosion').setOrigin(0);
  this.anims.create({
    key: 'explosion-start',
    frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 5 }),
    frameRate: 10,
    repeat: 0,
  });

  coin = this.physics.add.sprite(220, 220, 'coin').setOrigin(0);
  this.anims.create({
    key: 'coin-start',
    frames: this.anims.generateFrameNumbers('coin', { start: 0, end: 5 }),
    frameRate: 10,
    repeat: 0,
  });
  layers[4].add([...ballons, explosion, coin]);

  cursors = this.input.keyboard.createCursorKeys();
  keys = this.input.keyboard.addKeys({
    enter: 'enter',
  });
}

let blinkTimer;

function update(t, dt) {
  mainTimer += dt;

  explosion.anims.play('explosion-start', true);
  ballons[0].anims.play('balloon1-start', true);
  ballons[1].anims.play('balloon2-start', true);
  coin.anims.play('coin-start', true);

  // INTRO --------------------------------------------------------------------
  if (!isEnterPressed) {
    if (mainTimer < timings.bgAppear) {
      layers[1].alpha += getDeltaAlpha(timings.bgAppear);
      layers[2].alpha += getDeltaAlpha(timings.bgAppear);
    }

    if (mainTimer >= timings.bgAppear && mainTimer < timings.balloonsAppear) {
      if (layers[1].alpha !== 1) {
        layers[1].alpha = 1;
      }
      if (layers[2].alpha !== 1) {
        layers[2].alpha = 1;
      }

      ballons[0].x -= 3;
      ballons[0].y -= 2;

      ballons[1].x -= 4;
      ballons[1].y -= 2;
    }

    if (mainTimer >= timings.balloonsAppear) {
      if (!blinkTimer) {
        blinkTimer = setInterval(() => {
          layers[5].alpha = Number(!layers[5].alpha);
        }, 300);
      }

      if (keys.enter.isDown) {
        isEnterPressed = true;
        mainTimer = 0;
      }
    }
  }

  // THE GAME -----------------------------------------------------------------
  if (isEnterPressed) {
    clearInterval(blinkTimer);
    layers[5].alpha = 1;
    text.pressEnter.alpha = 0;

    // STAGE 1 ----------------------------------------------------------------
    if (mainTimer < timings.bgChange1) {
      if (bg.stage1[0].x <= -SCREEN.WIDTH) {
        bg.stage1[0].x = 0;
      }
      if (bg.stage1[1].x <= -SCREEN.WIDTH) {
        bg.stage1[1].x = 0;
      }
    }

    if (mainTimer < timings.bgChangeSpeed1) {
      bg.stage1[0].x -= speedSteps[0];
      bg.stage1[1].x -= speedSteps[1];
    }

    if (mainTimer >= timings.bgChangeSpeed1 && mainTimer < timings.bgChange1) {
      bg.stage1[0].x -= speedSteps[0] * 2;
      bg.stage1[1].x -= speedSteps[1] * 2;
    }

    // STAGE 2 ----------------------------------------------------------------
    if (mainTimer >= timings.bgChange1 && mainTimer < timings.bgChange2) {
      if (bg.stage2[0].x <= -SCREEN.WIDTH) {
        bg.stage2[0].x = 0;
      }
      if (bg.stage2[1].x <= -SCREEN.WIDTH) {
        bg.stage2[1].x = 0;
      }
      if (bg.stage1[0].x > -SCREEN.WIDTH * 2) {
        bg.stage1[0].x -= speedSteps[0] * 2;
        bg.stage2[0].x = bg.stage1[0].x + SCREEN.WIDTH * 2;
      } else {
        bg.stage2[0].x -= speedSteps[0] * 2;
      }
      if (bg.stage1[1].x > -SCREEN.WIDTH * 2) {
        bg.stage1[1].x -= speedSteps[1] * 2;
        bg.stage2[1].x = bg.stage1[1].x + SCREEN.WIDTH * 2;
      } else {
        bg.stage2[1].x -= speedSteps[1] * 2;
      }
    }

    // STAGE 3 ----------------------------------------------------------------
    if (mainTimer >= timings.bgChange2 && mainTimer < timings.bgChange3) {
      if (bg.stage3[0].x <= -SCREEN.WIDTH) {
        bg.stage3[0].x = 0;
      }
      if (bg.stage3[1].x <= -SCREEN.WIDTH) {
        bg.stage3[1].x = 0;
      }
      if (bg.stage2[0].x > -SCREEN.WIDTH * 2) {
        bg.stage2[0].x -= speedSteps[0] * 2;
        bg.stage3[0].x = bg.stage2[0].x + SCREEN.WIDTH * 2;
      } else {
        bg.stage3[0].x -= speedSteps[0] * 2;
      }
      if (bg.stage2[1].x > -SCREEN.WIDTH * 2) {
        bg.stage2[1].x -= speedSteps[1] * 2;
        bg.stage3[1].x = bg.stage2[1].x + SCREEN.WIDTH * 2;
      } else {
        bg.stage3[1].x -= speedSteps[1] * 2;
      }
    }

    // STAGE 4 ----------------------------------------------------------------
    if (mainTimer >= timings.bgChange3 && mainTimer < timings.bgChange4) {
      if (bg.stage4[0].x <= -SCREEN.WIDTH) {
        bg.stage4[0].x = 0;
      }
      if (bg.stage3[0].x > -SCREEN.WIDTH * 2) {
        bg.stage3[0].x -= speedSteps[0] * 2;
        bg.stage4[0].x = bg.stage3[0].x + SCREEN.WIDTH * 2;
      } else {
        bg.stage4[0].x -= speedSteps[0] * 2;
      }
      bg.stage3[1].x -= speedSteps[1] * 2;
      bg.stage3[1].alpha -= 0.005;
    }

    // STAGE 5 ----------------------------------------------------------------
    if (mainTimer >= timings.bgChange4 && mainTimer < timings.bgChange5) {
      layers[3].alpha += 0.0035;
      bgNeonGrid.anims.play('grid-start', true);
    }

    if (mainTimer > timings.bgChange5) {
      if (layers[3].alpha !== 1) {
        layers[3].alpha = 1;
      }
      bgNeonGrid.anims.play('grid-start', true);
    }

    if (mainTimer > timings.bgSunAppear) {
      if (bgNeonGlow.y >= 150) {
        bgNeonGlow.y -= 2;
      }
      if (bgSun.y >= 220) {
        bgSun.y -= 2;
      }
      // bgTower.x -= 3;
      // if (bgTower.x < 50) {
      //   bgTower.x = Math.random() * 300 + SCREEN.WIDTH;
      // }
    }

    if (cursors.up.isDown) {
      player.setVelocityY(-160);
      player.setVelocityX(0);
      player.anims.play('player-up', true);
    } else if (cursors.down.isDown) {
      // TODO add flight restriction!
      if (player.y <= 600) {
        player.setVelocityY(160);
        player.setVelocityX(0);
      }
      player.anims.play('player-down', true);
    } else {
      player.setVelocityX(0);
      player.setVelocityY(0);
    }
  }
}

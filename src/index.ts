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
let bgBlack;
const bg = {
  stage1: [],
  stage2: [],
  stage3: [],
  stage4: [],
  final: [],
};
let player;
const balloons = [];
const coins = [];
// TODO why undefined?
const captions = {
  pressEnter: undefined,
  lifes: undefined,
  score: undefined,
  grats: undefined,
  totalScore: undefined,
  gameOver: undefined,
};
let cursors;
let keys;
let mainTimer = 0;
const bgSpeedSteps = [1, 2]; // should be 1, 2, 4
let isEnterPressed = false;
let explosion;
let bgNeonGrid;
let bgNeonBg;
let bgNeonGlow;
let bgSun;
let bgTower;

const getDeltaAlpha = (t) => 1 / (t / 17);
const getRandomSpeedStep = (s) => Math.floor(Math.random() * s) + 1;
const getRandomOutOfBounds = (dx) => Math.floor(Math.random() * (dx + 1));
const getRandomAltitude = (y) => Math.floor(Math.random() * (y + 1));
const centerText = (textObject) =>
  (textObject.x = SCREEN.WIDTH / 2 - Math.floor(textObject.width / 2));

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
  playerOut: 95000,
  finalFade: 97000,
  totalScoreAppear: 100000,
};

let playerOrigins = {
  x: 24,
  y: 320,
};

const layers = [];
const layersCount = 10;

// LAYERS MAP
// 0 - white bg
// 1 - town bg
// 2
// 3 - neon bg
// 4 - balloons, coins, explosion
// 5 - player (need to be on separate layer cuz of death blinking)
// 6 - forest bg
// 7 - black bg
// 8 - captions
// 9

let blinkTimer;
const balloonsSpeedSteps = [getRandomSpeedStep(3), getRandomSpeedStep(3)];
const coinsSpeedSteps = [
  getRandomSpeedStep(3),
  getRandomSpeedStep(3),
  getRandomSpeedStep(3),
];

let isCollideblesRenew;
let isGameOver;

const gameData = {
  lifes: 3,
  score: 0,
};

const audio = {
  intro: undefined,
  mainTheme: undefined,
  gameOver: undefined,
  explosion: undefined,
  coinCollect: undefined,
};

function create() {
  const canvas = document.getElementsByTagName('canvas')[0];
  if (canvas) {
    const paddingXSize = Math.floor(
      (document.documentElement.clientWidth - SCREEN.WIDTH) / 2
    );
    const paddingYSize = Math.floor(
      (document.documentElement.clientHeight - SCREEN.HEIGHT) / 2
    );

    canvas.style.marginLeft = paddingXSize + 'px';
    canvas.style.marginRight = paddingXSize + 'px';
    canvas.style.marginTop = paddingYSize + 'px';
    canvas.style.marginBottom = paddingYSize + 'px';
  }

  // TODO why forEach doesnt work ???
  for (let i = 0; i < layersCount; i++) {
    layers[i] = this.add.layer();
    layers[i].setDepth(i);
  }

  audio.intro = this.sound.add('intro');
  audio.mainTheme = this.sound.add('main-theme');
  audio.gameOver = this.sound.add('game-over');
  audio.explosion = this.sound.add('explosion');
  audio.coinCollect = this.sound.add('coin-collect');

  // STAGE BACKGROUNDS --------------------------------------------------------
  bgWhite = this.add
    .tileSprite(0, 0, SCREEN.WIDTH, SCREEN.HEIGHT, 'bg-white')
    .setOrigin(0);
  layers[0].add([bgWhite]);
  bgBlack = this.add
    .tileSprite(0, 0, SCREEN.WIDTH, SCREEN.HEIGHT, 'bg-black')
    .setOrigin(0);
  layers[7].add([bgBlack]);
  layers[7].alpha = 0;

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
  layers[6].add([bg.stage1[1], bg.stage2[1], bg.stage3[1]]);
  layers[1].alpha = 0;
  layers[6].alpha = 0;

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
  player = this.physics.add
    .sprite(playerOrigins.x, playerOrigins.y, 'player')
    .setOrigin(0);
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
  layers[5].add([player]);
  layers[5].alpha = 0;

  balloons[0] = this.physics.add
    .sprite(SCREEN.WIDTH, 400, 'balloon')
    .setOrigin(0);
  balloons[1] = this.physics.add.sprite(1300, 500, 'balloon').setOrigin(0);
  this.anims.create({
    key: 'balloon1-start',
    frames: this.anims.generateFrameNumbers('balloon', { start: 0, end: 1 }),
    frameRate: 2,
    repeat: 0,
  });
  this.anims.create({
    key: 'balloon2-start',
    frames: this.anims.generateFrameNumbers('balloon', { start: 1, end: 0 }),
    frameRate: 2,
    repeat: 0,
  });

  coins[0] = this.physics.add
    .sprite(
      SCREEN.WIDTH + getRandomOutOfBounds(600),
      getRandomAltitude(500),
      'coin'
    )
    .setOrigin(0);
  this.anims.create({
    key: 'coin1-start',
    frames: this.anims.generateFrameNumbers('coin', { start: 0, end: 5 }),
    frameRate: 10,
    repeat: 0,
  });
  coins[1] = this.physics.add
    .sprite(
      SCREEN.WIDTH + getRandomOutOfBounds(600),
      getRandomAltitude(500),
      'coin'
    )
    .setOrigin(0);
  this.anims.create({
    key: 'coin2-start',
    frames: this.anims.generateFrameNumbers('coin', { start: 0, end: 5 }),
    frameRate: 10,
    repeat: 0,
  });
  coins[2] = this.physics.add
    .sprite(
      SCREEN.WIDTH + getRandomOutOfBounds(600),
      getRandomAltitude(500),
      'coin'
    )
    .setOrigin(0);
  this.anims.create({
    key: 'coin3-start',
    frames: this.anims.generateFrameNumbers('coin', { start: 0, end: 5 }),
    frameRate: 10,
    repeat: 0,
  });

  explosion = this.physics.add.sprite(0, -120, 'explosion').setOrigin(0);
  this.anims.create({
    key: 'explosion-start',
    frames: this.anims.generateFrameNumbers('explosion', { start: 0, end: 6 }),
    frameRate: 10,
    repeat: 0,
  });
  layers[4].add([...balloons, ...coins, explosion]);

  const scene = this;
  // @ts-ignore:next-line
  WebFont.load({
    custom: {
      families: ['Common Pixel'],
    },
    active: function () {
      captions.pressEnter = scene.add.text(0, 560, 'PRESS ENTER', {
        fontFamily: 'Common Pixel',
        fontSize: '32pt',
      });
      centerText(captions.pressEnter);
      captions.lifes = scene.add.text(24, 16, 'LIFES x 3', {
        fontFamily: 'Common Pixel',
        fontSize: '16pt',
      });
      captions.score = scene.add.text(880, 16, 'COINS x 0', {
        fontFamily: 'Common Pixel',
        fontSize: '16pt',
      });
      captions.grats = scene.add.text(0, 300, 'GRATS!', {
        fontFamily: 'Common Pixel',
        fontSize: '32pt',
      });
      centerText(captions.grats);
      captions.totalScore = scene.add.text(0, 400, 'COINS COLLECTED x 99', {
        fontFamily: 'Common Pixel',
        fontSize: '24pt',
      });
      centerText(captions.totalScore);
      captions.gameOver = scene.add.text(0, 360, 'GAME OVER', {
        fontFamily: 'Common Pixel',
        fontSize: '32pt',
      });
      centerText(captions.gameOver);
      layers[8].add([
        captions.pressEnter,
        captions.lifes,
        captions.score,
        captions.grats,
        captions.totalScore,
        captions.gameOver,
      ]);
      captions.pressEnter.alpha = 0;
      captions.lifes.alpha = 0;
      captions.score.alpha = 0;
      captions.grats.alpha = 0;
      captions.totalScore.alpha = 0;
      captions.gameOver.alpha = 0;
    },
  });

  cursors = this.input.keyboard.createCursorKeys();
  keys = this.input.keyboard.addKeys({
    enter: 'enter',
  });

  this.physics.add.overlap(player, coins[0], collectCoin1, null, this);
  this.physics.add.overlap(player, coins[1], collectCoin2, null, this);
  this.physics.add.overlap(player, coins[2], collectCoin3, null, this);
  this.physics.add.overlap(player, balloons[0], collideBalloon1, null, this);
  this.physics.add.overlap(player, balloons[1], collideBalloon2, null, this);
}

const coinOverlapShift = 16;

// when player is blinking he is uncontrollable and uncollidable
let isUncontrollable = false;

function collectCoinMixin() {
  audio.coinCollect.play({
    volume: 0.1,
  });
  gameData.score += 1;
  captions.score.setText('COINS x ' + gameData.score);
}

function collectCoin1() {
  if (
    Math.abs(player.x - coins[0].x) <= coinOverlapShift &&
    !isUncontrollable
  ) {
    coins[0].x = -48;
    collectCoinMixin();
  }
}
function collectCoin2() {
  if (
    Math.abs(player.x - coins[1].x) <= coinOverlapShift &&
    !isUncontrollable
  ) {
    coins[1].x = -48;
    collectCoinMixin();
  }
}
function collectCoin3() {
  if (
    Math.abs(player.x - coins[2].x) <= coinOverlapShift &&
    !isUncontrollable
  ) {
    coins[2].x = -48;
    collectCoinMixin();
  }
}

let deathBlinkInterval;
let deathBlinkTimeout;

const balloonOverlapShift = 16;

function collideBalloonMixin() {
  audio.explosion.play({
    volume: 0.4,
  });

  if (gameData.lifes == 1) {
    isGameOver = true;
  } else {
    isUncontrollable = true;

    gameData.lifes -= 1;
    captions.lifes.setText('LIFES x ' + gameData.lifes);

    player.x = playerOrigins.x;
    player.y = playerOrigins.y;

    if (deathBlinkInterval) {
      clearInterval(deathBlinkInterval);
    }
    deathBlinkInterval = setInterval(() => {
      player.alpha = Number(!player.alpha);
    }, 200);

    if (deathBlinkTimeout) {
      clearTimeout(deathBlinkTimeout);
    }
    deathBlinkTimeout = setInterval(() => {
      clearInterval(deathBlinkInterval);
      player.alpha = 1;
      isUncontrollable = false;
    }, 1600);
  }

  explosion.anims.play('explosion-start', true);
}

function collideBalloon1() {
  if (
    Math.abs(player.x - balloons[0].x) <= balloonOverlapShift &&
    !isUncontrollable
  ) {
    explosion.x = balloons[0].x - 30;
    explosion.y = balloons[0].y;
    balloons[0].x = -70;
    collideBalloonMixin();
  }
}
function collideBalloon2() {
  if (
    Math.abs(player.x - balloons[1].x) <= balloonOverlapShift &&
    !isUncontrollable
  ) {
    explosion.x = balloons[1].x - 30;
    explosion.y = balloons[1].y;
    balloons[1].x = -70;
    collideBalloonMixin();
  }
}

function update(t, dt) {
  mainTimer += dt;
  isCollideblesRenew = true;

  bgNeonGrid.anims.play('grid-start', true);
  balloons[0].anims.play('balloon1-start', true);
  balloons[1].anims.play('balloon2-start', true);
  coins[0].anims.play('coin1-start', true);
  coins[1].anims.play('coin2-start', true);
  coins[2].anims.play('coin3-start', true);

  // INTRO --------------------------------------------------------------------
  if (!isEnterPressed) {
    // TODO it works unstable
    // if (!audio.intro.isPlaying && mainTimer < timings.bgAppear / 2) {
    //   audio.intro.play({
    //     volume: 0.2,
    //   });
    // }

    if (mainTimer < timings.bgAppear) {
      layers[1].alpha += getDeltaAlpha(timings.bgAppear);
      layers[6].alpha += getDeltaAlpha(timings.bgAppear);
    }

    if (mainTimer >= timings.bgAppear && mainTimer < timings.balloonsAppear) {
      if (layers[1].alpha !== 1) {
        layers[1].alpha = 1;
      }
      if (layers[6].alpha !== 1) {
        layers[6].alpha = 1;
      }

      balloons[0].x -= 3;
      balloons[0].y -= 2;

      balloons[1].x -= 4;
      balloons[1].y -= 2;
    }

    if (mainTimer >= timings.balloonsAppear) {
      if (!blinkTimer) {
        blinkTimer = setInterval(() => {
          layers[5].alpha = Number(!layers[5].alpha);
          // font load issue
          if (captions.pressEnter) {
            captions.pressEnter.alpha = Number(!captions.pressEnter.alpha);
          }
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

    if (!audio.mainTheme.isPlaying) {
      audio.mainTheme.play({
        volume: 0.2,
      });
    }

    if (mainTimer < timings.playerOut) {
      layers[5].alpha = 1;

      // font load issue
      if (captions.pressEnter) {
        captions.pressEnter.alpha = 0;
      }
      if (!isGameOver) {
        // font load issue
        if (captions.lifes) {
          captions.lifes.alpha = 1;
        }
        if (captions.score) {
          captions.score.alpha = 1;
        }
      }
    }

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
      bg.stage1[0].x -= bgSpeedSteps[0];
      bg.stage1[1].x -= bgSpeedSteps[1];
    }

    if (mainTimer >= timings.bgChangeSpeed1 && mainTimer < timings.bgChange1) {
      bg.stage1[0].x -= bgSpeedSteps[0] * 2;
      bg.stage1[1].x -= bgSpeedSteps[1] * 2;
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
        bg.stage1[0].x -= bgSpeedSteps[0] * 2;
        bg.stage2[0].x = bg.stage1[0].x + SCREEN.WIDTH * 2;
      } else {
        bg.stage2[0].x -= bgSpeedSteps[0] * 2;
      }
      if (bg.stage1[1].x > -SCREEN.WIDTH * 2) {
        bg.stage1[1].x -= bgSpeedSteps[1] * 2;
        bg.stage2[1].x = bg.stage1[1].x + SCREEN.WIDTH * 2;
      } else {
        bg.stage2[1].x -= bgSpeedSteps[1] * 2;
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
        bg.stage2[0].x -= bgSpeedSteps[0] * 2;
        bg.stage3[0].x = bg.stage2[0].x + SCREEN.WIDTH * 2;
      } else {
        bg.stage3[0].x -= bgSpeedSteps[0] * 2;
      }
      if (bg.stage2[1].x > -SCREEN.WIDTH * 2) {
        bg.stage2[1].x -= bgSpeedSteps[1] * 2;
        bg.stage3[1].x = bg.stage2[1].x + SCREEN.WIDTH * 2;
      } else {
        bg.stage3[1].x -= bgSpeedSteps[1] * 2;
      }
    }

    // STAGE 4 ----------------------------------------------------------------
    if (mainTimer >= timings.bgChange3 && mainTimer < timings.bgChange4) {
      if (bg.stage4[0].x <= -SCREEN.WIDTH) {
        bg.stage4[0].x = 0;
      }
      if (bg.stage3[0].x > -SCREEN.WIDTH * 2) {
        bg.stage3[0].x -= bgSpeedSteps[0] * 2;
        bg.stage4[0].x = bg.stage3[0].x + SCREEN.WIDTH * 2;
      } else {
        bg.stage4[0].x -= bgSpeedSteps[0] * 2;
      }
      bg.stage3[1].x -= bgSpeedSteps[1] * 2;
      bg.stage3[1].alpha -= 0.005;
    }

    // STAGE 5 ----------------------------------------------------------------
    if (mainTimer >= timings.bgChange4 && mainTimer < timings.bgChange5) {
      layers[3].alpha += 0.0035;
    }

    if (mainTimer >= timings.bgChange5) {
      if (layers[3].alpha !== 1) {
        layers[3].alpha = 1;
      }
    }

    if (mainTimer >= timings.bgSunAppear) {
      if (bgNeonGlow.y >= 150) {
        bgNeonGlow.y -= 2;
      }
      if (bgSun.y >= 220) {
        bgSun.y -= 2;
      }

      isCollideblesRenew = false;
      // bgTower.x -= 3;
      // if (bgTower.x < 50) {
      //   bgTower.x = Math.random() * 300 + SCREEN.WIDTH;
      // }
    }

    if (mainTimer >= timings.playerOut) {
      isUncontrollable = true;
      captions.lifes.alpha -= 0.005;
      captions.score.alpha -= 0.005;
      player.x += 10;
      if (player.x >= 800) {
        layers[5].alpha -= 0.05;
      }
    }

    if (mainTimer >= timings.finalFade) {
      layers[7].alpha += 0.005;
    }

    if (mainTimer >= timings.totalScoreAppear) {
      captions.grats.setText('GRATS!');
      captions.totalScore.setText('COINS COLLECTED ' + gameData.score);
      captions.grats.alpha += 0.005;
      captions.totalScore.alpha += 0.005;
    }

    if (isGameOver) {
      audio.mainTheme.stop();
      if (!audio.gameOver.isPlaying) {
        audio.gameOver.play({
          volume: 0.2,
        });
      }

      isUncontrollable = true;
      layers[7].alpha += 0.05;
      captions.gameOver.alpha += 0.005;
      captions.lifes.alpha -= 0.05;
      captions.score.alpha -= 0.05;
    }

    // BALLOONS ---------------------------------------------------------------
    balloons[0].x -= balloonsSpeedSteps[0];
    balloons[1].x -= balloonsSpeedSteps[1];

    if (balloons[0].x < -70 && isCollideblesRenew) {
      balloons[0].x = SCREEN.WIDTH + getRandomOutOfBounds(300);
      balloons[0].y = getRandomAltitude(500);
      balloonsSpeedSteps[0] = getRandomSpeedStep(3);
      if (mainTimer >= timings.bgChangeSpeed1) {
        balloonsSpeedSteps[0] = getRandomSpeedStep(3) * 2;
      }
    }
    if (balloons[1].x < -70 && isCollideblesRenew) {
      balloons[1].x = SCREEN.WIDTH + getRandomOutOfBounds(300);
      balloons[1].y = getRandomAltitude(500);
      balloonsSpeedSteps[1] = getRandomSpeedStep(3);
      if (mainTimer >= timings.bgChangeSpeed1) {
        balloonsSpeedSteps[1] = getRandomSpeedStep(3) * 2;
      }
    }

    // COINS ------------------------------------------------------------------
    coins[0].x -= coinsSpeedSteps[0];
    coins[1].x -= coinsSpeedSteps[1];
    coins[2].x -= coinsSpeedSteps[2];

    if (coins[0].x < -48 && isCollideblesRenew) {
      coins[0].x = SCREEN.WIDTH + getRandomOutOfBounds(600);
      coins[0].y = getRandomAltitude(500);
      coinsSpeedSteps[0] = getRandomSpeedStep(2);
      if (mainTimer >= timings.bgChangeSpeed1) {
        coinsSpeedSteps[0] = getRandomSpeedStep(2) * 2;
      }
    }
    if (coins[1].x < -48 && isCollideblesRenew) {
      coins[1].x = SCREEN.WIDTH + getRandomOutOfBounds(600);
      coins[1].y = getRandomAltitude(500);
      coinsSpeedSteps[0] = getRandomSpeedStep(2);
      if (mainTimer >= timings.bgChangeSpeed1) {
        coinsSpeedSteps[1] = getRandomSpeedStep(2) * 2;
      }
    }
    if (coins[1].x < -48 && isCollideblesRenew) {
      coins[1].x = SCREEN.WIDTH + getRandomOutOfBounds(600);
      coins[1].y = getRandomAltitude(500);
      coinsSpeedSteps[0] = getRandomSpeedStep(2);
      if (mainTimer >= timings.bgChangeSpeed1) {
        coinsSpeedSteps[1] = getRandomSpeedStep(2) * 2;
      }
    }

    if (cursors.up.isDown && !isUncontrollable) {
      player.setVelocityY(-160);
      player.setVelocityX(0);
      player.anims.play('player-up', true);
    } else if (cursors.down.isDown && !isUncontrollable) {
      if (player.y < 600) {
        player.setVelocityY(160);
        player.setVelocityX(0);
      } else {
        player.setVelocityY(0);
        player.setVelocityX(0);
      }
      player.anims.play('player-down', true);
    } else if (cursors.left.isDown && !isUncontrollable) {
      player.setVelocityY(0);
      player.setVelocityX(-220);
      player.anims.play('player-up', true);
    } else if (cursors.right.isDown && !isUncontrollable) {
      if (player.x < 700) {
        player.setVelocityY(0);
        player.setVelocityX(180);
      } else {
        player.setVelocityY(0);
        player.setVelocityX(0);
      }
      player.anims.play('player-down', true);
    } else {
      player.setVelocityY(0);
      player.setVelocityX(0);
    }
  }
}

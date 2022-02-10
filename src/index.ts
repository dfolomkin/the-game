import * as Phaser from 'phaser';

const imgPath = './img';
const IMG = {
  BG_WHITE: `${imgPath}/bg-white.svg`,
  BALLOON: `${imgPath}/balloon.png`,
  PLAYER: `${imgPath}/player-pig.png`,
  BG_S1_L1: `${imgPath}/bg-winter-l1.png`,
  BG_S1_L2: `${imgPath}/bg-winter-l2.png`,
};

const config = {
  type: Phaser.AUTO,
  width: 1024,
  height: 768,
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
  final: [],
};
let ballons = [];
let player;
let text = { pressEnter: undefined };
let cursors;
let keys;
let mainTimer = 0;
let speedSteps = [2, 1];
let isEnterPressed = false;

const getDeltaAlpha = (t) => 1 / (t / 17);

const timings = {
  bgAppear: 2000,
  balloonsAppear: 4000,
  bgChangeSpeed1: 16000,
  bgChange1: 30000,
  bgChange2: 36000,
};
const layers = [];

function preload() {
  this.load.image('bg-s1-l1', IMG.BG_S1_L1);
  this.load.image('bg-s1-l2', IMG.BG_S1_L2);
  this.load.image('bg-white', IMG.BG_WHITE);
  this.load.spritesheet('player', IMG.PLAYER, {
    frameWidth: 80,
    frameHeight: 64,
  });
  this.load.spritesheet('balloon1', IMG.BALLOON, {
    frameWidth: 70,
    frameHeight: 100,
  });
  this.load.spritesheet('balloon2', IMG.BALLOON, {
    frameWidth: 70,
    frameHeight: 100,
  });
}

function create() {
  // console.log(this, game);

  // forEach doesnt work ???
  for (let i = 0; i < 3; i++) {
    layers[i] = this.add.layer();
    layers[i].setDepth(i);
  }

  bgWhite = this.add.tileSprite(0, 0, 1048, 768, 'bg-white').setOrigin(0);
  layers[0].add([bgWhite]);
  bg.stage1[0] = this.add.tileSprite(0, 0, 2048, 768, 'bg-s1-l1').setOrigin(0);
  bg.stage1[1] = this.add.tileSprite(0, 0, 2048, 768, 'bg-s1-l2').setOrigin(0);
  layers[1].add([bg.stage1[0], bg.stage1[1]]);
  layers[1].alpha = 0;

  ballons[0] = this.physics.add.sprite(1024, 400, 'balloon1').setOrigin(0);
  ballons[1] = this.physics.add.sprite(1300, 500, 'balloon2').setOrigin(0);
  layers[1].add([...ballons]);

  player = this.physics.add.sprite(32, 320, 'player').setOrigin(0);
  player.setCollideWorldBounds(true);
  text.pressEnter = this.add.text(360, 560, 'PRESS ENTER', {
    fontFamily: 'Common Pixel',
    fontSize: '32pt',
  });
  layers[2].add([player, text.pressEnter]);
  layers[2].alpha = 0;

  cursors = this.input.keyboard.createCursorKeys();
  keys = this.input.keyboard.addKeys({
    enter: 'enter',
  });
}

let blinkTimer;

function update(t, dt) {
  mainTimer += dt;
  // console.log(mainTimer);

  if (mainTimer < timings.bgAppear) {
    layers[1].alpha += getDeltaAlpha(timings.bgAppear);
  }

  if (mainTimer >= timings.bgAppear && mainTimer < timings.balloonsAppear) {
    if (layers[1].alpha !== 1) {
      layers[1].alpha = 1;
    }
    ballons[0].x -= 3;
    ballons[0].y -= 2;

    ballons[1].x -= 4;
    ballons[1].y -= 2;
  }

  if (mainTimer >= timings.balloonsAppear) {
    if (!blinkTimer) {
      blinkTimer = setInterval(() => {
        layers[2].alpha = Number(!layers[2].alpha);
      }, 300);
    }

    if (keys.enter.isDown) {
      isEnterPressed = true;
    }
  }

  if (isEnterPressed) {
    clearInterval(blinkTimer);
    layers[2].alpha = 1;
    text.pressEnter.alpha = 0;

    if (bg.stage1[0].x <= -1024) {
      bg.stage1[0].x = 0;
    }
    if (bg.stage1[1].x <= -1024) {
      bg.stage1[1].x = 0;
    }

    if (mainTimer <= timings.bgChangeSpeed1) {
      bg.stage1[0].x -= speedSteps[0];
      bg.stage1[1].x -= speedSteps[1];
    } else {
      bg.stage1[0].x -= speedSteps[0] * 2;
      bg.stage1[1].x -= speedSteps[1] * 2;
    }

    if (cursors.left.isDown) {
      player.setVelocityX(-160);
      player.setVelocityY(0);
      // player.anims.play('left', true);
    } else if (cursors.right.isDown) {
      player.setVelocityX(160);
      player.setVelocityY(0);
      // player.anims.play('right', true);
    } else if (cursors.up.isDown) {
      player.setVelocityY(-160);
      player.setVelocityX(0);
    } else if (cursors.down.isDown) {
      player.setVelocityY(160);
      player.setVelocityX(0);
    } else {
      player.setVelocityX(0);
      player.setVelocityY(0);
      // player.anims.play('turn');
    }
  }
}

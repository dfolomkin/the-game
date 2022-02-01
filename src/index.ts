import * as Phaser from 'phaser';

const imgPath = './img';

var config = {
  type: Phaser.AUTO,
  width: 900,
  height: 600,
  useTicker: true,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: {},
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

var game = new Phaser.Game(config as Phaser.Types.Core.GameConfig);
var cursors;
var player;
var bg;
let projectile;
let fire;

function preload() {
  this.load.image('bg', `${imgPath}/winter_bg.svg`);
  this.load.spritesheet('player', `${imgPath}/player.svg`, {
    frameWidth: 50,
    frameHeight: 50,
  });
  this.load.spritesheet('projectile', `${imgPath}/projectile.svg`, {
    frameWidth: 80,
    frameHeight: 8,
  });
}

function create() {
  console.log(this, game);
  this.physics.world.setBounds(-25, -25, 600, 600);
  bg = this.add.tileSprite(0, -300, 1350, 900, 'bg').setOrigin(0);
  // this.add.text(16, 16, 'score: 0', {
  //   fontSize: '32px',
  //   fill: '#000',
  // });

  // this.add.image(0, 275, 'player').setOrigin(0);
  player = this.physics.add.sprite(0, 275, 'player').setOrigin(0);
  player.setCollideWorldBounds(true);

  // this.cameras.main.setBounds(0, 0, 400, 400);
  // this.cameras.main.setAlpha(10);
  // this.cameras.main.useBounds = true;

  // this.cameras.main.startFollow(player);

  cursors = this.input.keyboard.createCursorKeys();
  // fire = this.input.keyboard.keyCode(32);
}

function update(t, dt) {
  if (bg.x === -450) {
    // bg = this.add.tileSprite(0, -300, 1350, 900, 'bg').setOrigin(0);
    bg.x = 0;
    console.log(t, dt);
  }
  // console.log(this.sys.game.loop.time.toString(), t);
  bg.x -= 1;
  // player.x += 1;
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
  // if (fire.isDown) {
  //   console.log('FIRE');
  // }
}

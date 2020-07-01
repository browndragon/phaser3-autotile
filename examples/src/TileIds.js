import Phaser from 'phaser';

/** Load the assets. */
import BlockI from './block.png';
import CornerI from './corner.png';
import EdgeI from './edge.png';
import RawBlobI from './rawblob.png';

import Autotile from 'phaser3-autotile';

const {Ids, Subtiles, Textures, Tilesets} = Autotile;

var config = {
  type: Phaser.WEBGL,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  parent: 'phaser-example',
  pixelArt: true,
  debug: true,
  scene: {
    preload: preload,
    create: create,
    update: update,
  }
};

var game = new Phaser.Game(config);  // eslint-disable-line no-unused-vars
var camControl;


function preload() {
  const assetSize = {frameWidth: 16, frameHeight: 16};
  this.load.spritesheet('block', BlockI, assetSize);
  this.load.spritesheet('corner', CornerI, assetSize);
  this.load.spritesheet('edge', EdgeI, assetSize);
  this.load.spritesheet('rawblob', RawBlobI, assetSize);
}

function create() {
  const subtiles = Subtiles.RpgMakerFormatFromGeometry({
    tileWidth: 16,
    tileHeight: 16,
  });
  Textures.CreateBlobTexture({
    key: 'blob',
    rawTexture: 'rawblob',
    tm: this.textures,
    subtiles: subtiles, 
  });

  this.add.text(16, 16, 'The frames of the various tile parts:', {
    fontSize: '18px',
    fill: '#ffffff'
  }); 

  {
    let xOffset = 16;
    const yOffset = 48;
    for (let img of ['block', 'corner', 'edge', 'rawblob', 'blob']) {
      this.anims.create({
        key: `anim_${img}`,
        frames: this.anims.generateFrameNumbers(
          img,
          {
            start: 0,
            end: -1
          }
        ),
        frameRate: 4,
        repeat: -1,
      });
      let newSprite = this.add.sprite(xOffset, yOffset, img);
      newSprite.play(`anim_${img}`);
      xOffset += 32;
    }
  }
  this.add.text(16, 80, 'More detail on the generated blob tileset:', {
    fontSize: '18px',
    fill: '#ffffff'
  });
  {
    for (let ty = 0; ty < 16; ++ty) {
      for (let tx = 0; tx < 16; ++tx) {
        const rawWangId = ty*16 + tx;
        const wangId = Ids.Blob.project(rawWangId);
        const [x, y] = [tx * 80 + 32, ty * 80 + 128];
        const tileId = Tilesets.Patterns.LITERAL_BLOB[wangId];
        let newSprite = this.add.sprite(x, y, 'blob', tileId);
        newSprite.originX = 0;
        newSprite.originY = 0;
        newSprite.setScale(4);
        this.add.text(x-8, y-8, `R:${rawWangId}/\nW:${wangId}`, {
          fontSize: '12px',
          fill: '#ff0000'
        });
        this.add.text(x-8, y+16, `T:${tileId}`, {
          fontSize: '12px',
          fill: '#00ff00'
        });                
      }
    }        
  }

  var cursors = this.input.keyboard.createCursorKeys();
  camControl = new Phaser.Cameras.Controls.FixedKeyControl({
    camera: this.cameras.main,
    left: cursors.left,
    right: cursors.right,
    up: cursors.up,
    down: cursors.down,
    speed: 1.0,
  });
}

function update (time, delta)
{
  camControl.update(delta);
}
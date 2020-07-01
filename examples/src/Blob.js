import Phaser from 'phaser';

/** Load the assets. */
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

  this.add.text(16, 16, 'Raw:', {
    fontSize: '18px',
    fill: '#ffffff'
  });
  {
    let img = this.add.image(16, 32, 'rawblob', '__BASE');
    img.setOrigin(0, 0);
  }
  this.add.text(16, 128, 'Generated:', {
    fontSize: '18px',
    fill: '#ffffff'
  }); 
  {
    let img = this.add.image(16, 144, 'blob', '__BASE');
    img.setOrigin(0, 0);
  }

  let [xmin, ymin] = [256, 16];
  {
    let [x, y] = [xmin, ymin];
    this.add.text(x, y, 'Basis:', {
      fontSize: '18px',
      fill: '#ffffff'
    });
    y += 16;
    for (const [_index, frame] of Object.entries(this.textures.get('rawblob').frames)) {
      let img = this.add.image(x, y, frame.texture.key, frame.name);
      img.setScale(2);
      img.setOrigin(0, 0);
      this.add.text(x+2, y+2, `T:${frame.name}`, {
        fontSize: '12px',
        fill: '#A0A000'
      });
      x += 48;
    }
  }
  ymin = 128;
  {
    let [x, y] = [xmin, ymin];
    this.add.text(x, y, 'Per Corner:', {
      fontSize: '18px',
      fill: '#ffffff'
    });
    y += 16;
    for (const corner of [Ids.NE, Ids.SE, Ids.SW, Ids.NW]) {
      this.add.text(x, y, `Corner: ${corner}`, {
        fontSize: '12px',
        fill: '#ffffff'
      });
      y += 16;
      for (const [wangIdStr, tileId] of Object.entries(subtiles.subtiles[corner])) {
        let img = this.add.image(x, y, 'blob', tileId);
        img.setScale(2);
        img.setOrigin(0, 0);
        this.add.text(x+2, y+2, `W:${wangIdStr}`, {
          fontSize: '12px',
          fill: '#A0A000'
        });
        x += 64;
      }
      y += 32;
      x = xmin; 
    }
    ymin = y + 32;
  }


  this.add.text(xmin, ymin, 'By Component:', {
    fontSize: '18px',
    fill: '#ffffff'
  });
  const [xminf, yminf] = [xmin, ymin];
  for (const [wangIdStr, tileId] of Object.entries(Tilesets.Patterns.LITERAL_BLOB)) {
    const wangId = +wangIdStr;
    const [xmin, ymin] = [xminf + 128 * (tileId % 8), yminf + 32 + 64 * Math.floor(tileId / 8)];
    let [x, y] = [xmin, ymin];
    this.add.text(x, y, `Wang:${wangId} Tile:${tileId}`, {
      fontSize: '12px',
      fill: '#ffffff',
    });
    y += 16;
    {
      let img = this.add.image(x, y, 'blob', tileId);
      img.setOrigin(0, 0);
    }
    x += 32;
    let subx = x;
    const corners = [[Ids.NW, Ids.NE], [Ids.SW, Ids.SE]];
    for (const row of corners) {
      for (const cell of row) {
        const subWangId = Ids.Subtile[cell].project(wangId);
        const tileId = subtiles.tileId(subWangId, cell);
        let img = this.add.image(subx, y, 'blob', tileId);
        img.setOrigin(0, 0);
        this.add.text(subx + 2, y + 2, `[${tileId}]`, {
          fontSize: '10px',
          fill: '#A0A000'
        });
        subx += 24;
      }
      y += 24;
      subx = x;
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

function update (time, delta)  // eslint-disable-line no-unused-vars
{
  camControl.update(delta);
}

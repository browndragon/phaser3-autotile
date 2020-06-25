import Phaser, { Game, Scene } from 'phaser';

/** Load the assets. */
import BlockI from "./block.png";
import CornerI from "./corner.png";
import EdgeI from "./edge.png";
import RawBlobI from "./rawblob.png";

import Autotile from "phaser3-autotile";

const {Id, Grid, BlobIndexer} = Autotile;

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

var game = new Phaser.Game(config);
var camControl;


function preload() {
    const assetSize = {frameWidth: 16, frameHeight: 16};
    this.load.spritesheet('block', BlockI, assetSize);
    this.load.spritesheet('corner', CornerI, assetSize);
    this.load.spritesheet('edge', EdgeI, assetSize);
    this.load.spritesheet('rawblob', RawBlobI, assetSize);
}

function create() {
    let blobIndexer = new BlobIndexer({
        bases: {
            [Id.NN | Id.EE | Id.SS | Id.WW]: this.textures.get("rawblob").get(1),
            [Id.EE | Id.SE | Id.SS]: this.textures.get("rawblob").get(2),
            [Id.SS | Id.SW | Id.WW]: this.textures.get("rawblob").get(3),
            [Id.NN | Id.NE | Id.EE]: this.textures.get("rawblob").get(4),
            [Id.NN | Id.WW | Id.NW]: this.textures.get("rawblob").get(5),
        }
    });
    let blobTileset = blobIndexer.toTileset({
      tilesetName: "blob",
      tm: this.textures,
      firstgid: 0,
      subtiles: {
        tileWidth: 16,
        tileHeight: 16,
      },
    });

    var help = this.add.text(16, 16, "The frames of the various tile parts:", {
        fontSize: '18px',
        fill: '#ffffff'
    }); 

    {
        let xOffset = 16;
        const yOffset = 48;
        for (let img of ["block", "corner", "edge", "rawblob", "blob"]) {
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
    var help = this.add.text(16, 80, "More detail on the generated blob tileset:", {
        fontSize: '18px',
        fill: '#ffffff'
    });
    {
        for (let ty = 0; ty < 16; ++ty) {
            for (let tx = 0; tx < 16; ++tx) {
                const rawWangId = ty*16 + tx;
                const wangId = Id.toBlob(rawWangId);
                const [x, y] = [tx * 80 + 32, ty * 80 + 128];
                const tileId = blobIndexer.toTiler(0)(wangId);
                // Cheat a little: don't bother *using* the resultant tileset,
                // just the image + its frames.
                let newSprite = this.add.sprite(x, y, "blob", tileId);
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
import Phaser, { Game, Scene } from 'phaser';

/** Load the assets. */
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

    this.add.text(16, 16, "Raw:", {
        fontSize: '18px',
        fill: '#ffffff'
    });
    {
        let img = this.add.image(16, 32, "rawblob", '__BASE');
        img.setOrigin(0, 0);
    }
    this.add.text(16, 128, "Generated:", {
        fontSize: '18px',
        fill: '#ffffff'
    }); 
    {
        let img = this.add.image(16, 144, "blob", '__BASE');
        img.setOrigin(0, 0);
    }

    let [xmin, ymin] = [256, 16];
    {
        let [x, y] = [xmin, ymin];
        this.add.text(x, y, "Basis:", {
            fontSize: '18px',
            fill: '#ffffff'
        });
        y += 16;
        for (const [base, tile] of Object.entries(blobIndexer.originalTiles)) {
            let img = this.add.image(x, y, tile.texture.key, tile.name);
            img.setScale(2);
            img.setOrigin(0, 0);
            this.add.text(x+2, y+2, `T:${tile.name}\nW:${base}`, {
                fontSize: '12px',
                fill: '#A0A000'
            });
            x += 48;
        }
    }
    ymin = 128;
    {
        let [x, y] = [xmin, ymin];
        this.add.text(x, y, "Per Corner:", {
            fontSize: '18px',
            fill: '#ffffff'
        });
        y += 16;
        for (const corner of [Id.NE, Id.SE, Id.SW, Id.NW]) {
            this.add.text(x, y, `Corner: ${corner}`, {
                fontSize: '12px',
                fill: '#ffffff'
            });
            y += 16;
            for (const [wangId, tile] of Object.entries(blobIndexer.subtiles[corner])) {
                let img = this.add.image(x, y, tile.texture.key, tile.name);
                img.setScale(2);
                img.setOrigin(0, 0);
                this.add.text(x+2, y+2, `W:${wangId}`, {
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


    this.add.text(xmin, ymin, "By Component:", {
        fontSize: '18px',
        fill: '#ffffff'
    });
    const [xminf, yminf] = [xmin, ymin];
    for (const [wangIdStr, tileId] of Object.entries(Id.LITERAL_BLOB_PATTERN)) {
        const wangId = +wangIdStr;
        const [xmin, ymin] = [xminf + 128 * (tileId % 8), yminf + 32 + 64 * Math.floor(tileId / 8)];
        let [x, y] = [xmin, ymin];
        this.add.text(x, y, `Wang:${wangId} Tile:${tileId}`, {
            fontSize: '12px',
            fill: '#ffffff',
        });
        y += 16;
        {
            let img = this.add.image(x, y, "blob", tileId);
            img.setOrigin(0, 0);
        }
        x += 32;
        let subx = x;
        const corners = [[Id.NW, Id.NE], [Id.SW, Id.SE]];
        for (const row of corners) {
            for (const cell of row) {
                const subWangId = blobIndexer.getSubtileWangId(wangId, cell);
                const subTile = blobIndexer.getSubtile(wangId, cell);
                // Maybe?
                let img = this.add.image(subx, y, subTile.texture.key, +subTile.name);
                img.setOrigin(0, 0);
                this.add.text(subx + 2, y + 2, `[${subTile.name}]`, {
                    fontSize: '10px',
                    fill: '#A0A000'
                });
                subx += 24
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

function update (time, delta)
{
    camControl.update(delta);
}

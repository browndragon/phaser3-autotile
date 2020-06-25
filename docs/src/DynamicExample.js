import Phaser, { Game, Scene } from 'phaser';

import BlockI from "./block.png";
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

function preload() {
    const assetSize = {frameWidth: 16, frameHeight: 16};
    this.load.spritesheet('block', BlockI, assetSize);
    this.load.spritesheet('rawblob', RawBlobI, assetSize);
}

let autotilemap;
let blobIndexer;
let blobTileset;
let tiler;
let cursor = new Phaser.Geom.Rectangle(0, 0, 1, 1);
let cursors;
let graphics;
let grid;

function create() {
    graphics = this.add.graphics();
    cursors = this.input.keyboard.createCursorKeys();

    // When loading a CSV map, make sure to specify the tileWidth and tileHeight
    blobIndexer = new BlobIndexer({
        bases: {            
            [Id.NN | Id.EE | Id.SS | Id.WW]: this.textures.get("rawblob").get(1),
            [Id.EE | Id.SE | Id.SS]: this.textures.get("rawblob").get(2),
            [Id.SS | Id.SW | Id.WW]: this.textures.get("rawblob").get(3),
            [Id.NN | Id.NE | Id.EE]: this.textures.get("rawblob").get(4),
            [Id.NN | Id.WW | Id.NW]: this.textures.get("rawblob").get(5),
        }
    });
    blobTileset = blobIndexer.toTileset({
      tilesetName: "blob",
      tm: this.textures,
      firstgid: 0,
      subtiles: {
        tileWidth: 16,
        tileHeight: 16,
      },
    });
    tiler = blobIndexer.toTiler(0);
    var help = this.add.text(16, 16, 'Navigate arrows, shift erase, space draw', {
        fontSize: '18px',
        fill: '#ffffff'
    });

    // The actual magic! Now we use a Grid to parse the map and put another layer on top of it which does autotiling. We happen to know this object's size based on the CSVs.
    grid = new Grid(new Phaser.Geom.Rectangle(0, 0, 24, 24), (x, y) => false);
    grid.dataSource = (x, y) => grid.values.has([x, y].join(","));

    autotilemap = this.add.tilemap(null, 16, 16, 24, 24);
    autotilemap.addTilesetImage("blob");
    autotilemap.createBlankDynamicLayer(0, "blob", 32, 48);
}

function update (time, delta) {
    let updating = false;
    if (Phaser.Input.Keyboard.JustUp(cursors.up)) {
        cursor.y += 23;
        cursor.y %= 24;
    }
    if (Phaser.Input.Keyboard.JustUp(cursors.down)) {
        cursor.y += 1;
        cursor.y %= 24;
    }
    if (Phaser.Input.Keyboard.JustUp(cursors.left)) {
        cursor.x += 23;
        cursor.x %= 24;
    }
    if (Phaser.Input.Keyboard.JustUp(cursors.right)) {
        cursor.x += 1;
        cursor.x %= 24;
    }
    if (Phaser.Input.Keyboard.JustUp(cursors.space)) {
        grid.values.set([cursor.x, cursor.y].join(","), true);
        grid.forEachPoint(new Phaser.Geom.Rectangle(cursor.x-1, cursor.y-1, 3, 3), (x, y) => {
            const wangId = grid.getId(x, y);
            if (wangId == null || wangId == 0 && !grid.isSet(x, y)) {
                autotilemap.removeTileAt(x, y);
                return;
            }
            const tileId = tiler(wangId);
            autotilemap.putTileAt(tileId, x, y);            
        });
    }
    if (Phaser.Input.Keyboard.JustUp(cursors.shift)) {
        grid.values.delete([cursor.x, cursor.y].join(","));
        grid.forEachPoint(new Phaser.Geom.Rectangle(cursor.x-1, cursor.y-1, 3, 3), (x, y) => {
            const wangId = grid.getId(x, y);
            if (wangId == null || wangId == 0 && !grid.isSet(x, y)) {
                autotilemap.removeTileAt(x, y);;
                return;
            }
            const tileId = tiler(wangId);
            autotilemap.putTileAt(tileId, x, y);
        });
    }
    graphics.clear();
    graphics.setDefaultStyles({
        lineStyle:{
            width: 1,
            color: 0xff9999,
            alpha:.75
        },
        fillStyle:{
            color: 0xff9999,
            alpha:.1
        },
    });
    let drawRect = new Phaser.Geom.Rectangle(32 + 16 * cursor.x, 48 + 16 * cursor.y, 16, 16);
    graphics.fillRectShape(drawRect);
    graphics.strokeRect(31, 47, 24 * 16 + 1, 24 * 16 + 1);
}
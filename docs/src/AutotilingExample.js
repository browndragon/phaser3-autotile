import Phaser, { Game, Scene } from 'phaser';

/** Load the assets. */
import BlockI from "./block.png";
import CornerI from "./corner.png";
import EdgeI from "./edge.png";
import RawBlobI from "./rawblob.png";
import Map1 from "./map1.csv";
import Map2 from "./map2.csv";
import Map3 from "./map3.csv";

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
    this.load.spritesheet('corner', CornerI, assetSize);
    this.load.spritesheet('edge', EdgeI, assetSize);
    this.load.spritesheet('rawblob', RawBlobI, assetSize);
    this.load.tilemapCSV('map1', Map1);
    this.load.tilemapCSV('map2', Map2);
    this.load.tilemapCSV('map3', Map3);
}

const tilesets = ["corner", "edge", "blob"];
let ct = 0;
const maps = ["map1", "map2", "map3"];
let cm = 0;

let cursors;
let blockmap;
let autotilemap;
let isVisible = false;
let blobIndexer;
let blobTileset;

function createLayer() {
    // The underlying image changes, so we don't just cache the map.
    blockmap = this.add.tilemap(maps[cm], 16, 16);
    blockmap.addTilesetImage("block");
    blockmap.createStaticLayer(0, "block", 32, 48).setAlpha(isVisible ? .1 : .9);

    // The actual magic! Now we use a Grid to parse the map and put another layer on top of it which does autotiling. We happen to know this object's size based on the CSVs.
    let grid = new Grid(new Phaser.Geom.Rectangle(0, 0, 6, 6), (x, y) => blockmap.getTileAt(x, y, true, 0).index == 1);

    const tilesetName = tilesets[ct];
    // let tileSize = 16;
    // if (tilesetName == "blob") {
    //     tileSize = 8;
    // }
    autotilemap = this.add.tilemap(null, 16, 16)
    autotilemap.addTilesetImage(tilesetName);
    autotilemap.createBlankDynamicLayer(0, tilesetName, 32, 48).setAlpha(isVisible ? .9 : .1);

    var tiler;
    switch (tilesetName) {
        case "corner":
        tiler = Id.tiler(Id.toCorner, Id.BRIGITTS_CROSS_PATTERN, 0);
        break;
        case "edge":
        tiler = Id.tiler(Id.toEdge, Id.EDGE_PATTERN, 0);
        break;
        case "blob":
        tiler = blobIndexer.toTiler(0);
        break;
    }


    for (let y = 0; y < 6; ++y) {
        for (let x = 0; x < 6; ++x) {
            const wangId = grid.getId(x, y);
            if (wangId == null || wangId == 0 && !grid.isSet(x, y)) {
                continue;
            }
            const tileId = tiler(wangId);
            autotilemap.putTileAt(tileId, x, y);
        }
    }
}

function create() {
    // When loading a CSV map, make sure to specify the tileWidth and tileHeight
    cursors = this.input.keyboard.createCursorKeys();
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
    var help = this.add.text(16, 16, 'Up/down swap map, left/right swap tiles; spacebar twiddles autotile visibility', {
        fontSize: '18px',
        fill: '#ffffff'
    });

    createLayer.call(this);
}

function update (time, delta) {
    let updating = false;
    if (Phaser.Input.Keyboard.JustUp(cursors.up)) {
        cm += maps.length - 1;
        cm %= maps.length;
        updating = true;
    }
    if (Phaser.Input.Keyboard.JustUp(cursors.down)) {
        cm += 1;
        cm %= maps.length;
        updating = true;
    }
    if (Phaser.Input.Keyboard.JustUp(cursors.left)) {
        ct += tilesets.length - 1;
        ct %= tilesets.length;
        updating = true;
    }
    if (Phaser.Input.Keyboard.JustUp(cursors.right)) {
        ct += 1;
        ct %= tilesets.length;
        updating = true;
    }
    if (Phaser.Input.Keyboard.JustUp(cursors.space)) {
        isVisible = !isVisible;
        updating = true;
    }
    if (updating) {
        blockmap.destroy();
        autotilemap.destroy();
        createLayer.call(this);
    }
}
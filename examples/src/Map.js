import Phaser from 'phaser';

/** Load the assets. */
import BlockI from './block.png';
import CornerI from './corner.png';
import EdgeI from './edge.png';
import RawBlobI from './rawblob.png';
import Map1 from './map1.csv';
import Map2 from './map2.csv';
import Map3 from './map3.csv';

import {Ids, Patterns, Pointwise} from 'phaser3-autotile';

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

const layouts = [
    ['corner', Ids.Corner, Patterns.BRIGITTS_CROSS],
    ['edge', Ids.Edge, Patterns.EDGE],
    ['blob', Ids.Blob, Patterns.LITERAL_BLOB]
];
let cl = 0;
const maps = ['map1', 'map2', 'map3'];
let cm = 0;

let cursors;
let blockmap;
let autotilemap;
let isVisible = false;

function createLayer() {
    // The underlying image changes, so we don't just cache the map.
    // This is the "minimal" invocation to make a map in phaser3 with its existing API, and has nothing to do with autotiling extensions:
    // 1) Create a tilemap with fixed tilesize in pixels. This version also preloads with cached tile config.
    blockmap = this.add.tilemap(maps[cm], 16, 16);
    // 2) Give it a tileset image (assumed to have same geometry as the map itself).
    blockmap.addTilesetImage('block');
    // 3) Create a layer (which is a real game object) which should line up with the input data -- needs same layerid/name, same tileset or tileset name, and arbitrary initial position. This is upper-left-corner oriented, not center (as with other sprites). 
    blockmap.createStaticLayer(0, 'block', 32, 48).setAlpha(isVisible ? .1 : .9);

    // Select an autotile.
    const [tilesetName, layout, pattern] = layouts[cl];

    // So then do the same for our autotile. This version is not seeded with data, because autotiles expect to be told where & what to draw.
    autotilemap = this.add.tilemap(null, 16, 16);
    // As before, add a tileset image.
    autotilemap.addTilesetImage(tilesetName);
    autotilemap.createBlankDynamicLayer(0, tilesetName, 32, 48).setAlpha(isVisible ? .9 : .1);
    const pointwise = new Pointwise(0, 0, 6, 6);
    const isSet = pointwise.wrap((x, y) => blockmap.getTileAt(x, y, true, 0).index == 1, false);

    pointwise.forEach((x, y) => {
        const wangId = layout.wangId(isSet, x, y);
        if (wangId == null) {
            return;
        }
        const tileId = pattern[wangId];
        autotilemap.putTileAt(tileId, x, y);
    });
}

function create() {
    // When loading a CSV map, make sure to specify the tileWidth and tileHeight
    cursors = this.input.keyboard.createCursorKeys();
    this.textures.generateBlobAutotileTexture('blob', {
        subtileGeometry: {
            tileWidth: 16,
        }
    });

    this.add.text(16, 16, 'Up/down swap map, left/right swap tiles; spacebar twiddles autotile visibility', {
        fontSize: '18px',
        fill: '#ffffff'
    });

    createLayer.call(this);
}

function update (time, delta) {  // eslint-disable-line no-unused-vars
    let updating = false;
    if (Phaser.Input.Keyboard.JustUp(cursors.up)) {
        cm = Pointwise.Mod(0, maps.length, cm-1);
        updating = true;
    }
    if (Phaser.Input.Keyboard.JustUp(cursors.down)) {
        cm = Pointwise.Mod(0, maps.length, cm+1);
        updating = true;
    }
    if (Phaser.Input.Keyboard.JustUp(cursors.left)) {
        cl = Pointwise.Mod(0, layouts.length, cl-1);
        updating = true;
    }
    if (Phaser.Input.Keyboard.JustUp(cursors.right)) {
        cl = Pointwise.Mod(0, layouts.length, cl+1);
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
import Phaser from 'phaser';

/** Load the assets. */
import BlockI from './block.png';
import CornerI from './corner.png';
import EdgeI from './edge.png';
import RawBlobI from './rawblob.png';
import Map1 from './map1.csv';
import Map2 from './map2.csv';
import Map3 from './map3.csv';

import Autotile from 'phaser3-autotile';

const {Ids, Pointwise, Subtiles, Textures, Tilesets} = Autotile;

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
    ['corner', Ids.Corner, Tilesets.Patterns.BRIGITTS_CROSS],
    ['edge', Ids.Edge, Tilesets.Patterns.EDGE],
    ['blob', Ids.Blob, Tilesets.Patterns.LITERAL_BLOB]
];
let cl = 0;
const maps = ['map1', 'map2', 'map3'];
let cm = 0;

let cursors;
let blockmap;
let autotilemap;
let isVisible = false;
let subtiles;

function createLayer() {
    // The underlying image changes, so we don't just cache the map.
    blockmap = this.add.tilemap(maps[cm], 16, 16);
    blockmap.addTilesetImage('block');
    blockmap.createStaticLayer(0, 'block', 32, 48).setAlpha(isVisible ? .1 : .9);

    const [tilesetName, layout, pattern] = layouts[cl];
    autotilemap = this.add.tilemap(null, 16, 16);
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
    subtiles = Subtiles.RpgMakerFormatFromGeometry({
        tileWidth: 16,
        tileHeight: 16,
    });
    Textures.CreateBlobTexture({
        key: 'blob',
        rawTexture: 'rawblob',
        tm: this.textures,
        subtiles: subtiles, 
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
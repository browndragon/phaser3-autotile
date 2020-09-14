import Phaser from 'phaser';

import BlockI from './block.png';
import RawBlobI from './raw/blob.png';

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
    this.load.spritesheet('rawblob', RawBlobI, assetSize);
}

let autotilemap;
const [xBoard, yBoard] = [32, 48];
let cursor = new Phaser.Geom.Rectangle(0, 0, 1, 1);
let cursors;
let graphics;
let grid;

class Grid {
    constructor(x=0, y=0, width=24, height=24) {
        this.pointwise = new Pointwise(x, y, width, height, 1, 1, Pointwise.Adjustment.MOD);
        this.grid = new Map();
        this.isSetCallback = this.pointwise.wrap((x, y) => this.has(x, y));
    }
    has(x, y) {
        return !!this.grid.has(''+[x, y]);
    }
    set(x, y) {
        this.grid.set(''+[x, y], true);
    }
    unset(x, y) {
        this.grid.delete(''+[x, y]);
    }
}

function create() {
    cursors = this.input.keyboard.createCursorKeys();
    grid = new Grid(0, 0, 24, 24);
    this.textures.generateBlobAutotileTexture('blob', {
        subtileGeometry: {
            tileWidth: 16,
        }
    });

    this.add.text(16, 16, 'Navigate arrows, shift erase, space draw', {
        fontSize: '18px',
        fill: '#ffffff'
    });

    autotilemap = this.add.tilemap(null, 16, 16, grid.pointwise.width, grid.pointwise.height);
    autotilemap.addTilesetImage('blob');
    autotilemap.createBlankDynamicLayer(0, 'blob', xBoard, yBoard);
    graphics = this.add.graphics();
    drawUI.call(this);
}

function drawUI() {
    grid.pointwise.forEach(
        (x, y) => {
            const wangId = Ids.Blob.wangId(grid.isSetCallback, x, y);
            if (wangId == null) {
                autotilemap.removeTileAt(x, y);
                return;
            }
            const tileId = Patterns.LITERAL_BLOB[wangId];
            autotilemap.putTileAt(tileId, x, y);            
        },
        new Phaser.Geom.Rectangle(cursor.x-1, cursor.y-1, 3, 3)
    );
    graphics.clear();
    graphics.setDefaultStyles({
        lineStyle:{
            width: 4,
            color: 0xff9999,
            alpha: 1
        },
        fillStyle:{
            color: 0xff9999,
            alpha:.1
        },
    });
    let drawRect = new Phaser.Geom.Rectangle(xBoard + 16 * cursor.x, yBoard + 16 * cursor.y, 16, 16);
    graphics.fillRectShape(drawRect);
    graphics.strokeRectShape(drawRect);
    graphics.strokeRect(31, 47, grid.pointwise.width * 16 + 1, grid.pointwise.height * 16 + 1);
}

function update (time, delta) {  // eslint-disable-line no-unused-vars
    let updating = false;
    if (Phaser.Input.Keyboard.JustUp(cursors.up)) {
        [cursor.x, cursor.y] = grid.pointwise.adjust(cursor.x, cursor.y - 1);
        updating = true;
    }
    if (Phaser.Input.Keyboard.JustUp(cursors.down)) {
        [cursor.x, cursor.y] = grid.pointwise.adjust(cursor.x, cursor.y + 1);
        updating = true;
    }
    if (Phaser.Input.Keyboard.JustUp(cursors.left)) {
        [cursor.x, cursor.y] = grid.pointwise.adjust(cursor.x - 1, cursor.y);
        updating = true;
    }
    if (Phaser.Input.Keyboard.JustUp(cursors.right)) {
        [cursor.x, cursor.y] = grid.pointwise.adjust(cursor.x + 1, cursor.y);
        updating = true;
    }
    if (Phaser.Input.Keyboard.JustUp(cursors.space)) {
        grid.set(cursor.x, cursor.y);
        updating = true;
    }
    if (Phaser.Input.Keyboard.JustUp(cursors.shift)) {
        grid.unset(cursor.x, cursor.y);
        updating = true;
    }
    if (updating) {
        drawUI.call(this);
    }
}
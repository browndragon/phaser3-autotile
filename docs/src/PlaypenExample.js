import Phaser, { Game, Scene } from 'phaser';

import BlockI from "./block.png";
import RawBlobI from "./rawblob.png";

import Autotile from "phaser3-autotile";

const {Ids, Pointwise, Subtiles, Textures} = Autotile;

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

const [xBoard, yBoard] = [32, 48];
let autotilemap;
let subtiles;
let blobTileset;
let tiler;
let cursor = new Phaser.Geom.Rectangle(0, 0, 1, 1);
let cursors;
let graphics;
let grid;

class Grid {
    constructor(x=0, y=0, width=24, height=24) {
        this.rect = new Phaser.Geom.Rectangle(x, y, width, height);
        this.pointwise = new Pointwise(this.rect, Pointwise.Adjustment.MOD);
        this.grid = new Map();
        this.isSetCallback = this.isSet.bind(this);
    }
    static id (x, y) {
        return [x, y].join(",");
    }
    isSet(x, y) {
        return this.pointwise.evaluateAt((x, y) => !!this.grid.has(Grid.id(x, y)), x, y, false);
    }
    set(x, y) {
        this.pointwise.evaluateAt((x, y) => this.grid.set(Grid.id(x, y), true), x, y);
    }
    unset(x, y) {
        this.pointwise.evaluateAt((x, y) => this.grid.delete(Grid.id(x, y)), x, y);
    }
}

function create() {
    cursors = this.input.keyboard.createCursorKeys();
    grid = new Grid(0, 0, 24, 24);
    subtiles = Subtiles.RpgMakerFormatFromGeometry({
        tileWidth: 16,
        tileHeight: 16,
    });
    Textures.CreateBlobTexture({
        key: "blob",
        rawTexture: "rawblob",
        tm: this.textures,
        subtiles: subtiles, 
    });

    var help = this.add.text(16, 16, 'Navigate arrows, shift erase, space draw', {
        fontSize: '18px',
        fill: '#ffffff'
    });

    autotilemap = this.add.tilemap(null, 16, 16, grid.rect.width, grid.rect.height);
    autotilemap.addTilesetImage("blob");
    autotilemap.createBlankDynamicLayer(0, "blob", xBoard, yBoard);
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
            const tileId = Ids.Blob.tileId(wangId);
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
    let drawRect = new Phaser.Geom.Rectangle(32 + 16 * cursor.x, 48 + 16 * cursor.y, 16, 16);
    graphics.fillRectShape(drawRect);
    graphics.strokeRectShape(drawRect);
    graphics.strokeRect(31, 47, grid.rect.width * 16 + 1, grid.rect.height * 16 + 1);
}

function update (time, delta) {
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
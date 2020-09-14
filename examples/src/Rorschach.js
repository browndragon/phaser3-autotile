import Phaser from 'phaser';
import {Pointwise} from 'phaser3-autotile';

/** Load the assets. */
import Tiles from './cooked/blob.png';
import TiledM from './rorschach.json';

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
    this.load.image('tiles');
    this.load.tilemapTiledJSON('tiled_map', TiledM);
}

let graphics;
let cursors;
let autotilemap;
let autotilemaplayer;
let tileset;
const [xBoard, yBoard] = [32, 48];
let cursor = new Phaser.Geom.Rectangle(0, 0, 1, 1);


function create() {
    cursors = this.input.keyboard.createCursorKeys();
    this.add.text(16, 16, 'Navigate arrows, shift erase, space draw', {
        fontSize: '18px',
        fill: '#ffffff'
    });

    autotilemap = this.add.tilemap('tiled_map');
    autotilemap.prepareAutotile({jsonkey:'tiled_map'});
    let terrain = autotilemap.autotile().terrains.getTerrain('wall');
    terrain.input.add(13);

    tileset = autotilemap.addTilesetImage('tiles', 'corner');
    autotilemaplayer = autotilemap.createDynamicLayer('mutable', tileset, xBoard, yBoard);
    autotilemap.autotile().addRefresh('tilesbinary');

    graphics = this.add.graphics();
    drawUI.call(this);
}

function drawUI() {
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
    graphics.strokeRect(31, 47, autotilemaplayer.width + 1, autotilemaplayer.height + 1);
}

function update (time, delta) {  // eslint-disable-line no-unused-vars
    let updating = false;
    if (Phaser.Input.Keyboard.JustUp(cursors.up)) {
        cursor.y = Pointwise.Mod(0, autotilemap.height, cursor.y - 1);
        updating = true;
    }
    if (Phaser.Input.Keyboard.JustUp(cursors.down)) {
        cursor.y = Pointwise.Mod(0, autotilemap.height, cursor.y + 1);
        updating = true;
    }
    if (Phaser.Input.Keyboard.JustUp(cursors.left)) {
        cursor.x = Pointwise.Mod(0, autotilemap.width, cursor.x - 1);
        updating = true;
    }
    if (Phaser.Input.Keyboard.JustUp(cursors.right)) {
        cursor.x = Pointwise.Mod(0, autotilemap.width, cursor.x + 1);
        updating = true;
    }
    if (Phaser.Input.Keyboard.JustUp(cursors.space)) {
        // Sets the northwest corner, and then lets the algorithm figure out what else should set.
        autotilemap.putTileAt(16, cursor.x, cursor.y);
        autotilemap.autotile().refreshRadius('tilesbinary', cursor.x, cursor.y, 1);
        updating = true;
    }
    if (Phaser.Input.Keyboard.JustUp(cursors.shift)) {
        autotilemap.removeTileAt(cursor.x, cursor.y);
        autotilemap.autotile().refreshRadius('tilesbinary', cursor.x, cursor.y, 1);
        updating = true;
    }
    if (updating) {
        drawUI.call(this);
    }
}
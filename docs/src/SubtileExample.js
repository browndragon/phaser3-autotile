import Phaser, { Game, Scene } from 'phaser';

/** Load the assets. */
import BlockI from "../assets/block.png";
import CornerI from "../assets/corner.png";
import EdgeI from "../assets/edge.png";
import RawBlobI from "../assets/rawblob.png";
import Map1 from "../assets/map1.csv";
import Map2 from "../assets/map2.csv";
import Map3 from "../assets/map3.csv";

import Autotile from "phaser3-autotile";

const {Id, Grid, BlobIndexer} = Autotile;

var config = {
    type: Phaser.WEBGL,
    width: 800,
    height: 600,
    backgroundColor: '#2d2d2d',
    parent: 'phaser-example',
    pixelArt: true,
    scene: {
        preload: preload,
        create: create,
        update: update,
    }
};

var game = new Phaser.Game(config);

function preload() {
    this.load.image('block', BlockI);
    this.load.image('corner', CornerI);
    this.load.image('edge', EdgeI);
    this.load.image('rawblob', RawBlobI);
    this.load.tilemapCSV('map1', Map1);
    this.load.tilemapCSV('map2', Map2);
    this.load.tilemapCSV('map3', Map3);
}

const tilesets = ["corner", "edge", "blob"];
let ct = 0;
const maps = ["map1", "map2", "map3"];
let cm = 0;
var cursors;
var map;
var baselayer;
var autotilelayer;
var isVisible = false;
var blobIndexer;
var blobTileset;

function createLayer() {
    map = this.make.tilemap({ key: maps[cm], tileWidth: 16, tileHeight: 16 });
    baselayer = map.createStaticLayer(0, tileset);
    map.addTilesetImage("block");

    // The actual magic! Now we use a Grid to parse the map and put another layer on top of it which does autotiling.
    let grid = new Grid(new Phaser.Geom.Rectangle(0, 0, 12, 12), (x, y) => baselayer.getTileAt(x, y, true, 0).index == 1);
}


function create() {
    // When loading a CSV map, make sure to specify the tileWidth and tileHeight
    cursors = this.input.keyboard.createCursorKeys();
    blobIndexer = new BlobIndexer({
        bases: {
          [Id.NN | Id.EE | Id.SS | Id.WW]: this.textures.getFrame("rawblob", 1),
          [Id.SS | Id.SW | Id.WW]: this.textures.getFrame("rawblob", 2),
          [Id.NN | Id.WW | Id.NW]: this.textures.getFrame("rawblob", 3),
          [Id.NN | Id.NE | Id.EE]: this.textures.getFrame("rawblob", 4),
          [Id.EE | Id.SE | Id.SS]: this.textures.getFrame("rawblob", 6),
        }
    });
    blobTileset = blobIndexer.toTileset({
      tilesetName: "blob",
      tm: this.textures,
      firstgid: 2,
      subtiles: {
        tileWidth: 32,
        tileHeight: 32,
      },
    });
    var help = this.add.text(16, 16, 'Up/down swap map, left/right swap tiles; spacebar twiddles autotile visibility', {
        fontSize: '18px',
        fill: '#ffffff'
    });
    createLayer();
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
      ct += maps.length - 1;
      ct %= maps.length;
      updating = true;
    }
    if (Phaser.Input.Keyboard.JustUp(cursors.right)) {
      ct += 1;
      ct %= maps.length;
      updating = true;
    }
    if (Phaser.Input.Keyboard.JustUp(cursors.right)) {
      ct += 1;
      ct %= maps.length;
      updating = true;
    }
    if (Phaser.Input.Keyboard.JustUp(cursors.space)) {
      isVisible = !isVisible;
      updating = true;
    }
    if (updating) {
      map.destroy();
      createLayer();
    }
}
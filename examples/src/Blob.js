import Phaser from 'phaser';

/** Load the assets. */
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
var camControl;


function preload() {
    const assetSize = {frameWidth: 16, frameHeight: 16};
    this.load.spritesheet('rawblob', RawBlobI, assetSize);
}

function adjustPositionToFrame(pointwise, object, index, scale=1, size=16) {
    const [cx, cy] = pointwise.nth(index);
    object.setCrop(cx, cy, size, size);
    object.setPosition(object.x - scale*cx, object.y - scale*cy);
    object.setOrigin(0, 0);
    object.setScale(scale);
}

const Style = {
    min: function(someStyle={}) {
        const {
            fontSize='12px',
            fill='#000',
            shadow={},
            wordWrap={},
            ...someStyleRest
        } = someStyle;
        const {
            color='#FFF',
            blur=4,
            fill:shadowFill=true,
            ...shadowRest
        } = shadow;
        const {
            width=64,
            ...wordWrapRest
        } = wordWrap;
        return {
            fontSize,
            fill,
            shadow:{
                color,
                blur,
                fill:shadowFill,
                ...shadowRest
            },
            wordWrap:{
                width,
                ...wordWrapRest
            },
            ...someStyleRest
        };
    },
    max: function(someStyle={}) {
        const {
            fontSize='18px',
            fill='#FFF',
            shadow={},
            ...someStyleRest
        } = someStyle;
        const {
            color='#000',
            blur=6,
            fill:shadowFill=true,
            ...shadowRest
        } = shadow;
        return {
            fontSize,
            fill,
            shadow:{
                color,
                blur,
                fill:shadowFill,
                ...shadowRest
            },
            ...someStyleRest
        };
    },
    mid: function(someStyle={}) {
        const {
            fontSize='12px',
            shadow={},
            ...someStyleRest
        } = someStyle;
        const {
            blur=4,
            ...shadowRest
        } = shadow;
        return Style.max({fontSize, shadow: {blur, ...shadowRest}, ...someStyleRest});
    }
};


function create() {
    // Generates a 47 tile blob texture from the input.
    // This sets default values for height (from width), subtile geometry, margin, and even the baseline image information such as the source being `raw${key}` -- "rawblob".
    // The below regurgitates a LOT of the logic for debugging purposes: this is a Bad Test.
    this.textures.generateBlobAutotileTexture('blob', {
        subtileGeometry: {
            tileWidth: 16,
        }
    });
    // This is what's used under the covers:
    const index = Patterns.IndexByCorner(Patterns.RPG_MAKER);

    this.add.text(16, 16, 'Raw:', Style.max());
    {
        let img = this.add.image(16, 32, 'rawblob', '__BASE');
        img.setOrigin(0, 0);
    }
    this.add.text(16, 128, 'Generated:', Style.max()); 
    {
        let img = this.add.image(16, 144, 'blob', '__BASE');
        img.setOrigin(0, 0);
    }

    let [xmin, ymin] = [256, 16];
    {
        let [x, y] = [xmin, ymin];
        let rawblob = this.textures.get('rawblob').get('__BASE');
        let p = new Pointwise(rawblob.x, rawblob.y, rawblob.width, rawblob.height, 16, 16);
        this.add.text(x, y, 'Basis', Style.max());
        y += 16;
        // Invert the index so that we can go in order of tile.
        let inverted = {};
        for (const [wangId, frame] of Object.entries(Patterns.RPG_MAKER)) {
            inverted[frame] = wangId;
        }
        for (const [frame, wangId] of Object.entries(inverted)) {
            let img = this.add.image(x, y, 'rawblob', '__BASE');
            adjustPositionToFrame(p, img, frame, 2);
            this.add.text(x+2, y+2, `N:${wangId}\nW:${Ids.Name(wangId)}\nT:${frame}`, Style.min());
            x += 96;
        }
    }
    ymin = 128;
    {
        let [x, y] = [xmin, ymin];
        this.add.text(x, y, 'Per Corner:', Style.max());
        y += 16;

        let blob = this.textures.get('blob').get('__BASE');
        let p = new Pointwise(blob.x, blob.y, blob.width, blob.height, 16, 16);
        for (const corner of [Ids.NE, Ids.SE, Ids.SW, Ids.NW]) {
            this.add.text(x, y, `Corner: ${Ids.Name(corner)}`, Style.mid());
            y += 16;
            for (const [cornerWangId, wangId] of Object.entries(index[corner])) {
                const tileId = Patterns.RPG_MAKER[wangId];
                let img = this.add.image(x, y, 'blob', '__BASE');
                adjustPositionToFrame(p, img, tileId, 2);
                this.add.text(x+2, y+2, `C:${Ids.Name(cornerWangId)}\nW:${Ids.Name(wangId)}\nT:${tileId}`, Style.min());
                x += 64;
            }
            y += 32;
            x = xmin; 
        }
        ymin = y + 32;
    }

    {
        this.add.text(xmin, ymin, 'By Component:', Style.max());
        const [xminf, yminf] = [xmin, ymin];
        let blob = this.textures.get('blob').get('__BASE');
        let p = new Pointwise(blob.x, blob.y, blob.width, blob.height, 16, 16);
        for (const [wangId, tileId] of Object.entries(Patterns.LITERAL_BLOB)) {
            const [xmin, ymin] = [xminf + 128 * (tileId % 8), yminf + 32 + 64 * Math.floor(tileId / 8)];
            let [x, y] = [xmin, ymin];
            this.add.text(x, y, `Wang:${wangId} Tile:${tileId}`, Style.mid());
            y += 16;
            {
                let img = this.add.image(x, y, 'blob', '__BASE');
                adjustPositionToFrame(p, img, tileId);
            }
            x += 32;
            let subx = x;
            const corners = [[Ids.NW, Ids.NE], [Ids.SW, Ids.SE]];
            for (const row of corners) {
                for (const cell of row) {
                    const subWangId = Ids.Subtile[cell].project(wangId);
                    const tileId = Patterns.RPG_MAKER[index[cell][subWangId]];
                    let img = this.add.image(subx, y, 'blob', '__BASE');
                    adjustPositionToFrame(p, img, tileId, 1, 8);
                    this.add.text(subx + 2, y + 2, `[${tileId}]`, Style.min());
                    subx += 24;
                }
                y += 24;
                subx = x;
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

function update (time, delta)  // eslint-disable-line no-unused-vars
{
    camControl.update(delta);
}

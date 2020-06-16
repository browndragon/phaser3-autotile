import Phaser;
import Wang from "./Wang.js";

const NN = Wang.Parts.NN;
const NE = Wang.Parts.NE;
const EE = Wang.Parts.EE;
const SE = Wang.Parts.SE;
const SS = Wang.Parts.SS;
const SW = Wang.Parts.SW;
const WW = Wang.Parts.WW;
const NW = Wang.Parts.NW;

export class ExplicitTileset {
    constructor(tileMappings) {
        this.tileMappings = tileMappings;
    }
    getTile(wangId) {
        const ret = this.tileMappings[wangId];
        if (ret == undefined || ret = null) {
            ret = this.tileMappings[0];
        }
        return ret;
    }
}

/** Loads a tileset from a given image & pattern. */
export class PatternTileset extends ExplicitTileset {
    constructor(image, tilesize, pattern) {
        super(PatternTileset.loadTileMappings(image, tilesize, pattern));
    }
    static loadTileMappings(image, tilesize, pattern) {
        tileMappings = {};
        for (var r = 0; r < pattern.length; ++r) {
            const row = pattern[r];
            for (var c = 0; c < row.length; ++c) {
                let wangId = row[c];
                // TODO: Lookup the actual call.
                let portion = image.rectangularRegion(tilesize*c, tilesize*r, c, r);
                tileMappings[wangId] = portion;
            }
        }
        return tileMappings;
    }
}

/**
 * Loads a 4x4 edge tileset with known pattern. This is suitable for walls, paths, etc.
 * Format:
 *  - The upper right 3x3 is fully connected
 *    - To its west is a 1x3 column
 *    - To its south is a 3x1 dormer
 *  - In the southwest 1x1 corner is an island
 * This is 2-edge layout 0 from http://www.cr31.co.uk/stagecast/wang/pattern.html .
 */
export class EdgeTileset extends PatternTileset {
    constructor(image, tilesize) {
        super(EdgeTileset.loadTileMappings(image, tilesize, EdgeTileset.pattern))
    }
    getTile(wangId) {
        return super.getTile(Wang.EdgeId(wangId));
    }
}
EdgeTileset.pattern = [
    [SS, SS | EE, WW | SS | EE, WW | SS],
    [NN | SS, NN | EE | SS, NN | EE | SS | WW, NN | SS | WW],
    [NN, NN | EE, NN | EE | WW, NN | WW],
    [0, EE, EE | WW, WW],
];

/**
 * Loads a Brigitt's Cross edge tileset. This is suitable for corner terrain. 
 * Format: See  http://www.cr31.co.uk/stagecast/wang/pattern.html#brigid 
 */
export class CornerTileset extends PatternTileset {
    constructor(image, tilesize) {
        super(CornerTileset.loadTileMappings(image, tilesize, CornerTileset.pattern));
    }
    getTile(wangId) {
        return super.getTile(Wang.CornerId(wangId));
    }
}
CornerTileset.pattern = [
    [SW, NE | SE, NW | SW | SE, SW | SE],
    [NW | SE, NE | SE | SW, NE | SE | SW | NW, NE | SW | NW],
    [NE, NW | NE, NW | NE | SE, NW | SW],
    [0, SE, SW | NE, NW],
];

/**
 * The geometry of output autotiles.
 * @typedef {object} AutoTileset.TileConfig
 *
 * @property {object} size - The target tile size to extract from this region in pixels.
 * @property {number} size.width - The target width of tile to extract from this region in pixels.
 * @property {number} size.height - The target height of tile to extract from this region in pixels.
 * @property {object} NWsubtile - The size of the subtile at 0,0 within this region (in pixels).
 * @property {number} [NWsubtile.width=size.width/2] - The width for the NW subtile (in pixels).
 * @property {number} [NWsubtile.height=size.height/2] - The height for the NW subtile (in pixels).
 */

/**
 * Describes the format of input data for generating an autotileset.
 * @typedef {object} AutoTileset.Config
 *
 * Autotiles are generated from parts taken from at least 5 "source" tiles.
 *
 * At their simplest, this is a 2x2 block of convex corners ("an island"), and a 1x1 block of concave corners (shaped either as a crossroads, or else a hole in the ground).
 *
 * @property {AutoTileset.TileConfig} tile - The geometry of output tiles to use.
 * @property {object} convex - The configuration of the convex region.
 * @property {string} convex.textureKey - The source image to use for the convex region.
 * @property {Phaser.Geom.Rectangle} convex.location - The location within the textureKey image to use for the convex region. This rectangle must be a square region 2x2 tiles(as of 2020/06/12).
 * @property {object} concave - The configuration of the concave region.
 * @property {boolean} [concave.atCenter=false] - True if the "outside" of the concave region is a hole at its center; false if the "outside" of the concave region is at the 4 corners of the region.
 * @property {string} concave.textureKey - The source image to use for the concave region.
 * @property {Phaser.Geom.Rectangle} concave.location - The location within the textureKey image to use for the concave region. This rectangle must be a square region 1x1 tiles (as of 2020/06/12).
 */

// Bitmasks to restrict *S*ub*T*ile *I*ndices to the area of interest only.
const STI = {
    NE: NN | NE | EE,
    SE: EE | SE | SS,
    SW: SS | SW | WW,
    NW: NN | WW | NW,
};

/**
 * Loads a 47-tile "blob" tileset from an input generative image.
 * See http://www.cr31.co.uk/stagecast/wang/blob.html for more details.
 */
export class AutoTileset extends ExplicitTileset {
    /**
     * @param {Autotileset.Config} config - The configuration to use for loading the tileset.
     */
    constructor(config) {
        super(AutoTileset.loadTileMappingsFromConfig())
    }

    /**
     * @param {Autotileset.Config} config - The configuration to use for loading the tileset.
     */
    static loadTileMappingsFromConfig(config) {

        const subtiles = {
            nw: 
        };
    }

    getTile(wangId) {
        return super.getTile(Wang.BlobId(wangId));
    }
}
AutoTileset.tiles = [0, 1, 4, 5, 7, 16, 17, 20, 21, 23, 28, 29, 31, 64, 65, 68, 69, 71, 80, 81, 84, 85, 87, 92, 93, 95, 112, 113, 116, 117, 119, 124, 125, 127, 193, 197, 199, 209, 213, 215, 221, 223, 241, 245, 247, 253, 255];
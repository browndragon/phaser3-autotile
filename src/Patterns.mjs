import Ids from './Ids.mjs';

/**
 * A mapping from wangid into a "tileId".
 *
 * This isn't necessarily the integer offset into a phaser tilemap, since these patterns (below) are defined continguously, and a given tilemap might pack multiple tileIds into a single (larger) grid of images. But it's a sequential mapping, and you might be able to use something like Pointwise.nth to map from these patterns back to the actual tile offsets in a much larger image.
 *
 * @typedef {Object.<WangId, integer>} Pattern
 */

/**
 * A mapping corner -> restricted wangIds -> the parent wangId that generates that restriction for that corner.
 * @typedef {Object.<WangId, Object.<WangId, WangId>>} CornerIndex
 */

/**
 * @typedef {object} Patterns.SubtileGeometry
 * @property {integer} tileWidth - The width of each tile.
 * @property {integer} [tileHeight=tileWidth] - The height of each tile.
 * @property {integer} [topLeftWidth=tileWidth/2] - The width of the top left subtile.
 * @property {integer} [topLeftHeight=tileHeight/2] - The height of the top left subtile.
 * @property {integer|Array.<integer>[4]} [margin=[0,0,0,0]] - The inset of the tiles in their containing image (in order top, right, bottom, left).
 * @property {integer|Array.<integer>[2]} [spacing=[0,0]] - The spacing to leave between each tile (in order x, y).
 */

const {NN, NE, EE, SE, SS, SW, WW, NW} = Ids;

/** 
 * Hardcoded texture layout patterns.
 * @namespace
 */
const Patterns = {
    /**
     * Loads a 4x4 edge tileset with known pattern.
     * Format:
     *  - The upper right 3x3 is fully connected
     *    - To its west is a 1x3 column
     *    - To its south is a 3x1 dormer
     *  - In the southwest 1x1 corner is an island
     *
     * Assuming the "fully connected" tiles leave gaps at their corners, this is suitable for overhead walls, paths, etc. If they don't, this will work for a sort of tiled/repeated nineslice, but cannot contain concave corners.
     *
     * This is 2-edge layout 0 from http://www.cr31.co.uk/stagecast/wang/pattern.html .
     * @property {Pattern} EDGE
     */
    EDGE: {
        [SS]: 0,
        [SS | EE]: 1,
        [WW | SS | EE]: 2,
        [WW | SS]: 3,

        [NN | SS]: 4,
        [NN | EE | SS]: 5,
        [NN | EE | SS | WW]: 6,
        [NN | SS | WW]: 7,

        [NN]: 8,
        [NN | EE]: 9,
        [NN | EE | WW]: 10,
        [NN | WW]: 11,

        [0]: 12,
        [EE]: 13,
        [EE | WW]: 14,
        [WW]: 15,
    },

    /**
     * Loads a Brigitt's Cross edge tileset. This is suitable for corner terrain. 
     *
     * This is suitable for terrain, and more generically anything that works well on an offset gr
     *
     * Format: See  http://www.cr31.co.uk/stagecast/wang/pattern.html#brigid .
     * @property {Pattern} BRIGITTS_CROSS
     */
    BRIGITTS_CROSS: {
        [SW]: 0,
        [NE | SE]: 1,
        [NW | SW | SE]: 2,
        [SW | SE]: 3,

        [NW | SE]: 4,
        [NE | SE | SW]: 5,
        [NE | SE | SW | NW]: 6,
        [NE | SW | NW]: 7,

        [NE]: 8,
        [NW | NE]: 9,
        [NW | NE | SE]: 10,
        [NW | SW]: 11,

        [0]: 12,
        [SE]: 13,
        [SW | NE]: 14,
        [NW]: 15,
    },

    /**
     * Loads an explicit 47-tile "blob" tileset from a fixed order.
     *
     * This is fairly generic and can be used for walls, paths, terrain, overgrowth, etc.
     *
     * See http://www.cr31.co.uk/stagecast/wang/blob.html for more details.
     * @property {Pattern} LITERAL_BLOB
     */
    LITERAL_BLOB: {
        0: 0,
        1: 1,
        4: 2,
        5: 3,
        7: 4,
        16: 5,
        17: 6,
        20: 7,
        21: 8,
        23: 9,
        28: 10,
        29: 11,
        31: 12,
        64: 13,
        65: 14,
        68: 15,
        69: 16,
        71: 17,
        80: 18,
        81: 19,
        84: 20,
        85: 21,
        87: 22,
        92: 23,
        93: 24,
        95: 25,
        112: 26,
        113: 27,
        116: 28,
        117: 29,
        119: 30,
        124: 31,
        125: 32,
        127: 33,
        193: 34,
        197: 35,
        199: 36,
        209: 37,
        213: 38,
        215: 39,
        221: 40,
        223: 41,
        241: 42,
        245: 43,
        247: 44,
        253: 45,
        255: 46
    },

    /**
     * Loads a single crossroads tile 
     * @property {Pattern} RPG_MAKER
     */
    RPG_MAKER: {
    // Nothing uses tile 0.
        [NN | EE | SS | WW]: 1,
        [EE | SE | SS]: 2,
        [SS | SW | WW]: 3,
        [NN | NE | EE]: 4,
        [WW | NW | NN]: 5
    },

    /**
     * @function ReversePattern
     * @parameter {Pattern} pattern - The pattern to reverse.
     * @returns {Object.<integer, WangId>} - The inverted map.
     */
    ReversePattern: function(pattern) {
        let reversePattern = {};
        for (let [wangId, tileId] of Object.entries(pattern)) {
            reversePattern[tileId] = wangId;
        }
        return reversePattern;
    },

    /**
     * @function NormalizeGeometry
     * @parameter {object} geometry - The geometry to ensure populated.
     * @returns Patterns.SubtileGeometry - The input object with geometry fields set to defaults.
     */
    NormalizeGeometry: function (geometry) {
        let {
            tileWidth,
            tileHeight=tileWidth,
            topLeftWidth=tileWidth/2,
            topLeftHeight=tileHeight/2,
            margin=[0,0,0,0],
            spacing=[0,0],
            ...rest
        } = geometry;
        if (!Array.isArray(margin)) {
            margin = [margin, margin, margin, margin];
        }
        if (!Array.isArray(spacing)) {
            spacing = [spacing, spacing];
        }
        return {
            tileWidth,
            tileHeight,
            topLeftWidth,
            topLeftHeight,
            margin,
            spacing,
            ...rest
        };
    },

    /**
     * Stores the location of each "corner" by [x,y] -- a 1 means "inset by the value of the top left corner" (width or height), a 0 means "aligned to the top left corner" (width or height).
     * @property {Object.<WangId, integer[2]>} SubtilecornerOffsets
     */
    SubtileCornerOffsets: {
        [Ids.NE]: [1, 0],
        [Ids.SE]: [1, 1],
        [Ids.SW]: [0, 1],
        [Ids.NW]: [0, 0],
    },

    /**
     * Produces an index corner -> restricted wang Id -> full wangId.
     * @function IndexByCorner
     * @parameter {Pattern}
     * @returns CornerIndex
     */
    IndexByCorner: function(pattern) {
        let retval = {};
        for (let corner of [NE, SE, SW, NW]) {
            retval[corner] = Patterns.indexOneCorner(pattern, corner);
        }
        return retval;
    },
    /**
     * Uses an `IndexByCorner` to get the original wangId back out.
     * @function LookupWangIdIndex
     * @parameter {CornerIndex} index
     * @parameter {WangId} corner
     * @parameter {WangId} wangId
     * @returns WangId
     */
    LookupWangIdIndex: function(index, corner, wangId) {
        return index[corner][Ids.Subtile[corner].project(wangId)];
    },
    /**
     * Privatish. Indexes the pattern by the given corner.
     * @private
     */
    indexOneCorner: function(pattern, corner) {
        let retval = {};
        for (let [wangId, _] of Object.entries(pattern)) {
            retval[Ids.Subtile[corner].project(wangId)] = +wangId;
        }
        return retval;
    },
};
export default Patterns;
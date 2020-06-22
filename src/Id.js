/**
 * Ids are an 8-bit integer with the given low order bits set if the neighbor is set:
 * ```
 *  7 | 0 | 1
 * ---+---+---
 *  6 | x | 2
 * ---+---+---
 *  5 | 4 | 3
 * ```
 * This representation is only well-defined if x is also set (by convention, `null` is used in all cases if it is not).
 *
 * @typedef {integer} WangId
 */

 /**
  * @callback Id.Projection
  * @param {WangId} wangId - An ID in the full wang space.
  * @returns WangId - An ID in the output space.
  */

 /**
  * @callback Id.Tiler
  * @param {WangId} wangId - An ID in the full wang space.
  * @returns {integer} - A tileID for that wangId.
  */

/**
 * Utilities for dealing with wang ids.
 */
export default class Id {
    /**
     * @parameter {number} nn - 0 or 1 if neighbor is set.
     * @parameter {number} ne - 0 or 1 if neighbor is set.
     * @parameter {number} ee - 0 or 1 if neighbor is set.
     * @parameter {number} se - 0 or 1 if neighbor is set.
     * @parameter {number} ss - 0 or 1 if neighbor is set.
     * @parameter {number} sw - 0 or 1 if neighbor is set.
     * @parameter {number} ww - 0 or 1 if neighbor is set.
     * @parameter {number} nw - 0 or 1 if neighbor is set.
     * @returns WangId
     */
    static asWang(nn, ne, ee, se, ss, sw, ww, nw) {
        return (0
            | nn << 0 
            | ne << 1
            | ee << 2
            | se << 3
            | ss << 4
            | sw << 5
            | ww << 6
            | nw << 7
        );
    }

    /**
     * @parameter {WangId} wangId - The Id to restrict.
     * @returns WangId - Restricted to edge bits `NN|EE|SS|WW` only.
     */
    static toEdge(wangId) {
        return wangId & (Id.NN | Id.EE | Id.SS | Id.WW);
    }

    /**
     * @parameter {WangId} wangId - The Id to restrict.
     * @returns WangId - Restricted to corner bits `NE|EE|SW|NW` only.
     */
    static toCorner(wangId) {
        return wangId & (Id.NE | Id.SE | Id.SW | Id.NW);
    }

    /**
     * @parameter {WangId} wangId - The Id to restrict.
     * @returns WangId - Ignoring cases which will be represented equivalently.
     */
    static toBlob(wangId) {
        // Unset the corners if the edges are unset.
        const [BOTH_NE_EDGES, BOTH_SE_EDGES, BOTH_SW_EDGES, BOTH_NW_EDGES] = [NN | EE, EE | SS, SS | WW, WW | NN];
        if (wangId & BOTH_NE_EDGES != BOTH_NE_EDGES) {
            wangId &= ~NE;
        }
        if (wangId & BOTH_SE_EDGES != BOTH_SE_EDGES) {
            wangId &= ~SE;
        }
        if (wangId & BOTH_SW_EDGES != BOTH_SW_EDGES) {
            wangId &= ~SW;
        }
        if (wangId & BOTH_NW_EDGES != BOTH_NW_EDGES) {
            wangId &= ~NW;
        }
        return wangId;
    }

    /**
     * Translates wangIds into tiler offsets.
     * @parameter {Id.Projection} projection - A method like `toEdge` or `toBlob` above to restrict wangIds to the ones in use.
     * @parameter {Object.<WangId, integer>} pattern - A mapping from (post-projection) wangId to the tile frame to use.
     * @parameter {Phaser.Tilemaps.Tileset} - The tileset which contains the automap tiles.
     * @returns {Id.Tiler} - A tiler over this set of IDs.
     */
    static tiler(projection, pattern, tileset) {
        return (wangId) => pattern[projection(wangId)] + tileset.firstgid;
    }
}

/** Constants for the directional components of a WangId. */
Id.NN = 0x00000001;
Id.NE = 0x00000010;
Id.EE = 0x00000100;
Id.SE = 0x00001000;
Id.SS = 0x00010000;
Id.SW = 0x00100000;
Id.WW = 0x01000000;
Id.NW = 0x10000000;


/**
 * Bitmasks to restrict *S*ub*T*ile *I*ndices to the area of interest only.
 *
 * The key is the wangId identifying the corner, and the value is the wangId identifying
 * edges and corners relevant to that corner.
 */
Id.STI = {
    [Id.NE]: Id.NN | Id.NE | Id.EE,
    [Id.SE]: Id.EE | Id.SE | Id.SS,
    [Id.SW]: Id.SS | Id.SW | Id.WW,
    [Id.NW]: Id.NN | Id.WW | Id.NW,
};

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
 */
Id.EDGE_PATTERN = {
    [Id.SS]: 0,
    [Id.SS | Id.EE]: 1,
    [Id.WW | Id.SS | Id.EE]: 2,
    [Id.WW | Id.SS]: 3,

    [Id.NN | Id.SS]: 4,
    [Id.NN | Id.EE | Id.SS]: 5,
    [Id.NN | Id.EE | Id.SS | Id.WW]: 6,
    [Id.NN | Id.SS | Id.WW]: 7,

    [Id.NN]: 8,
    [Id.NN | Id.EE]: 9,
    [Id.NN | Id.EE | Id.WW]: 10,
    [Id.NN | Id.WW]: 11,

    [0]: 12,
    [Id.EE]: 13,
    [Id.EE | Id.WW]: 14,
    [Id.WW]: 15,
};

/**
 * Loads a Brigitt's Cross edge tileset. This is suitable for corner terrain. 
 *
 * This is suitable for terrain, and more generically anything that works well on an offset grid.
 *
 * Format: See  http://www.cr31.co.uk/stagecast/wang/pattern.html#brigid .
 */
Id.BRIGITTS_CROSS_PATTERN = {
    [Id.SW]: 0,
    [Id.NE | Id.SE]: 1,
    [Id.NW | Id.SW | Id.SE]: 2,
    [Id.SW | Id.SE]: 3,

    [Id.NW | Id.SE]: 4,
    [Id.NE | Id.SE | Id.SW]: 5,
    [Id.NE | Id.SE | Id.SW | Id.NW]: 6,
    [Id.NE | Id.SW | Id.NW]: 7,

    [Id.NE]: 8,
    [Id.NW | Id.NE]: 9,
    [Id.NW | Id.NE | Id.SE]: 10,
    [Id.NW | Id.SW]: 11,

    [0]: 12,
    [Id.SE]: 13,
    [Id.SW | Id.NE]: 14,
    [Id.NW]: 15,
};

/**
 * Loads an explicit 47-tile "blob" tileset from a fixed order.
 *
 * This is fairly generic and can be used for walls, paths, terrain, overgrowth, etc.
 *
 * See http://www.cr31.co.uk/stagecast/wang/blob.html for more details.
 */
Id.LITERAL_BLOB_PATTERN = {
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
};
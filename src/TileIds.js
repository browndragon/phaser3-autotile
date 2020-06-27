/** See `Ids.js` for significantly more utilities. */
import WangIds from "./WangIds.js";

const {NN, NE, EE, SE, SS, SW, WW, NW} = WangIds;

const TileIds = {
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
     */
    RPG_MAKER: {
        // Nothing uses tile 0.
        [NN | EE | SS | WW]: 1,
        [EE | SE | SS]: 2,
        [SS | SW | WW]: 3,
        [NN | NE | EE]: 4,
        [WW | NW | NN]: 5
    }
};
export default TileIds;
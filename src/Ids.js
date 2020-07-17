/**
 * WangIds are an 8-bit integer with the given low order bits set if the neighbor is set:
 * ```
 *  7 | 0 | 1
 * ---+---+---
 *  6 | x | 2
 * ---+---+---
 *  5 | 4 | 3
 * ```
 * This representation is only well-defined if x is also set (by convention, `null` is used in all cases if it is not). Note that this is useful for edge and blob wangIds; for corner wangIds, the layout is different:
 *
 * ```
 *  |   |
 * -+---+---
 *  | 7 | 1
 * -+---+---
 *  | 5 | 3
 * ```
 *
 * @typedef {integer} WangId
 */
/** Positional index of each direction, clockwise from north.*/
const SHIFTS = {
    NN: 0,
    NE: 1,
    EE: 2,
    SE: 3,
    SS: 4,
    SW: 5,
    WW: 6,
    NW: 7,
};
/** Binary representation of each possible shifted value as an integer whose nth bit is set based on 0 being north and proceeding clockwise. */
const WANGIDS = Object.fromEntries(Object.entries(SHIFTS).map(
    ([k, v]) => [k, 1<<v]
));
/** Map back from WANGIDS to the string name. */
const NAMES = Object.fromEntries(Object.entries(WANGIDS).map(
    ([k, v]) => [v, k]
));

const {NN, NE, EE, SE, SS, SW, WW, NW} = WANGIDS;
const [BOTH_NE_EDGES, BOTH_SE_EDGES, BOTH_SW_EDGES, BOTH_NW_EDGES] = [NN | EE, EE | SS, SS | WW, WW | NN];

/**
 * @callback Ids~IsSet
 * @param {integer} x
 * @param {integer} y
 * @returns boolean - If the value at x,y is "on" for this autotile.
 */

/**
 * @callback Ids~GetWangId
 * @param {Ids~IsSet} isSet - A specific is set callback.
 * @param {integer} x
 * @param {integer} y
 * @returns WangId - The WangId generated around the given xy (so expect IsSet to be called for neighbors of the given point!)
 */

/**
 * @callback Ids~GetProjection
 * @param {WangId} wangId
 * @returns WangId - The input wangId projected into the space of this tileset.
 */

/**
 * @typedef {object} Ids.Getter
 * @property {Ids~GetWangId} wangId
 * @property {Ids~GetProjection} project
 */

/**
 * Utilities for working with specific WangIds and their indices.
 * @namespace
 */
const Ids = {
    // Expose the wangId values for other libraries, constants, etc.
    NN: NN,
    NE: NE,
    EE: EE,
    SE: SE,
    SS: SS,
    SW: SW,
    WW: WW,
    NW: NW,

    /**
     * WangId positional (shifted) values keyed by WangId value.
     */
    Shifts: {
        [NN]: 0,
        [NE]: 1,
        [EE]: 2,
        [SE]: 3,
        [SS]: 4,
        [SW]: 5,
        [WW]: 6,
        [NW]: 7,
    },
    /**
     * A wang 2-edge tileset.
     * This means each tile is dependent on whether it is set, and whether its 4 neighbors are set. If the tile is not itself set, it returns `null`, which the library may choose to treat differently from `0` ("island").
     * @property {Ids.Getter} Edge
     */
    Edge: {
        wangId: (isSet, x, y) => isSet(x, y) ? (0
            | +!!isSet(x, y-1) << 0
            | +!!isSet(x+1, y) << 2
            | +!!isSet(x, y+1) << 4
            | +!!isSet(x-1, y) << 6
        ) : null,
        project: (wangId) => +wangId & (NN | EE | SS | WW),
    },

    /**
     * A wang 2-corner tileset.
     * Each tile's value is assigned to its upper-left corner, and the other corners are the eastern, southeastern, and southern neighbors. As a result, the ambiguity about `islands` from `Edge` doesn't exist (if a tile is set, it will always have its northwest edge set!), and so these are slightly easier to handle.
     * @property {Ids.Getter} Corner
     */
    Corner: {
        wangId: (isSet, x, y) => (0
            | +!!isSet(x+1, y) << 1
            | +!!isSet(x+1, y+1) << 3
            | +!!isSet(x, y+1) << 5
            | +!!isSet(x, y) << 7
        ) || null,
        project: (wangId) => +wangId & (NE | SE | SW | NW),
    },
    /**
     * A wang 2-edge 2-corner tileset where all tiles' interiors are set.
     * As with `Edge`, this tileset distinguishes `wangId` `null` and `0` (null is not set, 0 is set but has no neighbors).
     * If neither edge flanking a corner is set, it will be drawn without the corner set.
     * @property {Ids.Getter} Blob
     */
    Blob: {
        wangId: function (isSet, x, y) {
            if (!isSet(x, y)) {
                return null;
            }
            let retval = 0;
            for (let [c, r, s] of [
                [x, y-1, 0],
                [x+1, y-1, 1],
                [x+1, y, 2],
                [x+1, y+1, 3],
                [x, y+1, 4],
                [x-1, y+1, 5],
                [x-1, y, 6],
                [x-1, y-1, 7]
            ]) {
                retval |= +!!isSet(c, r) << s;
            }
            return this.project(retval);
        },
        project: (wangId) => {
            // Unset the corners if the edges are unset.
            let retval = +wangId;
            if ((retval & BOTH_NE_EDGES) != BOTH_NE_EDGES) {
                retval &= ~NE;
            }
            if ((retval & BOTH_SE_EDGES) != BOTH_SE_EDGES) {
                retval &= ~SE;
            }
            if ((retval & BOTH_SW_EDGES) != BOTH_SW_EDGES) {
                retval &= ~SW;
            }
            if ((retval & BOTH_NW_EDGES) != BOTH_NW_EDGES) {
                retval &= ~NW;
            }
            return retval;
        }
    },
    /**
     * @property {Object.<WangId, Ids.Getter>} Subtile
     */
    Subtile: {
        [NE] : {
            wangId: (isSet, x, y) => (0
                | +!!isSet(x+0, y-1) << 0
                | +!!isSet(x+1, y-1) << 1
                | +!!isSet(x+1, y+0) << 2
            ),
            project: (wangId) => Ids.Blob.project(wangId) & (NN | NE | EE)
        },
        [SE] : {
            wangId: (isSet, x, y) => (0
                | +!!isSet(x+1, y+0) << 2
                | +!!isSet(x+1, y+1) << 3
                | +!!isSet(x+0, y+1) << 4
            ),
            project: (wangId) => Ids.Blob.project(wangId) & (EE | SE | SS)
        },
        [SW] : {
            wangId: (isSet, x, y) => (0
                | +!!isSet(x+0, y+1) << 4
                | +!!isSet(x-1, y+1) << 5
                | +!!isSet(x-1, y+0) << 6
            ),
            project: (wangId) => Ids.Blob.project(wangId) & (SS | SW | WW)
        },
        [NW] : {
            wangId: (isSet, x, y) => (0
                | +!!isSet(x-1, y+0) << 6
                | +!!isSet(x-1, y-1) << 7
                | +!!isSet(x+0, y-1) << 0
            ),
            project: (wangId) => Ids.Blob.project(wangId) & (WW | NW | NN)
        },
    },
    /**
     * Just for debugging.
     * @function Name
     * @parameter {WangId} wangId
     * @returns string - A human-readable representation of the wangId.
     */
    Name: function(wangId) {
        let retval = [];
        for (let i = 0; i < 8; ++i) {
            const mask = 1<<i;
            if (+wangId & mask) {
                let name = NAMES[mask];
                // For compactness, remove duplicated letters.
                if (name[0] == name[1]) {
                    name = name[0];
                }
                retval.push(name);
            }
        }
        if (retval.length <= 0) {
            return '0';
        } 
        return retval.join('|');
    }
};
Ids.blob = Ids.Blob;
Ids.corner = Ids.Corner;
Ids.edge = Ids.Edge;

export default Ids;
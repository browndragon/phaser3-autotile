import WangIds from './WangIds';


const {NN, NE, EE, SE, SS, SW, WW, NW} = WangIds;
const [BOTH_NE_EDGES, BOTH_SE_EDGES, BOTH_SW_EDGES, BOTH_NW_EDGES] = [NN | EE, EE | SS, SS | WW, WW | NN];

/**
 * Utilities for working with specific WangIds and their indices.
 */
const Ids = {
    NN: NN,
    NE: NE,
    EE: EE,
    SE: SE,
    SS: SS,
    SW: SW,
    WW: WW,
    NW: NW,

    /**
     * A wang 2-edge tileset.
     * This means each tile is dependent on whether it is set, and whether its 4 neighbors are set. If the tile is not itself set, it returns `null`, which the library may choose to treat differently from `0` ("island").
     */
    Edge: new WangIds.Getter({
        wangId: (isSet, x, y) => isSet(x, y) ? (0
            | +!!isSet(x, y-1) << 0
            | +!!isSet(x+1, y) << 2
            | +!!isSet(x, y+1) << 4
            | +!!isSet(x-1, y) << 6
        ) : null,
        project: (wangId) => +wangId & (NN | EE | SS | WW),
    }),

    /**
     * A wang 2-corner tileset.
     * Each tile's value is assigned to its upper-left corner, and the other corners are the eastern, southeastern, and southern neighbors. As a result, the ambiguity about `islands` from `Edge` doesn't exist (if a tile is set, it will always have its northwest edge set!), and so these are slightly easier to handle.
     */
    Corner: new WangIds.Getter({
        wangId: (isSet, x, y) => (0
            | +!!isSet(x+1, y) << 1
            | +!!isSet(x+1, y+1) << 3
            | +!!isSet(x, y+1) << 5
            | +!!isSet(x, y) << 7
        ) || null,
        project: (wangId) => +wangId & (NE | SE | SW | NW),
    }),
    /**
     * A wang 2-edge 2-corner tileset where all tiles' interiors are set.
     * As with `Edge`, this tileset distinguishes `wangId` `null` and `0` (null is not set, 0 is set but has no neighbors).
     * If neither edge flanking a corner is set, it will be drawn without the corner set.
     */
    Blob: new WangIds.Getter({
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
    }),
    Subtile: {
        [NE] : new WangIds.Getter({
            wangId: (isSet, x, y) => (0
                | +!!isSet(x+0, y-1) << 0
                | +!!isSet(x+1, y-1) << 1
                | +!!isSet(x+1, y+0) << 2
            ),
            project: (wangId) => +wangId & (NN | NE | EE)
        }),
        [SE] : new WangIds.Getter({
            wangId: (isSet, x, y) => (0
                | +!!isSet(x+1, y+0) << 2
                | +!!isSet(x+1, y+1) << 3
                | +!!isSet(x+0, y+1) << 4
            ),
            project: (wangId) => +wangId & (EE | SE | SS)
        }),
        [SW] : new WangIds.Getter({
            wangId: (isSet, x, y) => (0
                | +!!isSet(x+0, y+1) << 4
                | +!!isSet(x-1, y+1) << 5
                | +!!isSet(x-1, y+0) << 6
            ),
            project: (wangId) => +wangId & (SS | SW | WW)
        }),
        [NW] : new WangIds.Getter({
            wangId: (isSet, x, y) => (0
                | +!!isSet(x-1, y+0) << 6
                | +!!isSet(x-1, y-1) << 7
                | +!!isSet(x+0, y-1) << 0
            ),
            project: (wangId) => +wangId & (WW | NW | NN)
        }),
    },
};
/**
 * @readonly
 * @enum
 * @memberOf Ids
 */
Ids.Type = {
    edge: 'edge',
    corner: 'corner',
    blob: 'blob'
};
/** Convenience exposure, when we want to identify getters by string. */
Ids.Tile = {
    blob: Ids.Blob,
    corner: Ids.Corner,
    edge: Ids.Edge,
};

export default Ids;
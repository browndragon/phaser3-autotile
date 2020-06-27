import WangIds from "./WangIds.js";
import TileIds from "./TileIds.js";

/**
 * @callback IdType~IsSet
 * @parameter {number} x - The coordinate to probe.
 * @parameter {number} y - The coordinate to probe.
 * @returns boolean - True if the coordinate is "on".
 */

/**
 * A specific type of tileset layout logic, WangId logic, and the ids it uses.
 */
export class IdType {
    /**
     * @parameter {object} params - The container arg.
     * @parameter {string} params.name - A name for this IdType.
     * @parameter {Object.<WangId, integer>} params.pattern - A mapping from wangId -> tileId for this IdType. This is somewhat flexible, since perhaps you have combined multiple terrains on the same sheet; use `withPattern` for a new IdType varying only in pattern.
     * @parameter {function(IdType~IsSet, integer, integer):WangId?} params.wangId - A method which calculates wangIds given an `isSet`` callback and a specific `x,y`.
     * @parameter {function(WangId):WangId} params.project - Returns the wangId appropriate to this IdType for the given (possibly more fully-featured) wangId. For instance, an edge tileset should turn off corners.
     */
    constructor({name, pattern, wangId, project}={}) {
        this.name = name;
        this.pattern = pattern;
        this.wangId = wangId;  // Exposed & invoked as a method.
        this.project = project;  // Exposed & invoked as a method.
    }
    withPattern(pattern) {
        return new IdType(this.name, pattern, this.wangId, this.project);
    }
    tileId(wangId) {
        if (wangId == null) {
            return null;
        }
        return this.pattern[this.project(wangId)];
    }
}

const {NN, NE, EE, SE, SS, SW, WW, NW} = WangIds;
const [BOTH_NE_EDGES, BOTH_SE_EDGES, BOTH_SW_EDGES, BOTH_NW_EDGES] = [NN | EE, EE | SS, SS | WW, WW | NN];

/**
 * Utilities for working with wangIds, tileIds, and the relationship between them.
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
    TileIds: TileIds,

    /**
     * A wang 2-edge tileset.
     * This means each tile is dependent on whether it is set, and whether its 4 neighbors are set. If the tile is not itself set, it returns `null`, which the library may choose to treat differently from `0` ("island").
     */
    Edge: new IdType({
        name: "edge",
        pattern: TileIds.EDGE,
        wangId: (isSet, x, y) => {
            if (!isSet(x, y)) {
                return null;
            }
            return (0
                | +!!isSet(x, y-1) << 0
                | +!!isSet(x+1, y) << 2
                | +!!isSet(x, y+1) << 4
                | +!!isSet(x-1, y) << 6
            );
        },
        project: (wangId) => wangId & (NN | EE | SS | WW),
    }),

    /**
     * A wang 2-corner tileset.
     * Each tile's value is assigned to its upper-left corner, and the other corners are the eastern, southeastern, and southern neighbors. As a result, the ambiguity about `islands` from `Edge` doesn't exist (if a tile is set, it will always have its northwest edge set!), and so these are slightly easier to handle.
     */
    Corner: new IdType({
        name: "corner",
        pattern: TileIds.BRIGITTS_CROSS,
        wangId: (isSet, x, y) => {
            const wangId = (0
                | +!!isSet(x+1, y) << 1
                | +!!isSet(x+1, y+1) << 3
                | +!!isSet(x, y+1) << 5
                | +!!isSet(x, y) << 7
            );
            if (wangId == 0 && !isSet(x, y)) {
                return null;
            }
            return wangId;
        },
        project: (wangId) => wangId & (NE | SE | SW | NW),
    }),
    /**
     * A wang 2-edge 2-corner tileset where all tiles' interiors are set.
     * As with `Edge`, this tileset distinguishes `wangId` `null` and `0` (null is not set, 0 is set but has no neighbors).
     * If neither edge flanking a corner is set, it will be drawn without the corner set.
     */
    Blob: new IdType({
        name: "blob",
        pattern: TileIds.LITERAL_BLOB,
        wangId: (isSet, x, y) => {
            if (!isSet(x, y)) {
                return null;
            }
            return (0
                | +!!isSet(x, y-1) << 0
                | +!!isSet(x+1,y-1) << 1
                | +!!isSet(x+1, y) << 2
                | +!!isSet(x+1, y+1) << 3
                | +!!isSet(x, y+1) << 4
                | +!!isSet(x-1, y+1) << 5
                | +!!isSet(x-1, y) << 6
                | +!!isSet(x-1, y-1) << 7
            );
        },
        project: (wangId) => {
            // Unset the corners if the edges are unset.
            let retval = wangId;
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
        [NE] : new IdType({
            name: "subtileNE",
            pattern: {},  // It's a long story. See Subtiles for useful examples with geometry.
            wangId: (isSet, x, y) => {
                if (!isSet(x, y)) {
                    return null;
                }
                return (0
                    | +!!isSet(x+0, y-1) << 0
                    | +!!isSet(x+1, y-1) << 1
                    | +!!isSet(x+1, y+0) << 2
                );
            },
            project: (wangId) => Ids.Blob.project(wangId) & (NN | NE | EE)
        }),
        [SE] : new IdType({
            name: "subtileSE",
            pattern: {},  // It's a long story. See Subtiles for useful examples with geometry.
            wangId: (isSet, x, y) => {
                if (!isSet(x, y)) {
                    return null;
                }
                return (0
                    | +!!isSet(x+1, y+0) << 2
                    | +!!isSet(x+1, y+1) << 3
                    | +!!isSet(x+0, y+1) << 4
                );
            },
            project: (wangId) => Ids.Blob.project(wangId) & (EE | SE | SS)
        }),
        [SW] : new IdType({
            name: "subtileSW",
            pattern: {},  // It's a long story. See Subtiles for useful examples with geometry.
            wangId: (isSet, x, y) => {
                if (!isSet(x, y)) {
                    return null;
                }
                return (0
                    | +!!isSet(x+0, y+1) << 4
                    | +!!isSet(x-1, y+1) << 5
                    | +!!isSet(x-1, y+0) << 6
                );
            },
            project: (wangId) => Ids.Blob.project(wangId) & (SS | SW | WW)
        }),
        [NW] : new IdType({
            name: "subtileNW",
            pattern: {},  // It's a long story. See Subtiles for useful examples with geometry.
            wangId: (isSet, x, y) => {
                if (!isSet(x, y)) {
                    return null;
                }
                return (0
                    | +!!isSet(x-1, y+0) << 6
                    | +!!isSet(x-1, y-1) << 7
                    | +!!isSet(x+0, y-1) << 0
                );
            },
            project: (wangId) => Ids.Blob.project(wangId) & (WW | NW | NN)
        }),
    },
};
export default Ids;
import {Rectangle} from './Bindings';
import Ids from './Ids';
import Tilesets from './Tilesets';


/**
 * @typedef {object} Subtiles.Geometry
 * @property {number} [tileWidth=32] - The output tile width in pixels.
 * @property {number} [tileHeight=32] - The output tile height in pixels.
 * @property {boolean} [isFullTile=false] - If true, the tile/subtile geometry is degenerate -- each tile represents a whole subtile.
 * @property {number} [NESubtileWidth=tileWidth/2] - The width of the NE subtile.
 * @property {number} [NESubtileHeight=tileHeight/2] - The height of the NE subtile.
 */

/**
 * An object keyed by WangId whose values are the frames to use for subtiling.
 * When the value is an array, it is assumed to be 4 elements NE, SE, SW, NW to use as explicit entries in that direction.
 * These frames are provided as frame offsets within a texture (which must be provided by the caller).
 * @typedef {Object.<number, integer|integer[]>} Subtiles.Bases 
 */

/**
 * Indexes the provided basis tiles by corner.
 * 
 * There are two common representations for these pieces; either:
 * * Isolation (no connections)
 * * Connection N/S (as appropriate)
 * * Connection E/W (as appropriate)
 * * Right angle connection to both neighboring edges (no corner)
 * * Full connection to both neighboring edges and corner.
 * or else:
 * * One convex tile (a crossroads)
 * * Four convex tiles (each of the NE, SE, SW, and NW corners of an island).
 */
export default class Subtiles {
    /**
     * @parameter {object} config - The config for this subtiles object.
     * @parameter {Subtiles.Bases} config.bases - The bases to construct from this.
     * @parameter {Subtiles.Geometry} config.geometry - The geometry of these bases.
     */
    constructor(config) {
        const {bases, geometry} = config;
        this.subtiles = {
            [Ids.NE]: Subtiles.loadSubtiles(bases, Ids.NE),
            [Ids.SE]: Subtiles.loadSubtiles(bases, Ids.SE),
            [Ids.SW]: Subtiles.loadSubtiles(bases, Ids.SW),
            [Ids.NW]: Subtiles.loadSubtiles(bases, Ids.NW),
        };
        const {tileWidth=32, tileHeight=32, isFullTile=false} = geometry;
        const {NESubtileWidth=tileWidth/2, NESubtileHeight=tileHeight/2} = geometry;
        if (!tileWidth || !tileHeight) {
            throw 'Invalid geometry';
        }
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
        this.isFullTile = isFullTile;
        this.NESubtileWidth = NESubtileWidth;
        this.NESubtileHeight = NESubtileHeight;
    }

    /**
     * @parameter {WangId} wangId - The tile wangId for which to fetch a subtile.
     * @parameter {WangId} corner - The corner to project into (for instance, upper right would be Ids.NE).
     * @returns FrameId - The frame containing the subtile to use (further analysis will rely on specific geometry).
     */
    tileId(wangId, corner) {
        const cornerWangId = Ids.Subtile[corner].project(wangId);
        return this.subtiles[corner][cornerWangId];
    }

    /**
     * Given the tile/subtile geometry, returns the location of the subtile within the tile.
     * @parameter {WangId} corner - The pointer towards the desired corner.
     * @returns {Rectangle} - The subtile relative to the geometry frame.
     */
    subTileGeometry(corner) {
        const {tileWidth, tileHeight, isFullTile, NESubtileWidth, NESubtileHeight} = this;
        if (isFullTile) {
            return new Rectangle(0, 0, tileWidth, tileHeight);
        }
        switch (corner) {
        case Ids.NE: return new Rectangle(
            tileWidth-NESubtileWidth,
            0,
            NESubtileWidth,
            NESubtileHeight
        );
        case Ids.SE: return new Rectangle(
            tileWidth-NESubtileWidth,
            NESubtileHeight,
            NESubtileWidth,
            tileHeight - NESubtileHeight
        );
        case Ids.SW: return new Rectangle(
            0,
            NESubtileHeight,
            tileWidth-NESubtileWidth,
            tileHeight - NESubtileHeight
        );
        case Ids.NW: return new Rectangle(
            0,
            0,
            tileWidth-NESubtileWidth,
            NESubtileHeight
        );
        default: throw 'Unrecognized corner';
        }
    }

    /**
     * @parameter {Autotileset.Bases} bases - The configuration to use for loading the tileset.
     * @parameter {WangId} corner -- Points at the corner to be identified.
     * @returns T - The stored frame type.
     */
    static loadSubtiles(bases, corner) {
        let patterns = {};
        for (let [wangIdStr, frame] of Object.entries(bases)) {
            let wangId = +wangIdStr;
            const cornerBlobId = Ids.Subtile[corner].project(wangId);
            if (Array.isArray(frame)) {
                frame = frame[Subtiles.CORNER_INDICES[corner]];
            }
            if (frame == undefined) {
                throw 'Can\'t find necessary frame';
            }
            patterns[cornerBlobId] = frame;
        }
        return patterns;
    }
    /**
   * @parameter {Rectangle} subtile - The geometry of the subtile within a frame.
   * @parameter {Rectangle} parent - The location of the frame within the source texture.
   * @parameter {number} resolution - The resolution of the source texture.
   * @returns Rectangle - The subtile rectangle relative to the texture for the source.
   */
    static InSrcCoords(subtile, parent, resolution) {
        let retval = new Rectangle(subtile.x, subtile.y, subtile.width, subtile.height);
        retval = Rectangle.Scale(retval, resolution);
        retval = Rectangle.Offset(retval, parent.x, parent.y);
        return retval;
    }

    /**
   * @parameter {Rectangle} subtile - The geometry of the subtile within a frame.
   * @parameter {Rectangle} parent - The location of the frame within the destination texture.
   * @returns Rectangle - The rectangle relative to the texture for the destination.
   */
    static InDstCoords(subtile, parent) {
        let retval = new Rectangle(subtile.x, subtile.y, subtile.width, subtile.height);
        retval = Rectangle.Offset(retval, parent.x, parent.y);
        return retval;
    }

    static RpgMakerFormatFromGeometry(geometry) {
        return new Subtiles({
            bases: Tilesets.Patterns.RPG_MAKER,
            geometry: geometry
        });
    }
}
Subtiles.CORNER_INDICES = {
    [Ids.NE]: 0,
    [Ids.SE]: 1,
    [Ids.SW]: 2,
    [Ids.NW]: 3
};



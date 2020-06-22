import {Rectangle, Point} from "./Bindings.js";

/**
 * @typedef {object} Subtiles.Config
 * @property {number} config.tileWidth - The output tile width in pixels.
 * @property {number} config.tileHeight - The output tile height in pixels.
 * @property {number} [config.NESubtileWidth=config.tileWidth/2] - The width of the NE subtile.
 * @property {number} [config.NESubtileHeight=config.tileHeight/2] - The height of the NE subtile.
 */

export default class Subtiles {
    /**
     * @parameter {Subtiles.Config} config - The geometry to use.
     */
    static subTileGeometry(config, corner) {
        let [NESubtileWidth, NESubtileHeight] = [config.NESubtileWidth, config.NESubtileHeight];
        if (NESubtileWidth == undefined) {
            NESubtileWidth = config.tileWidth / 2;
        }
        if (NESubtileHeight == undefined) {
            NESubtileHeight = config.tileHeight / 2;
        }
        switch (corner) {
            case Id.NE: return new Rectangle(config.tileWidth-NESubtileWidth, 0, NESubtileWidth, NESubtileHeight);
            case Id.SE: return new Rectangle(config.tileWidth-NESubtileWidth, config.NESubtileHeight, NESubtileWidth, config.tileHeight - NESubtileHeight);
            case Id.SW: return new Rectangle(0, config.NESubtileHeight, config.tileWidth-NESubtileWidth, config.tileHeight - NESubtileHeight);
            case Id.NW: return new Rectangle(0, 0, config.tileWidth-NESubtileWidth, config.NESubtileHeight);
            default: throw new Exception("Unrecognized corner");
        }
    }
    static inSrcCoords(subtile, parent, resolution) {
        let retval = new Rectangle(subtile.x, subtile.y, subtile.width, subtile.height);
        retval = Rectangle.Scale(retval, resolution);
        retval = Rectangle.Offset(retval, parent.x, parent.y);
        return retval;
    }
    static inDstCoords(subtile, parent) {
        let retval = new Rectangle(subtile.x, subtile.y, subtile.width, subtile.height)
        retval = Rectangle.Offset(retval, parent.x, parent.y);
        return retval;
    }
}
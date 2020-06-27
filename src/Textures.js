import {Rectangle, Point} from "./Bindings.js";
import Ids from "./Ids.js";
import Pointwise from "./Pointwise.js";
import Subtiles from "./Subtiles.js";

import Phaser from 'phaser';

/**
 * Utilities to create blob textures out of parts.
 */
export default class Textures {
    /**
     * Provides a 47 tile blob tileset given input tiles.
     * @parameter {object} config - The blob tileset configuration.
     * @parameter {string} config.key - The name to give the output texture.
     * @parameter {string} config.rawTexture - The name for the input texture.
     * @parameter {Phaser.Textures.TextureManager} config.tm - The texture manager to create this canvas under (and load the raw texture from).
     * @parameter {Subtiles} config.subtiles - The index & geometryof subtile parts to stitch together.
     * @returns {Phaser.Tilemaps.Tileset} - The resulting blob tileset.
     */
    static CreateBlobTexture(config) {
        const {
            key,
            rawTexture,
            tm,
            subtiles,
        } = config;

        const sourceIndex = 0;
        const texture = tm.createCanvas(key, subtiles.tileWidth, 47 * subtiles.tileHeight);
        if (!texture) {
            throw "Couldn't create backing canvas";
        }
        let frameRect = new Phaser.Geom.Rectangle(0, 0, subtiles.tileWidth, subtiles.tileHeight);

        // Iterate over the target frames.
        for (const [wangIdStr, index] of Object.entries(Ids.TileIds.LITERAL_BLOB)) {
            const wangId = +wangIdStr;
            // Relative to the texture.
            frameRect = frameRect.setPosition(0, index * subtiles.tileHeight);

            for (let corner of [Ids.NE, Ids.SE, Ids.SW, Ids.NW]) {
                const frame = tm.getFrame(rawTexture, subtiles.tileId(wangId, corner));

                if (!frame) {
                    throw "Can't find necessary subtile";
                }

                // Relative to the source image.
                const tileCanvas = frame.canvasData;
                const srcRes = frame.source.resolution;

                // Relative to the frame.
                const subframeRect = subtiles.subTileGeometry(corner);
                const srcCoords = Subtiles.InSrcCoords(subframeRect, tileCanvas, srcRes);
                // Relative to the texture.
                const dstCoords = Subtiles.InDstCoords(subframeRect, frameRect);
                texture.context.drawImage(
                    frame.source.image,
                    srcCoords.x,
                    srcCoords.y,
                    srcCoords.width,
                    srcCoords.height,
                    dstCoords.x,
                    dstCoords.y,
                    dstCoords.width,
                    dstCoords.height,
                );
                texture.update();
            }
            texture.add(index, sourceIndex, /* x */ 0, index * subtiles.tileHeight, subtiles.tileWidth, subtiles.tileHeight);
        }
        // Write out to GL.
        texture.refresh();
        return texture;
    }
}


import Phaser from 'phaser';
import Id from "./Id.js";

/**
 * Describes the format of input data for generating an autotileset.
 * @typedef {object} BlobIndexer.Config
 *
 * Autotiles are generated from parts taken from at least 5 "source" tiles, which are then sliced & diced. Across the input tiles, each corner must provide an example of:
 *
 * * Isolation (no connections)
 * * Connection N/S (as appropriate)
 * * Connection E/W (as appropriate)
 * * Right angle connection to both neighboring edges (no corner)
 * * Full connection to both neighboring edges and corner.
 *
 * These are commonly provided via the RPGMaker format, which provides 4 convex corner tiles (`SS|SW|WW`, `NN|WW|NW`, `NN|NE|EE`, `EE|SE|SS`) and one concave crossroad tile (`NN|EE|SS|WW`). Other implementations are also accepted, however, such as explicitly matching the required inputs -- a `0` tile, a `255` tile, a `NN|EE|SS|WW` tile, a `NN|SS` tile, and a `EE|WW` tile.
 *
 * @property {object[number, Phaser.Textures.Frame]} bases - A dict of wangId -> base tile frames (see Tileset.ExplicitTileset#tileMappings, for instance. For best performance, provide exactly five tiles matching the requirements above.
 * TODO: Better-support ambiguous overloads like the RPGMaker 9-tile convex tile (with additional edge pieces and explicit center).
 * TODO: Support the liberated pixel cup stylesheet. It replaces the crossroad tile with a "donut" tile which doesn't have a well-formed wangId -- it would be 255 but with a hollow center.
 */

/**
 * Given a set of generator tiles, indexes them by per-corner connectivity information.
 *
 * See http://www.cr31.co.uk/stagecast/wang/blob.html for more details.
 */
export default class BlobIndexer {
    /**
     * @param {BlobIndexer.Config} config - The configuration to use for loading the tileset.
     */
    constructor(config) {
        this.originalTiles = config.bases;
        this.subtiles = {
            [Id.NE]: BlobIndexer.loadSubtiles(config, Id.NE),
            [Id.SE]: BlobIndexer.loadSubtiles(config, Id.SE),
            [Id.SW]: BlobIndexer.loadSubtiles(config, Id.SW),
            [Id.NW]: BlobIndexer.loadSubtiles(config, Id.NW),
        }
    }

    /**
     * @param {Autotileset.Config} config - The configuration to use for loading the tileset.
     * @param {number} corner -- a corner WangId.
     */
    static loadSubtiles(config, corner) {
        const cornerMask = Id.STI[corner];
        if (cornerMask == undefined) {
            throw new Exception("Unrecognized corner");
        }

        let patterns = {};

        for (let wangId of Object.keys(config.bases)) {
            const tile = config.bases[wangId];
            const cornerBlobId = Id.toBlob(wangId) & cornerMask;
            patterns[cornerBlobId] = tile;
        }

        return patterns;
    }

    /**
     * Returns the (entire!) image to take the given corner from.
     */
    getSubTile(wangId, corner) {
        const cornerMask = Id.STI[corner];
        if (cornerMask == undefined) {
            throw new Exception("Unrecognized corner");
        }

        const cornerBlobId = Id.toBlob(wangId) & cornerMask;
        return this.subtiles[corner][cornerBlobId];
    }

    toTiler(firstgid) {
        if (firstgid == undefined) {
            firstgid = 0;
        }
        return Id.tiler(Id.toBlob, Id.LITERAL_BLOB_PATTERN, firstgid);
    }

    /**
     * @parameter {object} config - The blob tileset configuration.
     * @parameter {string} config.tilesetName - The name to give the output tileset.
     * @parameter {Phaser.Textures.TextureManager} config.tm - The texture manager to create this canvas under.
     * @parameter {Subtiles.Config} config.subtiles - The config for the tile & subtile geometry.
     * @parameter {string} [config.textureKey=config.tilesetName] - The key name to give the output tile texture.
     * @parameter {integer} firstgid - The first tile index the tileset contains.
     * @returns {Phaser.Tilemaps.Tileset} - The resulting blob tileset.
     */
    toTileset(config) {
        let {
            tilesetName,
            tm,
            subtiles: {
                tileWidth=32,
                tileHeight=32,
                tileMargin=0,
                tileSpacing=0,
            },
            firstgid=0
        } = config;
        let {textureKey=tilesetName} = config;

        const sourceIndex = 0;
        let frames = {};
        const texture = config.tm.createCanvas(config.textureKey, config.tileWidth, 47*config.tileHeight);
        let frameRect = new Phaser.Geom.Rectangle(0, 0, config.tileWidth, config.tileHeight);

        for (let [wangId, index] of Object.entires(Id.LITERAL_BLOB_PATTERN)) {
            // Relative to the texture.
            frameRect = frameRect.setPosition(0, index * config.tileHeight);

            for (let corner of [Id.NE, Id.SE, Id.SW, Id.NW]) {
                const tile = this.getSubtile(wangId, corner);
                if (!tile) {
                    throw new Exception("Can't find necessary subtile");
                }
                // Relative to the source image.
                const tileCanvas = tile.canvasData;
                const srcRes = tile.source.resolution;

                // Relative to the frame.
                const subframeRect = Subtiles.subTileGeometry(config.subtiles, corner);
                const srcCoords = Subtiles.inSrcCoords(subframeRect, tileCanvas, srcRes);
                // Relative to the texture.
                const dstCoords = Subtiles.inDstCoords(subframeRect, frameRect);
                texture.context.drawImage(
                    tile.source.image,
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
            frames[wangId] = texture.add(wangId, sourceIndex, /* x */ 0, index*config.tileHeight, config.tileWidth, config.tileHeight);
        }
        // Write out to GL.
        texture.refresh();

        let tileset = Phaser.Tilemaps.Tileset(tilesetName, firstgid, tileWidth, tileHeight, tileMargin, tileSpacing, tileProperties, tileData);
        return tileset.setImage(texture);
    }
}

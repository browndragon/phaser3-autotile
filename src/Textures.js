import Ids from './Ids';
import Patterns from './Patterns';
import Pointwise from './Pointwise';

import Phaser from 'phaser';

/**
 * Utilities to create blob textures out of parts.
 */
export default class Textures {
    static register() {
        /**
         * Generates a full blob tileset by slicing & dicing the input config.
         * @parameter {string} key - The name under which to generate the new texture.
         * @parameter {object} config - The configuration to use in generating this autotile.
         * @parameter {string} [config.fromKey=`raw${key}`] - The input texture.
         * @parameter {Patterns.SubtileGeometry} [config.subtileGeometry={}] - The geometry of the input texture.
         * @parameter {Pattern} [config.pattern=Patterns.RPG_MAKER] - The logical pattern the texture represents.
         * @parameter {Pattern} [config.outputPattern=Patterns.BLOB_LITERAL] - The logical pattern the texture represents.
         * @parameter {HTMLCanvasElement} [canvas=null] - The canvas to write into (or null and this will create one).
         * @parameter {boolean} resizeCanvas - Whether to resize the target canvas to match the blob geometry.
         * @parameter {boolean} clearCanvas - Whether to clear the target canvas first.
         * @parameter {Phaser.Types.Create.GenerateTextureCallback} preRender - To be called on the canvas before rendering.
         * @parameter {Phaser.Types.Create.GenerateTextureCallback} preRender - To be called on the canvas post rendering.
         */
        Phaser.Textures.TextureManager.prototype.generateBlobAutotileTexture = function(key, config) {
            const {
                fromKey,
                subtileGeometry,
                pattern,
                outputPattern,
                canvas,
                resizeCanvas,
                clearCanvas,
                preRender,
                postRender
            } = config;
            return Textures.CreateBlobTexture(this, key, fromKey, subtileGeometry, pattern, outputPattern, canvas, resizeCanvas, clearCanvas, preRender, postRender);
        };
    }

    /**
     * Provides a 47 tile blob tileset given input tiles. This implements `Phaser.Textures.TextureManager.generateBlobAutotileTexture` with the obvious parameter mappings.
     */
    static CreateBlobTexture(textureManager, key, fromKey=`raw${key}`, subtileGeometry={}, pattern=Patterns.RPG_MAKER, outputPattern=Patterns.LITERAL_BLOB, canvas=null, resizeCanvas=true, clearCanvas=true, preRender=null, postRender=null) {
        if (!textureManager.checkKey(key)) {
            throw 'key already in use';
        }
        const {
            tileWidth, tileHeight, topLeftWidth, topLeftHeight,
            margin: [tm, rm, bm, lm],
            spacing: [sx, sy]
        } = Patterns.NormalizeGeometry(subtileGeometry);
        let cornerIndex = Patterns.IndexByCorner(pattern); 

        const sourceTexture = textureManager.get(fromKey);
        const sourceFrame = sourceTexture.get('__BASE');
        const srcRes = sourceFrame.source.resolution;
        const sourcePointwise = new Pointwise(
            sourceFrame.x + lm,
            sourceFrame.y + tm,
            sourceFrame.width - lm - rm,
            sourceFrame.height - tm - bm,
            tileWidth + sx,
            tileHeight + sy
        );

        const [canvasWidth, canvasHeight] = [tileWidth, 47*tileHeight];
        if (!canvas) {
            canvas = Phaser.Display.Canvas.CanvasPool.create2D(this, canvasWidth, canvasHeight);
            resizeCanvas=false;
            clearCanvas=false;            
        }
        if (resizeCanvas) {
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;
        }
        let ctx = canvas.getContext('2d');
        if (clearCanvas) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        if (preRender) {
            preRender(canvas, ctx);
        }
        // Iterate over the target frames.
        for (const [wangId, index] of Object.entries(outputPattern)) {
            const [dstPX, dstPY] = [0, index * tileHeight];
            for (let corner of [Ids.NE, Ids.SE, Ids.SW, Ids.NW]) {
                const [offsetX, offsetY] = [
                    Patterns.SubtileCornerOffsets[corner][0] * topLeftWidth,
                    Patterns.SubtileCornerOffsets[corner][1] * topLeftHeight,
                ];
                const [subtileWidth, subtileHeight] = [
                    !offsetX ? topLeftWidth : tileWidth - topLeftWidth,
                    !offsetY ? topLeftHeight : tileHeight - topLeftHeight
                ];

                const cornerWangId = Patterns.LookupWangIdIndex(cornerIndex, corner, wangId);
                const tileId = pattern[cornerWangId];
                const [srcPX, srcPY] = sourcePointwise.nth(tileId);

                const [srcX, srcY, srcWidth, srcHeight] = [
                    srcPX + offsetX * srcRes,
                    srcPY + offsetY * srcRes,
                    subtileWidth * srcRes,
                    subtileHeight * srcRes,
                ];
                const [dstX, dstY, dstWidth, dstHeight] = [
                    dstPX + offsetX,
                    dstPY + offsetY,
                    subtileWidth,
                    subtileHeight,
                ];

                ctx.drawImage(
                    sourceFrame.source.image,
                    srcX,
                    srcY,
                    srcWidth,
                    srcHeight,
                    dstX,
                    dstY,
                    dstWidth,
                    dstHeight
                );
            }
        }
        if (postRender) {
            postRender(canvas, ctx);
        }

        return textureManager.addCanvas(key, canvas);
    }
}

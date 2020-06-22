import {Rectangle, Point} from "./Bindings.js";
import Id from "./Id.js";

/**
 * @callback Grid~DataSourceCallback
 * @param {number} x - A grid horizontal coordinate to fetch data from.
 * @param {number} y - A grid vertical coordinate to fetch data from.
 * @returns {boolean} - True if the point (x,y) is "on" for this grid.
 */

export default class Grid {
    /**
     * @param {Rectangle} rect - The area governed by this wang grid parser.
     * @param {Grid~DataSource} dataSource - The source of information to fetch from.
     * @param {Grid.Overflow} [overflow] - The handling of probes for areas outside of the rectangle.
     */
    constructor(rect, dataSource, overflow) {
        this.rect = rect;
        this.dataSource = dataSource;
        this.overflow = overflow;
        this.values = new Map();
        this.refresh(rect);
    }

    /**
     * @param {Rectangle} rect - The area to refresh.
     */
    refresh(rect) {
        const scopedRect = Phaser.Geom.Rectangle.Intersection(this.rect, rect, new Rectangle(0, 0, 0, 0));
        for (var y = scopedRect.top; y < scopedRect.bottom; ++y) {
            for (var x = scopedRect.left; x < scopedRect.right; ++x) {
                const present = dataSource(x, y);
                if (present) {
                    this.values.set([x, y], true);
                } else {
                    this.values.delete([x, y]);
                }
            }
        }
    }

    /**
     * @param {number} x - The horizontal coordinate to fetch.
     * @param {number} y - The vertical component to fetch.
     * @returns {boolean} - True if the tile is "on".
     * @private
     */
    isSet(x, y) {
        if (Phaser.Geom.Rectangle.Contains(this.rect, x, y)) {
            return this.values.has([x, y]);
        }
        switch (this.overflow) {
            case Grid.Overflow.TORUS: {
                let p = this.rectangleMod(x, y);
                return this.values.has([p.x, p.y]);
            }
            case Grid.Overflow.NEAREST_NEIGHBOR: {
                let p = this.rectangleClamp(x, y);
                return this.values.has([p.x, p.y]);
            }
            case Grid.Overflow.ALWAYS_ON: {
                return true;
            }
            case Grid.Overflow.ALWAYS_OFF:  // Fallthrough intentional.
            default:
                return false;
        }
    }

    /**
     * @param {number} x - The horizontal coordinate to fetch.
     * @param {number} y - The vertical coordinate to fetch.
     * @returns [WangId] - The wangId at that point (or undefined if unset).
     */
    getId(x, y) {
        let val = this.isSet(x, y);
        if (!isSet) {
            return null;
        }
        return Id.asWang(
            this.isSet(x, y-1),
            this.isSet(x+1, y-1),
            this.isSet(x+1, y),
            this.isSet(x+1, y+1),
            this.isSet(x, y+1),
            this.isSet(x-1, y+1),
            this.isSet(x-1, y),
            this.isSet(x-1, y-1),
        );
    }

    /**
     * @private
     */
    rectangleMod(x, y) {
        let xp = (x-this.rect.left) % this.rect.width;
        if (xp < 0) {
            xp += this.rect.width;
        }
        let yp = (y-this.rect.top) % this.rect.height;
        if (yp < 0) {
            yp += this.rect.height;
        }
        return new Point(xp, yp);
    }

    /**
     * @private
     */
    rectangleClamp(x, y) {
        let [xp, yp] = [x, y];
        if (xp < this.rect.left) {
            xp = this.rect.left;
        }
        if (xp >= this.rect.right) {
            xp = this.rect.right -1;
        }
        if (yp < this.rect.top) {
            yp = this.rect.top;
        }
        if (yp >= this.rect.bottom) {
            yp = this.rect.bottom -1;
        }
        return new Point(xp, yp);
    }
}

/**
 * @readonly
 * @enum {string}
 */
Grid.Overflow = {
    /** Circle back to the other end of the grid rect. */
    TORUS: "torus",
    /** Use the nearest cell in the grid. */
    NEAREST_NEIGHBOR: "nn",
    /** Always on! */
    ALWAYS_ON: "on",
    /** This is the default. Always off! */
    ALWAYS_OFF: "off",
};

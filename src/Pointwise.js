// Peer dependency, don't import or you'll get a second copy! Use the global instead.
// import Phaser from 'phaser';

/**
 * @callback Pointwise~Callback
 * @parameter {integer} x - The grid horizontal coordinate.
 * @parameter {integer} y - The grid vertical coordinate.
 * @parameter {integer} index - Which number call this is.
 * @returns * - The return value relevant to your usage.
 */

/**
 * Utilities for working with 2d arrays of space.
 */
export default class Pointwise {
    /**
     * @parameter {integer} x - As Rectangle.
     * @parameter {integer} y - As Rectangle.
     * @parameter {integer} width - As Rectangle.
     * @parameter {integer} height - As Rectangle.
     * @parameter {integer} stridex - The space between points in x.
     * @parameter {integer} stridey - The space between points in y.
     * @parameter {Pointwise.Adjustment} [pointAdjustment=Pointwise.Adjustment.CLAMP] - Handling for points outside of the rectangle.
     */
    constructor(x, y, width, height, stridex=1, stridey=1, adjustment=Pointwise.Adjustment.CLAMP) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.stridex = stridex;
        this.stridey = stridey;
        this.adjustment = adjustment;
    }

    get left() {
        return this.x;
    }

    get right() {
        return this.x + this.width;
    }

    get top() {
        return this.y;
    }

    get bottom() {
        return this.y + this.height;
    }

    get colCount() {
        return this.width / this.stridex;
    }

    get rowCount() {
        return this.height / this.stridey;
    }

    /**
     * @parameter {number} x - The point to use.
     * @parameter {number} y - The point to use.
     * @returns boolean - Whether the point is within the rectangle. This ignores overflow logic, so it is still possible for adjust calls, forEach calls etc to accept this point.
     */
    contains(x, y) {
        return Pointwise.Contains(this.left, this.right, x) && Pointwise.Contains(this.top, this.bottom, y);
    }

    /**
     * @parameter {number} x - The point to use.
     * @parameter {number} y - The point to use.
     * @returns number[2] - The `(x,y)` restricted value.
     */
    adjust(x, y) {
        switch (this.adjustment) {
        case Pointwise.Adjustment.CLAMP:
            return this.clamp(x, y);
        case Pointwise.Adjustment.MOD:
            return this.mod(x, y);
        case Pointwise.Adjustment.SKIP: {
            if (!this.contains(x, y)) {
                return undefined;
            }
            return [x, y];
        }
        }
    }

    /**
     * @parameter {number} x - The point to use.
     * @parameter {number} y - The point to use.
     * @returns number[2] - The `(x,y)` restricted value.
     */
    clamp(x, y) {
        return [Pointwise.Clamp(this.left, this.right, x), Pointwise.Clamp(this.top, this.bottom, y)];
    }

    /**
     * @parameter {number} x - The point to use.
     * @parameter {number} y - The point to use.
     * @returns number[2] - The `(x,y)` restricted value.
     */
    mod(x, y) {
        return [Pointwise.Mod(this.left, this.right, x), Pointwise.Mod(this.top, this.bottom, y)];
    }

    /**
     * @parameter {number} i - The count of point to look up -- left to right, then top to bottom (as the indices in `forEach`).
     * @returns number[2] - The `(x, y)` identified by that index, applying this object's overflow logic to values of i which lie outside the pointwise (overflowing to the bottom of the pointwise).
     */
    nth(i) {
        return this.adjust(
            Pointwise.Mod(this.left, this.right, this.left + this.stridex * i),
            this.top + this.stridey * Math.floor(i / this.colCount)
        );
    }

    /**
     * Inverse of `nth`, returns the maximal i st `nth(i)` is still less than the input in each dimension -- up to overflow.
     */
    index(x, y) {
        let row = Pointwise.Mod(
            0,
            this.rowCount,
            Math.floor(y - this.top) / this.stridey
        );
        let col = Pointwise.Mod(
            0,
            this.colCount,
            Math.floor(x - this.left) / this.stridex
        );
        return row * this.colCount + col;
    }

    /**
     * Invoke callback at each integer point inside of this pointwise.
     * @parameter {Pointwise~Callback} callback - The method to call at each point (return value discarded).
     * @parameter {Rectangle} rect - The subregion of the `Pointwise` to traverse. If unset, traverses the entire pointwise.
     * @returns undefined - Return values are all discarded.
     */
    forEach(callback, rect=undefined) {
        let useRect = new Phaser.Geom.Rectangle(this.x, this.y, this.width, this.height);
        switch (this.adjustment) {
        case Pointwise.Adjustment.CLAMP:    // Fallthrough intentional.
        case Pointwise.Adjustment.SKIP:
            if (rect) {
                Phaser.Geom.Rectangle.Intersection(useRect, rect, useRect);
            }
            break;
        }
        const evaluator = this.wrap(callback);
        Pointwise.ForEach(evaluator, useRect, this.stridex, this.stridey);
    }

    /**
     * Invoke callback at a specific point, using overflow if the point is outside this `Pointwise`.
     * @parameter {Pointwise~Callback} callback - The method to call at this point.
     * @parameter {integer} x - The pre-adjustment x coordinate to pass to `callback`.
     * @parameter {integer} y - The pre-adjustment y coordinate to pass to `callback`.
     * @parameter {...*} params - Any additional callback parameters.
     * @returns * - The value of `callback(...this.adjust(x, y), ...params)` (or default).
     */
    evaluateAt(callback, x, y, ...params) {
        const xy = this.adjust(x, y);
        if (!xy) {
            return undefined; 
        }
        return callback(...xy, ...params);
    }

    /**
     * Wrap callback in this Pointwise, using this overflow logic on the callback.
     * @parameter {Pointwise~Callback} callback - The method to wrap in adjustment.
     * @returns Pointwise~Callback - The callback, with its input x/y adjusted by the Pointwise.
     */
    wrap(callback) {
        const evaluator = (...params) => this.evaluateAt(callback, ...params);
        return evaluator;
    }

    /**
     * Invokes `callback` for each integral value within `rect` (given stride).
     */
    static ForEach(callback, rect, stridex=1, stridey=1) {
        if (!(callback instanceof Function)) {
            throw 'Invalid uncallable callback';
        }
        let index = 0;
        for (let y = Math.ceil(rect.top); y < Math.floor(rect.bottom); y+=stridey) {
            for (let x = Math.ceil(rect.left); x < Math.floor(rect.right); x+=stridex) {
                callback(x, y, index++);
            }
        }
    }

    /**
     * @returns True if the interval `[min, max)` contains `val`.
     */
    static Contains(min, max, val) {
        return min <= val && val < max;
    }

    /**
     * @returns The modulus of `val` between `min` and `max`.
     */
    static Mod(min, max, val) {
        const width = (max - min);
        let retval = (val-min) % width;  // Might be negative!
        retval += width;
        retval %= width;  // Steps up one stride and mods again, which shouldn't change anything.
        retval += min;  // This readjusts for the min we removed in the initial mod.
        return retval;
    }

    /**
     * @returns The value within `min` and `max` closest to `val`.
     */
    static Clamp(min, max, val) {
        if (val >= max) {
            val = max - 1;
        }
        if (val < min) {
            val = min;
        }
        return val;
    }
}

/**
 * @readonly
 * @enum {string}
 */
Pointwise.Adjustment = {
    /** Clamp values to the nearest neighbor in the `Pointwise`. Default. */
    CLAMP: 'clamp',
    /** Treat the Pointwise as a torus, wrapping around the edges. */
    MOD: 'mod',
    /** Entirely skip values outside of the pointwise, returning `undefined`. */
    SKIP: 'skip',
};

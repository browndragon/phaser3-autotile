import {Rectangle} from './Bindings';

/**
 * @callback Pointwise~Callback
 * @param {integer} x - The grid horizontal coordinate.
 * @param {integer} y - The grid vertical coordinate.
 * @returns * - The return value.
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
     * @parameter {Pointwise.Adjustment} [pointAdjustment=Pointwise.Adjustment.CLAMP] - Handling for points outside of the rectangle.
     */
    constructor(x, y, width, height, adjustment=Pointwise.Adjustment.CLAMP) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
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
     * Invoke callback at each integer point inside of this pointwise.
     * @parameter {Pointwise~Callback} callback - The method to call at each point (return value discarded).
     * @parameter {Rectangle} rect - The subregion of the `Pointwise` to traverse. If unset, traverses the entire pointwise.
     * @returns undefined - Return values are all discarded.
     */
    forEach(callback, rect=undefined) {
        let useRect = new Rectangle(this.x, this.y, this.width, this.height);
        switch (this.adjustment) {
        case Pointwise.Adjustment.CLAMP:    // Fallthrough intentional.
        case Pointwise.Adjustment.SKIP:
            if (rect) {
                Rectangle.Intersection(useRect, rect, useRect);
            }
            break;
        }
        const evaluator = this.wrap(callback);
        Pointwise.ForEach(evaluator, useRect);
    }

    /**
     * Invoke callback at a specific point, using overflow if the point is outside this `Pointwise`.
     * @parameter {Pointwise~Callback} callback - The method to call at this point.
     * @parameter {integer} x - The pre-adjustment x coordinate to pass to `callback`.
     * @parameter {integer} y - The pre-adjustment y coordinate to pass to `callback`.
     * @parameter {*} defaultvalue - The value to return if this point is skipped.
     * @returns * - The value of `callback(...this.adjust(x, y))` (or undefined).
     */
    evaluateAt(callback, x, y, defaultValue) {
        const xy = this.adjust(x, y);
        if (!xy) {
            return defaultValue; 
        }
        return callback(...xy);
    }

    /**
   * Wrap callback in this Pointwise, using this overflow logic on the callback.
   * @parameter {Pointwise~Callback} callback - The method to wrap in adjustment.
   * @parameter {*} defaultValue - The value to return if this point is skipped.
   * @returns Pointwise~Callback - The callback, with its input x/y adjusted by the Pointwise.
   */
    wrap(callback, defaultValue) {
        const evaluator = (x, y) => this.evaluateAt(callback, x, y, defaultValue);
        return evaluator;
    }

    /**
   * Invokes `callback` for each integral value within `rect`.
   */
    static ForEach(callback, rect) {
        if (!(callback instanceof Function)) {
            throw 'Invalid uncallable callback';
        }
        for (let y = Math.ceil(rect.top); y < Math.floor(rect.bottom); ++y) {
            for (let x = Math.ceil(rect.left); x < Math.floor(rect.right); ++x) {
                callback(x, y);
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

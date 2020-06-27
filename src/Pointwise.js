import {Rectangle, Point} from "./Bindings.js";

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
     * @parameter {Rectangle} rect - The rectangle over which to define this Pointwise.
     * @parameter {Pointwise.Adjustment} [pointAdjustment=Pointwise.Adjustment.CLAMP] - Handling for points outside of the rectangle.
     */
    constructor(rect, adjustment=Pointwise.Adjustment.CLAMP) {
        this.rect = rect;
        this.adjustment = adjustment;
    }

    /**
     * @parameter {number} x - The point to use.
     * @parameter {number} y - The point to use.
     * @returns boolean - Whether the point is within the rectangle. This ignores overflow logic, so it is still possible for adjust calls, forEach calls etc to accept this point.
     */
    contains(x, y) {
        return Phaser.Geom.Rectangle.Contains(this.rect, x, y);
    }

    /**
     * @parameter {number} x - The point to use.
     * @parameter {number} y - The point to use.
     * @returns number[2] - The `(x,y)` restricted value.
     */
    adjust(x, y) {
        switch (this.adjustment) {
            case Pointwise.Adjustment.CLAMP:
                return Pointwise.RectangleClamp(this.rect, x, y);
            case Pointwise.Adjustment.MOD:
                return Pointwise.RectangleMod(this.rect, x, y);
            case Pointwise.Adjustment.SKIP: {
                if (!this.contains(x, y)) {
                    return undefined;
                }
                return [x, y];
            }
        }
    }

    /**
     * Invoke callback at each integer point inside of this pointwise.
     * @parameter {Pointwise~Callback} callback - The method to call at each point (return value discarded).
     * @parameter {Rectangle} rect - The subregion of the `Pointwise` to traverse. If unset, traverses the entire pointwise.
     * @returns undefined - Return values are all discarded.
     */
    forEach(callback, rect) {
        if (!rect) {
            rect = this.rect;
        }
        switch (this.adjustment) {
            case Pointwise.Adjustment.CLAMP:  // Fallthrough intentional.
            case Pointwise.Adjustment.SKIP:
                rect = Phaser.Geom.Rectangle.Intersection(this.rect, rect, new Rectangle(0, 0, 0, 0));
                break;
        }
        const evaluator = this.wrap(callback);
        Pointwise.ForEach(evaluator, rect);
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
        return (x, y) => this.evaluateAt(callback, x, y, defaultValue);
    }

    static ForEach(callback, rect) {
        if (!(callback instanceof Function)) {
            throw "Invalid uncallable callback";
        }

        for (let y = Math.ceil(rect.top); y < Math.floor(rect.bottom); ++y) {
            for (let x = Math.ceil(rect.left); x < Math.floor(rect.right); ++x) {
                callback(x, y);
            }
        }
    }

    static RectangleMod(rect, x, y) {
        return [this.Mod(rect.left, rect.right, x), this.Mod(rect.top, rect.bottom, y)];
    }

    static Mod(min, max, val) {
        const width = (max - min);
        return (val-min) % width + width % width + min;
    }

    static RectangleClamp(rect, x, y) {
        return [this.Clamp(rect.left, rect.right, x), this.Clamp(rect.top, rect.bottom, y)];
    }

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
    CLAMP: "clamp",
    /** Treat the Pointwise as a torus, wrapping around the edges. */
    MOD: "mod",
    /** Entirely skip values outside of the pointwise, returning `undefined`. */
    SKIP: "skip",
};

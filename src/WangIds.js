/** See `Ids.js` for significantly more utilities. */

/**
 * Ids are an 8-bit integer with the given low order bits set if the neighbor is set:
 * ```
 *  7 | 0 | 1
 * ---+---+---
 *  6 | x | 2
 * ---+---+---
 *  5 | 4 | 3
 * ```
 * This representation is only well-defined if x is also set (by convention, `null` is used in all cases if it is not).
 *
 * @typedef {integer} WangId
 */

/** Constants for the directional components of a WangId; clockwise from north. */
const WangIds = {
    NN: 0b00000001,
    NE: 0b00000010,
    EE: 0b00000100,
    SE: 0b00001000,
    SS: 0b00010000,
    SW: 0b00100000,
    WW: 0b01000000,
    NW: 0b10000000
};
export default WangIds;

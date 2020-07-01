/** See `Ids.js` for significantly more utilities. */

/**
 * WangIds are an 8-bit integer with the given low order bits set if the neighbor is set:
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

/**
 * @callback WangIds.Getter~IsSet
 * @parameter {number} x - The coordinate to probe.
 * @parameter {number} y - The coordinate to probe.
 * @returns boolean - True if the coordinate is "on".
 */

/**
 * Specific methods for deriving wangIds from datastructures.
 */
export class Getter {
  /**
     * @parameter {object} params - The container arg.
     * @parameter {string} params.name - A name for this IdType.
     * @parameter {function(IdType~IsSet, integer, integer):WangId?} params.wangId - A method which calculates wangIds given an `isSet`` callback and a specific `x,y`.
     * @parameter {function(WangId):WangId} params.project - Returns the wangId appropriate to this IdType for the given (possibly more fully-featured) wangId. For instance, an edge tileset should turn off corners.
     */
  constructor({wangId, project}={}) {
    this.wangId = wangId;  // Exposed & invoked as a method.
    this.project = project;  // Exposed & invoked as a method.
  }
}

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
WangIds.Getter = Getter;

export default WangIds;

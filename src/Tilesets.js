/**
 * Adds structure to `Phaser.Tilemaps.Tileset` to identify tileIds by other means.
 */
// import Ids from './Ids';

import Phaser from 'phaser';
import {alea} from 'seedrandom';
import Ids from './Ids';

const {NN, NE, EE, SE, SS, SW, WW, NW} = Ids;

/**
 * A very specific set of coherent terrain along with their geometry. This isn't necessarily a full set (for instance, it might support only full corners or something). The keys are wangIds (potentially unreachable ones, if the tileset pattern is a blob pattern but the wangIds are being generated in edge space), and the values are the specific tiles in a given tileset to use for the matches.
 * @typedef {Object.<WangId, integer>} Pattern
 * @memberOf Tilesets
 */

/**
 * @callback Terrain~VariantRuleCallback
 * @property {integer} tileId
 * @property {integer} tileX
 * @property {integer} tileY
 * @returns {integer} - The new tileId.
 */

/**
 * Matches (or doesn't!) a variant and provides an alternate mapping for that tile.
 * @typedef {object} VariantRule
 * @property {Object.<integer, integer>} evenX - Remaps all even X values.
 * @property {Object.<integer, integer>} evenY - Remaps all even Y values.
 * @property {Object.<integer, integer>} evenXY - Remaps all even X+Y values.
 * @property {Object.<integer, integer>} p50 - Pseudorandomly (based on rule, input tile, x, and y) remaps. All `numbers` are accepted, not just `50`.
 * @property {Object.<integer, integer>} always - Always remaps.
 * @property {Terrain~VariantRuleCallback} callback - Uses the callback to remap.
 */

export class Terrain {
  /**
     * @parameter {string} name - The name of this terrain (unique in tileset).
     * @parameter {Ids.Type} idType - The type of wangIds we're using here -- blob, corner, or edge.
     * @parameter {Pattern} pattern - The mapping wangId -> tileId.
     * @parameter {integer[]} additionalTiles - Additional tiles to treat as "on" for this terrain, in addition to any in its output.
     * @parameter {VariantRule[]} variantRules - Additional rules to filter output on. Any tiles which appear here should appear in `additionalTiles` (caller's responsibility).
     */
  constructor(name, idType, pattern, additionalTiles, variantRules) {
    this.name = name;
    this.idType = idType;
    this.wangIdGetter = Ids.Type[idType];
    // Make immutable and remove?
    this.pattern = Object.assign({}, pattern);
    if (!variantRules) {
      this.variantRules = [];
    } else {
      // Make immutable and remove?
      this.variantRules = [...variantRules];
    }
    this.tiles = new Set(Object.values(pattern));
    for (let additionalTile of additionalTiles) {
      this.tiles.add(additionalTile);
    }
  }

  tileId(wangId) {
    return this.pattern[wangId];
  }

  wangId(tileId) {
    return this.tiles[tileId];
  }

  addPattern(wangId, tileId) {
    this.pattern[wangId] = tileId;
    this.tiles.add(tileId);
  }

  terrainize(wangId, x, y) {
    return this.vary(this.tileId(wangId), x, y);
  }

  addVariant(variantRule) {
    this.variantRules.push(variantRule);
  }

  contains(tileId) {
    return this.tiles.contains(tileId);
  }

  vary(tileId, x, y) {
    for (let rule of this.variantRules) {
      let [scheme, mapping] = Object.entries(rule)[0];
      let newTileId = undefined;
      switch (scheme) {
      case 'always':
        newTileId = mapping[tileId];
        break;
      case 'callback':
        newTileId = mapping(tileId, x, y);
        break;
      case 'evenX':  // Fallthrough intentional.
      case 'evenY':  // Fallthrough intentional.
      case 'evenXY':  // Fallthrough intentional.
      case 'oddX':  // Fallthrough intentional.
      case 'oddY':  // Fallthrough intentional.
      case 'oddXY': {
        let modValue = 0;
        if (scheme.startsWith('odd')) {
          modValue = 1;
        }
        let value = x;
        if (scheme.endsWith('XY')) {
          value = x + y;
        } else if (scheme.endsWith('X')) {
          value = x;
        } else {
          value = y;
        }
        if (value % 2 == modValue) {
          newTileId = mapping[tileId];
        }
      }
        break;
      default:
        if (scheme.startsWith('p')) {
          let number = (+scheme.substring(1, scheme.length - 1)) / 100.0;
          let random = new alea(`${this.name}|${tileId}|${x}|${y}`)();
          if (random < number) {
            newTileId = mapping[tileId];
          }
          break;
        }
      }
      if (newTileId != undefined) {
        return newTileId;
      }
    }
    return tileId;
  }
}

export default class Tilesets {
  static addAutotiles(tileset) {
    let terrains = {};
    for (let tileId = tileset.firstgid; tileId < tileset.firstgid + tileset.total; ++tileId) {
      const properties = tileset.getProperty(tileId);  // eslint-disable-line no-unused-vars
      const data = tileset.getData(tileId);
      if (!data.terrain) {
        continue;
      }
      let {terrain, type='blob', wangId, isVariant=false} = data;
      terrain = terrains[terrain];                
      if (!terrain) {
        terrain = new Terrain(terrain, type, {}, []);
        terrains = terrain;
      }
      if (isVariant) {
        terrain.addVariant({p50: {wangId, tileId}});
      } else {
        terrain.addPattern(wangId, tileId);
      }
    }
    tileset.terrains = terrains;
  }
  static register(scene) {  // eslint-disable-line no-unused-vars
    Phaser.Tilemaps.Tileset.prototype.addTerrain = function(terrain) {
      if (!this.terrains) {
        this.terrains = {};
      }
      this.terrains[terrain.name] = terrain;
      if (!this.terrainsByTileId) {
        this.terrainsByTileId = {};
      }
      for (let tileId of terrain.tiles.keys()) {
        this.terrainsByTileId[tileId] = terrain;
      }
      return this;
    };
    Phaser.Tilemaps.Tileset.prototype.terrains = function() {
      if (!this.terrains) {
        return [];
      }
      return Object.values(this.terrains);
    };
    Phaser.Tilemaps.Tileset.prototype.tileIdForTerrain = function(terrainName, wangId, x=undefined, y=undefined) {
      const terrain = this.terrains[terrainName];
      let tileId = terrain.tileId(wangId);
      if (x != undefined && y != undefined) {
        tileId = terrain.vary(tileId, x, y);
      }
      return tileId;
    };
    Phaser.Tilemaps.Tileset.prototype.getTerrain = function(tileId) {
      return this.terrainsByTileId[tileId];
    };
  }

}
/** Hardcoded texture layout patterns. */
Tilesets.Patterns = {
  /**
     * Loads a 4x4 edge tileset with known pattern.
     * Format:
     *  - The upper right 3x3 is fully connected
     *    - To its west is a 1x3 column
     *    - To its south is a 3x1 dormer
     *  - In the southwest 1x1 corner is an island
     *
     * Assuming the "fully connected" tiles leave gaps at their corners, this is suitable for overhead walls, paths, etc. If they don't, this will work for a sort of tiled/repeated nineslice, but cannot contain concave corners.
     *
     * This is 2-edge layout 0 from http://www.cr31.co.uk/stagecast/wang/pattern.html .
     */
  EDGE: {
    [SS]: 0,
    [SS | EE]: 1,
    [WW | SS | EE]: 2,
    [WW | SS]: 3,

    [NN | SS]: 4,
    [NN | EE | SS]: 5,
    [NN | EE | SS | WW]: 6,
    [NN | SS | WW]: 7,

    [NN]: 8,
    [NN | EE]: 9,
    [NN | EE | WW]: 10,
    [NN | WW]: 11,

    [0]: 12,
    [EE]: 13,
    [EE | WW]: 14,
    [WW]: 15,
  },

  /**
     * Loads a Brigitt's Cross edge tileset. This is suitable for corner terrain. 
     *
     * This is suitable for terrain, and more generically anything that works well on an offset gr
     *
     * Format: See  http://www.cr31.co.uk/stagecast/wang/pattern.html#brigid .
     */
  BRIGITTS_CROSS: {
    [SW]: 0,
    [NE | SE]: 1,
    [NW | SW | SE]: 2,
    [SW | SE]: 3,

    [NW | SE]: 4,
    [NE | SE | SW]: 5,
    [NE | SE | SW | NW]: 6,
    [NE | SW | NW]: 7,

    [NE]: 8,
    [NW | NE]: 9,
    [NW | NE | SE]: 10,
    [NW | SW]: 11,

    [0]: 12,
    [SE]: 13,
    [SW | NE]: 14,
    [NW]: 15,
  },

  /**
     * Loads an explicit 47-tile "blob" tileset from a fixed order.
     *
     * This is fairly generic and can be used for walls, paths, terrain, overgrowth, etc.
     *
     * See http://www.cr31.co.uk/stagecast/wang/blob.html for more details.
     */
  LITERAL_BLOB: {
    0: 0,
    1: 1,
    4: 2,
    5: 3,
    7: 4,
    16: 5,
    17: 6,
    20: 7,
    21: 8,
    23: 9,
    28: 10,
    29: 11,
    31: 12,
    64: 13,
    65: 14,
    68: 15,
    69: 16,
    71: 17,
    80: 18,
    81: 19,
    84: 20,
    85: 21,
    87: 22,
    92: 23,
    93: 24,
    95: 25,
    112: 26,
    113: 27,
    116: 28,
    117: 29,
    119: 30,
    124: 31,
    125: 32,
    127: 33,
    193: 34,
    197: 35,
    199: 36,
    209: 37,
    213: 38,
    215: 39,
    221: 40,
    223: 41,
    241: 42,
    245: 43,
    247: 44,
    253: 45,
    255: 46
  },

  /**
     * Loads a single crossroads tile 
     */
  RPG_MAKER: {
    // Nothing uses tile 0.
    [NN | EE | SS | WW]: 1,
    [EE | SE | SS]: 2,
    [SS | SW | WW]: 3,
    [NN | NE | EE]: 4,
    [WW | NW | NN]: 5
  }
};

/** Supported types of patterns along with their default values. */
Tilesets.Types = {
  blob: {
    type: 'blob',
    pattern: Tilesets.Patterns.LITERAL_BLOB,
    parseSubtiles: false,
  },
  corner: {
    type: 'corner',
    pattern: Tilesets.Patterns.BRIGITTS_CROSS,
    parseSubtiles: false,
  },
  edge: {
    type: 'edge',
    pattern: Tilesets.Patterns.EDGE,
    parseSubtiles: false,
  },
  rawblob: {
    type: 'blob',
    pattern: Tilesets.Patterns.RPG_MAKER,
    parseSubtiles: true,
  },
};

import Ids from './Ids.mjs';

/**
 * Utilities for constructing a Pattern from an actual Tilemap/FooTileLayer/Tileset.
 *
 * Since phaser doesn't natively parse the wangset data from tiled, this requires
 * some finessing.
 */
export default class TerrainParser {
    constructor({
        /** @property {Object.<string, TerrainParser.TerrainConfig>} terrains - additional terrains to join into the parser. They will be reparsed if organically encountered. */
        terrains={},
        /**
         * Parse each entry in `tilesets.terrains` into a terrain with idType 'corner'. 
         * @property {object} tiledTerrains - Configuration for tiledTerrains. 
         * @property {string} [tiledTerrains.name="{tileset}{terrain}"] - String pattern to name output terrain. If the name "ignore", will not parse.
         */
        tiledTerrains={},
        /**
         * Parse each entry in `tilesets.wangsets` into a terrain with appropriate idType.
         * @property {object} tiledWangsets - Configuration for tiledWangsets.
         * @property {string} [tiledWangsets.name="{tileset}{wangset}"] - String pattern to name output terrain. If the name "ignore", will not parse.
         * @property {int} [withColor=2] - which color value(s) to count for this terrain. This only supports binary wangsets, so only one color can be "on"; since color 1 defaults to red, we choose 2.
         */
        tiledWangsets={},
    }={}) {
        this.terrains = terrains;
        {
            const {name='{tileset}{terrain}'} = tiledTerrains;
            this.terrainRename = name;
        }
        {
            let {name='{tileset}{wangset}', withColor=2} = tiledWangsets;
            this.wangsetRename = name;
            this.wangsetWithColor = withColor;
        }
        this.firstgidByTileset = {};
    }

    parseTilemap(tilemap) {
        for (let tileset of tilemap.tilesets) {
            this.firstgidByTileset[tileset.name] = tileset.firstgid;
        }
    }

    /** Workaround for the data thrown away when Phaser initially parses tilesets. */
    reparseJSON(json) {
        if (!json) {
            return;
        }
        const {tilesets=[]} = json;
        for (let tileset of tilesets) {
            const {name, terrains=[], tiles=[], wangsets=[]} = tileset;
            const firstgid = this.firstgidByTileset[name] || 0;
            this.reparseJSONTerrains(name, firstgid, terrains, tiles);
            for (let wangset of wangsets) {
                this.reparseJSONWangset(name, firstgid, wangset);
            }
        }
    }
    reparseJSONTerrains(tilesetname, firstgid, terrainList, tileList) {
        if (this.terrainRename == 'ignore') {
            return;
        }
        let terrainKeys = [];
        for (let json of terrainList) {
            const key = TerrainParser._interpolate(this.terrainRename, {
                tileset:tilesetname,
                terrain:json.name
            });
            terrainKeys.push(key);
            let config = this.terrains[key];
            if (!config) {
                config = {
                    idType: 'corner',
                    input: new Set(),
                    pattern: {}
                };
            }
            this.terrains[key] = config;
        }
        for (let {id:tileId, terrain:terrainArray} of tileList) {
            if (!terrainArray || tileId == -1) {
                continue;
            }
            tileId += firstgid;
            this.reparseTile(terrainKeys, tileId, terrainArray);
        }
    }

    reparseTile(terrainKeys, tileId, terrainArray) {
        // Each tile can be in up to 4 terrains. Luckily/unfortunately, overlapping terrain definitions just replace the tile, so we don't have to handle that.
        const uniqueTerrainKeys = new Set(terrainArray);
        for (let uniqueTerrainKey of uniqueTerrainKeys) {
            if (uniqueTerrainKey == -1) {
                continue;
            }
            const wangId = TerrainParser.parseTiledTerrainWangId(terrainArray, uniqueTerrainKey);
            this.addTileToConfig(terrainKeys[uniqueTerrainKey], wangId, tileId);
        }
    }

    reparseJSONWangset(tilesetname, firstgid, wangset) {
        if (this.wangsetRename == 'ignore') {
            return;
        }
        let {name:wangsetname, cornercolors=[], edgecolors=[], wangtiles=[]} = wangset;
        let idType = 'blob';
        if (cornercolors.length == 0 && edgecolors.length > 0) {
            idType = 'edge';
        } else if (cornercolors.length > 0 &&  edgecolors.length == 0) {
            idType = 'corner';
        } else if (cornercolors.length == 0 && edgecolors.length == 0) {
            console.warning('Unparseable wangset', wangset);
            return;
        }
        const key = TerrainParser._interpolate(this.wangsetRename, {
            tileset:tilesetname,
            wangset:wangsetname
        });
        let config = this.terrains[key];
        if (!config) {
            config = {
                idType,
                input: new Set(),
                pattern: {}
            };
            this.terrains[key] = config;
        }
        // In contrast to terrains, this representation of wangids is unique (since each tiling is in a wangset, and we constrain the names of the autotile terrains to be the same as the wangset).
        for (let wangtile of wangtiles) {
            let {tileid, wangid} = wangtile;
            tileid += firstgid;
            let wangIdInt = 0;
            for (let i = 0; i < wangid.length; ++i) {
                if (wangid[i] == this.wangsetWithColor) {
                    wangIdInt |= 1 << i;
                }
            }
            this.addTileToConfig(key, wangIdInt, tileid);
        }
    }

    terrainConfigs() {
        let retval = [];
        for (let [name, config] of Object.entries(this.terrains)) {
            retval.push({name, ...config});
        }
        return retval;
    }

    addTileToConfig(terrainKey, wangId, tileId) {
        let config = this.terrains[terrainKey];
        console.assert(config, `Couldn't find ${terrainKey} in ${this.terrains}`);
        config.pattern[wangId] = tileId;
        // For corner wangIds, the tile is identified with its northwest corner.
        // So this counts as a "set" tile iff the northwest corner is set.
        if (config.idType != 'corner' || wangId & Ids.NW) {
            config.input.add(tileId);
        }
    }

    static parseTiledTerrainWangId([nw, ne, sw, se], value) {
        const reordered = [ne, se, sw, nw];
        let wangId = 0;
        for (let i = 0; i < reordered.length; ++i) {
            if (reordered[i] == value) {
                wangId |= 1 << (2*i + 1);
            }
        }
        return wangId;
    }

    static _interpolate(pattern, params) {
        let str = pattern.toString();
        for (let [k,v] of Object.entries(params)) {
            str = str.replace(new RegExp('\\{' + k + '\\}', 'gi'), v);
        }
        return str;
    }

}

//     static Parse(tileset, {
//         name,
//         isSet={},
//         wangId={},
//         input=new Set(),
//         pattern={},
//     }) {
//         if (!Array.isArray(tileset)) {
//             tileset = [tileset];
//         }
//         const isSetF = TerrainParser.isSetF(name, isSet);
//         const wangIdF = TerrainParser.wangIdF(name, wangId);
//         for (let t of tileset) {
//             let {addlInput, addlPattern} = TerrainParser.accumulateTileset(t, isSetF, wangIdF);
//             for (let k of addlInput) {
//                 input.add(k);
//             }
//             for (let [k, v] of Object.entries(addlPattern)) {
//                 // Note that this just silently replaces duplicates.
//                 // TODO: Provide a way for this to supply variant tiles instead.
//                 addlPattern[k] = v;
//             }
//         }
//         return {input, pattern};
//     }

//     static accumulateTileset(tileset, isSetF, wangIdF) {
//         let input = new Set();
//         let pattern = {};
//         for (let tileId = tileset.firstgid; tileId < tileset.firstgid + tileset.total; ++tileId) {
//             let data = tileset.getTileData(tileId);
//             let properties = tileset.getTileProperties(tileId);
//             const isSet = isSetF(data, properties);
//             if (isSet) {
//                 input.add(tileId);
//             }
//             const wangId = wangIdF(data, properties);
//             if (wangId != null && wangId != undefined) {
//                 pattern[wangId] = tileId;
//             }
//         }
//         return {input, pattern};
//     }

//     static isSetF(name, {
//         // False if it's a Property.
//         isData=true,
//         // By default, every set tile in this layer is considered set. Other reasonable values include properties given the name of the type or a type named `autotile` identifying the type. Accepts dotted paths.
//         field='tileid',
//         // Acceptable values for this field.
//         value=/.+/,
//         // Derived field.
//         fieldPath=field.split('.'),
//     }={}) {
//         return (datas, properties) => TerrainParser.getIsSet(isData, fieldPath, value, datas, properties);
//     }

//     static wangIdF(name, {
//         // False if it's a Property.
//         isData=true,
//         // By default, every set tile in this layer is considered set. Other reasonable values include properties given the name of the type or a type named `autotile` identifying the type.
//         field='wangid',
//         // The data is assumed to be the second tiled color.
//         // TODO: Replace this with tiledarray:1 when tiled supports single color wang brushes.
//         transform='tiledarray:2',
//         // Derived fields.
//         fieldPath = field.split('.'),
//     }={}) {
//         let transformF = TerrainParser.getTransformF(transform);
//         return (datas, properties) => TerrainParser.getWangId(isData, fieldPath, transformF, datas, properties);
//     }

//     static getIsSet(isData, fieldPath, value, datas, properties) {
//         const tileValue = fieldPath.reduce((o,i)=>o[i], (isData ? datas : properties));
//         if (tileValue == undefined) {
//             return false;
//         }
//         return value.test(''+tileValue);
//     }

//     static getWangId(isData, fieldPath, transformF, datas, properties) {
//         const tileValue = fieldPath.reduce((o,i)=>o[i], (isData ? datas : properties));
//         if (tileValue == undefined) {
//             // But it *was* "on", so this just can't be produced as output.
//             return null;
//         }
//         return transformF(tileValue);
//     }

//     static getTransformF(transformArg) {
//         if (transformArg instanceof String) {
//             const colonIndex = transformArg.indexOf(':');
//             const [pre, post] = [
//                 transformArg.substring(0, colonIndex),
//                 transformArg.substring(colonIndex)
//             ];
//             switch (pre) {
//             case '':
//                 switch (post) {
//                 case 'none':  // Fallthrough intentional.
//                 case 'default':
//                     return (x) => x;
//                 }
//                 throw 'Unrecognized transform';

//             case 'tiledarray':
//                 return (x) => {
//                     let retval = 0;
//                     for (let i = 0; i < x.length; ++i) {
//                         const setval = x[i];
//                         if (setval != +post) {
//                             continue;
//                         }
//                         retval |= 1 << i;
//                     }
//                     return retval;
//                 };

//             case 'tiledint':
//                 return (x) => {
//                     let retval = 0;
//                     for (let i = 0; i < 8; ++i) {
//                         const setval = (x >>> 4*i) & 0b1111;
//                         if (setval != +post) {
//                             continue;
//                         }
//                         retval |= 1 << i;
//                     }
//                     return retval;                        
//                 };

//             default:
//                 throw 'Unrecognized transform';
//             }
//         }
//     }
// }

/**
 * @typdef {object} TerrainParser.TerrainConfig
 * @parameter {string} idType - The type of wangIds to use (edge, corner, or blob).
 * @parameter {Set<int>} input - The allowable tiles which count as a member of this terrain.
 * @parameter {Pattern} pattern - The actual layout of tiles.
 */
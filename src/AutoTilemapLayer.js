import BaseAutoTilemapLayer from './BaseAutoTilemapLayer';

// Peer dependency, don't import or you'll get a second copy! Use the global instead.
// import Phaser from 'phaser';

/**
 * Methods for StaticTilemapLayer & DynamicTilemapLayer.
 *
 * They assume that there will be a field `autotile` set on the object,
 * which is populated in `AutoTilemap` (see the constructor )
 */
export default class AutoTilemapLayer extends BaseAutoTilemapLayer {
    static register() {
        Phaser.Tilemaps.DynamicTilemapLayer.prototype.autotile = function() {
            if (!this._autotile) {
                throw 'Must be constructed through Tilemap.autotile() methods';
            }
            return this._autotile;
        };
        Phaser.Tilemaps.StaticTilemapLayer.prototype.autotile = function() {
            if (!this._autotile) {
                throw 'Must be constructed through Tilemap.autotile() methods';
            }
            return this._autotile;
        };
    }

    static _ensureAutotile(autotilemap, layer) {
        if (layer._autotile) {
            return layer._autotile;
        }
        layer._autotile = new AutoTilemapLayer(autotilemap.terrains, layer);
        return layer._autotile;
    }

    constructor(terrains, layer) {
        super();
        this.terrains = terrains;
        this.layer = layer;
        this.refreshes = {};
    }

    isSetAt(name, x, y) {
        const tile = this.layer.getTileAt(x, y);
        if (tile == null) {
            return false;
        }
        const tileId = tile.index;

        const terrain = this.terrains.getTerrain(name);
        return terrain.contains(tileId);
    }

    getWangIdAt(name, x, y) {
        const terrain = this.terrains.getTerrain(name);
        return terrain.wangId((x, y) => this.isSetAt(name, x, y), x, y);
    }

    addRefresh(name, refresh=undefined) {
        if (!refresh) {
            const terrain = this.terrains.getTerrain(name);
            refresh = (x, y) => {
                const wangId = this.getWangIdAt(name, x, y);
                if (wangId == null) {
                    this.layer.removeTileAt(x, y);
                } else {
                    const tileId = terrain.tileId(wangId);
                    this.layer.putTileAt(tileId, x, y);
                }
            };
        }
        this.refreshes[name] = refresh;
    }

    refreshAt(name, x, y) {
        this.refreshes[name](x, y);
    }
}
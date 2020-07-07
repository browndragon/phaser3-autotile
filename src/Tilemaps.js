import Tilesets from './Tilesets';

import Phaser from 'phaser';

const GetWangId = function(tileX, tileY, terrain, layer) {
    if (!terrain) {
        throw 'Need terrain';
    }
    if (!terrain.wangIdGetter) {
        throw 'Tileset needs to be wangId enabled';
    }
    const isSet = (x, y) => {
        const tile = Phaser.Tilemaps.Components.GetTileAt(x, y, layer);
        if (!tile) {
            return false;
        }
        return terrain.contains(tile.index);
    };
    return terrain.wangIdGetter(isSet, tileX, tileY);
};

const RefreshAutoTilesIn = function(tileX, tileY, tileWidth, tileHeight, recalculateFaces, terrain, layer) {
    let backlog = new Map();
    for (let y = tileY; y < tileY + tileHeight; ++y) {
        for (let x = tileX; x < tileX + tileWidth; ++x) {
            const cacheKey = [x,y].join(',');
            let wangId = backlog.get(cacheKey);
            if (wangId == undefined) {
                wangId = GetWangId(x, y, terrain, layer);
                backlog.put(cacheKey, wangId);
            }
            if (wangId == null) {
                Phaser.Tilemaps.Components.RemoveTileAt(x, y, true, recalculateFaces, layer);
            } else {
                const tileId = terrain.terrainize(wangId, x, y);
                Phaser.Tilemaps.Components.PutTileAt(tileId, x, y, recalculateFaces, layer);
            }
        }
    }
};

export default class Tilemaps {
    static register(scene) {  // eslint-disable-line no-unused-vars
        Phaser.Tilemaps.Tileset.prototype.isAutotile = function() {
            return !!this._isAutotile;
        };
        Phaser.Tilemaps.Tileset.prototype.deriveWangTiles = function(texture) {
            this.setImage(texture);
            this._isAutotile = true;
            return this;
        };

        Phaser.Tilemaps.Tilemap.prototype.addAutotilesImage = function(tilesetName, key, tileWidth, tileHeight, tileMargin, tileSpacing, gid) {
            let tileset = this.addTilesetImage(tilesetName, key, tileWidth, tileHeight, tileMargin, tileSpacing, gid);
            Tilesets.addAutotiles(tileset);
        };
        Phaser.Tilemaps.Tilemap.prototype.getTileIndexByWangId = function(wangId) {
            if (!this.wangIdPattern) {
                return -1;
            }
            return this.wangIdPattern[wangId];
        };

        Phaser.Tilemaps.DynamicTilemapLayer.prototype.refreshAutoTilesIn = function(tileX, tileY, tileWidth, tileHeight, tileset) {
            RefreshAutoTilesIn(tileX, tileY, tileWidth, tileHeight, true, tileset, this);
            throw 'unimplemented';
        };
    }
}
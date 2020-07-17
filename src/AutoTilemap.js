import AutoTilemapLayer from './AutoTilemapLayer';
import BaseAutoTilemapLayer from './BaseAutoTilemapLayer';
import Terrains from './Terrains';
import TerrainParser from './TerrainParser';

import Phaser from 'phaser';


export default class AutoTilemap extends BaseAutoTilemapLayer {
    static register() {
        Phaser.Tilemaps.Tilemap.prototype.autotile = function(config) {
            return AutoTilemap._ensureAutotile(this, config);
        };
        Phaser.Tilemaps.Tilemap.prototype.prepareAutotile = function(config) {
            return AutoTilemap._ensureAutotile(this, config);
        };

        Phaser.Tilemaps.Tilemap.prototype.createBlankDynamicLayerWithoutAutotile = 
            Phaser.Tilemaps.Tilemap.prototype.createBlankDynamicLayer;
        Phaser.Tilemaps.Tilemap.prototype.createBlankDynamicLayer = function(...args) {
            return this.autotile()._createBlankDynamicLayer(...args);
        };

        Phaser.Tilemaps.Tilemap.prototype.createDynamicLayerWithoutAutotile = 
            Phaser.Tilemaps.Tilemap.prototype.createDynamicLayer;
        Phaser.Tilemaps.Tilemap.prototype.createDynamicLayer = function(...args) {
            return this.autotile()._createDynamicLayer(...args);
        };

        Phaser.Tilemaps.Tilemap.prototype.createStaticLayerWithoutAutotile = 
            Phaser.Tilemaps.Tilemap.prototype.createStaticLayer;
        Phaser.Tilemaps.Tilemap.prototype.createStaticLayer = function(...args) {
            return this.autotile()._createStaticLayer(...args);
        };

        Phaser.Tilemaps.Tilemap.prototype.convertLayerToStaticWithoutAutotile =
            Phaser.Tilemaps.Tilemap.prototype.convertLayerToStatic;
        Phaser.Tilemaps.Tilemap.prototype.convertLayerToStatic = function(...args) {
            return this.autotile()._convertLayerToStatic(...args);
        };

        Phaser.Tilemaps.Tilemap.prototype.addTilesetImageWithoutAutotile =
            Phaser.Tilemaps.Tilemap.prototype.addTilesetImage;
        Phaser.Tilemaps.Tilemap.prototype.addTilesetImage = function(...args) {
            return this.autotile()._addTilesetImage(...args);
        };
    }

    isSetAt(name, x, y) {
        return this.tilemap.layer.tilemapLayer.autotile().isSetAt(name, x, y);
    }
    getWangIdAt(name, x, y) {
        return this.tilemap.layer.tilemapLayer.autotile().getWangIdAt(name, x, y);
    }
    refreshAt(name, x, y) {
        return this.tilemap.layer.tilemapLayer.autotile().refreshAt(name, x, y);
    }
    addRefresh(name, refresh) {
        return this.tilemap.layer.tilemapLayer.autotile().addRefresh(name, refresh);
    }

    _createBlankDynamicLayer(...args) {
        let layer = this.tilemap.createBlankDynamicLayerWithoutAutotile(...args);
        AutoTilemapLayer._ensureAutotile(this, layer);
        return layer;
    }
    _createDynamicLayer(...args) {
        let layer = this.tilemap.createDynamicLayerWithoutAutotile(...args);
        AutoTilemapLayer._ensureAutotile(this, layer);
        return layer;
    }
    _createStaticLayer(...args) {
        let layer = this.tilemap.createStaticLayerWithoutAutotile(...args);
        AutoTilemapLayer._ensureAutotile(this, layer);
        return layer;
    }
    _convertLayerToStatic(...args) {
        let layer = this.tilemap.convertLayerToStaticWithoutAutotile(...args);
        AutoTilemapLayer._ensureAutotile(this, layer);
        return layer;
    }

    _addTilesetImage(...args) {
        let tileset = this.tilemap.addTilesetImageWithoutAutotile(...args);
        // Do something to augment this? Like maybe reparse the tileset now that it's been inflated with bounds?
        return tileset;
    }

    /** Prefer to use `tilemap.prepareAutotile({jsonkey:'foo'})` on first call, and just `tilemap.autotile()` thereafter. */
    constructor(tilemap) {
        super();
        this.tilemap = tilemap;
        this.terrains = new Terrains();
    }
    _init({jsonkey, ...config}={}) {
        let terrainParser = new TerrainParser(config);
        terrainParser.parseTilemap(this.tilemap);
        let json = this.tilemap.scene.cache.tilemap.get(jsonkey);
        if (json) {
            json = json.data;
            terrainParser.reparseJSON(json);
        }
        for (let config of terrainParser.terrainConfigs()) {
            const {name, idType, input, pattern} = config;
            this.terrains.addTerrain(name, idType, input, pattern);
        }
    }

    static _ensureAutotile(tilemap, config) {
        if (tilemap._autotile) {
            return tilemap._autotile;
        }
        tilemap._autotile = new AutoTilemap(tilemap);
        tilemap._autotile._init(config);

        return tilemap._autotile;
    }
}
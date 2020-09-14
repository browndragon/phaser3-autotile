import Ids from './Ids.mjs';

/** Manages the set of Terrains, analogous to Tileset management in Tilemap. */
export default class Terrains {
    constructor() {
        this.terrains = {};
        this.inputTilesToNames = {};
        this.noterrain = new Terrain('none', 'blob', new Set(), {});
    }

    addTerrain(name, idType, input, pattern) {
        let newTerrain = new Terrain(name, idType, input, pattern);
        this.terrains[name] = newTerrain;
        return newTerrain;
    }

    getTerrain(name) {
        return this.terrains[name] || this.noterrain;
    }

    hasTerrain(name) {
        return !!this.terrains[name];
    }
}
/** A specific part of a Tileset together with its geometry. */
export class Terrain {
    constructor(name, idType, input, pattern) {
        this.name = name;
        this.idType = Ids[idType];
        this.input = input;
        this.pattern = pattern;
    }

    contains(tileId) {
        return this.input.has(tileId);
    }

    wangId(isSet, x, y) {
        return this.idType.wangId(isSet, x, y);
    }

    tileId(wangId) {
        return this.pattern[this.idType.project(wangId)];
    }
}
Terrains.Terrain = Terrain;


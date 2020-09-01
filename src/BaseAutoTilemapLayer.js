import Pointwise from './Pointwise';

// Peer dependency, don't import or you'll get a second copy! Use the global instead.
// import Phaser from 'phaser';

/** Methods for TileMap & DynamicTileLayer. */
export default class BaseAutoTilemapLayer {
    isSetAt(_name, _x, _y) {
        throw 'Unimplemented';        
    }
    getWangIdAt(_name, _x, _y) {
        throw 'Unimplemented';
    }
    addRefresh(_name, _refresh) {
        throw 'Unimplemented';
    }
    refreshAt(_name, _x, _y) {
        throw 'Unimplemented';
    }

    refreshRect(name, rect) {
        Pointwise.ForEach((x, y) => this.refreshAt(name, x, y), rect);
    }
    refreshRadius(name, x, y, radius) {
        this.refreshRect(name, new Phaser.Geom.Rectangle(x - radius, y - radius, 2 * radius + 1, 2 * radius + 1));
    }
}
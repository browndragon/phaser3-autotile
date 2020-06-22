/**
* @author       Brown Dragon <browndragon@googlegroups.com>
* @copyright    2020 Brown Dragon.
* @license      {@link https://github.com/browndragon/phaser3-autotile/blob/master/LICENSE|MIT License}
*/

import {Rectangle, Point} from "./Bindings.js";
import BlobIndexer from "./BlobIndexer.js";
import Grid from "./Grid.js";
import Id from "./Id.js";
import Subtiles from "./Subtiles.js";
import Phaser from 'phaser';


export var BasePlugin = function (scene)
{
    //  The Scene that owns this plugin
    this.scene = scene;

    this.systems = scene.sys;

    if (!scene.sys.settings.isBooted)
    {
        scene.sys.events.once('boot', this.boot, this);
    }
};

//  Static function called by the PluginFile Loader.
BasePlugin.register = function (PluginManager)
{
    //  Register this plugin with the PluginManager, so it can be added to Scenes.

    //  The first argument is the name this plugin will be known as in the PluginManager. It should not conflict with already registered plugins.
    //  The second argument is a reference to the plugin object, which will be instantiated by the PluginManager when the Scene boots.
    //  The third argument is the local mapping. This will make the plugin available under `this.sys.base` and also `this.base` from a Scene if
    //  it has an entry in the InjectionMap.
    PluginManager.register('BasePlugin', BasePlugin, 'base');
};

BasePlugin.prototype = {

    //  Called when the Plugin is booted by the PluginManager.
    //  If you need to reference other systems in the Scene (like the Loader or DisplayList) then set-up those references now, not in the constructor.
    boot: function ()
    {
        var eventEmitter = this.systems.events;

        //  Listening to the following events is entirely optional, although we would recommend cleanly shutting down and destroying at least.
        //  If you don't need any of these events then remove the listeners and the relevant methods too.

        eventEmitter.on('start', this.start, this);

        eventEmitter.on('preupdate', this.preUpdate, this);
        eventEmitter.on('update', this.update, this);
        eventEmitter.on('postupdate', this.postUpdate, this);

        eventEmitter.on('pause', this.pause, this);
        eventEmitter.on('resume', this.resume, this);

        eventEmitter.on('sleep', this.sleep, this);
        eventEmitter.on('wake', this.wake, this);

        eventEmitter.on('shutdown', this.shutdown, this);
        eventEmitter.on('destroy', this.destroy, this);
    },

    //  A test method.
    test: function (name)
    {
        console.log('BasePlugin says hello ' + name + '!');
    },

    //  Called when a Scene is started by the SceneManager. The Scene is now active, visible and running.
    start: function ()
    {
    },

    //  Called every Scene step - phase 1
    preUpdate: function (time, delta)
    {
    },

    //  Called every Scene step - phase 2
    update: function (time, delta)
    {
    },

    //  Called every Scene step - phase 3
    postUpdate: function (time, delta)
    {
    },

    //  Called when a Scene is paused. A paused scene doesn't have its Step run, but still renders.
    pause: function ()
    {
    },

    //  Called when a Scene is resumed from a paused state.
    resume: function ()
    {
    },

    //  Called when a Scene is put to sleep. A sleeping scene doesn't update or render, but isn't destroyed or shutdown. preUpdate events still fire.
    sleep: function ()
    {
    },

    //  Called when a Scene is woken from a sleeping state.
    wake: function ()
    {
    },

    //  Called when a Scene shuts down, it may then come back again later (which will invoke the 'start' event) but should be considered dormant.
    shutdown: function ()
    {
    },

    //  Called when a Scene is destroyed by the Scene Manager. There is no coming back from a destroyed Scene, so clear up all resources here.
    destroy: function ()
    {
        this.shutdown();

        this.scene = undefined;
    }

};

BasePlugin.prototype.constructor = BasePlugin;

export default class Autotile {}
Autotile.BlobIndexer = BlobIndexer;
Autotile.Grid = Grid;
Autotile.Id = Id;
// TODO: HACK. Use the actual plugin to modify various loading steps.
Autotile.BasePlugin = BasePlugin;


/**
 * Method monkeypatched into tilemap to create a dynamic layer whose content is initially -- and thereafter! -- maintained with a Grid and TileSource.
 * @param {Phaser.Tilemaps.Tilemap} tilemap - The tilemap to monkeypatch into.
 * @param {integer|string} layerId - The name of this new layer.
 * @param {TileSource} tileSource - The tile source to use for doing autotile layout.
 * @param {object} geometry - The geometry to use for this layout.
 * @param {number} [geometry.x] - The x position to place the layer in the world (default 0).
 * @param {number} [geometry.y] - The y position to place the layer in the world (default 0).
 * @param {integer} geometry.width - The x position to place the layer in the world (default 0).
 * @param {integer} geometry.height - The y position to place the layer in the world (default 0).
 * @param {integer} geometry.tileWidth - The x position to place the layer in the world (default 0).
 * @param {integer} geometry.tileHeight - The y position to place the layer in the world (default 0).
 */
function createSubtilerDynamicLayer(tilemap, fromLayerId, toLayerId, tileSource, geometry) {
    throw new Exception("Still in development");
    // geometry = geometry || {};
    // let {x: x, y: y, width: width, height: height, tileWidth: tileWidth, tileHeight: tileHeight} = geometry;
    // const asTileset = TileSource.asTileset(tilemap, tileSource);
    // const fromLayer = tilemap.getLayer(fromLayerId);
    // const grid = new Grid();
    // let dynamicLayer = tilemap.createDynamicLayer(toLayerId, asTileset, x, y, width, height, tileWidth, tileHeight);


    // return dynamicLayer;
}

Autotile.createSubtilerDynamicLayer = createSubtilerDynamicLayer;

// Is this even necessary in the modern era?
// module.exports = Autotile;
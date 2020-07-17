# phaser3-autotile

# Installation
`npm i --save phaser3-autotile` as normal.

# Basic use
See code in the `examples` directory.

Before use, the library must be initialized (it adds additional methods to standard phaser components). You can force this to happen if you do not have any other imports from this library as:
```
import {initialize as autotileInitialize} from 'phaser3-autotile';
import Phaser from 'phaser';
// other imports, etc
autotileInitialize();
// Your code here, e.g.`let game = new Phaser.Game({/*config*/});` etc.
```

This library supports two main methods: generating blob tileset images from a more compact representation, and reshuffling autotiles on map layers to fix up flow & corners.

## Generating blob tileset images
`Textures.js` modifies the phaser texture manager, giving it an additional method `generateBlobAutotileTexture`. See `examples/src/Blob.js` and especially `examples/src/Playpen.js` for an example call. The input is a set of 5 generative tiles, and the result is a set of [47 generated tiles which cover cases where the center of the tile is set](http://www.cr31.co.uk/stagecast/wang/blob.html).

These are most useful when paired with autotiling, below.

## Autotiling & Terrains
`AutoTilemap` (and friends!) modify `Tilemap`, `TilemapLayer` etc to wrap their calls, and introduces a new field `.autotile()`, which works in terms of `Terrains`.

See `examples/src/Tiled.js` for an example of use.

### `.prepareAutotile({jsonkey})` & `.autotile()`
Tilemap exposes a new method `prepareAutotile` which must be called as early as possible (ideally, right after getting the tilemap out of the game factory). It will reparse the tilemap json and join in any additional information, parsing a subset of Tiled's "Terrain" and "Wangset" features.

Thereafter, you can access this library's features by calling `.autotile()` on `Tilemap` or `TilemapLayer` objects.

### `Terrain`s and methods on `.autotile()`
`someTilemap.autotile()` and `someTilemapLayer.autotile()` expose several relevant methods. They work equivalently up to the semantics of `someTilemap.getTileAt` or `.putTileAt`, so interpret "layer" in that sense below:
* `isSetAt(name, x, y)` - Returns true if the layer contains a tile in the terrain with `name` at `(x,y)`. This can be subtle: just because the tile is in the output of the terrain does not mean that it is in the input of that terrain! This is notable for corner terrains -- since a given tile's "set" value is identified with its northwest corner, elements of the tileset that don't include the northwest corner don't return true for `isSetAt`!
* `getWangIdAt(name, x, y)` - See notes at `isSetAt`; returns the `wangId` (see next section!) at `(x,y)`. This is dependent on `name` -- one tile could theoretically play different roles in different terrain names!
* `addRefresh(name, function(x, y))` - Only well-defined with `dynamicLayers`, so use with care. Registers a callback function under `name` to be used with the next block of methods. If you do not provide a callback, one will be provided for you: it uses the layer itself as input, determines each wangId, and maps that onto a specific tile using the Terrain by `name`.
* `refreshAt(name, x, y)`, `refreshRect(name, rect)`, `refreshRadius(name, x, y, radius)` - Invoke the refresh previously registered with `addRefresh` at each point in the arguments.
* Special note: `.terrains.getTerrain(name).tileId(wangId)` - As a convenience if you are implementing your own `addRefresh`, you can examine wangId<->tileId mappings with this field of `autotile()`.

# `WangId` & Autotiles
Autotiles as defined in this library are a special case of binary [Wang tilesets](http://www.cr31.co.uk/stagecast/wang/intro.html). This means that it can model the borders and interior of a single sort of thing: the edges of a field of grass-on-dirt, the cliffs of a plateau, walls against an alpha background, etc. This library doesn't support multiple transitions (such as explicit transitions between three types of terrain on a single tile), but by using alpha masking, layering, careful level design or other techniques this is generally not too bad a limitation.

## WangId algorithm: Blob & Edge
Truthy tile entries are identified by the 8-bit integer whose nth low order bit is set if the given neighbor in the below figure is set:
```
7 | 0 | 1
--+---+---
6 | x | 2
--+---+---
5 | 4 | 3
```
So for instance, a tile which is matched to the northeast, east, and southeast would have bits 1, 2 and 3 set, thus index (`14 == 0x0E == 0b00001110 == 14`).

Since not all tilesets generate all combinations, it is possible to estimate the index by omitting either corners or edges (consult the method arguments for `WangIndexRegion` or `WangIndexTile`). This simply assumes the given neighbor is unset.

If the tile at x is unset, the wangId is `null` (regardless of what it would otherwise evaluate to).

### WangId algorithm: Corner
As a special variant, the corner wangId algorithm is
```
 |   |   
-+---+---
 |x=7| 1
-+---+---
 | 5 | 3
```
Under this representation, if the tile at x is unset it is *not* set to `null`; instead, the value 0 is set to `null` (never otherwise encountered).

# FAQ

## What is phaser? What is a phaser plugin?
Check out [phaser.io]() -- it's a web-based game engine. It can be extended with plugins, of which this is one.

## What is autotiling?
Named in honor of [RPGMaker autotiles](https://blog.rpgmakerweb.com/tutorials/tutorial-how-autotiles-work/) feature, autotiles are a solution for blending between terrain types in a natural way.

## Where can I get autotiling tiles?
You generally cannot use the RPG Maker tiles outside of RPG maker -- due to licensing. Third party tiles have whatever license under which they were distributed, which may include your use case.

I wrote it because I wanted to generate my own assets and have them (in theory!) useable by others.

## Why is this clientside?
The usual solution for autotiling produces autotiled *maps*. But your game might use this for (harvestable) patches of grass, dynamic ditch-digging, water flowing through canals, or similar effects. Go nuts, and good luck!
# phaser3-autotile
**WIP** 
Implements autotiling support for phaser3.

# Wang Tiles & Autotiles
Autotiles as defined in this library are a special case of binary [Wang tilesets](http://www.cr31.co.uk/stagecast/wang/intro.html). This means that it can model the borders and interior of a single sort of thing: the edges of a field of grass-on-dirt, the cliffs of a plateau, walls against an alpha background, etc. This library doesn't support multiple transitions (such as explicit transitions between three types of terrain on a single tile), but by using alpha masking, layering, careful level design or other techniques this is generally not too bad a limitation.

The `WangIndexRegion` method takes as input a 2D array of truthy/falsey values. Falsey values are not of the type of the terrain, and will not generate a `wangIndex` (producing `null` instead). The truthy values are of the type of the terrain, and will generate a `wangIndex` which is an 8 bit integer `0`-`255` following the *indexing algorithm*. This index can then be used in the `WangTileset` to draw the necessary tiles.

## Indexing algorithm
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

## Tileset generation
Armed with a tile index, you will probably want to select specific asset(s) to display for that tile.

It is rare and labor intensive to explicitly design all 255 tiles, or even some of the [interesting subsets of the space](http://www.cr31.co.uk/stagecast/wang/blob.html). This library supports several methods of loading & deriving the tileset from images.

As a result, this library supports loading:

* An explicit list of tiles
* A set of 16 edge- or corner- based wang tiles
* Blob tiles from a set of 5 edge- or corner- based input.

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
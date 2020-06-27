/**
* @author       Brown Dragon <browndragon@googlegroups.com>
* @copyright    2020 Brown Dragon.
* @license      {@link https://github.com/browndragon/phaser3-autotile/blob/master/LICENSE|MIT License}
*/

import {Rectangle, Point} from "./Bindings.js";
import Ids from "./Ids.js";
import Plugin from "./Plugin.js";
import Pointwise from "./Pointwise.js";
import Subtiles from "./Subtiles.js";
import Textures from "./Textures.js";

import Phaser from 'phaser';

/**
 * Entrypoint for the Autotile library.
 *
 * 
 */
export default class Autotile {
}

Autotile.Ids = Ids;
// TODO: HACK. Use the actual plugin to modify various loading steps.
Autotile.Plugin = Plugin;
Autotile.Pointwise = Pointwise;
Autotile.Subtiles = Subtiles;
Autotile.Textures = Textures;

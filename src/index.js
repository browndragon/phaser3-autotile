/**
* @author       Brown Dragon <browndragon@googlegroups.com>
* @copyright    2020 Brown Dragon.
* @license      {@link https://github.com/browndragon/phaser3-autotile/blob/master/LICENSE|MIT License}
*/
import AutoTilemap from './AutoTilemap';
import AutoTilemapLayer from './AutoTilemapLayer';
import Ids from './Ids.mjs';
import Patterns from './Patterns';
import Pointwise from './Pointwise';
import Terrains from './Terrains';
import Textures from './Textures';

let _initialized = false;
export function initialize() {
    if (_initialized) {
        return;
    }
    AutoTilemap.register();
    AutoTilemapLayer.register();
    Textures.register();
    _initialized = true;    
}
initialize();

export {AutoTilemap, AutoTilemapLayer, Ids, Patterns, Pointwise, Terrains, Textures};

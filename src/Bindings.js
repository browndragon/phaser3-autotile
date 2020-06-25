/**
 * Binds phaser primitives which are not core to the use of phaser to more generic symbols.
 *
 * This is useful for geometry and basic image passing/frame dereferencing.
 */
import Phaser from 'phaser';

export const Rectangle = Phaser.Geom.Rectangle;
export const Point = Phaser.Geom.Point;
/** 
 * Convenience definition for Tilemaps (etc) where arrays of frames are used, but never actually invoked!
 */
export const Frame = Phaser.Textures.Frame;

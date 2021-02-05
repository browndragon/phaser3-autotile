#!/usr/bin/env node
/** Expands an rpg-maker tileset into a blob tileset. */

import commandLineArgs from 'command-line-args';
import commandLineUsage from 'command-line-usage';
import dirTree from 'directory-tree';
import fs from 'fs';
import fsPromises from 'fs/promises';
import glob from 'glob';
import Jimp from 'jimp';
import PATH from 'path';
import * as _Blob from '../src/Blob.mjs';
import TiledTileset from '../src/TiledTileset.mjs';

const optionDefinitions = [{
    name: 'help',
    alias: 'h',
    type: Boolean,
    description: 'Display this usage guide.'
}, {
    name: 'input',
    alias: 'i',
    type: String,
    multiple: true,
    description: 'Input image file to transform. With multiple files, output is interpreted as a target directory.',
    typeLabel: '<./raw/foo.png>',
}, {
    name: 'output',
    alias: 'o',
    type: String,
    description: 'Output directory to write into (basenames retained).',
    typeLabel: '<./cooked/>',
}, {
    name: 'tileset',
    alias: 't',
    type: String,
    description: 'Output directory to write tiled json tileset into.',
    typeLabel: '<./tileset/>',
}, {
    name: 'subtile',
    type: Number,
    multiple: true,
    description: `Geometry of the northwest subtile (<1: ratio tile)`,
    typeLabel: '<w[=h]|w h>',
    defaultValue: [0.5],
}, {
    name: 'tile',
    type: Number,
    multiple: true,
    description: `Geometry of each tile; (<1: ratio image)`,
    typeLabel: '<w[=h]|w h>',
    defaultValue: [1/2, 1/3],
},
// Pattern flags
...Object.entries({
    // Not used.
    // pzero: ['empty', 0, 0],
    // Standard RPGMaker layout.
    pcross: ['crossroads', 1/2, 0],
    pnw: ['northwest', 0, 1/3],
    pne: ['northeast', 1/2, 1/3],
    psw: ['southwest', 0, 2/3],
    pse: ['southeast', 1/2, 2/3],

    // Variant shapes.
    // Liberated Pixel Cup replacement for pcross.
    pnought: ['optional donut (crossroads shifted)', undefined],
    // VERY variant shapes; for the life of me I can't find the blog
    // post where I originally heard about these.
    pew: ['optional west/east passage', undefined],
    pns: ['optional north/south passage', undefined],
    pblock: ['optional small block', undefined],
    psat: ['optional saturated tile', undefined],

}).map(([k, [n, x, y]]) => ({
    name: k,
    group: 'patterns',
    type: Number,
    multiple: true,
    description: `Pixel offset of the ${n} tile (<1: ratio image)`,
    typeLabel: '<x[=y]|x y>',
    ...(x == undefined ? undefined: {defaultValue: [x, y]}),
})),
{
    name: 'force',
    alias: 'f',
    type: Boolean,
    description: 'Whether to mkdirp and forcibly replace the `output` file or not.',
    defaultValue: false,
}];

const options = commandLineArgs(optionDefinitions)

if (options._all.help) {
    const usage = commandLineUsage([
        {
            header: 'Phaser3-Autotile Blob utility',
            content: 'A tool for working with blob autotiles',
        },
        {
            header: 'Options',
            content: 'Note that the patterns flags are restricted. You can use either --pcross OR --pnought. You can use all of either [pnw, pne, pse, psw] OR [pew, pns, pblock, psat].',
            optionList: optionDefinitions,
        },
        {
            content: 'Project home: {underline https://github.com/browndragon/phaser3-autotile}'
        }
    ])
    console.log(usage);
} else {
    if (!Array.isArray(options._all.input) || options._all.input.length == 0) {
        throw 'Needs input file(s)';
    }
    for (let token of options._all.input) {
        for (let input of glob.sync(token)) {
            let opt = {...options._none};
            opt.input = PATH.join(input);
            console.assert(opt.input.endsWith('.png'));
            opt.name = PATH.basename(input).slice(0, -4);
            if (options._all.output) {
                opt.output = PATH.join(options._all.output, PATH.basename(input));
                if (options._all.tileset) {
                    opt.tileset = PATH.join(options._all.tileset, opt.name + '.json');    
                }            
            }
            single(opt, options.patterns);            
        }
    }
}

function single(options, patterns) {
    let state = {};
    console.log(`Running `, options, patterns);
    const dryRun = !options.output;
    Jimp.read(options.input)
        .then(input => new Promise((onFulfilled, onRejected) => {
            state.input = input;
            let [tw, th=tw] = options.tile;
            let [iw, ih=iw] = options.subtile;
            state.geometry = _Blob.geometry(
                input.bitmap.width, input.bitmap.height, tw, th, iw, ih
            );
            ({tile:{w:tw, h:th}, subtile:{w:iw, h:ih}} = state.geometry);
            console.log('Input geometry:', state.geometry);
            new Jimp(1 * tw, 47 * th, (err, output) => {
                if (err) {
                    onRejected(err);
                    return;
                }
                onFulfilled(output);
            });
        }))
        .then(output => {
            state.output = output;
            _Blob.forEach(
                ({dstx, dsty, x, y, w, h}, ...debug) => {
                    console.log('Blitting: ', dstx, dsty, x, y, w, h, 'debug: ', ...debug);
                    output.blit(
                        state.input, dstx, dsty, x, y, w, h
                    )
                },
                state.geometry,
                patterns,
            );
            return undefined;
        })
        .then(() => {
            if (!options.force) {
                return;
            }
            if (!options.output) {
                return;
            }
            const dir = PATH.dirname(options.output);
            console.log('(re)creating dir: ', dir);
            return fsPromises.mkdir(dir, {recursive: true});
        })
        .then(() => {
            if (dryRun) {
                console.log('Dry run! Use `-o someDir/`` to save.');
                return;
            }
            console.log('(re)writing to:', options.output);
            return state.output.writeAsync(options.output);
        })
        .then(jimp => {
            if (dryRun) {
                return;
            }
            if (!options.tileset) {
                console.log('No tileset! Use `-t tilesetDir/` to save.');
                return;
            }
            return fsPromises.writeFile(options.tileset, JSON.stringify(TiledTileset(
                options.name,
                PATH.relative(PATH.dirname(options.tileset), options.output),
            )));
        })
        .catch(err => {
            console.error('Error', state, err);
            process.exit(-1);
        });
}

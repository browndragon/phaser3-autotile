import Ids from './Ids.mjs';
import TerrainParser from './TerrainParser';

describe('smaller unit tests', ()=>{
    test.each([
        [[0, 0, 0, 0], 0],
        [[0, 0, 1, 0], Ids.SW],
        [[0, 1, 0, 0], Ids.NE],
        [[0, 0, 0, 1], Ids.SE],
        [[1, 0, 0, 0], Ids.NW],
    ])('', (terrainWangId, expected) => {
        expect(TerrainParser.parseTiledTerrainWangId(terrainWangId, 1)).toEqual(expected);
    });
});

const TESTJSON = {
    'compressionlevel':-1,
    'editorsettings':
    {
        'export':
        {
            'target':'.'
        }
    },
    'height':10,
    'infinite':false,
    'layers':[
        {
            'compression':'',
            'data':'DgAAAAQAAAAGAAAABwAAAAcAAAAIAAAACwAAAAMAAAAEAAAAAQAAAAIAAAAIAAAACgAAAAoAAAALAAAADAAAAAkAAAAKAAAACwAAAAwAAAAJAAAAEAAAAAAAAAAAAAAAAgAAAAMAAAABAAAAAAAAAAkAAAAQAAAABAAAAAEAAAAOAAAABAAAAA8AAAAKAAAABQAAAAEAAAAAAAAAAAAAAAcAAAAMAAAAAgAAAAcAAAADAAAABAAAAA8AAAAQAAAAAAAAAAAAAAAKAAAAEAAAAAkAAAAKAAAACwAAAAcAAAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgAAAA8AAAAKAAAABQAAAAQAAAAEAAAAAQAAAA4AAAABAAAAAAAAAAkAAAAFAAAAAQAAAAkAAAALAAAABwAAAAwAAAACAAAAAwAAAAQAAAAEAAAADwAAABAAAAAAAAAAAgAAAAcAAAAMAAAACQAAAAoAAAALAAAABwAAAAwAAAAAAAAAAAAAAAkAAAAKAAAAEAAAAA==',
            'encoding':'base64',
            'height':10,
            'id':1,
            'name':'mutable',
            'opacity':1,
            'type':'tilelayer',
            'visible':true,
            'width':10,
            'x':0,
            'y':0
        }],
    'nextlayerid':2,
    'nextobjectid':1,
    'orientation':'orthogonal',
    'renderorder':'right-down',
    'tiledversion':'1.4.1',
    'tileheight':16,
    'tilesets':[
        {
            'columns':4,
            'firstgid':1,
            'image':'corner.png',
            'imageheight':64,
            'imagewidth':64,
            'margin':0,
            'name':'tiles',
            'spacing':0,
            'terrains':[
                {
                    'name':'terrain2',
                    'tile':0
                }, 
                {
                    'name':'terrain1',
                    'tile':0
                }],
            'tilecount':16,
            'tileheight':16,
            'tiles':[
                {
                    'id':0,
                    'terrain':[0, 0, 1, 0]
                }, 
                {
                    'id':1,
                    'terrain':[0, 1, 0, 1]
                }, 
                {
                    'id':2,
                    'terrain':[1, 0, 1, 1]
                }, 
                {
                    'id':3,
                    'terrain':[0, 0, 1, 1]
                }, 
                {
                    'id':4,
                    'terrain':[1, 0, 0, 1]
                }, 
                {
                    'id':5,
                    'terrain':[0, 1, 1, 1]
                }, 
                {
                    'id':6,
                    'terrain':[1, 1, 1, 1]
                }, 
                {
                    'id':7,
                    'terrain':[1, 1, 1, 0]
                }, 
                {
                    'id':8,
                    'terrain':[0, 1, 0, 0]
                }, 
                {
                    'id':9,
                    'terrain':[1, 1, 0, 0]
                }, 
                {
                    'id':10,
                    'terrain':[1, 1, 0, 1]
                }, 
                {
                    'id':11,
                    'terrain':[1, 0, 1, 0]
                }, 
                {
                    'id':12,
                    'terrain':[0, 0, 0, 0]
                }, 
                {
                    'id':13,
                    'terrain':[0, 0, 0, 1]
                }, 
                {
                    'id':14,
                    'terrain':[0, 1, 1, 0]
                }, 
                {
                    'id':15,
                    'terrain':[1, 0, 0, 0]
                }],
            'tilewidth':16,
            'wangsets':[
                {
                    'cornercolors':[
                        {
                            'color':'#ff0000',
                            'name':'off',
                            'probability':1,
                            'tile':-1
                        }, 
                        {
                            'color':'#00ff00',
                            'name':'on',
                            'probability':1,
                            'tile':-1
                        }],
                    'edgecolors':[],
                    'name':'binary',
                    'tile':-1,
                    'wangtiles':[
                        {
                            'dflip':false,
                            'hflip':false,
                            'tileid':0,
                            'vflip':false,
                            'wangid':[0, 1, 0, 1, 0, 2, 0, 1]
                        }, 
                        {
                            'dflip':false,
                            'hflip':false,
                            'tileid':1,
                            'vflip':false,
                            'wangid':[0, 2, 0, 2, 0, 1, 0, 1]
                        }, 
                        {
                            'dflip':false,
                            'hflip':false,
                            'tileid':2,
                            'vflip':false,
                            'wangid':[0, 1, 0, 2, 0, 2, 0, 2]
                        }, 
                        {
                            'dflip':false,
                            'hflip':false,
                            'tileid':3,
                            'vflip':false,
                            'wangid':[0, 1, 0, 2, 0, 2, 0, 1]
                        }, 
                        {
                            'dflip':false,
                            'hflip':false,
                            'tileid':4,
                            'vflip':false,
                            'wangid':[0, 1, 0, 2, 0, 1, 0, 2]
                        }, 
                        {
                            'dflip':false,
                            'hflip':false,
                            'tileid':5,
                            'vflip':false,
                            'wangid':[0, 2, 0, 2, 0, 2, 0, 1]
                        }, 
                        {
                            'dflip':false,
                            'hflip':false,
                            'tileid':6,
                            'vflip':false,
                            'wangid':[0, 2, 0, 2, 0, 2, 0, 2]
                        }, 
                        {
                            'dflip':false,
                            'hflip':false,
                            'tileid':7,
                            'vflip':false,
                            'wangid':[0, 2, 0, 1, 0, 2, 0, 2]
                        }, 
                        {
                            'dflip':false,
                            'hflip':false,
                            'tileid':8,
                            'vflip':false,
                            'wangid':[0, 2, 0, 1, 0, 1, 0, 1]
                        }, 
                        {
                            'dflip':false,
                            'hflip':false,
                            'tileid':9,
                            'vflip':false,
                            'wangid':[0, 2, 0, 1, 0, 1, 0, 2]
                        }, 
                        {
                            'dflip':false,
                            'hflip':false,
                            'tileid':10,
                            'vflip':false,
                            'wangid':[0, 2, 0, 2, 0, 1, 0, 2]
                        }, 
                        {
                            'dflip':false,
                            'hflip':false,
                            'tileid':11,
                            'vflip':false,
                            'wangid':[0, 1, 0, 1, 0, 2, 0, 2]
                        }, 
                        {
                            'dflip':false,
                            'hflip':false,
                            'tileid':12,
                            'vflip':false,
                            'wangid':[0, 1, 0, 1, 0, 1, 0, 1]
                        }, 
                        {
                            'dflip':false,
                            'hflip':false,
                            'tileid':13,
                            'vflip':false,
                            'wangid':[0, 1, 0, 2, 0, 1, 0, 1]
                        }, 
                        {
                            'dflip':false,
                            'hflip':false,
                            'tileid':14,
                            'vflip':false,
                            'wangid':[0, 2, 0, 1, 0, 2, 0, 1]
                        }, 
                        {
                            'dflip':false,
                            'hflip':false,
                            'tileid':15,
                            'vflip':false,
                            'wangid':[0, 1, 0, 1, 0, 1, 0, 2]
                        }]
                }, 
                {
                    'cornercolors':[
                        {
                            'color':'#ff0000',
                            'name':'',
                            'probability':1,
                            'tile':-1
                        }, 
                        {
                            'color':'#00ff00',
                            'name':'',
                            'probability':1,
                            'tile':-1
                        }],
                    'edgecolors':[],
                    'name':'binary2',
                    'tile':-1,
                    'wangtiles':[
                        {
                            'dflip':false,
                            'hflip':false,
                            'tileid':0,
                            'vflip':false,
                            'wangid':[0, 0, 0, 0, 0, 2, 0, 0]
                        }, 
                        {
                            'dflip':false,
                            'hflip':false,
                            'tileid':1,
                            'vflip':false,
                            'wangid':[0, 2, 0, 2, 0, 0, 0, 0]
                        }, 
                        {
                            'dflip':false,
                            'hflip':false,
                            'tileid':2,
                            'vflip':false,
                            'wangid':[0, 0, 0, 2, 0, 2, 0, 2]
                        }, 
                        {
                            'dflip':false,
                            'hflip':false,
                            'tileid':3,
                            'vflip':false,
                            'wangid':[0, 0, 0, 2, 0, 2, 0, 0]
                        }, 
                        {
                            'dflip':false,
                            'hflip':false,
                            'tileid':4,
                            'vflip':false,
                            'wangid':[0, 0, 0, 2, 0, 0, 0, 2]
                        }, 
                        {
                            'dflip':false,
                            'hflip':false,
                            'tileid':5,
                            'vflip':false,
                            'wangid':[0, 2, 0, 2, 0, 2, 0, 0]
                        }, 
                        {
                            'dflip':false,
                            'hflip':false,
                            'tileid':6,
                            'vflip':false,
                            'wangid':[0, 2, 0, 2, 0, 2, 0, 2]
                        }, 
                        {
                            'dflip':false,
                            'hflip':false,
                            'tileid':7,
                            'vflip':false,
                            'wangid':[0, 2, 0, 0, 0, 2, 0, 2]
                        }, 
                        {
                            'dflip':false,
                            'hflip':false,
                            'tileid':8,
                            'vflip':false,
                            'wangid':[0, 2, 0, 0, 0, 0, 0, 0]
                        }, 
                        {
                            'dflip':false,
                            'hflip':false,
                            'tileid':9,
                            'vflip':false,
                            'wangid':[0, 2, 0, 0, 0, 0, 0, 2]
                        }, 
                        {
                            'dflip':false,
                            'hflip':false,
                            'tileid':10,
                            'vflip':false,
                            'wangid':[0, 2, 0, 2, 0, 0, 0, 2]
                        }, 
                        {
                            'dflip':false,
                            'hflip':false,
                            'tileid':11,
                            'vflip':false,
                            'wangid':[0, 0, 0, 0, 0, 2, 0, 2]
                        }, 
                        {
                            'dflip':false,
                            'hflip':false,
                            'tileid':13,
                            'vflip':false,
                            'wangid':[0, 0, 0, 2, 0, 0, 0, 0]
                        }, 
                        {
                            'dflip':false,
                            'hflip':false,
                            'tileid':14,
                            'vflip':false,
                            'wangid':[0, 2, 0, 0, 0, 2, 0, 0]
                        }, 
                        {
                            'dflip':false,
                            'hflip':false,
                            'tileid':15,
                            'vflip':false,
                            'wangid':[0, 0, 0, 0, 0, 0, 0, 2]
                        }]
                }]
        }],
    'tilewidth':16,
    'type':'map',
    'version':1.4,
    'width':10
};

describe('Terrain parsing on known data', () => {
    let parser = new TerrainParser({});
    // Use of nested "describes" is an attempt to get sequential running of tagged test clauses.
    // Otherwise, the tests all run in parallel.
    describe('performParse', () => {
        parser.reparseJSON(TESTJSON);
    });

    const generatedConfigs = parser.terrainConfigs();
    describe('number results', () => {
        expect(generatedConfigs.length).toEqual(4);
    });
    const cfgsByName = Object.fromEntries(generatedConfigs.map((cfg)=>[cfg.name, cfg]));
    describe('terrain name results', () => {
        expect(Object.keys(cfgsByName).sort()).toEqual([
            'tilesbinary', 'tilesbinary2', 'tilesterrain1', 'tilesterrain2',
        ].sort());
    });

    describe('Use the output', () => {
        test.each([
            ['tilesterrain1', [12]],
            ['tilesterrain2', [6]],
            ['tilesbinary', []],
            ['tilesbinary2', [12]],
        ])('.TerrainParser.missingPatternValues(%s)', (name, e) => {
            const cfg = cfgsByName[name];
            let presentValues = new Set(Object.values(cfg.pattern));
            let notPresent = new Set();
            for (let tile = 0; tile < 16; ++tile) {
                if (!presentValues.has(tile)) {
                    notPresent.add(tile);
                }
            }
            expect(Array.from(notPresent.values()).sort()).toEqual(e.sort());
        });

        test.each([
            ['tilesterrain1', [0, 1, 3, 5, 8, 12, 13, 14]],
            ['tilesterrain2', [2, 4, 6, 7, 9, 10, 11, 15]],
            ['tilesbinary', [0, 1, 3, 5, 8, 12, 13, 14]],
            ['tilesbinary2', [0, 1, 3, 5, 8, 12, 13, 14]],
        ])('.TerrainParser.missingInputs(%s)', (name, e) => {
            const cfg = cfgsByName[name];
            let notPresent = new Set();
            for (let tile = 0; tile < 16; ++tile) {
                if (!cfg.input.has(tile)) {
                    notPresent.add(tile);
                }
            }
            expect(Array.from(notPresent.values()).sort()).toEqual(e.sort());
        });

        test.each([
            ['tilesterrain1', Ids.NE, 8],
            ['tilesterrain1', Ids.NE | Ids.NW | Ids.SW, 7],

            ['tilesterrain2', Ids.NE, 2],
            ['tilesterrain2', Ids.NE | Ids.NW | Ids.SW, 13],

            ['tilesbinary', Ids.NE, 8],
            ['tilesbinary', Ids.NE | Ids.NW | Ids.SW, 7],

            ['tilesbinary2', Ids.NE, 8],
            ['tilesbinary2', Ids.NE | Ids.NW | Ids.SW, 7],
        ])('.TerrainParser.mappedWangIds(%s, %i)', (name, wang, tile) => {
            const cfg = cfgsByName[name];
            expect(cfg.pattern[wang]).toEqual(tile);
        });
        test('equivalent inputs terrain and wang', ()=> {
            expect(cfgsByName.tilesterrain1.input).toEqual(cfgsByName.tilesbinary2.input);
        });
        test('equivalent patterns terrain and wang', ()=> {
            expect(cfgsByName.tilesterrain1.pattern).toEqual(cfgsByName.tilesbinary2.pattern);
        });
    });
});

const tilecount=47;
export default function TiledTileset(
    name,
    image,
    tilewidth=32,
    tileheight=32,
    imagewidth=tilewidth,
    imageheight=tilecount*tileheight,
    margin=0,
    spacing=0,
) {
    return {
        "columns":1,
        "editorsettings":
           {
            "export":
               {
                "format":"",
                "target":"."
               }
           },
        "image": image,
        "imagewidth": imagewidth,
        "imageheight": imageheight,
        "margin": margin,
        "name":name,
        "spacing": spacing,
        "tilecount":tilecount,
        "tiledversion":"2020.09.09",
        "tileheight":tileheight,
        "tilewidth":tilewidth,
        "type":"tileset",
        "version":1.4,
        "wangsets":[{
                "colors":[
                       {
                        "color":"#ff0000",
                        "name": name,
                        "probability":1,
                        "tile":-1
                       }],
                "name": name,
                "tile":-1,
                "wangtiles":[
                       {
                        "dflip":false,
                        "hflip":false,
                        "tileid":0,
                        "vflip":false,
                        "wangid":[0, 0, 0, 0, 0, 0, 0, 0]
                       },
                       {
                        "dflip":false,
                        "hflip":false,
                        "tileid":1,
                        "vflip":false,
                        "wangid":[1, 0, 0, 0, 0, 0, 0, 0]
                       },
                       {
                        "dflip":false,
                        "hflip":false,
                        "tileid":2,
                        "vflip":false,
                        "wangid":[0, 0, 1, 0, 0, 0, 0, 0]
                       }, 
                       {
                        "dflip":false,
                        "hflip":false,
                        "tileid":3,
                        "vflip":false,
                        "wangid":[1, 0, 1, 0, 0, 0, 0, 0]
                       }, 
                       {
                        "dflip":false,
                        "hflip":false,
                        "tileid":4,
                        "vflip":false,
                        "wangid":[1, 1, 1, 0, 0, 0, 0, 0]
                       }, 
                       {
                        "dflip":false,
                        "hflip":false,
                        "tileid":5,
                        "vflip":false,
                        "wangid":[0, 0, 0, 0, 1, 0, 0, 0]
                       }, 
                       {
                        "dflip":false,
                        "hflip":false,
                        "tileid":6,
                        "vflip":false,
                        "wangid":[1, 0, 0, 0, 1, 0, 0, 0]
                       }, 
                       {
                        "dflip":false,
                        "hflip":false,
                        "tileid":7,
                        "vflip":false,
                        "wangid":[0, 0, 1, 0, 1, 0, 0, 0]
                       }, 
                       {
                        "dflip":false,
                        "hflip":false,
                        "tileid":8,
                        "vflip":false,
                        "wangid":[1, 0, 1, 0, 1, 0, 0, 0]
                       }, 
                       {
                        "dflip":false,
                        "hflip":false,
                        "tileid":9,
                        "vflip":false,
                        "wangid":[1, 1, 1, 0, 1, 0, 0, 0]
                       }, 
                       {
                        "dflip":false,
                        "hflip":false,
                        "tileid":10,
                        "vflip":false,
                        "wangid":[0, 0, 1, 1, 1, 0, 0, 0]
                       }, 
                       {
                        "dflip":false,
                        "hflip":false,
                        "tileid":11,
                        "vflip":false,
                        "wangid":[1, 0, 1, 1, 1, 0, 0, 0]
                       }, 
                       {
                        "dflip":false,
                        "hflip":false,
                        "tileid":12,
                        "vflip":false,
                        "wangid":[1, 1, 1, 1, 1, 0, 0, 0]
                       }, 
                       {
                        "dflip":false,
                        "hflip":false,
                        "tileid":13,
                        "vflip":false,
                        "wangid":[0, 0, 0, 0, 0, 0, 1, 0]
                       }, 
                       {
                        "dflip":false,
                        "hflip":false,
                        "tileid":14,
                        "vflip":false,
                        "wangid":[1, 0, 0, 0, 0, 0, 1, 0]
                       }, 
                       {
                        "dflip":false,
                        "hflip":false,
                        "tileid":15,
                        "vflip":false,
                        "wangid":[0, 0, 1, 0, 0, 0, 1, 0]
                       }, 
                       {
                        "dflip":false,
                        "hflip":false,
                        "tileid":16,
                        "vflip":false,
                        "wangid":[1, 0, 1, 0, 0, 0, 1, 0]
                       }, 
                       {
                        "dflip":false,
                        "hflip":false,
                        "tileid":17,
                        "vflip":false,
                        "wangid":[1, 1, 1, 0, 0, 0, 1, 0]
                       }, 
                       {
                        "dflip":false,
                        "hflip":false,
                        "tileid":18,
                        "vflip":false,
                        "wangid":[0, 0, 0, 0, 1, 0, 1, 0]
                       }, 
                       {
                        "dflip":false,
                        "hflip":false,
                        "tileid":19,
                        "vflip":false,
                        "wangid":[1, 0, 0, 0, 1, 0, 1, 0]
                       }, 
                       {
                        "dflip":false,
                        "hflip":false,
                        "tileid":20,
                        "vflip":false,
                        "wangid":[0, 0, 1, 0, 1, 0, 1, 0]
                       }, 
                       {
                        "dflip":false,
                        "hflip":false,
                        "tileid":21,
                        "vflip":false,
                        "wangid":[1, 0, 1, 0, 1, 0, 1, 0]
                       }, 
                       {
                        "dflip":false,
                        "hflip":false,
                        "tileid":22,
                        "vflip":false,
                        "wangid":[1, 1, 1, 0, 1, 0, 1, 0]
                       }, 
                       {
                        "dflip":false,
                        "hflip":false,
                        "tileid":23,
                        "vflip":false,
                        "wangid":[0, 0, 1, 1, 1, 0, 1, 0]
                       }, 
                       {
                        "dflip":false,
                        "hflip":false,
                        "tileid":24,
                        "vflip":false,
                        "wangid":[1, 0, 1, 1, 1, 0, 1, 0]
                       }, 
                       {
                        "dflip":false,
                        "hflip":false,
                        "tileid":25,
                        "vflip":false,
                        "wangid":[1, 1, 1, 1, 1, 0, 1, 0]
                       }, 
                       {
                        "dflip":false,
                        "hflip":false,
                        "tileid":26,
                        "vflip":false,
                        "wangid":[0, 0, 0, 0, 1, 1, 1, 0]
                       }, 
                       {
                        "dflip":false,
                        "hflip":false,
                        "tileid":27,
                        "vflip":false,
                        "wangid":[1, 0, 0, 0, 1, 1, 1, 0]
                       }, 
                       {
                        "dflip":false,
                        "hflip":false,
                        "tileid":28,
                        "vflip":false,
                        "wangid":[0, 0, 1, 0, 1, 1, 1, 0]
                       }, 
                       {
                        "dflip":false,
                        "hflip":false,
                        "tileid":29,
                        "vflip":false,
                        "wangid":[1, 0, 1, 0, 1, 1, 1, 0]
                       }, 
                       {
                        "dflip":false,
                        "hflip":false,
                        "tileid":30,
                        "vflip":false,
                        "wangid":[1, 1, 1, 0, 1, 1, 1, 0]
                       }, 
                       {
                        "dflip":false,
                        "hflip":false,
                        "tileid":31,
                        "vflip":false,
                        "wangid":[0, 0, 1, 1, 1, 1, 1, 0]
                       }, 
                       {
                        "dflip":false,
                        "hflip":false,
                        "tileid":32,
                        "vflip":false,
                        "wangid":[1, 0, 1, 1, 1, 1, 1, 0]
                       }, 
                       {
                        "dflip":false,
                        "hflip":false,
                        "tileid":33,
                        "vflip":false,
                        "wangid":[1, 1, 1, 1, 1, 1, 1, 0]
                       }, 
                       {
                        "dflip":false,
                        "hflip":false,
                        "tileid":34,
                        "vflip":false,
                        "wangid":[1, 0, 0, 0, 0, 0, 1, 1]
                       }, 
                       {
                        "dflip":false,
                        "hflip":false,
                        "tileid":35,
                        "vflip":false,
                        "wangid":[1, 0, 1, 0, 0, 0, 1, 1]
                       }, 
                       {
                        "dflip":false,
                        "hflip":false,
                        "tileid":36,
                        "vflip":false,
                        "wangid":[1, 1, 1, 0, 0, 0, 1, 1]
                       }, 
                       {
                        "dflip":false,
                        "hflip":false,
                        "tileid":37,
                        "vflip":false,
                        "wangid":[1, 0, 0, 0, 1, 0, 1, 1]
                       }, 
                       {
                        "dflip":false,
                        "hflip":false,
                        "tileid":38,
                        "vflip":false,
                        "wangid":[1, 0, 1, 0, 1, 0, 1, 1]
                       }, 
                       {
                        "dflip":false,
                        "hflip":false,
                        "tileid":39,
                        "vflip":false,
                        "wangid":[1, 1, 1, 0, 1, 0, 1, 1]
                       }, 
                       {
                        "dflip":false,
                        "hflip":false,
                        "tileid":40,
                        "vflip":false,
                        "wangid":[1, 0, 1, 1, 1, 0, 1, 1]
                       }, 
                       {
                        "dflip":false,
                        "hflip":false,
                        "tileid":41,
                        "vflip":false,
                        "wangid":[1, 1, 1, 1, 1, 0, 1, 1]
                       }, 
                       {
                        "dflip":false,
                        "hflip":false,
                        "tileid":42,
                        "vflip":false,
                        "wangid":[1, 0, 0, 0, 1, 1, 1, 1]
                       }, 
                       {
                        "dflip":false,
                        "hflip":false,
                        "tileid":43,
                        "vflip":false,
                        "wangid":[1, 0, 1, 0, 1, 1, 1, 1]
                       }, 
                       {
                        "dflip":false,
                        "hflip":false,
                        "tileid":44,
                        "vflip":false,
                        "wangid":[1, 1, 1, 0, 1, 1, 1, 1]
                       }, 
                       {
                        "dflip":false,
                        "hflip":false,
                        "tileid":45,
                        "vflip":false,
                        "wangid":[1, 0, 1, 1, 1, 1, 1, 1]
                       }, 
                       {
                        "dflip":false,
                        "hflip":false,
                        "tileid":46,
                        "vflip":false,
                        "wangid":[1, 1, 1, 1, 1, 1, 1, 1]
                       }]
                }]
    };
}
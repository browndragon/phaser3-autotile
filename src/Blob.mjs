/** Tools etc for doing 47-tile blob generation. */
import Ids from '../src/Ids.mjs';
import Patterns from '../src/Patterns.mjs';
const {NN, NE, EE, SE, SS, SW, WW, NW} = Ids;

function scale(v, x) {
    return v >= 1 ? v : v * x;
}

export function geometry(bmw, bmh, tw, th, iw, ih) {
    tw = scale(tw, bmw);
    th = scale(th, bmh);
    iw = scale(iw, tw);
    ih = scale(ih, th);

    return {
        image: {w: bmw, h:bmh},
        tile: {w:tw, h:th},
        subtile: {w:iw, h:ih},

        nw: {x:0, y:0, w:iw, h:ih},
        ne: {x:iw, y:0, w:tw-iw, h:ih},
        se: {x:iw, y:ih, w:tw-iw, h:th-ih},
        sw: {x:0, y:ih, w:iw, h:th-ih},
    };
}

export function project(wangId) {
    return Object.entries({
        nw: Ids.Subtile[NW].project(wangId),
        ne: Ids.Subtile[NE].project(wangId),
        se: Ids.Subtile[SE].project(wangId),
        sw: Ids.Subtile[SW].project(wangId),
    });
}

function indexByCorners(
    geometry,
    patterns,
    {x:patternOffsetX=0, y:patternOffsetY=0}
) {
    const {
        pcross,
        pnw, pne, pse, psw,
        pnought,
        pew, pns, pblock, psat,
    } = patterns;
    let subtiles = {nw: {}, ne: {}, se: {}, sw: {}};

    function setIndex(geometry, wangId, offsetX, offsetY) {
        for (let [corner, projectedWangId] of project(wangId)) {
            let {x, y, w, h} = geometry[corner];
            x += scale(offsetX, geometry.image.w) + patternOffsetX;
            y += scale(offsetY, geometry.image.h) + patternOffsetY;
            subtiles[corner][projectedWangId] = {x, y, w, h};
            console.log('Setting corner', corner, projectedWangId, 'to:', subtiles[corner][projectedWangId]);
        }
    };

    if (pnought) {
        const wackyGeometry = {
            nw: {...geometry.se, x:0, y:0},
            ne: {...geometry.sw, x:geometry.subtile.w, y:0},
            se: {...geometry.nw, x:geometry.subtile.w, y:geometry.subtile.h},
            sw: {...geometry.ne, x:0, y:geometry.subtile.h},
        };
        console.info('pnought', NN | EE | SS | WW);
        setIndex(wackyGeometry, NN | EE | SS | WW, ...pnought);
    } else {
        console.info('pcross', NN | EE | SS | WW);
        setIndex(geometry, NN | EE | SS | WW, ...pcross);
    }

    const altScheme = [
        pew,
        pns,
        pblock,
        psat,
    ];
    if (altScheme.some(Boolean)) {
        console.assert(altScheme.every(Boolean));
        for (let [name, wangId, pattern] of [
            ['East/West', EE | WW, pew],
            ['North/South', NN | SS, pns],
            ['Block', 0, pblock],
            ['Saturated', 255, psat],
        ]) {
            console.info(name, wangId);
            setIndex(geometry, wangId, ...pattern);
        }
    } else {
        for (let [name, wangId, pattern] of [
            ['Northwest', EE | SE | SS, pnw],
            ['Northeast', WW | SW | SS, pne],
            ['Southeast', NN | NW | WW, pse],
            ['Southwest', NN | NE | EE, psw],
        ]) {
            console.info(name, wangId);
            setIndex(geometry, wangId, ...pattern);
        }
    }
    return subtiles;
}

export function forEach(cb, geometry, patterns, inputOffset={x:0, y:0}, outputOffset={x:0, y:0}) {
    const cornerIndex = indexByCorners(geometry, patterns, inputOffset);
    console.log('Got corner index: ', cornerIndex);
    for (let [wangId, index] of Object.entries(Patterns.LITERAL_BLOB)) {
        for (let [corner, subWangId] of project(+wangId)) {
            const {x, y, w, h} = cornerIndex[corner][subWangId];
            let {x:dstx, y:dsty} = geometry[corner];
            dstx += outputOffset.x;
            dsty += outputOffset.y + index * geometry.tile.h;
            cb(
                { dstx, dsty, x, y, w, h },
                index, wangId, corner, subWangId, cornerIndex[corner][subWangId],
            );
        }
    }
}

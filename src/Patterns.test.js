import Ids from './Ids';
import Patterns from './Patterns';

const {NN, NE, EE, SE, SS, SW, WW, NW} = Ids;

describe('Patterns', function () {
    // Basically all the "answers" have to come in the form of these 5 input tiles.
    const X = NN|EE|SS|WW;  // "crossroads"
    const TL = EE|SE|SS;  // "island" top left.
    const TR = WW|SW|SS;  // "island" top right.
    const BL = NN|NE|EE;  // "island" bottom left.
    const BR = NN|NW|WW;  // "island" bottom right.
    test('RPG_MAKER pattern is known', () => {
        expect(Patterns.RPG_MAKER[X]).toEqual(1);        
        expect(Patterns.RPG_MAKER[TL]).toEqual(2);        
        expect(Patterns.RPG_MAKER[TR]).toEqual(3);        
        expect(Patterns.RPG_MAKER[BL]).toEqual(4);        
        expect(Patterns.RPG_MAKER[BR]).toEqual(5);        
    });

    const index = Patterns.IndexByCorner(Patterns.RPG_MAKER);

    test('Index is well formed', () => {
        expect(index).toEqual({
            [NE]: {[0]: TR, [NN]: BR, [EE]: TL, [NN|EE]: X, [NN|NE|EE]: BL},
            [SE]: {[0]: BR, [EE]: BL, [SS]: TR, [EE|SS]: X, [EE|SE|SS]: TL},
            [SW]: {[0]: BL, [SS]: TL, [WW]: BR, [SS|WW]: X, [SS|SW|WW]: TR},
            [NW]: {[0]: TL, [WW]: TR, [NN]: BL, [WW|NN]: X, [WW|NW|NN]: BR},
        });
    });
    // Test that inverted indices work.
    test.each([
        [NE, 0, TR],
        [NE, NN, BR],
        [NE, NN | SS, BR],
        [NE, NN | EE, X],
        [NE, NN | NE | EE, BL],
        [NE, NN | NE | NW, BR],
        [NE, SS, TR],
        [SW, WW, BR],
    ])('.Indices(%i, %i)', (corner, wangId, expected) => {
        expect(Patterns.LookupWangIdIndex(index, corner, wangId)).toEqual(expected);
    });     
});
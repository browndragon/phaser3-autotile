import Pointwise from './Pointwise';


describe('pointwise math more or less works.', () => {
    test('Basic forEach test', () => {
        let pointwise = new Pointwise(10, 10, 2, 2);
        let calls = [];
        pointwise.forEach((x, y) => {
            calls.push([x, y].join(','));
        });
        expect(calls).toEqual(['10,10', '11,10', '10,11', '11,11']);
    });

    test.each([
        [0, 10, 1, 1],
        [1, 11, 1, 1],
        [0, 9, 1, 1],
        [0, 9, 1, 1],
    ])('.Pointwise.Mod(%s,%s,%s)', (min, max, val, expected) => {
        expect(Pointwise.Mod(min, max, val)).toEqual(expected);
    });
});
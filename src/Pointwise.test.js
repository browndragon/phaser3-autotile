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

    test.each([
        [new Pointwise(0, 0, 10, 10), 0, [0, 0]],
        [new Pointwise(0, 0, 10, 10), 2, [2, 0]],
        [new Pointwise(0, 0, 10, 10), 12, [2, 1]],
        [new Pointwise(0, 0, 10, 10, 3, 2), 2, [6, 0]],
        [new Pointwise(0, 0, 10, 10, 3, 2), 11, [3, 6]],
        [new Pointwise(0, 0, 10, 10, 3, 2), 12, [6, 6]],
        [new Pointwise(-5, -5, 10, 10, 2, 2), 0, [-5, -5]],
        [new Pointwise(-5, -5, 10, 10, 2, 2), 2, [-1, -5]],
        [new Pointwise(0, 0, 2, 2), 0, [0, 0]],
        [new Pointwise(0, 0, 2, 2), 1, [1, 0]],
        [new Pointwise(0, 0, 2, 2), 2, [0, 1]],
        [new Pointwise(0, 0, 2, 2), 3, [1, 1]],
        [new Pointwise(0, 0, 2, 2), 4, [0, 1]],
    ])('.Pointwise.nth(%s, %i)', (p, i, e) => {
        expect(p.nth(i)).toEqual(e);
    });
});
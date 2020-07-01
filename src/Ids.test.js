import Ids from './Ids';


/** Returns an is-set over the 3x3 rectangle at 0,0. */
function mockSet({cc=true, nn=false, ne=false, ee=false, se=false, ss=false, sw=false, ww=false, nw=false} = {}) {
  const data = [
    [nw, nn, ne],
    [ww, cc, ee],
    [sw, ss, se]
  ];
  return (x, y) => {
    return data[y][x];
  };
}

describe('Math', function () {
  test.each([
    [{}, 0b00000000],
    [{nn:true}, 0b00000001],
    [{ne:true}, 0b00000000],  // Because: neighboring edges not set.
    [{ee:true}, 0b00000100],
    [{nn:true, ee:true}, 0b00000101],
    [{nn:true, ne:true, ee:true}, 0b00000111],
    [{nw:true, nn:true}, 0b00000001],  // Because: neighboring edge not set.
    [{nw:true, nn:true, ww:true}, 0b11000001],
    [{ss:true}, 0b00010000],
    [{nn:true, ee:true, ss:true, ww:true}, 0b01010101],
  ])('.Blob.wangId(%s)', (dirs, expectedWangId) => {
    expect(Ids.Blob.wangId(mockSet(dirs), 1, 1)).toEqual(expectedWangId);
  });

  // Since corner tilesets are relative to the `[[/*nw*/self, /*ne*/ee], [/*sw*/ss, /*se*/se]]` set, expect numbers here to vary dramatically!
  test.each([
    [{nn:true}, 0b10000000],
    [{ne:true}, 0b10000000],
    [{ee:true}, 0b10000010],
    [{nn:true, ee:true}, 0b10000010],
    [{nn:true, ne:true, ee:true}, 0b10000010],
    [{ss:true}, 0b10100000],
    [{nw:true, nn:true}, 0b10000000],
    [{nn:true, ee:true, ss:true, ww:true}, 0b10100010],
  ])('.Corner.wangId(%s)', (dirs, expectedWangId) => {
    expect(Ids.Corner.wangId(mockSet(dirs), 1, 1)).toEqual(expectedWangId);
  });

  // As blob, but corners don't matter.
  test.each([
    [{nn:true}, 0b00000001],
    [{ne:true}, 0b00000000],
    [{ee:true}, 0b00000100],
    [{nn:true, ee:true}, 0b00000101],
    [{nn:true, ne:true, ee:true}, 0b00000101],
    [{ss:true}, 0b00010000],
    [{nw:true, nn:true}, 0b00000001],
    [{nn:true, ee:true, ss:true, ww:true}, 0b01010101],
  ])('.Edge.wangId(%s)', (dirs, expectedWangId) => {
    expect(Ids.Edge.wangId(mockSet(dirs), 1, 1)).toEqual(expectedWangId);
  });
});

import Phaser;

/**
 * Ids are an 8-bit integer with the given low order bits set if the neighbor is set:
 * ```
 *  7 | 0 | 1
 * ---+---+---
 *  6 | x | 2
 * ---+---+---
 *  5 | 4 | 3
 * ```
 */
 
const NN = 0x00000001;
const NE = 0x00000010;
const EE = 0x00000100;
const SE = 0x00001000;
const SS = 0x00010000;
const SW = 0x00100000;
const WW = 0x01000000;
const NW = 0x10000000;

export class Wang {
	constructor(rect) {
		this.values = new Array(this.rect.height);
		for (var i = 0; i < this.rect.height; ++i) {
			this.values[i] = new Array(this.rect.width);
		}
		this.ids = new Array(this.rect.height);
	}

	set(x, y, v) {
		this.values[y-this.rect.top][x-this.rect.left] = v;
	}

	isSet(x, y) {
		let xp = (x-this.rect.left) % this.rect.width;
		if (xp < 0) {
			xp += this.rect.width;
		}
		let yp = (y-this.rect.top) % this.rect.height;
		if (yp < 0) {
			yp += this.rect.height;
		}
		return this.values[yp][xp] ? 1 : 0;
	}

    /** Refreshes presence information for the given rect. */
	refresh(rect, dataSource) {
		rect = rect || this.rect;
		rect = Phaser.Geom.Rectangle.Intersection(this.rect, rect);
		for (var y = rect.top; y < rect.bottom; ++y) {
			for (var x = rect.left; x < rect.right; ++x) {
				this.set(x, y, dataSource(x, y));
			}
		}
	}

	getId(x, y) {
		if (!this.isSet(x, y)) {
			return undefined;
		}
		return Wang.Id(
            this.isSet(x, y-1),
            this.isSet(x+1, y-1),
            this.isSet(x+1, y),
            this.isSet(x+1, y+1),
            this.isSet(x, y+1),
            this.isSet(x-1, y+1),
            this.isSet(x-1, y),
            this.isSet(x-1, y-1),
		);
	}

    static Id(nn, ne, ee, se, ss, sw, ww, nw) {
        return (0
            | nn << 0 
            | ne << 1
            | ee << 2
            | se << 3
            | ss << 4
            | sw << 5
            | ww << 6
            | nw << 7
        );
    }

    static EdgeId(wangId) {
        return wangId & (NN | EE | SS | WW);
    }

    static CornerId(wangId) {
        return wangId & (NE | SE | SW | NW);
    }

    static BlobId(wangId) {
        // Unset the corners if the edges are unset.
        if (wangId & (NN | WW) != (NN | WW)) {
            wangId &= ~NW;
        }
        if (wangId & (EE | NN) != (EE | NN)) {
            wangId &= ~NE;
        }
        if (wangId & (SS | EE) != (SS | EE)) {
            wangId &= ~SE;
        }
        if (wangId & (WW | SS) != (WW | SS)) {
            wangId &= ~SW;
        }
        return wangId;
    }
}

Wang.Parts = {
    NN: NN,
    NE: NE,
    EE: EE,
    SE: SE,
    SS: SS,
    SW: SW,
    WW: WW,
    NW: NW
};

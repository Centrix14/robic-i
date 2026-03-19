class Spatia {
    constructor(precision=5) {
        this._precision = precision;
    }

    distance(from, to) {
        if (to instanceof Point)
            return this.distanceToPoint(from, to);
    }

    distanceToPoint(from, to) {
        return (to.x - from.x)**2 + (to.y - from.y)**2;
    }

    isReachable(target, cursor) {
        switch (target.constructor.name) {
        case 'Point':
            return this._isReachablePoint(target, cursor);
            break;
        case 'StraightLine':
            return this._isReachableLine(target, cursor);
            break;
        }
    }

    _isReachablePoint(target, cursor) {
        const delta = cursor.sub(target);
        return (Math.abs(delta.x) <= this._precision) &&
            (Math.abs(delta.y) <= this._precision);
    }

    _isReachableLine(target, cursor) {
        
    }

    isInRect(rect, cursor) {
        const start = rect._start,
              end = start.sum(new Point(rect._width, rect._height));
        return (cursor.x - start.x >= -this._precision)
            && (cursor.y - start.y >= -this._precision)
            && (cursor.x - end.x <= this._precision)
            && (cursor.y - end.y <= this._precision);
    }

    cEq(c1, c2) { return Math.abs(c1 - c2) <= this._precision; }
}

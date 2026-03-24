class Spatia {
    constructor(precision=5) {
        this._precision = precision;
    }

    // todo: добавить дистанцию для случая линия-точка
    // реализовать через формулу Герона
    distance(from, to) {
        if (to instanceof Point)
            return this.distanceToPoint(from, to);
    }

    distanceToPoint(from, to) {
        return (to.x - from.x)**2 + (to.y - from.y)**2;
    }

    calcLinearKB(A, B) {
        const [x1, y1] = [A.x, A.y], [x2, y2] = [B.x, B.y];
        return {
            k: (y2 - y1) / (x2 - x1),
            b: (y1*x2 - y2*x1) / (x2 - x1)
        };
    }

    calcLinearABC(S, E) {
        const [x1, y1] = [S.x, S.y], [x2, y2] = [E.x, E.y];
        if (x1 === x2)
            return { A: 1, B: 0, C: -x1 };
        else if (y1 === y2)
            return { A: 0, B: 1, C: -y1 };
        else
            return {
                A: (y1 - y2) / (x2 - x1),
                B: 1,
                C: -((y1-y2) / (x2-x1))*x1 - y1
            };
    }

    confVector(line) {
        return new Point(
            (line.A > 0) ? 1 : 0,
            (line.B > 0) ? 1 : 0
        );
    }

    translateVector(line, R) {
        const K = this.confVector(line),
              r = Math.sqrt((R**2) / (K.x + K.y));
        return new Point(K.x * r, K.y * r);
    }

    isReachable(target, cursor) {
        switch (target.constructor.name) {
        case 'Point':
            return this._isReachablePoint(target, cursor);
            break;
        case 'StraightLine':
            return this._isReachableLine1(target, cursor);
            break;
        }
    }

    _isReachablePoint(A, C) {
        return (C.x - A.x)**2 + (C.y - A.y)**2 <= this._precision**2;
    }

    _isReachableLine(target, C) {
        const [A, B] = [target.start, target.end];
        const a = Math.sqrt((this._precision**2) / 2);

        const A1 = new Point(A.x - a, A.y + a), B1 = new Point(B.x - a, B.y + a);
        const A2 = new Point(A.x + a, A.y - a), B2 = new Point(B.x + a, B.y - a);
        const l1 = this.calcLinearKB(A1, B1), l2 = this.calcLinearKB(A2, B2),
              l3 = this.calcLinearKB(B1, B2), l4 = this.calcLinearKB(A1, A2);

        return ((C.y <= l1.k * C.x + l1.b)
                && (C.y >= l2.k * C.x + l2.b)
                && (C.y <= l3.k * C.x + l3.b)
                && (C.y >= l4.k * C.x + l4.b))
            || (this._isReachablePoint(A, C))
            || (this._isReachablePoint(B, C));
    }

    _isReachableLine1(target, C) {
        const [S, E] = [target.start, target.end];
        const r = Math.sqrt((this._precision**2) / 2);

        const S1 = new Point(S.x - r, S.y + r), E1 = new Point(E.x - r, E.y + r);
        const S2 = new Point(S.x + r, S.y - r), E2 = new Point(E.x + r, E.y - r);

        const l1 = this.calcLinearABC(S1, E1), l2 = this.calcLinearABC(S2, E2),
              l3 = this.calcLinearABC(E1, E2), l4 = this.calcLinearABC(S1, S2);

        return ((l1.A * C.x + l1.B * C.y + l1.C <= 0)
                && (l2.A * C.x + l2.B * C.y + l2.C >= 0)
                && (l3.A * C.x + l3.B * C.y + l3.C <= 0)
                && (l4.A * C.x + l4.B * C.y + l4.C >= 0))
            || (this._isReachablePoint(S, C))
            || (this._isReachablePoint(E, C));
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

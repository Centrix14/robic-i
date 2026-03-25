class Spatia {
    constructor(precision=5) {
        this._precision = precision;
    }

    distance(from, to) {
        if (to instanceof Point)
            return this.distanceToPoint(from, to);
        else if (to instanceof StraightLine)
            return this.distanceToLine(from, to);
    }

    distanceToPoint(from, to) {
        return (to.x - from.x)**2 + (to.y - from.y)**2;
    }

    distanceToLine(cursor, line) {
        const [x1, y1] = [line.start.x, line.start.y],
              [x2, y2] = [line.end.x, line.end.y],
              [X, Y] = [cursor.x, cursor.y];

        const a = Math.sqrt((x2-x1)**2 + (y2-y1)**2),
              b = Math.sqrt((X-x1)**2 + (Y-y1)**2),
              c = Math.sqrt((X-x2)**2 + (Y-y2)**2),
              p = (a + b + c) / 2;

        return 2 / a * Math.sqrt(p * (p-a) * (p-b) * (p-c));
    }

    solveQE(a, b, c) {
        const D = b**2 - 4*a*c;

        if (D > 0)
            return { D, x: [ (-b - Math.sqrt(D)) / (2*a),
                             (-b + Math.sqrt(D)) / (2*a) ] };
        else if (D === 0)
            return { D, x: [ (-b) / (2*a) ] };
        else
            return { D, x: [] };
    }

    intersectionLineCircle(L, C) {
        if (L.B === 0) {
            const a = 1,
                  b = -2 * C.Y,
                  c = (L.C/L.A)**2 + (2*L.C*C.X)/L.A + C.X**2 + C.Y**2 - C.R**2;

            const s = this.solveQE(a, b, c);
            if (s.D > 0)
                return [
                    { x: -L.C/L.A, y: s.x[0] },
                    { x: -L.C/L.A, y: s.x[1] }
                ];
            else if (s.D === 0)
                return [
                    { x: -L.C/L.A, y: s.x[0] }
                ];
            else
                return [];
        }

        else {
            const a = 1 + (A/B)**2,
                  b = (2*A*C)/(B**2) + (2*A*Y)/B - 2*X,
                  c = (C/B)**2 + (2*C*Y)/B + X**2 + Y**2 - R**2;

            const s = this.solveQE(a, b, c);
            if (s.D > 0)
                return [
                    { x: s.x[0], y: -s.x[0] * (L.A/L.B) - L.C/L.B },
                    { x: s.x[1], y: -s.x[1] * (L.A/L.B) - L.C/L.B }
                ];
            else if (s.D === 0)
                return [
                    { x: s.x[0], y: -s.x[0] * (L.A/L.B) - L.C/L.B }
                ];
            else
                return [];
        }
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
            return this._isReachableLine(target, cursor);
            break;
        }
    }

    _isReachablePoint(A, C) {
        return (C.x - A.x)**2 + (C.y - A.y)**2 <= this._precision**2;
    }

    _isReachableLine(target, C) {
        return this.distance(C, target) <= this._precision
            || this._isReachablePoint(target.start, C)
            || this._isReachablePoint(target.end, C);
    }

    isInRect(rect, cursor) {
        const start = rect._start,
              end = start.sum(new Point(rect._width, rect._height));
        return (cursor.x - start.x >= -this._precision)
            && (cursor.y - start.y >= -this._precision)
            && (cursor.x - end.x <= this._precision)
            && (cursor.y - end.y <= this._precision);
    }
}

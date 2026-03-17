class Primitive {
    shift(dX, dY) {}
    publish(options) {}
}

class Point extends Primitive {
    constructor(x, y) {
        super();
	    this._x = x;
	    this._y = y;
    }

    get x() {
        return this._x;
    }

    get y() {
        return this._y;
    }

    sum(arg) {
        return new Point(this._x + arg._x,
                         this._y + arg._y);
    }

    sub(arg) {
        return this.sum(new Point(-arg._x, -arg._y));
    }

    shift(dX, dY) {
        this._x += dX;
        this._y += dY;
    }

    publish() {
        return {
            x: this._x,
            y: this._y
        };
    }

    isTouching(cursor, spatia) {
        return spatia.isReachable(this, cursor);
    }
}

const zeroPoint = new Point(0, 0);

class Rect extends Primitive {
    constructor(start=zeroPoint, width=1, height=1) {
        super();
        this._start = start;
        this._width = width;
        this._height = height;
    }

    get start() { return this._start; }
    get width() { return this._width; }
    get height() { return this._height; }

    shift(dX, dY) {
        this._start.shift(dX, dY);
    }

    publish() {
        return {
            ...this._start.publish(),
            width: this._width,
            height: this._height
        };
    }

    isTouching(cursor, spatia) {
        return spatia.isInRect(this, cursor);
    }
}

class StraightLine extends Primitive {
    constructor(start=zeroPoint, end=zeroPoint) {
        super();
        this._start = start;
        this._end = end;
    }

    get start() { return this._start; }
    get end() { return this._end; }

    shift(dX, dY) {
        this._start.shift(dX, dY);
        this._end.shift(dX, dY);
    }

    publish() {
        return {
            x1: this._start.x,
            y1: this._start.y,
            x2: this._end.x,
            y2: this._end.y
        };
    }
}

class NaiveStepLine extends Primitive {
    constructor(start=zeroPoint, end=zeroPoint) {
        super();
        this._start = start;
        this._end = end;
    }

    get start() { return this._start; }
    get end() { return this._end; }

    shift(dX, dY) {
        this._start.shift(dX, dY);
        this._end.shift(dX, dY);
    }

    publish() {
        const [x1, y1] = [this._start.x, this._start.y],
              [x2, y2] = [this._end.x, this._end.y];
        const dx = x2 - x1, dy = y2 - y1;

        const d = `M ${x1} ${y1}`;

        if (x1 === x2) {
            return { d: `${d} v ${dy}` };
        }
        else if (y1 === y2) {
            return { d: `${d} h ${dx}` };
        }
        else {
            const l = x2 / 2;

            return { d: `${d} h ${l} M ${l} ${y1} v ${dy} M ${l} ${y2} h ${l}` }
        }
    }
}

class Text extends Primitive {
    constructor(start=zeroPoint, value='') {
        super();
        this._start = start;
        this._value = value;
    }

    get start() { return this._start; }
    get value() { return this._value; }

    shift(dX, dY) {
        this._start.shift(dX, dY);
    }

    publish() {
        return {
            ...this._start.publish(),
            value: this._value
        };
    }
}

class Spatia {
    constructor(precision=5) {
        this._precision = precision;
    }

    isReachable(target, cursor) {
        const delta = cursor.sub(target);

        return (Math.abs(delta.x) <= this._precision) &&
            (Math.abs(delta.y) <= this._precision);
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

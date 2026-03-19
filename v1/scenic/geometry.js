class Primitive {
    shift(dX, dY) {}
    publish(options) {}
}

class Point extends Primitive {
    constructor(x, y) {
        super();
	    this.x = x;
	    this.y = y;
    }

    sum(arg) {
        return new Point(this.x + arg.x,
                         this.y + arg.y);
    }

    sub(arg) {
        return this.sum(new Point(-arg.x, -arg.y));
    }

    shift(dX, dY) {
        this.x += dX;
        this.y += dY;
    }

    publish() {
        return {
            x: this.x,
            y: this.y
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

    isTouching(cursor, spatia) {
        return spatia.isReachable(this, cursor);
    }
}

class Text extends Primitive {
    constructor(value='', start=zeroPoint) {
        super();
        this._start = start;
        this.value = value;
    }

    get start() { return this._start; }

    shift(dX, dY) {
        this._start.shift(dX, dY);
    }

    publish() {
        return {
            ...this._start.publish(),
            value: this.value
        };
    }
}

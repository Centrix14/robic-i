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

    publish() { return {}; }
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
            x: this._x,
            y: this._y
        };
    }
}

class Line extends Primitive {
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

class Arrow extends Line {
    constructor(start, end, marker="") {
        super(start, end);
        this._marker = marker;
    }

    publish() {
        return {
            ...super.publish(),
            marker: this._marker
        };
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
            x: this._start.x,
            y: this._start.y,
            text: this._value
        };
    }
}

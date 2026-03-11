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
}

class Arrow extends Line {
    constructor(start, end, marker="") {
        super(start, end);
        this._marker = marker;
    }
}

class Text extends Primitive {
    constructor(start=zeroPoint, value='') {
        super();
        this._start = _start;
        this._value = value;
    }

    get start() { return this._start; }
    get value() { return this._value; }

    shift(dX, dY) {
        this._start.shift(dX, dY);
    }
}

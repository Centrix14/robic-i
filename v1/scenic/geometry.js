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

class Rect extends Primitive {
    constructor(start, width=1, height=1) {
        super();
        this._start = start ?? new Point(0,0);
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
    constructor(start, end) {
        super();
        this.start = start ?? new Point(0,0);
        this.end = end ?? new Point(0,0);
    }

    shift(dX, dY) {
        this.start.shift(dX, dY);
        this.end.shift(dX, dY);
    }

    publish() {
        return {
            x1: this.start.x,
            y1: this.start.y,
            x2: this.end.x,
            y2: this.end.y
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

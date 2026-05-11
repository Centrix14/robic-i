class Primitive {
    shift(dX, dY) {}
    publish(options) {}
}

class Point extends Primitive {
    static toJSON(obj) {
        return {
            x: obj.x,
            y: obj.y,
        }
    }

    static applyJSON(json, obj) {
        obj.x = json.x;
        obj.y = json.y;
    }

    static fromJSON(json) {
        const obj = new Point(0,0);
        Point.applyJSON(json, obj);
        return obj;
    }

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
    static toJSON(obj) {
        return {
            start: Point.toJSON(obj._start),
            width: obj._width,
            height: obj._height,
        };
    }

    static applyJSON(json, obj) {
        Point.applyJSON(json.start, obj._start);
        obj._width = json.width;
        obj._height = json.height;
    }

    static fromJSON(json) {
        const obj = new Rect();
        Rect.applyJSON(json, obj);
        return obj;
    }

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
    static toJSON(obj) {
        return {
            start: Point.toJSON(obj.start),
            end: Point.toJSON(obj.end),
        };
    }

    static applyJSON(json, obj) {
        Point.applyJSON(json.start, obj.start);
        Point.applyJSON(json.end, obj.end);
    }

    static fromJSON(json) {
        const obj = new StraightLine();
        StraightLine.applyJSON(json, obj);
        return obj;
    }

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
    static toJSON(obj) {
        return {
            start: Point.toJSON(obj._start),
            value: obj.value,
        };
    }

    static applyJSON(json, obj) {
        Point.applyJSON(json.start, obj._start);
        obj.value = json.value;
    }

    static fromJSON(json) {
        const obj = new Text();
        Text.applyJSON(json, obj);
        return obj;
    }

    constructor(value='', start) {
        super();
        this._start = start ?? new Point(0,0);
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

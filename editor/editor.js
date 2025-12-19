class Result {
    #errors = [];
    static Defaults = Object.freeze({
	    TestError: 'just a test error'
    });

    constructor(soleText = '') {
        if ((typeof soleText === 'string') && soleText !== '') {
            this.#errors.push(soleText);
        }
    }
    
    addError(text) {
	    if (this.#errors.includes(text)) {
	        return false;
	    }
	    else {
	        this.#errors.push(text);
	        return true;
	    }
    }

    hasErrors() {
	    return this.#errors.length > 0;
    }

    isSuccess() {
	    return !this.hasErrors();
    }

    getErrors() {
	    return [...this.#errors];
    }
}

class Point {
    #x = 0;
    #y = 0;

    constructor(x, y) {
	    this.#x = x;
	    this.#y = y;
    }

    get X() {
        return this.#x;
    }

    get Y() {
        return this.#y;
    }

    serialize(element) {
	    if (element instanceof SVGElement) {
	        element.setAttribute('x', this.#x.toString());
	        element.setAttribute('y', this.#y.toString());

	        return new Result();
	    }
	    else {
	        return new Result('Point.serialize requires SVGElement as argument');
	    }
    }

    sum(point) {
        if (point instanceof Point) {
            return new Point(this.#x + point.#x,
                             this.#y + point.#y);
        }
        else {
            return new Result('Point.sum requires Point as argument');
        }
    }

    sub(point) {
        if (point instanceof Point)
            return this.sum(new Point(-point.#x, -point.#y));
        else
            return new Result('Point.sub requires Point as argument');
    }
}

class Figure {
    #id = 0;
    #caption = '';
    #designation = '';

    constructor(id, designation='') {
        this.#id = id;
        this.#designation = designation;
    }

    setCaption(newCaption) {
        if (typeof newCaption === 'string') {
            this.#caption = newCaption;
            return new Result();
        }
        else {
            return new Result('Figure.setCaption requires string argument');
        }
    }

    getCaption() {
        return this.#caption;
    }
}

class FigureManager {
    _repository = [];
    _index = 0;
    _selection = [];
    SVGTag = '';

    select(cursor) {
        if (not (cursor instanceof Point)) {
            return new Result('FigureManager.select requires Point as argument');
        }

        this._repository.forEach((_, index) => this._selection.push(index));
    }

    unselect(cursor) {
        if (not (cursor instanceof Point)) {
            return new Result('FigureManager.unselect requires Point as argument');
        }

        this._repository.forEach((_, index) => this._selection.splice(index, 1));
    }

    deleteSelected() {
        this._selection.forEach((_, index) => this._repository.splice(index, 1));
    }
}

class Rect extends Figure {
    #start;
    #end;

    static createByPoints(id, designation, start, end) {
        if (start instanceof Point && end instanceof Point) {
            let rect = new Rect(id, designation);
            rect.#start = start;
            rect.#end = end;
            return rect;
        }
    }

    static createByMeasures(id, designation, start, width, height) {
        if (start instanceof Point) {
            let rect = new Rect(id, designation);
            rect.#start = start;
            rect.#end = start.sum(new Point(width, height));
            return rect;
        }
    }

    serialize(element) {
        if (element instanceof SVGElement) {
            element.setAttribute('x', this.#start.X.toString());
            element.setAttribute('y', this.#start.Y.toString());

            let measuresPoint = this.#end.sub(this.#start);
            element.setAttribute('width', measuresPoint.X.toString());
            element.setAttribute('height', measuresPoint.Y.toString());
            
            return new Result();
        }
        else {
            return new Result('Rect.serialize requires SVGElement as argument');
        }
    }

    isTouching(spatia, cursor) {
        return (spatia.isRighter(this.#start, cursor)) &&
            (spatia.isLower(this.#start, cursor)) &&
            (spatia.isLefter(this.#end, cursor)) &&
            (spatia.isHigher(this.#end, cursor));
    }
}

class RectManager extends FigureManager {
    create(cursor, element, designation='') {
        let id = this._index;
        let newRect = Rect.createByMeasures(id, designation, cursor, 30, 20);

        if (newRect) {
            newRect.serialize(element);
            element.setAttribute('id', id.toString());
            this._index++;

            return new Result();
        }
        else {
            return new Result('RectManager.create failed to create rectangle');
        }
    }
}

class Editor {
    #document = null;
    #canvas = null;
    #rectManager = null;

    constructor(targetDocument, targetCanvas) {
        if (targetDocument instanceof Document) {
            if (targetCanvas instanceof SVGElement &&
                targetCanvas.localName === 'svg') {
                
                this.#document = targetDocument;
                this.#canvas = targetCanvas;
                this.#rectManager = new RectManager();
            }
        }
    }

    createRect(designation) {
        let doc = this.#document;
        let elm = doc.createElementNS('http://www.w3.org/2000/svg', 'rect');

        let defaultCursor = new Point(1,1);
        let result = this.#rectManager.create(defaultCursor, elm, designation);
        if (result.isSuccess()) {
            this.#canvas.appendChild(elm);

            return new Result();
        }
        else {
            return result;
        }
    }
}

class Spatia {
    #gridStep = 0;
    #precision = 0;

    constructor(gridStep, precision) {
        this.#gridStep = gridStep;
        this.#precision = precision;
    }

    isReachable(target, cursor) {
        const delta = cursor.sub(target);

        return (Math.abs(delta.X) <= this.#precision) &&
            (Math.abs(delta.Y) <= this.#precision);
    }

    _isSnapped(point) {
        return (point.X % this.#gridStep === 0) && (point.Y % this.#gridStep === 0);
    }

    snapPoint(point) {
        if (!this._isSnapped(point)) {
            const ax = Math.trunc(point.X / this.#gridStep);
            const ay = Math.trunc(point.Y / this.#gridStep);

            let vertices = [
                new Point(ax, ay),
                new Point(ax + this.#gridStep, ay),
                new Point(ax, ay + this.#gridStep),
                new Point(ax + this.#gridStep, ay + this.#gridStep),
            ];

            let distances = new Map();
            for (let vertex of vertices) {
                if (this.isReachable(vertex, point)) {
                    const distance = Math.sqrt((vertex.X - point.X)**2 + (vertex.Y - point.Y)**2);
                    distances.set(vertex, distance);
                }
            }

            switch (distances.size) {
            case 0: return point;
            case 1: return distances.keys().next().value;
            case 2:
                const candidates = distances.entries().toArray();
                const d1 = candidates[0];
                const d2 = candidates[1];

                if (d1[1] === d2[1])
                    return point;
                else if (d1[1] < d2[1])
                    return d1[0];
                else
                    return d2[0];
            }
        }
    }

    isLefter(target, cursor) {
        return cursor.X <= target.X;
    }

    isRighter(target, cursor) {
        return cursor.X >= target.X;
    }

    isHigher(target, cursor) {
        return cursor.Y <= target.Y;
    }

    isLower(target, cursor) {
        return cursor.Y >= target.Y;
    }
}

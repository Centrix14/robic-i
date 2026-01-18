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

    shift(shiftX, shiftY) {
        this.#x += shiftX;
        this.#y += shiftY;
    }
}

class Figure {
    _id = 0;
    _designation = '';
    _styleSet = undefined;

    constructor(id, designation='') {
        this._id = id;
        this._designation = designation;
    }

    get id() { return this._id; }
    get designation() { return this._designation; }

    get styleSet() { return this._styleSet; }
    set styleSet(newSet) {
        this._styleSet = newSet;
    }

    useStyle(name, element) {
        this._styleSet.useOn(element, name);
    }
}

class FigureManager {
    _repository = new Map();
    _index = 0;
    _selection = [];
    _styleSets = new Map();
    SVGTag = '';

    get selected() {
        return Array.from(this._selection);
    }

    select(spatia, cursor) {
        if (!(cursor instanceof Point)) {
            return new Result('FigureManager.select requires Point as argument');
        }

        let unselected = [];
        
        this._repository.forEach(function(element){
            if (element.isTouching(spatia, cursor)) {
                if (this.includes(element)) {
                    unselected.push(element);
                    this.splice(this.indexOf(element), 1);
                }
                else
                    this.push(element);
            }
        }, this._selection);

        let result = new Result();
        result.selected = this.selected;
        result.unselected = unselected;
        
        return result;
    }

    resetSelection() {
        this._selection = [];
    }

    get styleSets() { return new Map(this._styleSets); }

    getStyleSet(name) {
        const result = this._styleSets.get(name);
        if (result)
            return result;

        const style = new SkeletonStyle(new Stroke());
        const set = new StyleSet('');
        set.add(style);
        
        return set;
    }

    addStyleSet(set) {
        this._styleSets.set(set.name, set);
        return set.name;
    }

    ejectStyleSet(name) {
        const set = this.getStyleSet(name);
        this._styleSets.delete(name);
        return set;
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

            this._styleSet.useOn(element, 'main');
            
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

    shift(shiftX, shiftY) {
        this.#start.shift(shiftX, shiftY);
        this.#end.shift(shiftX, shiftY);
    }
}

class RectManager extends FigureManager {
    create(cursor, element, designation='') {
        const id = this._index;
        let newRect = Rect.createByMeasures(id, designation, cursor, 30, 20);

        if (newRect) {
            newRect.styleSet = this.getStyleSet('default.rect');
            
            newRect.serialize(element);
            element.setAttribute('id', id.toString());
            this._repository.set(id, newRect);
            this._index++;

            return new Result();
        }
        else {
            return new Result('RectManager.create failed to create rectangle');
        }
    }
}

class Text extends Figure {
    value = '';
    #position = undefined;

    constructor(id, position) {
        super(id, '');
        this.#position = position;
    }

    get position() { return this.#position; }
    
    set position(newPosition) {
        this.#position = newPosition;
    }
}

class TextManager extends FigureManager {
    create(cursor, element) {
        const id = this._index;
        const newText = new Text(id, cursor);

        if (newText) {
            newText = this.getStyleSet('default.text');

            newText.serialize(element);
            element.setAttribute('id', id.toString());;
            this._repository.set(id, newText);
            this._index++;

            return new Result();
        }
        else
            return new Result('TextManager.create failed to create text');
    }
}

class Editor {
    #document = null;
    #canvas = null;

    #rectManager = null;
    #textManager = null;
    
    #spatia = null;

    static _defaultRectStyleSet() {
        const rmsStroke = new Stroke('#212529', '2');
        const rmsFill = new Fill('white');
        const rectMainStyle = new ShapeStyle('main', rmsStroke, rmsFill);

        const rssStroke = new Stroke('#00b4d8', '3');
        const rssFill = new Fill('white');
        const rectSeletedStyle = new ShapeStyle('selected', rssStroke, rssFill);

        const defaultSet = new StyleSet('default.rect');
        defaultSet.add(rectMainStyle);
        defaultSet.add(rectSeletedStyle);

        return defaultSet;
    }

    static _defaultTextStyleSet() {
        const tmsStroke = new Stroke('#000000', '0');
        const tmsFill = new Fill('black');
        const textMainStyle = new ShapeStyle('main', tmsStroke, tmsFill);

        const tssStroke = new Stroke('#000000', '0');
        const tssFill = new Fill('#00b4d8');
        const textSeletedStyle = new ShapeStyle('selected', tssStroke, tssFill);

        const defaultSet = new StyleSet('default.text');
        defaultSet.add(textMainStyle);
        defaultSet.add(textSeletedStyle);

        return defaultSet;
    }

    constructor(targetDocument, targetCanvas) {
        if (targetDocument instanceof Document) {
            if (targetCanvas instanceof SVGElement &&
                targetCanvas.localName === 'svg') {
                
                this.#document = targetDocument;
                this.#canvas = targetCanvas;
                
                this.#spatia = new Spatia();
                
                this.#rectManager = new RectManager();
                this.#rectManager.addStyleSet(Editor._defaultRectStyleSet());

                this.#textManager = new TextManager();
                this.#textManager.addStyleSet(Editor._defaultTextStyleSet());
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

    createText() {
        let doc = this.#document;
        let elm = doc.createElementNS('http://www.w3.org/2000/svg', 'text');

        let defaultCursor = new Point(1,1);
        let result = this.#textManager.create(defaultCursor, elm);
        if (result.isSuccess()) {
            this.#canvas.appendChild(elm);

            return new Result();
        }
        else {
            return result;
        }
    }

    select(x, y) {
        const doc = this.#document;
        const cursor = new Point(x, y);

        const rects = this.#rectManager.select(this.#spatia, cursor);
        for (let rect of rects.selected) {
            const element = doc.getElementById(rect.id.toString())
                  ?? {useStyle: (x, y) => {}};
            rect.useStyle('selected', element);
        }
        for (let rect of rects.unselected) {
            const element = doc.getElementById(rect.id.toString());
            if (element)
                rect.useStyle('main', element);
        }

        return rects;
    }

    grab(shiftX, shiftY) {
        const doc = this.#document;
        
        this.#rectManager.selected.forEach(
            (figure) => {
                figure.shift(shiftX, shiftY)

                const element = doc.getElementById(figure.id.toString());
                if (element) {
                    figure.serialize(element);
                    figure.useStyle('selected', element);
                }
            });
    }

    resetSelection() {
        const doc = this.#document;
        const selected = this.#rectManager.selected;

        selected.forEach((figure) => {
            const element = doc.getElementById(figure.id.toString());
            if (element)
                figure.useStyle('main', element);
        });

        this.#rectManager.resetSelection();
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

class Stroke {
    #color = '';
    #width = '';
    #dasharray = '';
    #linejoin = '';

    constructor(color='black', width='1', dasharray='', linejoin='miter') {
        this.#color = color;
        this.#width = width;
        this.#dasharray = dasharray;
        this.#linejoin = linejoin;
    }

    useOn(element) {
        element.setAttribute('stroke', this.#color);
        element.setAttribute('stroke-width', this.#width);
        element.setAttribute('stroke-dasharray', this.#dasharray);
        element.setAttribute('stroke-linejoin', this.#linejoin);

        return element;
    }
}

class Fill {
    #color = '';
    #opacity = '';

    constructor(color='white', opacity='0') {
        this.#color = color;
        this.#opacity = opacity;
    }

    useOn(element) {
        element.setAttribute('fill', this.#color);
        element.setAttribute('fill-opacity', this.#opacity);

        return element;
    }
}

class Style {
    #name = '';

    constructor(name='') {
        if (name === 'all')
            name = '';
        this.#name = name;
    }

    get name() { return this.#name };

    useOn(element) {}
}

class SkeletonStyle extends Style {
    #stroke = undefined;

    constructor(name, stroke) {
        super(name);
        this.#stroke = stroke;
    }

    useOn(element) {
        return this.#stroke.useOn(element);
    }
}

class ShapeStyle extends Style {
    #stroke = undefined;
    #fill = undefined;

    constructor(name, stroke, fill) {
        super(name);
        this.#stroke = stroke;
        this.#fill = fill;
    }

    useOn(element) {
        this.#stroke.useOn(element);
        this.#fill.useOn(element);
        return element;
    }
}

class StyleSet {
    #name = '';
    #repository = new Map();

    constructor(name) {
        this.#name = name;
    }

    get name() { return this.#name; }

    get(styleName) {
        const result = this.#repository.get(styleName);
        if (result)
            return result;

        return new SkeletonStyle('', new Stroke());
    }
    
    get repository() {
        return new Map(this.#repository);
    }

    add(style) {
        this.#repository.set(style.name, style);
        return style.name;
    }

    eject(styleName) {
        const style = this.get(styleName);
        this.#repository.delete(styleName);
        return style;
    }

    useOn(element, styleName='all') {
        if (styleName === 'all') {
            this.repository.forEach((style) => style.useOn(element));
        }
        else {
            this.get(styleName).useOn(element);
        }

        return element;
    }
}

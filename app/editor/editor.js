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
    _gid = undefined;
    _selection = [];
    _styleSets = new Map();
    SVGTag = '';

    constructor(gid) {
        this._gid = gid;
    }

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

//            this._styleSet.useOn(element, 'main');
            
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
        const id = this._gid.next();
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
    value = 'Текст';
    #position = undefined;

    constructor(id, position) {
        super(id, '');
        this.#position = position;
    }

    get position() { return this.#position; }
    
    set position(newPosition) {
        this.#position = newPosition;
    }

    serialize(element) {
        this.#position.serialize(element);
        element.textContent = this.value;

//        this._styleSet.useOn(element, 'main');
    }

    isTouching(spatia, cursor) {
        return spatia.isReachable(this.#position, cursor);
    }

    shift(shiftX, shiftY) {
        this.#position.shift(shiftX, shiftY);
    }
}

class TextManager extends FigureManager {
    create(cursor, element) {
        const id = this._gid.next();
        const newText = new Text(id, cursor);

        if (newText) {
            newText.styleSet = this.getStyleSet('default.text');

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

class ProcessGroup extends Figure {
    #shape = undefined;
    #caption = undefined;

    constructor(id, designation, shape, caption) {
        super(id, designation);
        this.#shape = shape;
        this.#caption = caption;
    }

    isTouching(spatia, cursor) {
        return this.#shape.isTouching(spatia, cursor)
            || this.#caption.isTouching(spatia, cursor);
    }

    shift(shiftX, shiftY) {
        this.#shape.shift(shiftX, shiftY);
        this.#caption.shift(shiftX, shiftY);
    }

    serialize(shapeElement, captionElement) {
        this.#shape.serialize(shapeElement);
        this.#caption.serialize(captionElement);
    }
}

class ProcessGroupManager extends FigureManager {
    create(cursor, groupElement, shapeElement, captionElement, designation) {
        const shapeId = this._gid.next();
        const captionId = this._gid.next();

        const newRect = Rect.createByMeasures(shapeId, '', cursor, 50, 40);
        const newText = new Text(captionId, cursor);

        if (newRect && newText) {
            const groupId = this._gid.next();
            const newProcess = new ProcessGroup(groupId, designation, newRect,
                                                newText);

            if (newProcess) {
                newRect.styleSet = this.getStyleSet('default.process.shape');
                newText.styleSet = this.getStyleSet('default.process.caption');
                
                newProcess.serialize(shapeElement, captionElement);
                groupElement.setAttribute('id', groupId.toString());
                shapeElement.setAttribute('id', shapeId.toString());
                captionElement.setAttribute('id', captionId.toString());

                this._repository.set(groupId, newProcess);

                return new Result();
            }
        }
        else
            return new Result('ProcessGroupManager.create failed to create process group');
    }
}

class Editor {
    #document = null;
    #canvas = null;

    #rectManager = null;
    #textManager = null;
    #processManager = null;
    
    #spatia = null;

    static _defaultProcessShapeStyleSet() {
        const rmsStroke = new Stroke('#212529', '2');
        const rmsFill = new Fill('white');
        const rectMainStyle = new ShapeStyle('main', rmsStroke, rmsFill);

        const rssStroke = new Stroke('#00b4d8', '3');
        const rssFill = new Fill('white');
        const rectSeletedStyle = new ShapeStyle('selected', rssStroke, rssFill);

        const defaultSet = new StyleSet('default.process.shape');
        defaultSet.add(rectMainStyle);
        defaultSet.add(rectSeletedStyle);

        return defaultSet;
    }

    static _defaultProcessCaptionStyleSet() {
        const tmsFill = new Fill('black', '100');
        const tmsFont = new Font();
        const textMainStyle = new TextStyle('main', tmsFill, tmsFont);

        const defaultSet = new StyleSet('default.process.caption');
        defaultSet.add(textMainStyle);
        defaultSet.add(textSeletedStyle);

        return defaultSet;
    }

    constructor(targetDocument, targetCanvas, gid) {
        if (targetDocument instanceof Document) {
            if (targetCanvas instanceof SVGElement &&
                targetCanvas.localName === 'svg') {
                
                this.#document = targetDocument;
                this.#canvas = targetCanvas;
                
                this.#spatia = new Spatia(1, 5);
                
                this.#rectManager = new RectManager(gid);
//                this.#rectManager.addStyleSet(Editor._defaultRectStyleSet());

                this.#textManager = new TextManager(gid);
//                this.#textManager.addStyleSet(Editor._defaultTextStyleSet());

                this.#processManager = new ProcessGroupManager(gid);
                this.#processManager.addStyleSet(
                    Editor._defaultProcessShapeStyleSet(),
                    Editor._defaultProcessCaptionStyleSet()
                );
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

        let defaultCursor = new Point(20,20);
        let result = this.#textManager.create(defaultCursor, elm);
        if (result.isSuccess()) {
            this.#canvas.appendChild(elm);

            return new Result();
        }
        else {
            return result;
        }
    }

    createProcess(designation) {
        const doc = this.#document;
        
        const groupElm = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
        const shapeElm = doc.createElementNS('http://www.w3.org/2000/svg', 'rect');
        const captionElm = doc.createElementNS('http://www.w3.org/2000/svg', 'text');

        const defaultCursor = new Point(20,20);
        const result = this.#processManager.create(defaultCursor, groupElm,
                                                   shapeElm, captionElm,
                                                   designation);
        if (result.isSuccess()) {
            groupElm.appendChild(shapeElm);
            groupElm.appendChild(captionElm);
            this.#canvas.appendChild(groupElm);

            return new Result();
        }
        else {
            return result;
        }
    }

    select(x, y) {
        const doc = this.#document;
        const cursor = new Point(x, y);

        let figures;
        const managers = [this.#rectManager];
        for (let manager of managers) {
            figures = manager.select(this.#spatia, cursor);
            if (figures.selected.length > 0 || figures.unselected.length > 0)
                break;
        }

        if (figures.selected.length > 0 || figures.unselected.length > 0) {
            for (let figure of figures.selected) {
                const element = doc.getElementById(figure.id.toString())
                      ?? {useStyle: (x, y) => {}};
                figure.useStyle('selected', element);
            }
            for (let figure of figures.unselected) {
                const element = doc.getElementById(figure.id.toString());
                if (element)
                    figure.useStyle('main', element);
            }
        }

        return figures;
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
    #gridStep = undefined;
    #precision = undefined;

    constructor(gridStep=0, precision=0) {
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

class Font {
    #family = '';
    #size = '';
    #style = '';

    constructor(family='sans', size='12px', style='normal') {
        this.#family = family;
        this.#size = size;
        this.#style = style;
    }

    useOn(element) {
        element.setAttribute('font-family', this.#family);
        element.setAttribute('font-size', this.#size);
        element.setAttribute('font-style', this.#style);

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

class TextStyle extends Style {
    #fill = undefined;
    #font = undefined;

    constructor(name, fill, font) {
        super(name);
        this.#fill = fill;
        this.#font = font;
    }

    useOn(element) {
        this.#fill.useOn(element);
        this.#font.useOn(element);
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

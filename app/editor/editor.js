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

    get start() { return this.#start; }

    get end() { return this.#end; }

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

class Line extends Figure {
    #start;
    #end;

    constructor(id, designation, start, end) {
        super(id, designation);
        this.#start = start;
        this.#end = end;
    }

    get start() { return this.#start; }

    get end() { return this.#end; }

    serialize(element) {
        element.setAttribute('x1', this.#start.X.toString());
        element.setAttribute('y1', this.#start.Y.toString());
        element.setAttribute('x2', this.#end.X.toString());
        element.setAttribute('y2', this.#end.Y.toString());

        this._styleSet.useOn(element, 'main');

        element.setAttribute('marker-end', 'url(#element-line-marker)');
    }
}

class LineManager extends FigureManager {
    create(start, end, element, designation='') {
        const id = this._gid.next();
        const newLine = new Line(id, designation, start, end);

        if (newLine) {
            newLine.styleSet = this.getStyleSet('default.element.line');

            newLine.serialize(element);
            element.setAttribute('id', id.toString());
            this._repository.set(id, newLine);
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

        this._styleSet.useOn(element, 'main');
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
    #shapeFigure = undefined;
    #captionFigure = undefined;
    #designationFigure = undefined;

    constructor(id, designation, shape, caption, designationFigure) {
        super(id, designation);
        this.#shapeFigure = shape;
        this.#captionFigure = caption;
        this.#designationFigure = designationFigure;
    }

    isTouching(spatia, cursor) {
        return this.#shapeFigure.isTouching(spatia, cursor)
            || this.#captionFigure.isTouching(spatia, cursor);
    }

    shift(shiftX, shiftY) {
        this.#shapeFigure.shift(shiftX, shiftY);
        this.#captionFigure.shift(shiftX, shiftY);
        this.#designationFigure.shift(shiftX, shiftY);
    }

    _getChildElement(groupElement, condition) {
        for (let child of groupElement.children) {
            if (condition(child))
                return child;
        }
        return null;
    }

    getShapeElement(groupElement) {
        return this._getChildElement(groupElement, (elm) =>
            (elm.className.baseVal === 'shape'));
    }

    getCaptionElement(groupElement) {
        return this._getChildElement(groupElement, (elm) =>
            (elm.className.baseVal === 'caption'));
    }

    getDesignationElement(groupElement) {
        return this._getChildElement(groupElement, (elm) =>
            (elm.className.baseVal === 'designation'));
    }
    
    serialize(shapeElement, captionElement, designationElement) {
        this.#shapeFigure.serialize(shapeElement);
        shapeElement.setAttribute('class', 'shape');

        this.#captionFigure.serialize(captionElement);
        captionElement.setAttribute('class', 'caption');

        this.#designationFigure.serialize(designationElement);
        designationElement.setAttribute('class', 'designation');
    }

    deserialize(map) {
        this.#captionFigure.value = map.get('name') ?? 'Текст';
    }

    useStyle(name, groupElement) {
        this.#shapeFigure.useStyle(name, this.getShapeElement(groupElement));
    }
}

class ProcessGroupManager extends FigureManager {
    create(cursor, groupElement, shapeElement, captionElement, designation,
           designationElement) {
        const shapeId = this._gid.next();
        const captionId = this._gid.next();
        const designationId = this._gid.next();

        const width = 80; const height = 50;
        const shapeFigure = Rect.createByMeasures(shapeId, '',
                                                  new Point(cursor.X, cursor.Y),
                                                  width, height);
        const captionFigure = new Text(captionId,
                                       new Point(cursor.X + width/2,
                                                 cursor.Y + height/2));
        const designationFigure = new Text(designationId,
                                           new Point(cursor.X + width-5,
                                                     cursor.Y + height-5));
        captionFigure.value = 'Процесс';
        designationFigure.value = designation;

        if (shapeFigure && captionFigure && designationFigure) {
            const groupId = this._gid.next();
            const processFigure = new ProcessGroup(groupId, designation,
                                                   shapeFigure, captionFigure,
                                                   designationFigure);

            if (processFigure) {
                shapeFigure.styleSet = this.getStyleSet('default.process.shape');
                captionFigure.styleSet =
                    this.getStyleSet('default.process.caption');
                designationFigure.styleSet =
                    this.getStyleSet('default.process.designation');
                
                processFigure.serialize(shapeElement, captionElement,
                                        designationElement);
                groupElement.setAttribute('id', groupId.toString());
                shapeElement.setAttribute('id', shapeId.toString());
                captionElement.setAttribute('id', captionId.toString());
                designationElement.setAttribute('id', designationId.toString());

                this._repository.set(groupId, processFigure);

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
    #lineManager = null;
    #textManager = null;
    #processManager = null;
    
    #spatia = null;

    static _defaultProcessShapeStyleSet() {
        const smsStroke = new Stroke('#212529', '2');
        const smsFill = new Fill('white');
        const shapeMainStyle = new ShapeStyle('main', smsStroke, smsFill);

        const sssStroke = new Stroke('#00b4d8', '3');
        const sssFill = new Fill('white');
        const shapeSelectedStyle = new ShapeStyle('selected', sssStroke, sssFill);

        const defaultSet = new StyleSet('default.process.shape');
        defaultSet.add(shapeMainStyle);
        defaultSet.add(shapeSelectedStyle);

        return defaultSet;
    }

    static _defaultProcessCaptionStyleSet() {
        const cmsFill = new Fill('black', '100');
        const cmsFont = new Font();
        const cmsAlign = new TextAlign();
        const captionMainStyle = new TextStyle('main', cmsFill, cmsFont,
                                               cmsAlign);

        const defaultSet = new StyleSet('default.process.caption');
        defaultSet.add(captionMainStyle);

        return defaultSet;
    }

    static _defaultProcessDesignationStyleSet() {
        const cmsFill = new Fill('black', '100');
        const cmsFont = new Font('sans', '10', 'normal');
        const dmsAlign = new TextAlign('end', 'auto');
        const captionMainStyle = new TextStyle('main', cmsFill, cmsFont,
                                               dmsAlign);

        const defaultSet = new StyleSet('default.process.designation');
        defaultSet.add(captionMainStyle);

        return defaultSet;
    }

    static _defaultElementStyleSet() {
        const emsStroke = new Stroke();
        const elementMainStyle = new SkeletonStyle('main', emsStroke);

        const defaultSet = new StyleSet('default.element.line');
        defaultSet.add(elementMainStyle);

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

                this.#lineManager = new LineManager(gid);
                this.#lineManager.addStyleSet(Editor._defaultElementStyleSet());
                
                this.#textManager = new TextManager(gid);
//                this.#textManager.addStyleSet(Editor._defaultTextStyleSet());

                this.#processManager = new ProcessGroupManager(gid);
                this.#processManager.addStyleSet(
                    Editor._defaultProcessShapeStyleSet()
                );
                this.#processManager.addStyleSet(
                    Editor._defaultProcessCaptionStyleSet()
                );
                this.#processManager.addStyleSet(
                    Editor._defaultProcessDesignationStyleSet()
                );
            }
        }
    }

    createProcess(designation) {
        const doc = this.#document;
        
        const groupElm = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
        const shapeElm = doc.createElementNS('http://www.w3.org/2000/svg', 'rect');
        const captionElm = doc.createElementNS('http://www.w3.org/2000/svg', 'text');
        const designationElm = doc.createElementNS('http://www.w3.org/2000/svg', 'text');

        const defaultCursor = new Point(20,20);
        const result = this.#processManager.create(defaultCursor, groupElm,
                                                   shapeElm, captionElm,
                                                   designation,
                                                   designationElm);
        if (result.isSuccess()) {
            groupElm.appendChild(shapeElm);
            groupElm.appendChild(captionElm);
            groupElm.appendChild(designationElm);
            this.#canvas.appendChild(groupElm);

            return new Result();
        }
        else {
            return result;
        }
    }

    createArrowElement(designation, start, end) {
        const doc = this.#document;

        const lineElm = doc.createElementNS('http://www.w3.org/2000/svg', 'line');

        this.#lineManager.create(start, end, lineElm, designation);
        this.#canvas.appendChild(lineElm);
    }

    select(x, y) {
        const doc = this.#document;
        const cursor = new Point(x, y);

        let figures;
        const managers = [this.#processManager];
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

        this.#processManager.selected.forEach(
            (figure) => {
                figure.shift(shiftX, shiftY)

                const groupElement = doc.getElementById(figure.id.toString());
                if (groupElement) {
                    const shapeElement = figure.getShapeElement(groupElement);
                    const captionElement =
                          figure.getCaptionElement(groupElement);
                    const designationElement =
                          figure.getDesignationElement(groupElement);

                    figure.serialize(shapeElement, captionElement,
                                     designationElement);
                    figure.useStyle('selected', groupElement);
                }
            }
        );
    }

    resetSelection() {
        const doc = this.#document;
        const selected = this.#processManager.selected;

        selected.forEach((figure) => {
            const element = doc.getElementById(figure.id.toString());
            if (element)
                figure.useStyle('main', element);
        });

        this.#processManager.resetSelection();
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

    snapToRectSide(rectStart, rectEnd, cursor) {
        const abs = Math.abs;
        const distances = [
            [abs(rectStart.X - cursor.X), new Point(rectStart.X, cursor.Y)],
            [abs(rectStart.Y - cursor.Y), new Point(cursor.X, rectStart.Y)],
            [abs(rectEnd.X - cursor.X), new Point(rectEnd.X, cursor.Y)],
            [abs(rectStart.Y - cursor.Y), new Point(cursor.X, rectEnd.Y)]
        ];

        let min = distances[0];
        distances.forEach((pair) => {
            if (pair[0] < min[0])
                min = pair;
        });

        return min[1];
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

class TextAlign {
    #anchor = '';
    #baseline = '';

    constructor(anchor='middle', baseline='middle') {
        this.#anchor = anchor;
        this.#baseline = baseline;
    }

    useOn(element) {
        element.setAttribute('text-anchor', this.#anchor);
        element.setAttribute('dominant-baseline', this.#baseline);
        
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
    #align = undefined;

    constructor(name, fill, font, align) {
        super(name);
        this.#fill = fill;
        this.#font = font;
        this.#align = align;
    }

    useOn(element) {
        this.#fill.useOn(element);
        this.#font.useOn(element);
        this.#align.useOn(element);
        
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

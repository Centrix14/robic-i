class Group {
    constructor() {
        this._store = new Map();

        this._selfElm = null;
        this._init = false;
        this._id = {
            inner: null,
            outer: null,
        };
    }
 
    get isInitiated() { return this._init; }

    init(id, operator) {
        const group = operator.createGroup();
        operator.applyTo(group, {
            id: id.inner,
        });

        this._selfElm = group;
        this._id = id;

        return group;
    }

    add(id, element) {
        if (this._store.has(id))
            return new Fail();

        this._store.set(id, element);
        return new Success();
    }

    drop(id) {
        if (this._store.has(id))
            return new Success([['element', this._store.delete(id)]]);

        return new Fail();
    }
}

class AngleLine extends Group {
    static Rib = {
        Horizontal: 'horizontal',
        Vertical: 'vertical',
    }

    static Variant = {
        X: 'x',
        Y: 'y',
    }

    static toJSON(obj) {
        return {
            start: Point.toJSON(obj._start),
            end: Point.toJSON(obj._end),
            variant: this._variant,
        };
    }

    static applyJSON(json, obj) {
        Point.applyJSON(json.start, obj._start);
        Point.applyJSON(json.end, obj._end);
        this._variant = json.variant;

        obj._calcRibs();
    }

    static fromJSON(json) {
        const obj = new AngleLine();
        AngleLine.applyJSON(json, obj);
        return obj;
    }

    constructor(start, end, variant) {
        super();

        this._store = new Map([
            [AngleLine.Rib.Horizontal, new StraightLine()],
            [AngleLine.Rib.Vertical, new StraightLine()],
        ]);

        this._start = start ?? new Point(0,0);
        this._end = end ?? new Point(0,0);
        this._variant = variant ?? AngleLine.Variant.X;

        this._calcRibs();
    }

    _calcRibs() {
        const horizontal = this._store.get(AngleLine.Rib.Horizontal),
              vertical = this._store.get(AngleLine.Rib.Vertical);

        switch (this._variant) {
        case AngleLine.Variant.X:
            horizontal.start = this._start;
            horizontal.end = this.center;

            vertical.start = this.center;
            vertical.end = this._end;
            break;
        case AngleLine.Variant.Y:
            vertical.start = this._start
            vertical.end = this.center;

            horizontal.start = this.center;
            horizontal.end = this._end;
            break;
        }
    }

    get start() { return this._start; }
    get end() { return this._end; }

    get center() {
        const [x1, y1] = [this._start.x, this._start.y],
              [x2, y2] = [this._end.x, this._end.y];

        switch (this._variant) {
        case AngleLine.Variant.X:
            return new Point(
                x2, y1
            );
        case AngleLine.Variant.Y:
            return new Point(
                x1, y2
            );
        }
    }

    add() { return new Result(); }
    drop() { return new Result(); }

    toPolyline() {
        const horizontal = this._store.get(AngleLine.Rib.Horizontal),
              vertical = this._store.get(AngleLine.Rib.Vertical);

        let points;
        switch (this._variant) {
        case AngleLine.Variant.X:
            points = `${horizontal.start.x},${horizontal.start.y} `
                + `${horizontal.end.x},${horizontal.end.y} `
                + `${vertical.end.x},${vertical.end.y}`;
            break;
        case AngleLine.Variant.Y:
            points = `${vertical.start.x},${vertical.start.y} `
                + `${vertical.end.x},${vertical.end.y} `
                + `${horizontal.end.x},${horizontal.end.y}`;
            break;
        }

        return {points};
    }

    shift(dX, dY, flags) {
        const f = flags ?? {start: true, end: true};

        if (f.start)
            this._start.shift(dX, dY);
        if (f.end)
            this._end.shift(dX, dY);
        this._calcRibs();
    }
}

class HorizontalStepline extends Group {
    static Rib = {
        Up: 'up',
        Middle: 'middle',
        Down: 'down'
    }

    static toJSON(obj) {
        return {
            start: Point.toJSON(obj._start),
            end: Point.toJSON(obj._end),
        };
    }

    static applyJSON(json, obj) {
        Point.applyJSON(json.start, obj._start);
        Point.applyJSON(json.end, obj._end);
        obj._calcRibs();
    }

    static fromJSON(json) {
        const obj = new HorizontalStepline();
        HorizontalStepline.applyJSON(json, obj);
        return obj;
    }

    constructor(start, end) {
        super();

        this._store = new Map([
            [HorizontalStepline.Rib.Up, new StraightLine()],
            [HorizontalStepline.Rib.Middle, new StraightLine()],
            [HorizontalStepline.Rib.Down, new StraightLine()]
        ]);

        this._start = start ?? new Point(0,0);
        this._end = end ?? new Point(0,0);

        this._calcRibs();
    }

    _calcRibs() {
        const Rib = HorizontalStepline.Rib;

        const up = this._store.get(Rib.Up),
              middle = this._store.get(Rib.Middle),
              down = this._store.get(Rib.Down);

        const [x1, y1] = [this.start.x, this.start.y],
              [x2, y2] = [this.end.x, this.end.y];
        const dx = x2 - x1, dy = y2 - y1, l = dx / 2;

        [up.start.x, up.start.y] = [x1, y1];
        [up.end.x, up.end.y] = [x1 + l, y1];

        [middle.start.x, middle.start.y] = [x1 + l, y1];
        [middle.end.x, middle.end.y] = [x1 + l, y1 + dy];

        [down.start.x, down.start.y] = [x1 + l, y1 + dy];
        [down.end.x, down.end.y] = [x2, y2];
    }

    get start() { return this._start; }
    get end() { return this._end; }

    getCenter() {
        const [x1, y1] = [this._start.x, this._start.y],
              [x2, y2] = [this._end.x, this._end.y];

        return new Point(
            x1 + (x2 - x1) / 2,
            y1 + (y2 - y1) / 2
        );
    }

    add() { return new Result(); }
    drop() { return new Result(); }

    publish() {
        const Rib = HorizontalStepline.Rib;

        const up = this._store.get(Rib.Up),
              middle = this._store.get(Rib.Middle),
              down = this._store.get(Rib.Down);

        return {
            points: `${up.start.x},${up.start.y} `
                + `${middle.start.x},${middle.start.y} `
                + `${down.start.x},${down.start.y} `
                + `${down.end.x},${down.end.y}`
        };
    }

    isTouching(cursor, spatia) {
        const Rib = HorizontalStepline.Rib;

        const up = this._store.get(Rib.Up),
              middle = this._store.get(Rib.Middle),
              down = this._store.get(Rib.Down);

        return up.isTouching(cursor, spatia)
            || middle.isTouching(cursor, spatia)
            || down.isTouching(cursor, spatia);
    }

    shift(dX, dY, flags) {
        const f = flags ?? {start: true, end: true};

        if (f.start)
            this._start.shift(dX, dY);
        if (f.end)
            this._end.shift(dX, dY);
        this._calcRibs();
    }
}

class NamedRectGroup extends Group {
    static Member = {
        Shape: 'shape',
        Name: 'name',
        Designation: 'designation'
    }

    static toJSON(obj) {
        const Member = NamedRectGroup.Member;
        const store = obj._store;
        return {
            id: obj._id,
            shape: Rect.toJSON(store.get(Member.Shape)[0]),
            name: Text.toJSON(store.get(Member.Name)[0]),
            designation: Text.toJSON(store.get(Member.Designation)[0]),
        };
    }

    static applyJSON(json, obj, operator) {
        const shape = Rect.fromJSON(json.shape),
              name = Text.fromJSON(json.name),
              designation = Text.fromJSON(json.designation);

        obj.init(json.id, operator,
                 {
                     shape: {
                         spawn: shape._start,
                         size: {
                             width: shape.width,
                             height: shape.height,
                         },
                     },
                     designation: {
                         offset: {
                             x: -5,
                             y: -5,
                         },
                     },
                 },
                 {
                     name: name.value,
                     designation: designation.value,
                 });
    }

    static fromJSON(json, operator) {
        const obj = new NamedRectGroup();
        NamedRectGroup.applyJSON(json, obj, operator);
        return obj;
    }

    init(id, operator, defaults, labels) {
        const group = super.init(id, operator);

        const spawn = defaults.shape.spawn,
              size = defaults.shape.size,
              offset = defaults.designation.offset;

        const store = this._store;
        store.set(NamedRectGroup.Member.Shape, [
            new Rect(new Point(spawn.x, spawn.y),
                     size.width, size.height),
            operator.createRect()
        ]);
        store.set(NamedRectGroup.Member.Name, [
            new Text(labels.name, new Point(spawn.x, spawn.y)),
            operator.createHTMLText()
        ]);
        store.set(ElementRectGroup.Member.Designation, [
            new Text(labels.designation,
                     new Point((spawn.x + size.width + offset.x),
                               (spawn.y + size.height + offset.y))
                    ),
            operator.createText()
        ]);

        for (let [id, [figure, element]] of store) {
            if (element.tagName === 'foreignObject') {
                operator.applyTo(element, {
                    id,
                    ...figure.publish(),
                    ...size,
                });
            }
            else
                operator.applyTo(element, { id, ...figure.publish() });

            operator.appendChild(group, element);
        }

        this._init = true;
        return group;
    }

    add() { return new Fail(); }
    drop() { return new Fail(); }

    getMemberValue(member) {
        if (member === NamedRectGroup.Member.Name
            || member === NamedRectGroup.Member.Designation) {

            return new Success([['value', this._store.get(member)[0].value]]);
        }
        else
            return new Fail();
    }

    setMemberValue(member, value, operator) {
        if (member === NamedRectGroup.Member.Name
            || member === NamedRectGroup.Member.Designation) {

            const m = this._store.get(member);
            m[0].value = value;
            operator.applyTo(m[1], { value });

            return new Success();
        }
        else
            return new Fail();
    }

    getMemberElement(member) {
        if (member === NamedRectGroup.Member.Shape
            || member === NamedRectGroup.Member.Name
            || member === NamedRectGroup.Member.Designation) {

            return new Success([['element', this._store.get(member)[1]]]);
        }
        else
            return new Fail();
    }

    isTouching(cursor, spatia) {
        const shape = this._store.get(NamedRectGroup.Member.Shape)[0];
        return shape.isTouching(cursor, spatia);
    }

    shift(dX, dY, operator) {
        for (let [figure, element] of this._store.values()) {
            figure.shift(dX, dY);
            operator.applyTo(element, figure.publish());
        }
    }

    setPosition(newPosition, operator) {
        const shape = this._store.get(NamedRectGroup.Member.Shape),
              currentPosition = shape[0].start;

        const delta = newPosition.sub(currentPosition);
        this.shift(delta.x, delta.y, operator);
    }

    setSize(newSize, operator, defaults) {
        const Member = NamedRectGroup.Member;

        const offset = defaults.designation.offset;

        const shape = this._store.get(Member.Shape),
              name = this._store.get(Member.Name),
              designation = this._store.get(Member.Designation);

        const shapeJSON = Rect.toJSON(shape[0]);

        if (newSize?.increment && newSize.increment === true) {
            newSize.width += shapeJSON.width;
            newSize.height += shapeJSON.height;
        }

        shapeJSON.width = newSize.width;
        shapeJSON.height = newSize.height;

        Rect.applyJSON(shapeJSON, shape[0]);
        operator.applyTo(shape[1], shape[0].publish());

        const nameJSON = Text.toJSON(name[0]);
        nameJSON.start = new Point(
            shapeJSON.start.x,
            shapeJSON.start.y
        );
        Text.applyJSON(nameJSON, name[0]);
        operator.applyTo(name[1], {
            ...name[0].publish(),
            ...shape[0].publish(),
        });

        const designationJSON = Text.toJSON(designation[0]);
        designationJSON.start = new Point(
            shapeJSON.start.x + newSize.width + offset.x,
            shapeJSON.start.y + newSize.height + offset.y,
        );
        Text.applyJSON(designationJSON, designation[0]);
        operator.applyTo(designation[1], designation[0].publish());
    }

    snapPoint(cursor, spatia) {
        const shape = this._store.get(NamedRectGroup.Member.Shape)[0];
        return spatia.snapToRectSide(shape, cursor);
    }
}

class ProcessGroup extends NamedRectGroup {
    init(id, operator) {
        return super.init(id, operator, Defaults.process, {
            name: 'Процесс',
            designation: `П ${id.outer}`
        });
    }
}

class ElementArrowGroup extends Group {
    static Member = {
        Shape: 'shape',
        Name: 'name',
        Designation: 'designation'
    }

    static toJSON(obj) {
        const Member = ElementArrowGroup.Member;
        const store = obj._store;

        return {
            id: obj._id,
            shape: HorizontalStepline.toJSON(store.get(Member.Shape)[0]),
            name: Text.toJSON(store.get(Member.Name)[0]),
            designation: Text.toJSON(store.get(Member.Designation)[0]),
        };
    }

    static applyJSON(json, obj, operator) {
        const shape = HorizontalStepline.fromJSON(json.shape),
              name = Text.fromJSON(json.name),
              designation = Text.fromJSON(json.designation);

        obj.init(json.id, operator,
                 {
                     start: shape._start,
                     end: shape._end,
                 },
                 {
                     name: name.value,
                     designation: designation.value
                 });
    }

    static fromJSON(json, operator) {
        const obj = new ElementArrowGroup();
        ElementArrowGroup.applyJSON(json, obj, operator);
        return obj;
    }

    init(id, operator, coords, labels) {
        if (!coords?.start || !coords?.end)
            return new Fail();

        labels = labels ?? {name: 'Элемент', designation: `Э ${id.outer}`};

        const Member = ElementArrowGroup.Member;

        const group = super.init(id, operator);

        const start = coords.start, end = coords.end;
        const stepline = new HorizontalStepline(start, end),
              center = stepline.getCenter();
        const nameOffset = Defaults.element.arrow.name.offset,
              designationOffset = Defaults.element.arrow.designation.offset;

        const store = this._store;
        store.set(Member.Shape, [
            stepline,
            operator.createPolyline()
        ]);
        store.set(Member.Name, [
            new Text(labels.name,
                     new Point(center.x + nameOffset.x,
                               center.y + nameOffset.y)
                    ),
            operator.createText()
        ]);
        store.set(Member.Designation, [
            new Text(labels.designation,
                     new Point(center.x + designationOffset.x,
                               center.y + designationOffset.y)
                    ),
            operator.createText()
        ]);

        for (let [id, [figure, element]] of store) {
            operator.applyTo(element, { id, ...figure.publish() });
            operator.appendChild(group, element);
        }

        this._init = true;
        return group;
    }

    add() { return new Fail(); }
    drop() { return new Fail(); }

    getMemberValue(member) {
        if (member === ElementArrowGroup.Member.Name
            || member === ElementArrowGroup.Member.Designation) {

            return new Success([['value', this._store.get(member)[0].value]]);
        }
        else
            return new Fail();
    }

    setMemberValue(member, value, operator) {
        if (member === ElementArrowGroup.Member.Name
            || member === ElementArrowGroup.Member.Designation) {

            const m = this._store.get(member);
            m[0].value = value;
            operator.applyTo(m[1], { value });

            return new Success();
        }
        else
            return new Fail();
    }

    getMemberElement(member) {
        if (member === ElementArrowGroup.Member.Shape
            || member === ElementArrowGroup.Member.Name
            || member === ElementArrowGroup.Member.Designation) {

            return new Success([['element', this._store.get(member)[1]]]);
        }
        else
            return new Fail();
    }

    shift(dX, dY, operator, flags) {
        const Member = ElementArrowGroup.Member;

        const shape = this._store.get(Member.Shape),
              name = this._store.get(Member.Name),
              designation = this._store.get(Member.Designation);

        shape[0].shift(dX, dY, flags);
        operator.applyTo(shape[1], shape[0].publish());

        const center = shape[0].getCenter();
        const nameOffset = Defaults.element.arrow.name.offset,
              designationOffset = Defaults.element.arrow.designation.offset;

        name[0]._start = new Point(center.x + nameOffset.x,
                                   center.y + nameOffset.y);
        operator.applyTo(name[1], name[0].publish());

        designation[0]._start = new Point(center.x + designationOffset.x,
                                          center.y + designationOffset.y);
        operator.applyTo(designation[1], designation[0].publish());
    }

    isTouching(cursor, spatia) {
        const shape = this._store.get(ElementArrowGroup.Member.Shape)[0];
        return shape.isTouching(cursor, spatia);
    }
}

class ElementRectGroup extends NamedRectGroup {
    init(id, operator) {
        return super.init(id, operator, Defaults.element.rect, {
            name: 'Элемент',
            designation: `Э ${id.outer}`
        });
    }
}

class LineView extends Group {
    static Member = { Shape: 'shape' }

    init(operator, coords) {
        if (!coords?.start || !coords?.end)
            return new Fail();

        const store = this._store;
        const line = new StraightLine(coords.start, coords.end);

        this._selfElm = operator.createLine();
        store.set(LineView.Member.Shape, [ line, this._selfElm ]);
        operator.applyTo(this._selfElm, line.publish());

        this._init = true;
        return this._selfElm;
    }

    add() { return new Fail(); }
    drop() { return new Fail(); }

    getMemberField(member, field) {
        if (member === LineView.Member.Shape)
            return new Success([['value', this._store.get(member)[0][field]]]);
        else
            return new Fail();
    }

    setMemberField(member, field, value, operator) {
        if (member === LineView.Member.Shape) {
            const m = this._store.get(member);
            m[0][field] = value;
            operator.applyTo(m[1], m[0].publish());

            return new Success();
        }
        else
            return new Fail();
    }

    getMemberElement(member) {
        if (member === LineView.Member.Shape)
            return new Success([['element', this._selfElm]]);
        else
            return new Fail();
    }
}

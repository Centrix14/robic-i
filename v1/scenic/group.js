class Group {
    constructor() {
        this._store = new Map();

        this._selfElm = null;
        this._init = false;
    }
 
    get isInitiated() { return this._init; }

    init(id, operator) {
        const group = operator.createGroup();
        operator.applyTo(group, { id });
        this._selfElm = group;

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

class NaiveVerticalStepline extends Group {
    static Rib = {
        Up: 'up',
        Middle: 'middle',
        Down: 'down'
    }

    constructor(start=zeroPoint, end=zeroPoint) {
        super();

        this._store = new Map([
            [NaiveVerticalStepline.Rib.Up, new StraightLine()],
            [NaiveVerticalStepline.Rib.Middle, new StraightLine()],
            [NaiveVerticalStepline.Rib.Down, new StraightLine()]
        ]);

        this._start = start;
        this._end = end;
    }

    _calcRibs() {
        const Rib = NaiveVerticalStepline.Rib;

        const up = this._store.get(Rib.Up)[1],
              middle = this._store.get(Rib.Middle)[1],
              down = this._store.get(Rib.Down)[1];

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

    shift(dX, dY) {
        this._start.shift(dX, dY);
        this._end.shift(dX, dY);
    }

    publish() {
        const [x1, y1] = [this._start.x, this._start.y],
              [x2, y2] = [this._end.x, this._end.y];
        const dx = x2 - x1, dy = y2 - y1;

        const d = `M ${x1} ${y1}`;

        if (x1 === x2) {
            return { d: `${d} v ${dy}` };
        }
        else if (y1 === y2) {
            return { d: `${d} h ${dx}` };
        }
        else {
            const l = dx / 2;

            return {
                d: `${d} h ${l} M ${x1+l} ${y1} v ${dy} M ${x1+l} ${y1+dy} h ${l}`
            }
        }
    }

    isTouching(cursor, spatia) {
        const [x1, y1] = [this._start.x, this._start.y], x2 = this._end.x;
        const a = new Point(x1 + (x2 - x1) / 2, y1), end = this._end;

        return spatia.cEq(cursor.y, a.y)
            || spatia.cEq(cursor.x, a.x)
            || spatia.cEq(cursor.y, end.y);
    }
}

class NamedRectGroup extends Group {
    static Member = {
        Shape: 'shape',
        Name: 'name',
        Designation: 'designation'
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
            new Text(labels.name,
                     new Point((size.width / 2) + spawn.x,
                               (size.height / 2) + spawn.y)
                    ),
            operator.createText()
        ]);
        store.set(ElementRectGroup.Member.Designation, [
            new Text(labels.designation,
                     new Point((spawn.x + size.width + offset.x),
                               (spawn.y + size.height + offset.y))
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
}

class ProcessGroup extends NamedRectGroup {
    init(id, operator) {
        return super.init(id, operator, Defaults.process, {
            name: 'Процесс',
            designation: `П ${id}`
        });
    }
}

class ElementArrowGroup extends Group {
    static Member = {
        Shape: 'shape',
        Name: 'name',
        Designation: 'designation'
    }

    init(id, operator, coords) {
        if (!coords?.start || !coords?.end)
            return new Fail();

        const Member = ElementArrowGroup.Member;

        const group = super.init(id, operator);

        const start = coords.start, end = coords.end;
        const stepline = new NaiveVerticalStepline(start, end),
              center = stepline.getCenter();
        const nameOffset = Defaults.element.arrow.name.offset,
              designationOffset = Defaults.element.arrow.designation.offset;

        const store = this._store;
        store.set(Member.Shape, [
            stepline,
            operator.createPath()
        ]);
        store.set(Member.Name, [
            new Text('Элемент',
                     new Point(center.x + nameOffset.x,
                               center.y + nameOffset.y)
                    ),
            operator.createText()
        ]);
        store.set(Member.Designation, [
            new Text(`Э ${id}`,
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

    shift(dX, dY, operator) {
        for (let [figure, element] of this._store.values()) {
            figure.shift(dX, dY);
            operator.applyTo(element, figure.publish());
        }
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
            designation: `Э ${id}`
        });
    }
}

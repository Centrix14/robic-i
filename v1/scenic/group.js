class Group {
    constructor() {
        this._store = new Map();
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

class ProcessGroup extends Group {
    static Member = {
        Shape: 'shape',
        Name: 'name',
        Designation: 'designation'
    }

    constructor() {
        super();

        this._selfElm = null;
        this._init = false;
    }

    get isInitiated() { return this._init; }

    init(id, operator) {
        const group = operator.createGroup();
        operator.applyTo(group, { id });
        this._selfElm = group;

        const spawn = Defaults.process.spawn,
              size = Defaults.process.size,
              offset = Defaults.process.designationOffset;

        const store = this._store;
        store.set(ProcessGroup.Member.Shape, [
            new Rect(new Point(spawn.x, spawn.y),
                     size.width, size.height),
            operator.createRect()
        ]);
        store.set(ProcessGroup.Member.Name, [
            new Text(new Point(
                (size.width / 2) + spawn.x,
                (size.height / 2) + spawn.y
            ), 'Процесс'),
            operator.createText()
        ]);
        store.set(ProcessGroup.Member.Designation, [
            new Text(new Point(
                (spawn.x + size.width + offset.x),
                (spawn.y + size.height + offset.y)
            ), `П ${id}`),
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
        if (member === ProcessGroup.Member.Name
            || member === ProcessGroup.Member.Designation) {

            return new Success([['value', this._store.get(member)[0].value]]);
        }
        else
            return new Fail();
    }

    setMemberValue(member, value, operator) {
        if (member === ProcessGroup.Member.Name
            || member === ProcessGroup.Member.Designation) {

            const m = this._store.get(member);
            m[0].value = value;
            operator.applyTo(m[1], { value });

            return new Success();
        }
        else
            return new Fail();
    }

    getMemberElement(member) {
        if (member === ProcessGroup.Member.Shape
            || member === ProcessGroup.Member.Name
            || member === ProcessGroup.Member.Designation) {

            return new Success([['element', this._store.get(member)[1]]]);
        }
        else
            return new Fail();
    }

    isTouching(cursor, spatia) {
        const shape = this._store.get('shape')[0];
        return shape.isTouching(cursor, spatia);
    }

    shift(dX, dY, operator) {
        for (let [shape, element] of this._store.values()) {
            shape.shift(dX, dY);
            operator.applyTo(element, shape.publish());
        }
    }
}

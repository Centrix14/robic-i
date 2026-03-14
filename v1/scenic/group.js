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
    init(id, operator) {
        const shape = new Rect(new Point(10, 10), 100, 50);
        this._store.set('shape', shape);

        const shapeElm = operator.createRect();
        operator.applyTo(shapeElm, {
            id: 'shape',
            ...shape
        });

        const name = new Text(new Point(55, 35), 'Процесс');
        this._store.set('name', name);
        const nameElm = operator.createText();
        operator.applyTo(nameElm, {
            id: 'name',
            ...name
        });

        const designation = new Text(new Point(100, 50), `П ${id}`);
        this._store.set('designation', designation);
        const designationElm = operator.createText();
        operator.applyTo(designationElm, {
            id: 'designation',
            ...designation
        });

        const group = operator.createGroup();
        operator.applyTo(group, { id });
    }
}

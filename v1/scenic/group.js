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
        const group = operator.createGroup();
        operator.applyTo(group, { id });

        const store = this._store;
        store.set('shape', [
            new Rect(new Point(10, 10), 100, 50),
            operator.createRect()
        ]);
        store.set('name', [
            new Text(new Point(55, 35), 'Процесс'),
            operator.createText()
        ]);
        store.set('designation', [
            new Text(new Point(100, 50), `П ${id}`),
            operator.createText()
        ]);

        for (let [id, [figure, element]] of store) {
            operator.applyTo(element, { id, ...figure });
            operator.appendChild(group, element);
        }

        return group;
    }
}

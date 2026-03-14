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
    constructor() {
        super();
        this._selfElm = null;
    }

    init(id, operator) {
        const group = operator.createGroup();
        operator.applyTo(group, { id });
        this._selfElm = group;

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

    getName() {
        return this._store.get('name')[0].value;
    }

    setName(newer, operator) {
        const name = this._store.get('name');
        name[0].value = newer;
        operator.applyTo(name[1], { value: newer });
    }

    getDesignation() {
        return this._store.get('designation')[0].value;
    }

    setDesignation(newer, operator) {
        const designation = this._store.get('designation');
        designation[0].value = newer;
        operator.applyTo(designation[1], { value: newer });
    }
}

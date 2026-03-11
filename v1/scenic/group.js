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
            return new Success([['element': this._store.delete(id)]]);

        return new Fail();
    }
}

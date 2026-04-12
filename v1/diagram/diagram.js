class Accordance {
    constructor(name, note) {
        this._name = name;
        this._note = note;
    }
}

class Process extends Accordance {
    constructor(name, note) {
        super(name, note);

        this._objective = '';
        this._owner = '';
        this._environment = '';
        this._pov = '';
    }
}

class Element extends Accordance {
    constructor(name, note) {
        super(name, note);

        this._owner = '';
    }
}

class Property extends Accordance {
    const ValueField = {
        Id: 'id',
        Value: 'value',
        All: 'all'
    }

    constructor(name, note) {
        super(name, note);

        this._index = 0;
        this._values = new Map();
        this._referenceValue = 0;
    }

    get referenceValue() { return this._referenceValue; }
    set referenceValue(value) { this._referenceValue = value; }

    values(field) {
        const Field = Property.ValueField;

        switch (field) {
        case Field.Id:
            return this._values.keys();
        case Field.Value:
            return this._values.values();
        case Field.All:
            return this._values.entries();
        }
    }

    addValue(value) {
        this._values.set(this._index, value);
        return new Success([['id', this._index++]]);
    }

    dropValue(id) {
        const value = this._values.delete(id);
        if (value)
            return new Success([['value', value]]);
        else
            return new Fail();
    }
}

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

class Unit {
    const Type = {
        Process: [Process, ProcessGeometrySet]
    }

    constructor(type, operator, name, note) {
        const accConstructor = type[0], gsConstructor = type[1];

        this._accordance = new accConstructor(name, note);
        this._accordanceGS = new gsConstructor(operator);
    }
}

class Diagram {
    constructor() {
        this._index = 0;
        this._graph = new Graph();

        this._name = '';
        this._author = '';
        this._changed = null;
    }

    addProcess(operator) {
        const unit = new Unit(Unit.Type.Process, operator, '', '');
        this._graph.addNode(this._index, unit);
        return new Success([['id', this._index++]]);
    }
}

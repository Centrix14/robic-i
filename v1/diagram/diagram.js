class Accordance {
    constructor(name, note) {
        this.name = name;
        this.note = note;
    }
}

class Process extends Accordance {
    constructor(name, note) {
        super(name, note);

        this.objective = '';
        this.owner = '';
        this.environment = '';
        this.pov = '';
    }
}

class Element extends Accordance {
    constructor(name, note) {
        super(name, note);

        this.owner = '';
    }
}

class Property extends Accordance {
    static ValueField = {
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
    static Type = {
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
        this._spatia = new Spatia(5);

        this._selected = null;

        this._name = '';
        this._author = '';
        this._changed = null;
    }

    getByPoint(point) {
        const spatia = this._spatia;
        const units = this._graph.nodes(NodeFields.All);

        for (let [id, unit] of units) {
            if (unit._accordanceGS.isTouching(point, spatia))
                return new Success([['id', id]]);
        }

        return new Fail();
    }

    clearSelection() {
        if (this._selected !== null) {
            const gs = this._graph.getNode(this._selected)._accordanceGS;
            gs.combine(GeometryLayer.Process, GeometryState.Main);
        }

        this._selected = null;
    }

    select(id) {
        this.clearSelection();
        this._selected = id;

        const gs = this._graph.getNode(this._selected)._accordanceGS;
        gs.combine(GeometryLayer.Process, GeometryState.Selected);
    }

    shift(id, dX, dY) {
        const gs = this._graph.getNode(id)._accordanceGS;
        gs.shift(dX, dY);
    }

    snapPoint(id, point) {
        const gs = this._graph.getNode(id)._accordanceGS;
        return gs.snapPoint(point, this._spatia);
    }

    addProcess(operator, layer, state) {
        const unit = new Unit(Unit.Type.Process, operator, '', '');
        const element = unit._accordanceGS.combine(layer, state, {
            id: this._index
        });

        this._graph.addNode(this._index, unit);

        return new Success([['id', this._index++], ['element', element]]);
    }
}

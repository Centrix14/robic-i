class Accordance {
    constructor(name, note, activity=true) {
        this.name = name;
        this.note = note;
        this.activity = activity;
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
        Process: [Process, ProcessGeometrySet],
        Element: [Element, ElementGeometrySet]
    }

    constructor(type, operator, name, note) {
        const accConstructor = type[0], gsConstructor = type[1];

        this.type = type;
        this._accordance = new accConstructor(name, note);
        this._accordanceGS = new gsConstructor(operator);
    }

    getData() {
        const accordance = this._accordance;

        const common = {
            name: accordance.name,
            note: accordance.note,
            activity: accordance.activity,
        };

        if (this.type === Unit.Type.Process) {
            return {
                ...common,
                processObjective: accordance.objective,
                processOwner: accordance.owner,
                processEnvironment: accordance.environment,
                processPov: accordance.pov,
            };
        }
        else if (this.type === Unit.Type.Element) {
            return {
                ...common,
                elementOwner: accordance.owner,
            };
        }
    }

    applyData(data) {
        const accordance = this._accordance, gs = this._accordanceGS;

        accordance.name = data.name;
        accordance.note = data.note;
        accordance.activity = data.activity;

        if (this.type === Unit.Type.Process) {
            accordance.objective = data.processObjective;
            accordance.owner = data.processOwner;
            accordance.environment = data.processEnvironment;
            accordance.pov = data.processPov;

            gs.combine(GeometryLayer.Process, GeometryState.None, {
                name: data.name
            });
            console.log(accordance);
        }
        else if (this.type === Unit.Type.Element) {
            accordance.owner = data.processOwner;

            gs.combine(GeometryLayer.Process, GeometryState.None, {
                name: data.name
            });
            console.log(accordance);
        }
    }
}

class Diagram {
    constructor() {
        this._index = { total: 0, process: 0, element: 0 };
        this._graph = new Graph();
        this._spatia = new Spatia(5);

        this._selected = null;

        this._name = '';
        this._author = '';
        this._changed = null;
    }

    get graph() { return this._graph; }

    getByPoint(point) {
        const spatia = this._spatia;
        const units = this._graph.nodes(NodeFields.All);

        for (let [id, unit] of units) {
            if (unit._accordanceGS.isTouching(point, spatia))
                return new Success([['id', id]]);
        }

        return new Fail();
    }

    getSelection() {
        if (this._selected === null)
            return null;
        else
            return this._graph.getNode(this._selected);
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

        const unit = this._graph.getNode(this._selected);

        const gs = unit._accordanceGS;
        gs.combine(GeometryLayer.Process, GeometryState.Selected);

        return unit;
    }

    shift(id, dX, dY) {
        const graph = this._graph;

        const gs = graph.getNode(id)._accordanceGS;
        if (gs instanceof ElementGeometrySet)
            return;

        gs.shift(dX, dY);

        const adjacents = graph.getAdjacents(id);
        for (let adjacentId of adjacents) {
            const connection = graph.getAdjacencyData(id, adjacentId);

            if (connection?.role === 'start' || connection?.role === 'end') {
                const adjacentGS = graph.getNode(adjacentId)._accordanceGS;

                if (connection?.role === 'start') {
                    adjacentGS.shift(dX, dY, {
                        start: true,
                        end: false
                    });
                }
                else if (connection?.role === 'end') {
                    adjacentGS.shift(dX, dY, {
                        start: false,
                        end: true
                    });
                }
            }
        }
    }

    snapPoint(id, point) {
        const gs = this._graph.getNode(id)._accordanceGS;
        return gs.snapPoint(point, this._spatia);
    }

    addProcess(operator, layer, state) {
        const unit = new Unit(Unit.Type.Process, operator, '', '');
        const element = unit._accordanceGS.combine(layer, state, {
            id: this._index.process++
        });

        this._graph.addNode(this._index.total, unit);

        return new Success([['id', this._index.total++],
                            ['element', element]]);
    }

    addElement(operator, layer, state, coords) {
        const unit = new Unit(Unit.Type.Element, operator, '', '');
        const element = unit._accordanceGS.combine(layer, state, {
            id: this._index.element++,
            coords
        });

        this._graph.addNode(this._index.total, unit);

        return new Success([['id', this._index.total++],
                            ['element', element]]);
    }
}

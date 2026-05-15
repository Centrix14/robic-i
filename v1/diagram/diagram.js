class Accordance {
    static toJSON(obj) {
        return {
            name: obj.name,
            note: obj.note,
            activity: obj.activity,
        };
    }

    static applyJSON(json, obj) {
        obj.name = json.name ?? '';
        obj.note = json.note ?? '';
        obj.activity = json.activity ?? true;
    }

    static fromJSON(json) {
        const obj = new Accordance();
        Accordance.applyJSON(json, obj);
        return obj;
    }

    constructor(name, note, activity=true) {
        this.name = name;
        this.note = note;
        this.activity = activity;
    }
}

class Process extends Accordance {
    static toJSON(obj) {
        return {
            ...super.toJSON(obj),
            objective: obj.objective,
            owner: obj.owner,
            environment: obj.environment,
            pov: obj.pov,
        };
    }

    static applyJSON(json, obj) {
        super.applyJSON(json, obj);
        obj.objective = json.objective ?? '';
        obj.owner = json.owner ?? '';
        obj.environment = json.environment ?? '';
        obj.pov = json.pov ?? '';
    }

    static fromJSON(json) {
        const obj = new Process();
        Process.applyJSON(json, obj);
        return obj;
    }

    constructor(name, note) {
        super(name, note);

        this.objective = '';
        this.owner = '';
        this.environment = '';
        this.pov = '';
    }
}

class Element extends Accordance {
    static toJSON(obj) {
        return {
            ...super.toJSON(obj),
            owner: obj.owner,
        };
    }

    static applyJSON(json, obj) {
        super.applyJSON(json, obj);
        obj.owner = json.owner ?? '';
    }

    static fromJSON(json) {
        const obj = new Element();
        Element.applyJSON(json, obj);
        return obj;
    }

    constructor(name, note) {
        super(name, note);

        this.owner = '';
    }
}

class Property extends Accordance {
    static toJSON(obj) {
        const keys = Array.from(obj._values.keys()),
              values = Array.from(obj._values.values());

        return {
            values,
            referenceIndex: keys.indexOf(obj._referenceValue),
        };
    }

    static applyJSON(json, obj) {
        obj._values = new Map();

        obj._index = 0;
        for (let value of json.values) {
            obj._values.set(obj._index, value);
            obj._index++;
        }

        obj._referenceValue = json.referenceIndex;
    }

    static fromJSON(json) {
        const obj = new Property();
        Property.applyJSON(json, obj);
        return obj;
    }

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
        Process: {
            name: 'Process',
            accCtor: Process,
            gsCtor: ProcessGeometrySet
        },
        Element: {
            name: 'Element',
            accCtor: Element,
            gsCtor: ElementGeometrySet
        },
    }

    static toJSON(obj) {
        let accordance, gs;

        if (obj.type === Unit.Type.Process) {
            accordance = Process.toJSON(obj._accordance);
            gs = ProcessGeometrySet.toJSON(obj._accordanceGS);
        }
        else if (obj.type === Unit.Type.Element) {
            accordance = Element.toJSON(obj._accordance);
            gs = ElementGeometrySet.toJSON(obj._accordanceGS);
        }

        return {
            type: obj.type.name,
            isSystem: obj.isSystem,

            accordance,
            accordanceGS: gs,
        };
    }

    static applyJSON(json, obj, operator) {
        if (json.type === 'Process') {
            obj.type = Unit.Type.Process;
            obj.isSystem = json.isSystem;
            obj._accordance = Process.fromJSON(json.accordance);
            obj._accordanceGS = ProcessGeometrySet.fromJSON(
                json.accordanceGS,
                operator
            );
        }
        else if (json.type === 'Element') {
            obj.type = Unit.Type.Element;
            obj.isSystem = json.isSystem;
            obj._accordance = Element.fromJSON(json.accordance);
            obj._accordanceGS = ElementGeometrySet.fromJSON(
                json.accordanceGS,
                operator
            );
        }
    }

    static fromJSON(json, operator) {
        const obj = new Unit(Unit.Type.Process, operator);
        Unit.applyJSON(json, obj, operator);
        return obj;
    }

    constructor(type, operator, name, note, isSystem=false) {
        const accConstructor = type.accCtor, gsConstructor = type.gsCtor;

        this.type = type;
        this.isSystem = isSystem;
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
            accordance.owner = data.elementOwner;

            gs.combine(GeometryLayer.Process, GeometryState.None, {
                name: data.name
            });
            console.log(accordance);
        }
    }

    setSize(newSize) {
        this._accordanceGS.combine(GeometryLayer.Process, GeometryState.None, {
            size: newSize,
        });
    }

    setPosition(newPosition) {
        this._accordanceGS.combine(GeometryLayer.Process, GeometryState.None, {
            position: newPosition,
        });
    }
}

class Diagram {
    static toJSON(obj) {
        const serializer = {
            nodeFn: (u) => Unit.toJSON(u),
        }

        return {
            name: obj._name,
            author: obj._author,
            changed: obj._changed,
            index: obj._index,
            graph: obj._graph.serialize(serializer),
        };
    }

    static applyJSON(json, obj, operator) {
        const deserializer = {
            nodeFn: (j) => Unit.fromJSON(j, operator),
        }

        obj._name = json.name;
        obj._author = json.author;
        obj._changed = json.changed;
        obj._index = json.index;

        obj._graph = new Graph();
        obj._graph.deserialize(json.graph, deserializer);
    }

    static fromJSON(json, operator) {
        const obj = new Diagram();
        Diagram.applyJSON(json, obj, operator);
        return obj;
    }

    constructor() {
        this._index = {
            total: 0,
            process: {
                user: 0,
                system: 0,
            },
            element: 0
        };

        this._graph = new Graph();
        this._spatia = new Spatia(5);

        this._selected = null;

        this._name = '';
        this._author = '';
        this._changed = null;
    }

    init(operator, canv) {
        const supprocess = {
            input: null,
            output: null,
            doer: null,
            mean: null,
        };

        for (let process in supprocess) {
            const result = this.addProcess(
                operator,
                GeometryLayer.Process,
                GeometryState.Hidden,
                true, // this is a system process
            );

            operator.appendChild(canv.element, result.get('element'));
            supprocess[process] = result.get('unit');
        }

        const corner = 40;

        supprocess.doer.setPosition(new Point(0, 0));
        supprocess.input.setPosition(new Point(0, corner));
        supprocess.output.setPosition(new Point(canv.width - corner, corner));
        supprocess.mean.setPosition(new Point(0, canv.height - corner));

        supprocess.doer.setSize({width: canv.width, height: corner});
        supprocess.mean.setSize({width: canv.width, height: corner});

        supprocess.input.setSize({
            width: corner,
            height: canv.height - corner * 2,
        });
        supprocess.output.setSize({
            width: corner,
            height: canv.height - corner * 2,
        });

        this._index.process.system = 4;
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

    select(id) {
        this.clearSelection();
        this._selected = id;

        const unit = this._graph.getNode(this._selected);

        const gs = unit._accordanceGS;
        gs.combine(GeometryLayer.Process, GeometryState.Selected);

        return unit;
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

    dropSelection() {
        if (this._selected !== null && this._selected !== undefined) {
            const id = this._selected;

            const unit = this._graph.getNode(id);
            if (unit.type === Unit.Type.Process)
                this._index.process.user--;
            else if (unit.type === Unit.Type.Element)
                this._index.element--;
            this._index.total--;

            this.clearSelection();
            this._graph.dropNode(id);
            return id;
        }
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

    addProcess(operator, layer, state, isSystem=false) {
        const unit = new Unit(Unit.Type.Process, operator, '', '', isSystem);
        const element = unit._accordanceGS.combine(layer, state, {
            id: this._index.process.user
        });

        if (!isSystem)
            this._index.process.user++;

        this._graph.addNode(this._index.total, unit);

        return new Success([['id', this._index.total++],
                            ['unit', unit],
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
                            ['unit', unit],
                            ['element', element]]);
    }
}

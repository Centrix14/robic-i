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
    static Role = {
        Input: 'input',
        Output: 'output',
        Doer: 'doer',
        Mean: 'mean',
    }

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

    static getRoleBySide(side) {
        const Side = Spatia.RectSide, Role = Element.Role;

        const map = new Map([
            [Side.Up, Role.Doer],
            [Side.Right, Role.Output],
            [Side.Down, Role.Mean],
            [Side.Left, Role.Input],
        ]);

        return map.get(side);
    }

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

    static toJSON(obj) {
        const keys = Array.from(obj._values.keys()),
              values = Array.from(obj._values.values());

        return {
            ...super.toJSON(obj),
            values,
            referenceIndex: keys.indexOf(obj._referenceValue),
        };
    }

    static applyJSON(json, obj) {
        super.applyJSON(json, obj);

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

class Deviation {
    static toJSON(obj) {
        return {
            name: obj.name,
            note: obj.note,
            cause: obj.cause,
            activity: obj.activity,
        };
    }

    static applyJSON(json, obj) {
        obj.name = json.name;
        obj.note = json.note;
        obj.cause = json.cause;
        obj.activity = json.activity;
    }

    static fromJSON(json) {
        const obj = new Deviation();
        Deviation.applyJSON(json, obj);
        return obj;
    }

    constructor(name='', note='', cause='', activity=true) {
        this.name = name;
        this.note = note;
        this.cause = cause;
        this.activity = activity;
    }
}

class PropertyDeviation extends Deviation {
    static toJSON(obj) {
        return {
            ...super.toJSON(obj),
            actualValue: obj.actualValue,
            value: obj.value,
        };
    }

    static applyJSON(json, obj) {
        super.applyJSON(json, obj);
        obj.actualValue = json.actualValue;
        obj.value = json.value;
    }

    static fromJSON(json) {
        const obj = new PropertyDeviation();
        PropertyDeviation.applyJSON(json, obj);
        return obj;
    }

    constructor(name, note) {
        super(name, note);

        this.actualValue = null;
        this.value = 0;
    }
}

class Risk extends Deviation {
    static Character = {
        Treat: 'treat',
        Possibility: 'possibility',
        noValue: 'noValue',
    }

    static toJSON(obj) {
        return {
            ...super.toJSON(obj),
            character: obj.character,
            LCStep: obj.LCStep,
            outrunning: obj.outrunning,
            profit: obj.profit,
            probability: obj.probability,
            score: obj.score,
            error: obj.error,
        };
    }

    static applyJSON(json, obj) {
        super.applyJSON(json, obj);
        obj.character = json.character;
        obj.LCStep = json.LCStep;
        obj.outrunning = json.outrunning;
        obj.profit = json.profit;
        obj.probability = json.probability;
        obj.score = json.score;
        obj.error = json.error;
    }

    static fromJSON(json) {
        const obj = new Risk();
        Risk.applyJSON(json, obj);
        return obj;
    }

    constructor(name, note, character=Risk.Character.Possibility) {
        super(name, note);

        this.character = character;
        this.LCStep = '';
        this.outrunning = 0;
        this.profit = 0;
        this.probability = 0;
        this.score = 0;
        this.error = 0;
    }
}

class Unit {
    static Type = {
        Process: {
            name: 'Process',

            accCtor: Process,
            gsCtor: ProcessGeometrySet,

            devCtor: Risk,
            devGSCtor: null,
        },
        Element: {
            name: 'Element',

            accCtor: Element,
            gsCtor: ElementGeometrySet,

            devCtor: Deviation,
            devGSCtor: null,
        },
    }

    static toJSON(obj) {
        let accordance, gs,
            deviation;

        if (obj.type === Unit.Type.Process) {
            accordance = Process.toJSON(obj._accordance);
            gs = ProcessGeometrySet.toJSON(obj._accordanceGS);

            deviation = Risk.toJSON(obj._deviation);
        }
        else if (obj.type === Unit.Type.Element) {
            accordance = Element.toJSON(obj._accordance);
            gs = ElementGeometrySet.toJSON(obj._accordanceGS);

            deviation = Deviation.toJSON(obj._deviation);
        }

        return {
            type: obj.type.name,
            isSystem: obj.isSystem,

            accordance,
            accordanceGS: gs,

            deviation,
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

            obj._deviation = Risk.fromJSON(json.deviation);
        }
        else if (json.type === 'Element') {
            obj.type = Unit.Type.Element;
            obj.isSystem = json.isSystem;
            obj._accordance = Element.fromJSON(json.accordance);
            obj._accordanceGS = ElementGeometrySet.fromJSON(
                json.accordanceGS,
                operator
            );

            obj._deviation = Deviation.fromJSON(json.deviation);
        }
    }

    static fromJSON(json, operator) {
        const obj = new Unit(Unit.Type.Process, operator);
        Unit.applyJSON(json, obj, operator);
        return obj;
    }

    constructor(type, operator, name, note, isSystem=false) {
        const accConstructor = type.accCtor, gsConstructor = type.gsCtor,
              devConstructor = type.devCtor;

        this.type = type;
        this.isSystem = isSystem;

        this._accordance = new accConstructor(name, note);
        this._accordanceGS = new gsConstructor(operator);

        this._deviation = new devConstructor();
    }

    getData() {
        const accordance = {
            name: this._accordance.name,
            note: this._accordance.note,
            activity: this._accordance.activity,
        };

        const deviation = {
            name: this._deviation.name,
            note: this._deviation.note,
            cause: this._deviation.cause,
            activity: this._deviation.activity,
        };

        if (this.type === Unit.Type.Process) {
            return {
                accordance,
                process: {
                    objective: this._accordance.objective,
                    owner: this._accordance.owner,
                    environment: this._accordance.environment,
                    pov: this._accordance.pov,
                },

                deviation,
                risk: {
                    character: this._deviation.character,
                    LCStep: this._deviation.LCStep,
                    outrunning: this._deviation.outrunning,
                    profit: this._deviation.profit,
                    score: this._deviation.score,
                    probability: this._deviation.probability,
                    error: this._deviation.error,
                },
            };
        }
        else if (this.type === Unit.Type.Element) {
            return {
                accordance,
                element: {
                    owner: this._accordance.owner,
                },
                deviation,
            };
        }
    }

    applyData(data) {
        const accordance = this._accordance, gs = this._accordanceGS,
              deviation = this._deviation;

        if (data?.accordance) {
            accordance.name = data.accordance.name;
            accordance.note = data.accordance.note;
            accordance.activity = data.accordance.activity;
        }

        if (data?.deviation) {
            deviation.name = data.deviation.name;
            deviation.note = data.deviation.note;
            deviation.cause = data.deviation.cause;
            deviation.activity = data.deviation.activity;
        }

        if (this.type === Unit.Type.Process) {
            if (data?.process) {
                accordance.objective = data.process.objective;
                accordance.owner = data.process.owner;
                accordance.environment = data.process.environment;
                accordance.pov = data.process.pov;
            }

            if (data?.risk) {
                deviation.character = data.risk.character;
                deviation.LCStep = data.risk.LCStep;
                deviation.outrunning = data.risk.outrunning;
                deviation.profit = data.risk.profit;
                deviation.score = data.risk.score;
                deviation.probability = data.risk.probability;
                deviation.error = data.risk.error;
            }

            if (data?.accordance) {
                gs.combine(GeometryLayer.Process, GeometryState.None, {
                    name: data.accordance.name
                });
            }
        }
        else if (this.type === Unit.Type.Element) {
            if (data?.element)
                accordance.owner = data.element.owner;

            if (data?.accordance) {
                gs.combine(GeometryLayer.Process, GeometryState.None, {
                    name: data.accordance.name
                });
            }
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

    isTouching(cursor, spatia) {
        return this._accordanceGS.isTouching(cursor, spatia);
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

    init(operator, canv, defaults) {
        const supprocess = {
            input: null,
            output: null,
            doer: null,
            mean: null,
        };

        let state = GeometryState.Hidden;
        if (defaults.supprocess.show)
            state = GeometryState.Main;

        for (let process in supprocess) {
            const result = this.addProcess(
                operator,
                GeometryLayer.Process,
                state,
                true, // this is a system process
            );

            operator.appendChild(canv.element, result.get('element'));
            supprocess[process] = result.get('unit');
        }

        const corner = defaults.supprocess.corner;

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
            if (unit.isTouching(point, spatia))
                return new Success([['id', id]]);
        }

        return new Fail();
    }

    select(id) {
        this.clearSelection();

        const unit = this._graph.getNode(id);
        if (unit.isSystem)
            return null;

        this._selected = id;

        const gs = unit._accordanceGS;
        gs.combine(GeometryLayer.Process, GeometryState.Selected);

        return unit;
    }

    getSelection() {
        if (isEmpty(this._selected))
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

        const unit = graph.getNode(id);
        if (unit.isSystem)
            return;

        const gs = unit._accordanceGS;
        if (gs instanceof ElementGeometrySet)
            return;

        gs.shift(dX, dY);

        const adjacents = graph.getAdjacents(id);
        for (let adjacentId of adjacents) {
            const connection = graph.getAdjacencyData(id, adjacentId);

            if (connection?.position === 'start'
                || connection?.position === 'end') {
                const adjacentGS = graph.getNode(adjacentId)._accordanceGS;

                if (connection?.position === 'start') {
                    adjacentGS.shift(dX, dY, {
                        start: true,
                        end: false
                    });
                }
                else if (connection?.position === 'end') {
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
            id: {
                inner: this._index.total,
                outer: this._index.process.user,
            }
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
            id: {
                inner: this._index.total,
                outer: this._index.element,
            },
            coords
        });

        this._index.element++;

        this._graph.addNode(this._index.total, unit);

        return new Success([['id', this._index.total++],
                            ['unit', unit],
                            ['element', element]]);
    }
}

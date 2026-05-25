const canvas = document.querySelector('.canvas');

const statusBar = {
    element: document.querySelector('.menu-status-bar > p'),

    print: (text) => statusBar.element.innerText = text
}

const SVG = {
    namespace: 'http://www.w3.org/2000/svg',
    point: canvas.createSVGPoint(),

    translateXY: (x, y) => (
        SVG.point.x = x,
        SVG.point.y = y,
        SVG.point.matrixTransform(canvas.getScreenCTM().inverse())
    ),

    translateToPoint: (x, y) => (
        new Point(SVG.translateXY(x, y).x, SVG.translateXY(x, y).y)
    ),

    createTag: (tag) => document.createElementNS(SVG.namespace, tag),

    createGroup: () => SVG.createTag('g'),

    createLine: () => SVG.createTag('line'),
    createPath: () => SVG.createTag('path'),
    createPolyline: () => SVG.createTag('polyline'),

    createRect: () => SVG.createTag('rect'),

    createText: () => SVG.createTag('text'),
    createHTMLText: () => {
        const p = document.createElement('p');
        p.className = 'htmltext-p';

        const div = document.createElementNS(
            'http://www.w3.org/1999/xhtml', 'div'
        );
        div.className = 'htmltext-container';
        div.appendChild(p);

        const object = SVG.createTag('foreignObject');
        object.appendChild(div);

        return object;
    },

    _applyHTMLTextValue(element, value) {
        element.firstElementChild.firstElementChild.textContent = value;
    },

    applyTo: function(element, definition) {
        for (let prop in definition) {
            if (element.tagName === 'foreignObject' && prop === 'value')
                SVG._applyHTMLTextValue(element, definition[prop]);
            else if (element.tagName === 'text' && prop === 'value')
                element.textContent = definition[prop];
            else
                element.setAttribute(prop, definition[prop]);
        }
    },

    appendChild: (parent, child) => parent.appendChild(child)
}

class Palette {
    static Tab = {
        Diagram: 'palette-diagramTab-radio',
        Accordance: 'palette-accordanceTab-radio',
        Deviation: 'palette-deviationTab-radio',
    }

    constructor(app) {
        function elm(selector) { return document.querySelector(selector); }

        this._app = app;

        this.diagram = {
            name: elm('#palette-diagramName'),
            author: elm('#palette-diagramAuthor'),
            changed: elm('#palette-diagramChanged'),
        };

        this.accordance = {
            name: elm('#palette-accordanceName'),
            note: elm('#palette-accordanceNote'),
            activity: elm('#palette-accordanceActivity'),
        };

        this.process = {
            objective: elm('#palette-processObjective'),
            owner: elm('#palette-processOwner'),
            environment: elm('#palette-processEnvironment'),
            pov: elm('#palette-processPov'),
        };

        this.element = {
            owner: elm('#palette-elementOwner'),
        };

        this.deviation = {
            name: elm('#palette-deviationName'),
            note: elm('#palette-deviationNote'),
            cause: elm('#palette-deviationCause'),
            activity: elm('#palette-deviationActivity'),
        };

        this.propertyDeviation = {
            actualValue: elm('#palette-propertyDeviationActualValue'),
            scale: elm('#palette-propertyDeviationScale'),
        };

        this.risk = {
            character: elm('#palette-riskCharacter'),
            LCStep: elm('#palette-riskLCStep'),
            outrunning: elm('#palette-riskOutrunning'),
            profit: elm('#palette-riskProfit'),
            score: elm('#palette-riskScore'),
            probability: elm('#palette-riskProbability'),
            error: elm('#palette-riskError'),
        };

        this.buttons = {
            apply: elm('#palette-applyBtn'),
            reset: elm('#palette-resetBtn'),
            drop: elm('#palette-dropBtn'),
        };
        this.buttons.apply.onclick = (e) => this.applyCb(e);
        this.buttons.reset.onclick = (e) => this.resetCb(e);
        this.buttons.drop.onclick = (e) => this.dropCb(e);

        this._state = {
            buttons: false,
            diagram: false,
            process: false,
            element: false,
            deviation: false,
            propertyDeviation: false,
            risk: false,
        };
        this.updateState();

        this.tabs = {
            diagram: {
                btn: elm('#palette-diagramTab-radio'),
                body: elm('#palette-diagramTab'),
            },
            accordance: {
                btn: elm('#palette-accordanceTab-radio'),
                body: elm('#palette-accordanceTab'),
            },
            deviation: {
                btn: elm('#palette-deviationTab-radio'),
                body: elm('#palette-deviationTab'),
            },
        };
        this.tabs.diagram.btn.onchange = (e) => this.changeTab(e);
        this.tabs.accordance.btn.onchange = (e) => this.changeTab(e);
        this.tabs.deviation.btn.onchange = (e) => this.changeTab(e);

        this._tab = Palette.Tab.Diagram;
        this.updateTabs();
    }

    get state() { return this._state; }
    set state(value) {
        this._state = value;
        this.updateState();
    }

    updateState() {
        function turn(value, elms) {
            for (let elm of elms)
                elm.disabled = !value;
        }

        this.clearData();

        const state = this._state;

        turn(state.buttons, [
            this.buttons.apply, this.buttons.reset, this.buttons.drop,
        ]);

        turn(state.diagram, [
            this.diagram.name, this.diagram.author, this.diagram.changed,
        ]);

        turn(state.process || state.element, [
            this.accordance.name, this.accordance.note, this.accordance.activity,
        ]);

        turn(state.process, [
            this.process.objective, this.process.owner,
            this.process.environment, this.process.pov,
        ]);

        turn(state.element, [
            this.element.owner,
        ]);

        turn(state.deviation, [
            this.deviation.name, this.deviation.note, this.deviation.cause,
            this.deviation.activity,
        ]);

        turn(state.propertyDeviation, [
            this.propertyDeviation.actualValue, this.propertyDeviation.scale,
        ]);

        turn(state.risk, [
            this.risk.character, this.risk.LCStep,
            this.risk.outrunning, this.risk.profit, this.risk.score,
            this.risk.probability, this.risk.error,
        ]);
    }

    get tab() { return this._tab; }
    set tab(value) {
        this._tab = value;
        this.updateTabs();
    }

    updateTabs() {
        switch (this._tab) {
        case 'palette-diagramTab-radio':
            this.tabs.diagram.btn.checked = true;

            this.tabs.diagram.body.hidden = false;
            this.tabs.accordance.body.hidden = true;
            this.tabs.deviation.body.hidden = true;

            this.state = {
                buttons: true,
                diagram: true,
            };
            break;

        case 'palette-accordanceTab-radio':
            this.tabs.accordance.btn.checked = true;

            this.tabs.diagram.body.hidden = true;
            this.tabs.accordance.body.hidden = false;
            this.tabs.deviation.body.hidden = true;

            this.state = {};
            break;

        case 'palette-deviationTab-radio':
            this.tabs.deviation.btn.checked = true;

            this.tabs.diagram.body.hidden = true;
            this.tabs.accordance.body.hidden = true;
            this.tabs.deviation.body.hidden = false;

            this.state = {};
            break;
        }
    }

    set data(dto) {
        if (dto?.diagram) {
            this.diagram.name.value = dto.diagram.name;
            this.diagram.author.value = dto.diagram.author;
            this.diagram.changed.value = dto.diagram.changed;
        }

        if (this._state.process || this._state.element) {
            if (dto?.accordance) {
                this.accordance.name.value = dto.accordance.name;
                this.accordance.note.value = dto.accordance.note;
                this.accordance.activity.checked = dto.accordance.activity;
            }

            if (dto?.deviation) {
                this.deviation.name.value = dto.deviation.name;
                this.deviation.note.value = dto.deviation.note;
                this.deviation.cause.value = dto.deviation.cause;
                this.deviation.activity.checked = dto.deviation.activity;
            }
        }
        if (this._state.process) {
            if (dto?.process) {
                this.process.objective.value = dto.process.objective;
                this.process.owner.value = dto.process.owner;
                this.process.environment.value = dto.process.environment;
                this.process.pov.value = dto.process.pov;
            }

            if (dto?.risk) {
                this.risk.character.value = dto.risk.character;
                this.risk.LCStep.value = dto.risk.LCStep;
                this.risk.outrunning.value = dto.risk.outrunning;
                this.risk.profit.value = dto.risk.profit;
                this.risk.score.value = dto.risk.score;
                this.risk.probability.value = dto.risk.probability;
                this.risk.error.value = dto.risk.error;
            }
        }
        else if (this._state.element) {
            if (dto?.element)
                this.element.owner.value = dto.element.owner;
        }
    }

    clearData() {
        this.accordance.name.value = '';
        this.accordance.note.value = '';
        this.accordance.activity.checked = false;

        this.process.objective.value = '';
        this.process.owner.value = '';
        this.process.environment.value = '';
        this.process.pov.value = '';

        this.element.owner.value = '';

        this.deviation.name.value = '';
        this.deviation.note.value = '';
        this.deviation.cause.value = '';
        this.deviation.activity.checked = false;

        this.propertyDeviation.actualValue.value = 'noValue';
        this.propertyDeviation.scale.value = '';

        this.risk.character.value = '';
        this.risk.LCStep.value = '';
        this.risk.outrunning.value = '';
        this.risk.profit.value = '';
        this.risk.score.value = '';
        this.risk.probability.value = '';
        this.risk.error.value = '';
    }

    _applyDiagram() {
        this._app.applyToDiagram({
            name: this.diagram.name.value,
            author: this.diagram.author.value,
            changed: this.diagram.changed.value,
        });
    }

    _applyAccordance() {
        const state = Palette.State;

        let data = {};

        if (this._state.process || this._state.element) {
            data.accordance = {
                name: this.accordance.name.value,
                note: this.accordance.note.value,
                activity: this.accordance.activity.checked,
            };
        }
        if (this._state.process) {
            data.process = {
                objective: this.process.objective.value,
                owner: this.process.owner.value,
                environment: this.process.environment.value,
                pov: this.process.pov.value,
            };
        }
        if (this._state.element) {
            data.element = {
                owner: this.element.owner.value,
            };
        }

        this._app.applyToSelection(data);
    }

    _applyDeviation() {
        let data = {};

        if (this._state.deviation) {
            data.deviation = {
                name: this.deviation.name.value,
                note: this.deviation.note.value,
                cause: this.deviation.cause.value,
                activity: this.deviation.activity.checked,
            };
        }

        if (this._state.propertyDeviation) {
            data.propertyDeviation = {
                actualValue: this.propertyDeviation.actualValue.value,
                scale: this.propertyDeviation.scale.value,
            };
        }

        if (this._state.risk) {
            data.risk = {
                character: this.risk.character.value,
                LCStep: this.risk.LCStep.value,
                outrunning: this.risk.outrunning.value,
                profit: this.risk.profit.value,
                score: this.risk.score.value,
                probability: this.risk.probability.value,
                error: this.risk.error.value,
            };
        }

        this._app.applyToSelection(data);
    }

    applyCb(event) {
        const tab = Palette.Tab;

        switch (this._tab) {

        case tab.Diagram:
            this._applyDiagram();
            break;

        case tab.Accordance:
            this._applyAccordance();
            break;

        case tab.Deviation:
            this._applyDeviation();
            break;
        }
    }

    resetCb(event) {
        this.clearData();
    }

    dropCb(event) {
        this._app.dropUnit();
    }

    changeTab(event) {
        this._tab = event.target.id;
        this.updateTabs();
    }
}

class Canvas {
    constructor(element) {
        this._element = element;
    }

    get element() { return this._element; }
    get width() { return this._element.width.baseVal.value; }
    get height() { return this._element.height.baseVal.value; }
}

class EventHandler {
    constructor(app) {
        this._app = app;
    }

    start(event) {
        this._app.startEvent(this, event);
    }

    end(event) {
        this._app.endEvent(this, event);
    }
}

class ButtonHandler extends EventHandler {
    static State = {
        Idle: 'Idle',
        ProcessCreated: 'ProcessCreated',
        PropertyCreated: 'PropertyCreated',

        ElementInit: 'ElementInit',
        ElementSrcSet: 'ElementSrcSet',
        ElementCreated: 'ElementCreated',

        IndependanceInit: 'IndependanceInit',
        IndependanceSrcSet: 'IndependanceSrcSet',
        IndependanceCreated: 'IndependanceCreated',

        CompatibilityInit: 'CompatibilityInit',
        CompatibilitySrcSet: 'CompatibilitySrcSet',
        CompatibilityCreated: 'CompatibilityCreated',

        IncompatibilityInit: 'IncompatibilityInit',
        IncompatibilitySrcSet: 'IncompatibilitySrcSet',
        IncompatibilityCreated: 'IncompatibilityCreated'
    }

    constructor(app) {
        super(app);

        this.state = ButtonHandler.State.Idle;

        this._i = 0;
        this._pgs = [];

        this._j = 0;
        this._egs = [];

        this._start = null;
        this._end = null;

        this._auxLine = new ElementAuxLineGeometrySet(SVG);
        SVG.appendChild(canvas, this._auxLine.combine(GeometryLayer.Process, GeometryState.Hidden, {start: new Point(0,0), end: new Point(0,0)}));
    }

    cursorClick(event) {
        this.start(event);

        console.log('Idle');

        this.state = ButtonHandler.State.Idle;
    }

    newProcessClick(event) {
        this.start(event);

        const diagram = this._app.diagram;
        const result =
              diagram.addProcess(SVG, GeometryLayer.Process, GeometryState.Main);
        SVG.appendChild(canvas, result.get('element'));
    }

    newElementClick(event) {
        this.start(event);

        if (this.state === ButtonHandler.State.Idle
            || this.state === ButtonHandler.State.ProcessCreated
            || this.state === ButtonHandler.State.PropertyCreated) {
            console.log('Element init');
            this.state = ButtonHandler.State.ElementInit;
        }
        else if (this.state === ButtonHandler.State.ElementInit) {
            this.state = ButtonHandler.State.ElementSrcSet;

            this._start = null;

            const cursor = SVG.translateToPoint(event.x, event.y);

            const diagram = this._app.diagram;
            const result = diagram.getByPoint(cursor);
            if (result.isOk)
                this._start = diagram.snapPoint(result.get('id'), cursor);
            else {
                this.state = ButtonHandler.State.Idle;
                console.log('err');
                return ;
            }

            this._auxLine.combine(GeometryLayer.Process, GeometryState.Hidden, {
                start: this._start,
                end: new Point(0,0)
            });

            console.log(`Element src = ${this._start.x} ${this._start.y}, side = ${this._start.side}`);
        }
        else if (this.state === ButtonHandler.State.ElementSrcSet) {
            if (event.type === 'mouseup') { // second process selected
                this._end = null;

                const cursor = SVG.translateToPoint(event.x, event.y);

                const diagram = this._app.diagram;
                let result = diagram.getByPoint(cursor);
                if (result.isOk)
                    this._end = diagram.snapPoint(result.get('id'), cursor);
                else {
                    console.log('err');
                    return ;
                }

                this.state = ButtonHandler.State.ElementCreated;

                const coords = {
                    start: this._start,
                    end: this._end
                };
                result =
                    diagram.addElement(SVG,
                                       GeometryLayer.Process, GeometryState.Main,
                                       coords);

                SVG.appendChild(canvas, result.get('element'));

                this._auxLine.combine(GeometryLayer.Process, GeometryState.Hidden, {
                    start: new Point(0,0),
                    end: new Point(0,0)
                });

                const processId = {
                    start: this._app.diagram.getByPoint(coords.start).get('id'),
                    end: this._app.diagram.getByPoint(coords.end).get('id')
                };
                const elementId = result.get('id');
                const graph = this._app.diagram.graph;
                graph.connect(processId.start, elementId, {
                    direction: ConnectDirections.Both,
                    data: {
                        position: 'start',
                        role: Element.getRoleBySide(coords.start.side),
                    }
                });
                graph.connect(elementId, processId.end, {
                    direction: ConnectDirections.Both,
                    data: {
                        position: 'end',
                        role: Element.getRoleBySide(coords.end.side),
                    }
                });

                console.log(`Element dst = ${this._end.x} ${this._end.y}, side = ${this._end.side}`);
            }
            else { // searching second process
                this._end = SVG.translateToPoint(event.x, event.y);
                console.log('search');
                this._auxLine.combine(GeometryLayer.Process, GeometryState.Main, {
                    end: this._end
                });
            }
        }

        this.end(event);
    }

    newPropertyClick(event) {
        this.start(event);

        console.log('+Property');

        this.state = ButtonHandler.State.PropertyCreated;
    }

    newIndependanceClick(event) {
        this.start(event);

        if (this.state === ButtonHandler.State.Idle) {
            this.state = ButtonHandler.State.IndependanceInit;
            console.log('Independance init');
        }
        else if (this.state === ButtonHandler.State.IndependanceInit) {
            this.state = ButtonHandler.State.IndependanceSrcSet;
            console.log(`Independance src = ${event.x} ${event.y}`);
        }
        else if (this.state === ButtonHandler.State.IndependanceSrcSet) {
            this.state = ButtonHandler.State.IndependanceCreated;
            console.log(`Independance dst = ${event.x} ${event.y}`);
        }

        this.end(event);
    }

    newCompatibilityClick() {
        this.start(event);

        if (this.state === ButtonHandler.State.Idle) {
            this.state = ButtonHandler.State.CompatibilityInit;
            console.log('Compatibility init');
        }
        else if (this.state === ButtonHandler.State.CompatibilityInit) {
            this.state = ButtonHandler.State.CompatibilitySrcSet;
            console.log(`Compatibility src = ${event.x} ${event.y}`);
        }
        else if (this.state === ButtonHandler.State.CompatibilitySrcSet) {
            this.state = ButtonHandler.State.CompatibilityCreated;
            console.log(`Compatibility dst = ${event.x} ${event.y}`);
        }

        this.end(event);
    }

    newIncompatibilityClick() {
        this.start(event);

        if (this.state === ButtonHandler.State.Idle) {
            this.state = ButtonHandler.State.IncompatibilityInit;
            console.log('Incompatibility init');
        }
        else if (this.state === ButtonHandler.State.IncompatibilityInit) {
            this.state = ButtonHandler.State.IncompatibilitySrcSet;
            console.log(`Incompatibility src = ${event.x} ${event.y}`);
        }
        else if (this.state === ButtonHandler.State.IncompatibilitySrcSet) {
            this.state = ButtonHandler.State.IncompatibilityCreated;
            console.log(`Incompatibility dst = ${event.x} ${event.y}`);
        }

        this.end(event);
    }
}

class MouseHandler extends EventHandler {
    static State = {
        Idle: 'Idle',
        ClickStart: 'ClickStart',
        ClickEnd: 'ClickEnd',
        Grabbing: 'Grabbing',
        GrabEnd: 'GrabEnd'
    }

    constructor(app) {
        super(app);

        this.state = MouseHandler.State.Idle;
        this.queue = [];
    }

    down(event) {
        this.start(event);

        if (this.state === MouseHandler.State.Idle
            || this.state === MouseHandler.State.ClickEnd
            || this.state === MouseHandler.State.GrabEnd) {

            this.state = MouseHandler.State.ClickStart;
            this.queue.push(event);
        }
    }

    move(event) {
        this.start(event);

        switch (this.state) {
        case MouseHandler.State.ClickStart:
            this.state = MouseHandler.State.Grabbing;

            this.queue.push(event);
            break;

        case MouseHandler.State.Grabbing:
            this.queue = [this.queue[1], event];
            break;

        case MouseHandler.State.ClickEnd:
        case MouseHandler.State.GrabEnd:
            this.state = MouseHandler.State.Idle;
            this.queue = [];
            break;
        }

        this.end(event);
    }

    up(event) {
        this.start(event);

        switch (this.state) {
        case MouseHandler.State.ClickStart:
            this.state = MouseHandler.State.ClickEnd;
            break;
        case MouseHandler.State.Grabbing:
            this.state = MouseHandler.State.GrabEnd;
            break;
        }

        this.end(event);
    }
}

class Application {
    static State = {
    }

    constructor() {
        this.state = Application.State.Idle;

        this.canvas = new Canvas(canvas);
        this.diagram = new Diagram();
        this.diagram.init(SVG, this.canvas, Defaults.diagram);

        this.buttons = new ButtonHandler(this);
        this.mouse = new MouseHandler(this);
        this.palette = new Palette(this);

        this.csv = new CSVExport();
    }

    startEvent(handler, event) {
        
    }

    endEvent(handler, event) {
        const buttons = this.buttons, mouse = this.mouse;

        // Select unit
        if (handler === mouse
            && handler.state === MouseHandler.State.ClickEnd
            && buttons.state === ButtonHandler.State.Idle) {

            const cursor = SVG.translateToPoint(event.x, event.y);
            const diagram = this.diagram;

            const result = diagram.getByPoint(cursor);
            if (result.isOk) {
                const id = result.get('id');
                const unit = diagram.select(id);

                if (!unit)
                    return;
                if (unit._accordance.constructor.name === 'Process') {
                    this.palette.state = {
                        buttons: true,
                        process: true,
                        element: false,
                        deviation: true,
                        risk: true,
                    };
                    this.palette.data = unit.getData();
                }
                else if (unit._accordance.constructor.name === 'Element') {
                    this.palette.state = {
                        buttons: true,
                        process: false,
                        element: true,
                        deviation: true
                    };
                    this.palette.data = unit.getData();
                }
                else {
                    this.palette.state = {};
                }
            }
            else {
                diagram.clearSelection();
                this.palette.state = {};
            }

            console.log(`Select ${cursor.x} ${cursor.y}`);
        }

        // Units moving & resizing
        else if (handler === mouse
                 && handler.state === MouseHandler.State.Grabbing) {

            this.buttons.state = ButtonHandler.State.Idle;

            const start = handler.queue[0], end = handler.queue[1];
            const s = SVG.translateToPoint(start.x, start.y),
                  e = SVG.translateToPoint(end.x, end.y);
            const delta = e.sub(s);

            const diagram = this.diagram;
            const result = diagram.getByPoint(s);

            // moving
            if (result.isOk)
                diagram.shift(result.get('id'), delta.x, delta.y);
            else {
                const selection = diagram.getSelection();

                // resizing
                if (selection && selection.type !== Unit.Type.Element) {
                    selection.setSize({
                        width: delta.x,
                        height: delta.y,
                        increment: true,
                    });
                }
            }
        }
        else if (handler === mouse
                 && handler.state === MouseHandler.State.GrabEnd) {
            this.buttons.state = ButtonHandler.State.Idle;
            console.log('Move ended!');
        }

        // Buttons state clearing
        else if (handler === mouse
                 && handler.state === MouseHandler.State.Idle
                 && (buttons.state === ButtonHandler.State.ProcessCreated
                     || buttons.state === ButtonHandler.State.ElementCreated
                     || buttons.state === ButtonHandler.State.PropertyCreated
                     || buttons.state === ButtonHandler.State.IndependanceCreated
                     || buttons.state === ButtonHandler.State.CompatibilityCreated
                     || buttons.state === ButtonHandler.State.IncompatibilityCreated
                    ))
            this.buttons.state = ButtonHandler.State.Idle;

        // Element creation 1: first process selected
        else if (handler === mouse
                 && handler.state === MouseHandler.State.ClickEnd
                 && buttons.state === ButtonHandler.State.ElementInit)
            this.buttons.newElementClick(event);

        // Element creation 2: seeking for a second process
        else if (handler === mouse
                 && handler.state === MouseHandler.State.Idle
                 && buttons.state === ButtonHandler.State.ElementSrcSet)
            this.buttons.newElementClick(event);

        // Element creation 3: second process selected
        else if (handler === mouse
                 && handler.state === MouseHandler.State.ClickEnd
                 && buttons.state === ButtonHandler.State.ElementSrcSet)
            this.buttons.newElementClick(event);

        // Independance creation 1: first process selected
        else if (handler === mouse
                 && handler.state === MouseHandler.State.ClickEnd
                 && buttons.state === ButtonHandler.State.IndependanceInit)
            this.buttons.newIndependanceClick(event);

        // Independance creation 2: second process selected
        else if (handler === mouse
                 && handler.state === MouseHandler.State.ClickEnd
                 && buttons.state === ButtonHandler.State.IndependanceSrcSet)
            this.buttons.newIndependanceClick(event);

        // Compatibility creation 1: first process selected
        else if (handler === mouse
                 && handler.state === MouseHandler.State.ClickEnd
                 && buttons.state === ButtonHandler.State.CompatibilityInit)
            this.buttons.newCompatibilityClick(event);

        // Compatibility creation 2: second process selected
        else if (handler === mouse
                 && handler.state === MouseHandler.State.ClickEnd
                 && buttons.state === ButtonHandler.State.CompatibilitySrcSet)
            this.buttons.newCompatibilityClick(event);

        // Incompatibility creation 1: first process selected
        else if (handler === mouse
                 && handler.state === MouseHandler.State.ClickEnd
                 && buttons.state === ButtonHandler.State.IncompatibilityInit)
            this.buttons.newIncompatibilityClick(event);

        // Incompatibility creation 2: second process selected
        else if (handler === mouse
                 && handler.state === MouseHandler.State.ClickEnd
                 && buttons.state === ButtonHandler.State.IncompatibilitySrcSet)
            this.buttons.newIncompatibilityClick(event);
    }

    applyToDiagram(data) {
        this.diagram._name = data.name;
        this.diagram._author = data.author;
        this.diagram._changed = data.changed;
    }

    applyToSelection(data) {
        const selection = this.diagram.getSelection();
        selection.applyData(data);
    }

    dropUnit() {
        const id = this.diagram.dropSelection();

        this.palette.state = {};

        const group = canvas.querySelector(`g[id="${id}"]`);
        canvas.removeChild(group);
    }

    setEvents(definition) {
        for (let event in definition) {
            for (let [selector, scope, func] of definition[event]) {
                document
                    .querySelector(selector)
                    .addEventListener(event, (e)=>func.call(scope, e));
            }
        }
    }

    newFile() {
        window.location.reload();
    }

    open() {
        function drawDiagram(unit) {
            let state = GeometryState.Main;
            if (unit.isSystem) {
                state =
                    Defaults.diagram.supprocess.show
                    ? GeometryState.Main
                    : GeometryState.Hidden;
            }

            const element = unit._accordanceGS.combine(
                GeometryLayer.Process,
                state,
            );

            SVG.appendChild(canvas, element);
        }

        function clearDiagram() {
            const groups = canvas.querySelectorAll('g');

            for (let group of groups) {
                canvas.removeChild(group);
            }
        }

        const self = this;

        openIdf((text) => {
            const json = JSON.parse(text);
            this.diagram = Diagram.fromJSON(json, SVG);

            clearDiagram();

            const nodes = this.diagram.graph.nodes(NodeFields.Data);
            nodes.forEach(drawDiagram);

            this.palette.data = {
                diagram: json,
            };
        });
    }

    save() {
        const contents = JSON.stringify(Diagram.toJSON(this.diagram));
        saveString(contents, 'application/json', 'diagram.idf');
    }

    exportPNG() {
        const exporter = new PNGExport({ scale: 1 });

        exporter.make(canvas, (blob) => {
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = 'diagram.png';
            a.click();

            URL.revokeObjectURL(url);
        });
    }

    exportProcessCSV() {
        const units = this.diagram.graph.nodes(NodeFields.Data);
        saveString(this.csv.exportProcess(units), 'text/csv', 'process.csv');
    }

    exportDeviationCSV() {
        const units = this.diagram.graph.nodes(NodeFields.Data);
        saveString(this.csv.exportDeviation(units),
                   'text/csv', 'deviation.csv');
    }

    exportRisksCSV() {
        const units = this.diagram.graph.nodes(NodeFields.Data);
        saveString(this.csv.exportRisk(units), 'text/csv', 'risk.csv');
    }

    exportStructure() {
        const units = this.diagram.graph.nodes(NodeFields.Data);

        const tab = window.open();
        if (!tab)
            return;

        const doc = tab.document;

        const link = doc.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'css/tree.css';

        doc.head.appendChild(link);

        const diagramJSON = Diagram.toJSON(this.diagram);
        appendDiagramHeading(diagramJSON.name, doc);
        appendDiagramCredentials(diagramJSON, doc);

        buildDiagramTree(units, tab.document);
    }

    exportElementCSV(event) {
        const settings = {
            inputs: document.querySelector('#export-inputs-checkbox').checked,
            outputs: document.querySelector('#export-outputs-checkbox').checked,
            doers: document.querySelector('#export-doers-checkbox').checked,
            means: document.querySelector('#export-means-checkbox').checked,
        };

        const exporter = new ElementExport(settings);
        const table = exporter.make(this.diagram.graph);
        saveString(table, 'text/csv', 'elements.csv');

        document.querySelector('#element-export-dialog').close();
    }
}

function isEmpty(value) {
    return value === null || value === undefined;
}

const app = new Application();

app.setEvents({
    'click': [
        ['#cursorBtn', app.buttons, app.buttons.cursorClick],

        ['#newProcessBtn', app.buttons, app.buttons.newProcessClick],
        ['#newElementBtn', app.buttons, app.buttons.newElementClick],
        ['#newPropertyBtn', app.buttons, app.buttons.newPropertyClick],

        ['#newIndependanceBtn', app.buttons, app.buttons.newIndependanceClick],
        ['#newCompatibilityBtn', app.buttons, app.buttons.newCompatibilityClick],
        ['#newIncompatibilityBtn', app.buttons,
         app.buttons.newIncompatibilityClick],

        ['#newFileBtn', app, app.newFile],
        ['#openFileBtn', app, app.open],
        ['#saveFileBtn', app, app.save],

        ['#exportPngBtn', app, app.exportPNG],
        ['#exportProcessBtn', app, app.exportProcessCSV],
        ['#exportDeviationBtn', app, app.exportDeviationCSV],
        ['#exportRiskBtn', app, app.exportRisksCSV],
        ['#exportStructureBtn', app, app.exportStructure],

        ['#openAboutDialogBtn', null,
         ()=>document.querySelector('#about-dialog').showModal()],
        ['#closeAboutDialogBtn', null,
         ()=>document.querySelector('#about-dialog').close()],

        ['#exportElementBtn', null,
         ()=>document.querySelector('#element-export-dialog').showModal()],
        ['#makeElementExportBtn', app, app.exportElementCSV],
        ['#closeElementExportDialogBtn', null,
         ()=>document.querySelector('#element-export-dialog').close()],
    ],

    'mousedown': [['.canvas', app.mouse, app.mouse.down]],
    'mousemove': [['.canvas', app.mouse, app.mouse.move]],
    'mouseup': [['.canvas', app.mouse, app.mouse.up]],
});

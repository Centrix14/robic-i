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

    applyTo: function(element, definition) {
        for (let prop in definition) {
            if (element.tagName === 'text' && prop === 'value')
                element.textContent = definition[prop];
            else
                element.setAttribute(prop, definition[prop]);
        }
    },

    appendChild: (parent, child) => parent.appendChild(child)
}

class Palette {
    static State = {
        None: 'none',
        Process: 'process',
        Element: 'element'
    }

    static Tab = {
        Diagram: 'palette-diagramTab-radio',
        Accordance: 'palette-accordanceTab-radio',
        Deviation: 'palette-deviationTab-radio',
    }

    constructor(app) {
        function elm(selector) { return document.querySelector(selector); }

        this._app = app;

        this.name = elm('#palette-name');
        this.note = elm('#palette-note');
        this.activity = elm('#palette-activity');

        this.process = {
            objective: elm('#palette-processObjective'),
            owner: elm('#palette-processOwner'),
            environment: elm('#palette-processEnvironment'),
            pov: elm('#palette-processPov'),
        };

        this.element = {
            owner: elm('#palette-elementOwner'),
        };

        this.buttons = {
            apply: elm('#palette-applyBtn'),
            reset: elm('#palette-resetBtn'),
            drop: elm('#palette-dropBtn'),
        };
        this.buttons.apply.onclick = (e) => this.applyCb(e);
        this.buttons.reset.onclick = (e) => this.resetCb(e);
        this.buttons.drop.onclick = (e) => this.dropCb(e);

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

        this._state = Palette.State.None;
        this.updateState();
    }

    get state() { return this._state; }
    set state(value) {
        this._state = value;
        this.updateState();
    }

    updateState() {
        const state = Palette.State;

        function off(value, elms) {
            for (let elm of elms)
                elm.disabled = value;
        }

        switch (this._state) {

        case state.None:
            this.clearData();

            off(true, [
                this.name, this.note, this.activity,
                this.process.objective, this.process.owner,
                this.process.environment, this.process.pov,
                this.element.owner,
                this.buttons.apply, this.buttons.reset, this.buttons.drop,
            ]);
            break;

        case state.Process:
            off(false, [
                this.name, this.note, this.activity,
                this.process.objective, this.process.owner,
                this.process.environment, this.process.pov,
                this.buttons.apply, this.buttons.reset, this.buttons.drop,
            ]);
            off(true, [
                this.element.owner,
            ]);
            break;

        case state.Element:
            off(false, [
                this.name, this.note, this.activity,
                this.element.owner,
                this.buttons.apply, this.buttons.reset, this.buttons.drop,
            ]);
            off(true, [
                this.process.objective, this.process.owner,
                this.process.environment, this.process.pov,
            ]);
            break;
        }
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
            break;

        case 'palette-accordanceTab-radio':
            this.tabs.accordance.btn.checked = true;

            this.tabs.diagram.body.hidden = true;
            this.tabs.accordance.body.hidden = false;
            this.tabs.deviation.body.hidden = true;
            break;

        case 'palette-deviationTab-radio':
            this.tabs.deviation.btn.checked = true;

            this.tabs.diagram.body.hidden = true;
            this.tabs.accordance.body.hidden = true;
            this.tabs.deviation.body.hidden = false;
            break;
        }
    }

    set data(dto) {
        const state = Palette.State;

        switch (this._state) {
        case state.Process:
            this.name.value = dto.name;
            this.note.value = dto.note;
            this.activity.checked = dto.activity;

            this.process.objective.value = dto.processObjective;
            this.process.owner.value = dto.processOwner;
            this.process.environment.value = dto.processEnvironment;
            this.process.pov.value = dto.processPov;
            break;

        case state.Element:
            this.name.value = dto.name;
            this.note.value = dto.note;
            this.activity.checked = dto.activity;
            this.element.owner.value = dto.elementOwner;
            break;
        }
    }

    clearData() {
        this.name.value = '';
        this.note.value = '';
        this.activity.checked = false;

        this.process.objective.value = '';
        this.process.owner.value = '';
        this.process.environment.value = '';
        this.process.pov.value = '';

        this.element.owner.value = '';
    }

    applyCb(event) {
        const state = Palette.State;

        switch (this._state) {

        case state.Process:
            this._app.applyData({
                name: this.name.value,
                note: this.note.value,
                activity: this.activity.checked,
                processObjective: this.process.objective.value,
                processOwner: this.process.owner.value,
                processEnvironment: this.process.environment.value,
                processPov: this.process.pov.value,
            });
            break;

        case state.Element:
            this._app.applyData({
                name: this.name.value,
                note: this.note.value,
                activity: this.activity.checked,
                elementOwner: this.element.owner.value,
            });
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

            console.log(`Element src = ${this._start.x} ${this._start.y}`);
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
                        role: 'start'
                    }
                });
                graph.connect(elementId, processId.end, {
                    direction: ConnectDirections.Both,
                    data: {
                        role: 'end'
                    }
                });

                console.log(`Element dst = ${this._end.x} ${this._end.y}`);
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
        this.diagram.init(SVG, this.canvas);

        this.buttons = new ButtonHandler(this);
        this.mouse = new MouseHandler(this);
        this.palette = new Palette(this);
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
                    this.palette.state = Palette.State.Process;
                    this.palette.data = unit.getData();
                }
                else if (unit._accordance.constructor.name === 'Element') {
                    this.palette.state = Palette.State.Element;
                    this.palette.data = unit.getData();
                }
                else
                    this.palette.state = Palette.State.None;
            }
            else {
                diagram.clearSelection();
                this.palette.state = Palette.State.None;
            }

            console.log(`Select ${cursor.x} ${cursor.y}`);
        }

        // Units moving
        else if (handler === mouse
                 && handler.state === MouseHandler.State.Grabbing) {

            this.buttons.state = ButtonHandler.State.Idle;

            const start = handler.queue[0], end = handler.queue[1];
            const s = SVG.translateToPoint(start.x, start.y),
                  e = SVG.translateToPoint(end.x, end.y);
            const delta = e.sub(s);

            const diagram = this.diagram;
            const result = diagram.getByPoint(s);
            if (result.isOk)
                diagram.shift(result.get('id'), delta.x, delta.y);
            else {
                const selection = diagram.getSelection();
                if (selection && selection.type !== Unit.Type.Element) {
                    console.log('resize');
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

    applyData(data) {
        const selection = this.diagram.getSelection();
        selection.applyData(data);
    }

    dropUnit() {
        const id = this.diagram.dropSelection();

        this.palette.state = Palette.State.None;

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
            if (unit.isSystem)
                state = GeometryState.Hidden;

            const element = unit._accordanceGS.combine(
                GeometryLayer.Process,
                state,
            );

            SVG.appendChild(canvas, element);
        }

        const self = this;

        openIdf((text) => {
            const json = JSON.parse(text);
            this.diagram = Diagram.fromJSON(json, SVG);

            const nodes = this.diagram.graph.nodes(NodeFields.Data);
            nodes.forEach(drawDiagram);
        });
    }

    save() {
        const contents = JSON.stringify(Diagram.toJSON(this.diagram));
        saveIdf(contents);
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
        ['#exportPngBtn', null, ()=>exportToPng(canvas)],
    ],

    'mousedown': [['.canvas', app.mouse, app.mouse.down]],
    'mousemove': [['.canvas', app.mouse, app.mouse.move]],
    'mouseup': [['.canvas', app.mouse, app.mouse.up]],
});

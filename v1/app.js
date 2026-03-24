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
    }

    cursorClick(event) {
        this.start(event);

        console.log('Idle');

        this.state = ButtonHandler.State.Idle;
    }

    newProcessClick(event) {
        this.start(event);

        const pgs = new ProcessGeometrySet(SVG);
        const elm = pgs.combine(GeometryLayer.Process, GeometryState.Main, {
            id: this._i.toString()
        });

        SVG.appendChild(canvas, elm);
        this._pgs.push(pgs);

        this._i++;
        this.state = ButtonHandler.State.ProcessCreated;
        console.log(this._pgs);
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
            console.log(`Element src = ${event.x} ${event.y}`);
        }
        else if (this.state === ButtonHandler.State.ElementSrcSet) {
            this.state = ButtonHandler.State.ElementCreated;
            console.log(`Element dst = ${event.x} ${event.y}`);
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

        this.buttons = new ButtonHandler(this);
        this.mouse = new MouseHandler(this);
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
            const spatia = new Spatia(10);

            for (let pg of this.buttons._pgs) {
                if (pg.isTouching(cursor, spatia))
                    pg.combine(GeometryLayer.Process, GeometryState.Selected);
                else
                    pg.combine(GeometryLayer.Process, GeometryState.Main);
            }

            console.log(`Select ${cursor.x} ${cursor.y}`);
        }

        // Units moving
        else if (handler === mouse
                 && handler.state === MouseHandler.State.Grabbing) {

            this.buttons.state = ButtonHandler.State.Idle;

            const start = handler.queue[0], end = handler.queue[1];
            const startP = SVG.translateToPoint(start.x, start.y),
                  endP = SVG.translateToPoint(end.x, end.y);
            const delta = endP.sub(startP);

            const spatia = new Spatia(10);

            for (let pg of this.buttons._pgs) {
                if (pg.isTouching(startP, spatia))
                    pg.shift(delta.x, delta.y);
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

        // Element creation 2: second process selected
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

    setEvents(definition) {
        for (let event in definition) {
            for (let [selector, scope, func] of definition[event])
                document
                .querySelector(selector)
                .addEventListener(event, (e)=>func.call(scope, e));
        }
    }
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
         app.buttons.newIncompatibilityClick]
    ],

    'mousedown': [['.canvas', app.mouse, app.mouse.down]],
    'mousemove': [['.canvas', app.mouse, app.mouse.move]],
    'mouseup': [['.canvas', app.mouse, app.mouse.up]]
});

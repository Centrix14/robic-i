const statusBar = {
    element: document.querySelector('.menu-status-bar > p'),

    print: (text) => statusBar.element.innerText = text
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
        ElementCreated: 'ElementCreated'
    }

    constructor(app) {
        super(app);

        this.state = ButtonHandler.State.Idle;
    }

    newProcessClick(event) {
        this.start(event);

        console.log('+Process');

        this.state = ButtonHandler.State.ProcessCreated;
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
    }

    down(event) {
        this.start(event);

        if (this.state === MouseHandler.State.Idle
            || this.state === MouseHandler.State.ClickEnd
            || this.state === MouseHandler.State.GrabEnd)
            this.state = MouseHandler.State.ClickStart;
    }

    move(event) {
        this.start(event);

        switch (this.state) {
        case MouseHandler.State.ClickStart:
            this.state = MouseHandler.State.Grabbing;
            break;
        case MouseHandler.State.ClickEnd:
        case MouseHandler.State.GrabEnd:
            this.state = MouseHandler.State.Idle;
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
            console.log('Select');
        }

        // Units moving
        else if (handler === mouse
                 && handler.state === MouseHandler.State.Grabbing) {
            this.buttons.state = ButtonHandler.State.Idle;
            console.log('Move!');
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
                || buttons.state === ButtonHandler.State.PropertyCreated))
            this.buttons.state = ButtonHandler.State.Idle;

        // Element creation 1: first process selected
        else if (handler === mouse
                 && buttons.state === ButtonHandler.State.ElementInit
                 && handler.state === MouseHandler.State.ClickEnd)
            this.buttons.newElementClick(event);

        // Element creation 2: second process selected
        else if (handler === mouse
                 && handler.state === MouseHandler.State.ClickEnd
                 && buttons.state === ButtonHandler.State.ElementSrcSet)
            this.buttons.newElementClick(event);
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
        ['#newProcessBtn', app.buttons, app.buttons.newProcessClick],
        ['#newElementBtn', app.buttons, app.buttons.newElementClick],
        ['#newPropertyBtn', app.buttons, app.buttons.newPropertyClick]
    ],

    'mousedown': [['.canvas', app.mouse, app.mouse.down]],
    'mousemove': [['.canvas', app.mouse, app.mouse.move]],
    'mouseup': [['.canvas', app.mouse, app.mouse.up]]
});

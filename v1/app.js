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

        this.state = ButtonHandler.State.ProcessCreated;
    }

    newElementClick(event) {
        this.start(event);

        if (this.state === ButtonHandler.State.Idle
            || this.state === ButtonHandler.State.ProcessCreated
            || this.state === ButtonHandler.State.PropertyCreated)
            this.state = ButtonHandler.State.ElementInit;
        else if (this.state === ButtonHandler.State.ElementInit) {
            this.state = ButtonHandler.State.ElementSrcSet;
            console.log(`Src set ${event.x} ${event.y}`);
        }
        else if (this.state === ButtonHandler.State.ElementSrcSet) {
            this.state = ButtonHandler.State.ElementCreated;
            console.log(`Dst set ${event.x} ${event.y}`);
        }

        this.end(event);
    }

    newPropertyClick(event) {
        this.start(event);

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

        if (handler === mouse
            && handler.state === MouseHandler.State.Idle
            && (buttons.state === ButtonHandler.State.ProcessCreated
                || buttons.state === ButtonHandler.State.ElementCreated
                || buttons.state === ButtonHandler.State.PropertyCreated))
            this.buttons.state = ButtonHandler.State.Idle;

        else if (handler === mouse
                 && buttons.state === ButtonHandler.State.ElementInit
                 && handler.state === MouseHandler.State.ClickEnd)
            this.buttons.newElementClick(event);
        else if (handler === mouse
                 && handler.state === MouseHandler.State.ClickEnd
                 && buttons.state === ButtonHandler.State.ElementSrcSet)
            this.buttons.newElementClick(event);
    }
}

const app = new Application();

function setEvents(definition) {
    for (let event in definition) {
        for (let [selector, lambda] of definition[event])
            document.querySelector(selector).addEventListener(event, lambda);
    }
}

setEvents({
    'click': [
        ['#newProcessBtn', ()=>app.buttons.newProcessClick()],
        ['#newElementBtn', ()=>app.buttons.newElementClick()],
        ['#newPropertyBtn', ()=>app.buttons.newPropertyClick()]
    ],

    'mousedown': [['.canvas', (e)=>app.mouse.down(e)]],
    'mousemove': [['.canvas', (e)=>app.mouse.move(e)]],
    'mouseup': [['.canvas', (e)=>app.mouse.up(e)]]
});

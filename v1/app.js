const statusBar = {
    element: document.querySelector('.menu-status-bar > p'),

    print: (text) => statusBar.element.innerText = text
}

const State = {
    Idle: 'Idle',

    ClickStart: 'ClickStart',
    ClickEnd: 'ClickEnd',

    GrabStart: 'GrabStart',
    GrabEnd: 'GrabEnd',

    ProcessCreation: 'ProcessCreation',
    ElementCreationInit: 'ElementCreationInit',
    ElementCreationSrcSet: 'ElementCreationSrcSet',
    ElementCreationDestSet: 'ElementCreationDestSet',
    PropertyCreation: 'PropertyCreation',

    ProcessSelect: 'ProcessSelect',
    ElementSelect: 'ElementSelect',
    PropertySelect: 'PropertySelect'
}

class EventHandler {
    constructor(app) {
        this._app = app;
    }

    get state() { return this._app._currentState; }
    set state(value) { this._app._currentState = value; }

    start(event) {
        this._app.startEvent(event);
    }

    end(event) {
        statusBar.print(this.state);
        this._app.endEvent(event);
    }
}

class ButtonHandler extends EventHandler {
    newProcessClick(event) {
        this.start(event);
        this.state = State.ProcessCreation;
        this.end(event);
    }

    newElementClick() {
        this.start(event);
        this.state = State.ElementCreationInit;
        this.end(event);
    }

    newPropertyClick() {
        this.start(event);
        this.state = State.PropertyCreation;
        this.end(event);
    }
}

class MouseHandler extends EventHandler {
    down(event) {
        this.start(event);

        if (this.state === State.Idle)
            this.state = State.ClickStart;

        this.end(event);
    }

    move(event) {
        this.start(event);

        if (this.state === State.ClickStart)
            this.state = State.GrabStart;

        this.end(event);
    }

    up(event) {
        this.start(event);

        switch (this.state) {
        case State.ClickStart:
            this.state = State.ClickEnd;
            break;
        case State.GrabStart:
            this.state = State.GrabEnd;
            break;
        }

        this.end(event);
    }
}

class Application {
    constructor() {
        this._currentState = State.Idle;

        this.buttons = new ButtonHandler(this);
        this.mouse = new MouseHandler(this);
    }

    startEvent(e) {
        
    }

    endEvent(e) {
        
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

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

        if (this.state === ButtonHandler.State.Idle
            || this.state === ButtonHandler.State.ElementCreated
            || this.state === ButtonHandler.State.PropertyCreated)
            this.state = State.ProcessCreated;

        this.end(event);
    }

    newElementClick() {
        this.start(event);

        if (this.state === ButtonHandler.State.Idle
            || this.state === ButtonHandler.State.ProcessCreated
            || this.state === ButtonHandler.State.PropertyCreated)
            this.state = State.ElementCreationInit;

        this.end(event);
    }

    newPropertyClick() {
        this.start(event);

        if (this.state === ButtonHandler.State.Idle
            || this.state === ButtonHandler.State.ProcessCreated
            || this.state === ButtonHandler.State.ElementCreated)
            this.state = State.PropertyCreation;

        this.end(event);
    }
}

class MouseHandler extends EventHandler {

    _localState = State.Idle;

    down(event) {
        this.start(event);

        if (this.state === State.Idle)
            this._localState = State.ClickStart;

        this.end(event);
    }

    move(event) {
        this.start(event);

        if (this.state === State.Idle && this._localState === State.ClickStart) {
            this.state = State.GrabStart;
            this._localState = State.GrabStart;
        }

        this.end(event);
    }

    up(event) {
        this.start(event);

        switch (this._localState) {
        case State.ClickStart:
            this.state = State.ClickEnd;
            this._localState = State.Idle;
            break;
        case State.GrabStart:
            this.state = State.GrabEnd;
            this._localState = State.Idle;
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

    setState(newState) {
        const currentState = this._currentState;

        if (currentState === State.ElementCreationInit
            && newState === State.ClickEnd)
            this._currentState = State.ElementCreationSrcSet;
        else
            this._currentState = newState;
    }

    startEvent(e) {
        
    }

    endEvent(e) {
        switch (this._currentState) {
        case State.ClickEnd:
            statusBar.print('Clicked');
            this._currentState = State.Idle;
            break;
        case State.GrabEnd:
            statusBar.print('Grab');
            this._currentState = State.Idle;
            break;

        case State.ProcessCreation:
            statusBar.print('Process created');
            this._currentState = State.Idle;
            break;
        case State.PropertyCreation:
            statusBar.print('Property created');
            this._currentState = State.Idle;
            break;
        }
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

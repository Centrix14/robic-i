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

    ElementCreationInit: 'ElementCreationInit',
    ElementCreationSrcSet: 'ElementCreationSrcSet',
    ElementCreationDestSet: 'ElementCreationDestSet',

    ProcessSelect: 'ProcessSelect',
    ElementSelect: 'ElementSelect',
    PropertySelect: 'PropertySelect'
}

class ButtonHandler {
    constructor(app) {
        this._app = app;
    }

    newProcessClick() {
        statusBar.print('Process created');
    }

    newElementClick() {
        this._app._currentState = State.ElementCreationInit;
        statusBar.print(this._app._currentState);
    }

    newPropertyClick() {
        statusBar.print('Property created');
    }
}

class MouseHandler {
    constructor(app) {
        this._app = app;
    }

    get state() { return this._app._currentState; }
    set state(value) { this._app._currentState = value; }

    _end(event) {
        statusBar.print(this.state);
    }

    down(event) {
        if (this.state === State.Idle)
            this.state = State.ClickStart;

        this._end(event);
    }

    move(event) {
        if (this.state === State.ClickStart)
            this.state = State.GrabStart;

        this._end(event);
    }

    up(event) {
        switch (this.state) {
        case State.ClickStart:
            this.state = State.ClickEnd;
            break;
        case State.GrabStart:
            this.state = State.GrabEnd;
            break;
        }

        this._end(event);
    }
}

class Application {
    constructor() {
        this._currentState = State.Idle;

        this.buttons = new ButtonHandler(this);
        this.mouse = new MouseHandler(this);
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

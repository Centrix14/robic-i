const statusBar = {
    element: document.querySelector('.menu-status-bar > p'),

    print: (text) => statusBar.element.innerText = text
}

const State = {
    Idle: 'Idle',

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

class Application {
    constructor() {
        this._currentState = State.Idle;

        this.buttons = new ButtonHandler(this);
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
    ]
});

const canvas = document.getElementById('canvas');

const _point = canvas.createSVGPoint();
function canvasCoords(x, y) {
    _point.x = x; _point.y = y;
    return _point.matrixTransform(canvas.getScreenCTM().inverse());
}

function adhocMouseEvent(name, event) {
    return {
        name,
        button: event.button,
        x: event.x,
        y: event.y
    };
}

function adhocKeyboardEvent(name, event) {
    return {
        name,
        key: event.key
    };
}

class StatusBar {
    #element = undefined;

    constructor(element) {
        this.#element = element;
    }

    print(message) {
        this.#element.innerText = message;
    }
}

class Application {
    #editor = undefined;
    #validator = undefined;
    
    #roles = undefined;
    #diagram = undefined;

    #canvas = undefined;

    #eventBuffer = [];

    constructor() {
        this.#roles = new ElementRole();
        this.#roles.create('none');
        
        this.#diagram = new ComponentManager(this.#roles);

        this.#validator = new Validator();

        this.#canvas = document.getElementById('canvas');
        this.#editor = new Editor(document, this.#canvas);
    }

    createProcess() {
        const designation = this.#diagram.createComponent(Process);
        this.#editor.createRect(designation);
    }

    canvasSelect(event) {
        const cursor = canvasCoords(event.x, event.y);
        this.#editor.select(cursor.x, cursor.y);
    }

    canvasClick(event) {
        this.canvasSelect(event);
    }

    eventDispatch() {
        const events = this.#eventBuffer;

        console.log(events);
        if (events.length >= 2) {
            const first = events.length - 2;
            const second = events.length - 1;

            if (events[first].name === 'mousedown' && events[second].name === 'mouseup') {
                this.canvasClick(events[0]);
                this.#eventBuffer = [];
            }
            if (events[first].name === 'keyDown' && events[second].name === 'keyUp') {
                this.#eventBuffer = [];
            }
        }
    }

    mouseDown(event) {
        this.#eventBuffer.push(adhocMouseEvent('mousedown', event));
        this.eventDispatch();
    }

    mouseUp(event) {
        this.#eventBuffer.push(adhocMouseEvent('mouseup', event));
        this.eventDispatch();
    }

    keyDown(event) {
        if (event.key === 'Escape')
            this.#eventBuffer = [];
        else {
            this.#eventBuffer.push(adhocKeyboardEvent('keyDown', event));
            this.eventDispatch();
        }
    }

    keyUp(event) {
        if (event.key === 'Escape')
            this.#eventBuffer = [];
        else {
            this.#eventBuffer.push(adhocKeyboardEvent('keyUp', event));
            this.eventDispatch();
        }
    }
}

const app = new Application();
const statusBar = new StatusBar(document.getElementById('status-text'));

//canvas.addEventListener('click', (event) => app.canvasSelect(event));
//canvas.addEventListener('click', function(event){
//    statusBar.print('Click!');
//});

canvas.addEventListener('pointerdown', function(event){
    statusBar.print('Down');
    app.mouseDown(event);
});

canvas.addEventListener('pointerup', function(event){
    statusBar.print('Up');
    app.mouseUp(event);
});

canvas.addEventListener('mousemove', function(event) {
    //statusBar.print(event.movementX + ', ' + event.movementY);
});

const body = document.querySelector('body');

body.addEventListener('keydown', function(event){
    app.keyDown(event);
});

body.addEventListener('keyup', function(event){
    app.keyUp(event);
});

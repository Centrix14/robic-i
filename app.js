const canvas = document.getElementById('canvas');

const _point = canvas.createSVGPoint();
function canvasCoords(x, y) {
    _point.x = x; _point.y = y;
    return _point.matrixTransform(canvas.getScreenCTM().inverse());
}

function adhocEvent(event) {
    switch (event.type) {
    case 'mousedown':
    case 'mouseup':
    case 'mousemove':
        return {
            source: 'mouse',
            type: event.type,
            button: event.button,
            x: event.x,
            y: event.y
        }
        break;

    case 'keydown':
    case 'keyup':
        return {
            source: 'keyboard',
            type: event.type,
            key: event.key
        }
        break;

    default:
        return {
            source: '',
            type: ''
        };
        break;
    }
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

    click(event) {
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

class EventDispatcher {
    #app = undefined;
    #eventQueue = [];

    constructor(app) {
        this.#app = app;
    }

    readMouseEvent(event) {
        const queue = this.#eventQueue;
        
        switch (event.type) {
        case 'mousedown':
            queue.push(event);
            break;

        case 'mouseup':
            const last = queue[queue.length - 1];
            
            if (last && last.type === 'mousedown')
                this.#app.click(event);

            this.#eventQueue = [];
            break;

        default:
            break;
        }
    }
}

const app = new Application();
const statusBar = new StatusBar(document.getElementById('status-text'));
const dispatcher = new EventDispatcher(app);

//canvas.addEventListener('click', (event) => app.canvasSelect(event));
//canvas.addEventListener('click', function(event){
//    statusBar.print('Click!');
//});

canvas.addEventListener('mousedown', function(event){
    dispatcher.readMouseEvent(event);
});

canvas.addEventListener('mouseup', function(event){
    dispatcher.readMouseEvent(event);
});

canvas.addEventListener('mousemove', function(event) {
    //statusBar.print(event.movementX + ', ' + event.movementY);
});

const body = document.querySelector('body');

body.addEventListener('keydown', function(event){
});

body.addEventListener('keyup', function(event){
});

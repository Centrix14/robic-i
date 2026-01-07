const canvas = document.getElementById('canvas');

const _point = canvas.createSVGPoint();
function canvasCoords(x, y) {
    _point.x = x; _point.y = y;
    return _point.matrixTransform(canvas.getScreenCTM().inverse());
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

    grab(startX, startY, endX, endY) {
        
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
        const last = queue[queue.length - 1] ?? {type: ''};
            
        switch (event.type) {
        case 'mousedown':
            queue.push(event);
            break;

        case 'mouseup':
            if (last.type === 'mousedown')
                this.#app.click(event);

            this.#eventQueue = [];
            break;

        case 'mousemove':
            if (last.type === 'mousedown')
                this.#app.grab(last.x, last.y, event.x, event.y);
            break;

        default:
            break;
        }
    }
}

const app = new Application();
const statusBar = new StatusBar(document.getElementById('status-text'));
const dispatcher = new EventDispatcher(app);

canvas.addEventListener('mousedown', function(event){
    dispatcher.readMouseEvent(event);
});

canvas.addEventListener('mouseup', function(event){
    dispatcher.readMouseEvent(event);
});

canvas.addEventListener('mousemove', function(event) {
    dispatcher.readMouseEvent(event);
});

const body = document.querySelector('body');

body.addEventListener('keydown', function(event){
});

body.addEventListener('keyup', function(event){
});

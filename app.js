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
        const cursor = canvasCoords(event.clientX, event.clientY);
        this.#editor.select(cursor.x, cursor.y);
    }
}

const app = new Application();
const statusBar = new StatusBar(document.getElementById('status-text'));

canvas.addEventListener('click', (event) => app.canvasSelect(event));

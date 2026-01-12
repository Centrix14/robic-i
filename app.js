class StatusBar {
    #element = undefined;

    constructor(element) {
        this.#element = element;
    }

    print(message) {
        this.#element.innerText = message;
    }
}

class PaletteManager {
    #palette = undefined;
    #uuid = 0;

    constructor(palette) {
        this.#palette = palette ?? {};
    }

    get(componentMap) {
        const queried = componentMap.get('designation');
        
        const childs = Array.from(palette.getElementsByTagName('div'));
        for (let child of childs) {
            if (child.getAttribute('designation') === queried)
                return child;
        }

        return {
            tagName: null,
            remove: () => {}
        };
    }

    has(componentMap) {
        return this.get(componentMap).tagName !== null;
    }

    addSection(componentMap) {
        if (!this.has(componentMap)) {
            const div = document.createElement('div');
            div.setAttribute('designation', componentMap.get('designation'));

            for (let entry of componentMap.entries()) {
                const input = document.createElement('input');
                input.setAttribute('id', this.#uuid.toString());
                input.setAttribute('type', 'text');
                input.setAttribute('value', entry[1]);

                const label = document.createElement('label');
                label.setAttribute('for', this.#uuid.toString());
                label.innerText = entry[0];

                this.#uuid++;
                
                div.appendChild(input);
                div.appendChild(label);
            }
            
            this.#palette.appendChild(div);
        }
    }

    removeSection(componentMap) {
        this.get(componentMap).remove();
    }
}

class Application {
    #editor = undefined;
    #validator = undefined;
    
    #roles = undefined;
    #diagram = undefined;

    #paletteManager = undefined;

    #canvas = undefined;
    #palette = undefined;

    constructor(canvas, palette) {
        this.#roles = new ElementRole();
        this.#roles.create('none');
        
        this.#diagram = new ComponentManager(this.#roles);
        this.#validator = new Validator();

        this.#editor = new Editor(document, canvas);

        this.#paletteManager = new PaletteManager(palette);

        this.#canvas = canvas;
        this.#palette = palette;
    }

    newProcess() {
        const designation = this.#diagram.createComponent(Process);
        this.#editor.createRect(designation);
    }

    canvasSelect(event) {
        const editor = this.#editor;
        const diagram = this.#diagram;
        const palette = this.#palette;
        
        const cursor = canvasCoords(event.x, event.y);
        const selection = editor.select(cursor.x, cursor.y);

        for (let figure of selection.selected) {
            const map = diagram.get(figure.designation).serialize();
            this.#paletteManager.addSection(map);
        }

        for (let figure of selection.unselected) {
            const map = diagram.get(figure.designation).serialize();
            this.#paletteManager.removeSection(map);
        }
    }

    click(event) {
        this.canvasSelect(event);
    }

    grab(startX, startY, endX, endY) {
        const shiftX = canvasCoords(endX, endY).x - canvasCoords(startX, startY).x;
        const shiftY = canvasCoords(endX, endY).y - canvasCoords(startX, startY).y;
        
        this.#editor.grab(shiftX, shiftY);
    }

    keyboardHit(event) {
        if (event.key === 'Escape')
            this.#editor.resetSelection();
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
            if (last.type === 'mousedown' || last.type === 'mousemove') {
                this.#app.grab(last.x, last.y, event.x, event.y);
                this.#eventQueue.push(event);
            }
            break;

        default:
            break;
        }
    }

    readKeyboardEvent(event) {
        const queue = this.#eventQueue;
        const last = queue[queue.length - 1] ?? {};

        switch (event.type) {
        case 'keydown':
            queue.push(event);
            break;

        case 'keyup':
            if (last.type === 'keydown')
                this.#app.keyboardHit(event);

            this.#eventQueue = [];
            break;
        }
    }
}

const palette = document.querySelector('.palette');
const canvas = document.querySelector('.canvas');

const _point = canvas.createSVGPoint();
function canvasCoords(x, y) {
    _point.x = x; _point.y = y;
    return _point.matrixTransform(canvas.getScreenCTM().inverse());
}

const app = new Application(canvas, palette);
//const statusBar = new StatusBar(document.getElementById('status-text'));
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
    dispatcher.readKeyboardEvent(event);
});

body.addEventListener('keyup', function(event){
    dispatcher.readKeyboardEvent(event);
});

const newProcessBtn = document.querySelector('#newProcessBtn');
newProcessBtn.addEventListener('click', () => app.newProcess());

const paletteIterationField = document.querySelector('#palette-iteration');
paletteIterationField.value = 0;

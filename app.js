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

    constructor(descriptor) {
        this.#palette = new Map();

        const palette = this.#palette;
        
        palette.set('designation', descriptor.designation);
        palette.set('name', descriptor.name);
        palette.set('description', descriptor.description);
        palette.set('iteration', descriptor.iteration);
        palette.set('isHiding', descriptor.isHiding);
        palette.set('possibleValues', descriptor.possibleValues);
        palette.set('referenceValue', descriptor.referenceValue);
        palette.set('actualValue', descriptor.actualValue);
    }

    select(componentMap) {
        const palette = this.#palette;

        for (let [fieldName, fieldElement] of palette) {
            const fieldValue = componentMap.get(fieldName) ?? '';

            if (fieldValue !== undefined)
                fieldElement['value'] = fieldValue;
        }
    }

    clear() {
        const palette = this.#palette;

        palette.get('designation')['value'] = '';
        palette.get('name')['value'] = '';
        palette.get('description')['value'] = '';
        palette.get('iteration')['value'] = 0;
        palette.get('isHiding')['value'] = false;
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

        this.#paletteManager = new PaletteManager({
            designation: document.querySelector('#palette-designation'),
            name: document.querySelector('#palette-name'),
            description: document.querySelector('#palette-description'),
            iteration: document.querySelector('#palette-iteration'),
            isHiding: document.querySelector('#palette-isHiding'),
            possibleValues: document.querySelector('#palette-possibleValues'),
            referenceValue: document.querySelector('#palette-referenceValue'),
            actualValue: document.querySelector('#palette-actualValue')
        });

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
        const paletteManager = this.#paletteManager;
        
        const cursor = canvasCoords(event.x, event.y);
        const selection = editor.select(cursor.x, cursor.y).selected;

        const selectedFigure = selection[selection.length - 1];
        if (selectedFigure) {
            const selectedComponent = diagram.get(selectedFigure.designation);
            paletteManager.select(selectedComponent.serialize());
        }
        else
            paletteManager.clear();
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

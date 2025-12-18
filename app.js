class Application {
    #editor = undefined;
    #validator = undefined;
    
    #roles = undefined;
    #diagram = undefined;

    #canvas = undefined;
    #svgPoint = undefined;

    constructor() {
        this.#roles = new ElementRole();
        this.#roles.create('none');
        
        this.#diagram = new ComponentManager(this.#roles);

        this.#validator = new Validator();

        this.#canvas = document.getElementById('canvas');
        this.#editor = new Editor(document, this.#canvas);

        this.#svgPoint = this.#canvas.createSVGPoint();
    }

    createProcess() {
        const designation = this.#diagram.createComponent(Process);
        this.#editor.createRect(designation);
    }

    canvasSelect(event) {
        const point = this.#svgPoint;
        const canvas = this.#canvas;
        
        point.x = event.clientX;
        point.y = event.clientY;

        var cursorpt = point.matrixTransform(canvas.getScreenCTM().inverse());
        console.log("(" + cursorpt.x + ", " + cursorpt.y + ")");
    }
}

const app = new Application();

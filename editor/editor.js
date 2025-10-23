class Result {
    #errors = [];
    static Defaults = Object.freeze({
	    TestError: 'just a test error'
    });

    constructor(soleText = '') {
        if ((typeof soleText === 'string') && soleText !== '') {
            this.#errors.push(soleText);
        }
    }
    
    addError(text) {
	    if (this.#errors.includes(text)) {
	        return false;
	    }
	    else {
	        this.#errors.push(text);
	        return true;
	    }
    }

    hasErrors() {
	    return this.#errors.length > 0;
    }

    isSuccess() {
	    return !this.hasErrors();
    }

    getErrors() {
	    return [...this.#errors];
    }
}

class Point {
    #x = 0;
    #y = 0;

    constructor(x, y) {
	    this.#x = x;
	    this.#y = y;
    }

    serialize(element) {
	    if (element instanceof SVGElement) {
	        element.setAttribute('x', this.#x.toString());
	        element.setAttribute('y', this.#y.toString());

	        return new Result();
	    }
	    else {
	        return new Result('Point.serialize requires SVGElement as argument');
	    }
    }
}

class Figure {
    #id = 0;
    #caption = "";

    constructor(id) {
        this.#id = id;
    }

    setCaption(newCaption) {
        if (typeof newCaption === 'string') {
            this.#caption = newCaption;
            return new Result();
        }
        else {
            return new Result('Figure.setCaption requires string argument');
        }
    }

    getCaption() {
        return this.#caption;
    }
}


class FigureManager {
    #repository = [];
    #index = 0;
    #selection = [];
    SVGTag = '';

    create() {
        return null;
    }

    select(cursor) {
        return null;
    }

    unselect(cursor) {
        return null;
    }

    deleteSelected() {
        return null;
    }
}

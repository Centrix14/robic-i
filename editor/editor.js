class Result {
    #errors = [];
    static Defaults = Object.freeze({
	    TestError: 'just a test error'
    });

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
	        let r = new Result();
	        r.addError('Point.serialize requires SVGElement as argument');
	        return r;
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
            let r = new Result();
            r.addError('Figure.setCaption requires string argument');
            return r;
        }
    }

    getCaption() {
        return this.#caption;
    }
}

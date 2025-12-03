class Relation {
    static Type = Object.freeze({
	    Independance: 'Independance',
	    Compatibility: 'Compatibility',
	    Incompatibility: 'Incompatibility'
    });
}

class ElementRole {
    #roles = new Map();
    #index = 0;

    getId(name) {
        for (let pair of this.#roles.entries()) {
            if (pair[1] == name) return pair[0];
        }

        return null;
    }

    getName(id) {
        return this.#roles.get(id);
    }

    getAll() {
        return this.#roles.values();
    }

    create(name) {
        if (this.getId(name)) {
            return null;
        }
        else {
            this.#roles.set(this.#index, name);
            return this.#index++;
        }
    }

    delete(id) {
        this.#roles.delete(id);
    }
}

class Component {
    _designation = "";
    _name = "";
    _description = "";
    _relationType = Relation.Type.Independance;

    constructor(designation, name="") {
	    this._designation = designation;
        this._name = name;
    }

    get name() {
        return this._name;
    }

    set name(newName) {
        this._name = newName;
    }

    static copy(source, destination) {
        for (let property in source) {
            destination[property] = source[property];
        }
    }

    clone() {
        let destination = new Component(this._designation, this._name);
        Component.copy(this, destination);
        return destination;
    }
}

class Property extends Component {
    #possibleValues = [];
    #referenceValue = null;
    #actualValue = null;

    clone() {
        let destination = new Property(this._designation, this._name);

        destination.#possibleValues = this.#possibleValues;
        destination.#referenceValue = this.#referenceValue;
        destination.#actualValue = this.#actualValue;

        return destination;
    }
}

class Element extends Component {
    static Type = Object.freeze({
        Input: 'Input',
        Output: 'Output',
        Doer: 'Doer',
        Mean: 'Mean'
    });
    
    #subelements = [];
    #properties = [];
    #elementType = Element.Type.Input;

    constructor(designation, name="", elementType=Element.Type.Input) {
        super(designation, name);
        this.#elementType = elementType;
    }

    clone() {
        let destination = new Element(this._designation, this._name, this.#elementType);

        destination.#properties = [];
        for (property of this.#properties) {
            destination.#properties.push(property.clone());
        }
    }
}

class Process extends Component {
    #iteration = 0;
    #isHiding = 0;
    #subprocesses = [];
    #elements = [];

    get iteration() {
        return this.#iteration;
    }

    clone() {
        let destination = new Process(this._designation, this._name);
        
        destination.#iteration = this.#iteration;
        destination.#isHiding = this.#isHiding;
        destination.#subprocesses = structuredClone(this.#subprocesses);
        destination.#elements = structuredClone(this.#elements);

        return destination;
    }
}

class ComponentManager {
    #repository = new Map();

    // this ugly-looking switch is required
    static designate(componentClass, index) {
        switch (componentClass) {
        case Process:
            return 'П ' + index.toString();
            break;
        case Element:
            return 'Э ' + index.toString();
            break;
        case Property:
            return 'С ' + index.toString();
            break;
        default:
            return index.toString();
        }
    }

    get(designation) {
        return this.#repository.get(designation);
    }

    getByName(name) {
        for (let component in this.#repository.values()) {
            if (component.name === name)
                return component;
        }

        return null;
    }

    countComponents(componentClass) {
        let result = 0;
        
        for (let component of this.#repository.values()) {
            if (component instanceof componentClass) result++;
        }

        return result;
    }

    createProcess(parent=0, name="") {
        let number = this.countComponents(Process);
        let designation = ComponentManager.designate(Process, number);

        let process = new Process(designation, name);
        this.#repository.set(designation, process);
        
        return designation;
    }

    createElement(parent=0, name="", elementType=Element.Type.Input) {
        let number = this.countComponents(Element);
        let designation = ComponentManager.designate(Element,number);
        
        let element = new Element(designation, name, elementType);
        this.#repository.set(designation, element);
        
        return designation;
    }

    createProperty(parent=0, name="") {
        let number = this.countComponents(Property);
        let designation = ComponentManager.designate(Property, number);
        
        let property = new Property(designation, name);
        this.#repository.set(designation, property);
        
        return designation;
    }

    deleteComponent(designation) {
        this.#repository.delete(designation);
    }

}

class Validator {
    #componentManager = null;
    #ruleSet = null;

    constructor(ruleSet) {
	    this._ruleSet = ruleSet;
	    this._componentManager = new ComponentManager();
    }
}

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

        return undefined;
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
    description = "";
    _relationType = Relation.Type.Independance;
    _content = new Set();

    constructor(designation, name="") {
	    this._designation = designation;
        this._name = name;
    }

    get designation() {
        return this._designation;
    }

    get name() {
        return this._name;
    }

    set name(newName) {
        this._name = newName;
    }

    get relationType() {
        this._relationType;
    }

    set relationType(newType) {
        this._relationType = newType;
    }

    getNested() {
        return Array.from(this._content);
    }

    addNested(component) {
        this._content.add(component.designation);
    }

    deleteNested(designation) {
        this._content.delete(designation);
    }
}

class Property extends Component {
    #possibleValues = new Map();
    #index = 0;
    #referenceValue = 0;
    #actualValue = 0;

    getPossibleValue(id) {
        return this.#possibleValues.get(id);
    }

    getPossibleValueByValue(value) {
        for (let pair of this.#possibleValues.entries()) {
            if (pair[1] === value) return pair[0];
        }

        return undefined;
    }

    getPossibleValues() {
        return this.#possibleValues.values();
    }

    get referenceValue() {
        return this.#referenceValue;
    }

    set referenceValue(id) {
        this.#referenceValue = id;
    }

    get actualValue() {
        return this.#actualValue;
    }

    set actualValue(id) {
        this.#actualValue = id;
    }

    addPossibleValue(value) {
        if (this.getPossibleValueByValue(value)) {
            return null;
        }
        else {
            this.#possibleValues.set(this.#index, value);
            return this.#index++;
        }
    }

    deletePossibleValue(id) {
        this.#possibleValues.delete(id);
    }

    isComplete() {
        return this.#referenceValue === this.#actualValue;
    }
}

class Element extends Component {
    #context = new Set();

    getContexts() {
        return Array.from(this.#context);
    }

    getContextsByDesig(designation) {
        for (let entry of this.#context.values()) {
            if (entry[0] == designation) return entry;
        }

        return undefined;
    }

    getContextsByRole(role) {
        for (let entry of this.#context.values()) {
            if (entry[1] == role) return entry;
        }

        return undefined;
    }

    addContext(designation, role) {
        this.#context.add([designation, role]);
    }

    deleteContext(designation, role) {
        // for because Map.delete() uses references, not values
        for (let entry of this.#context.values()) {
            if (entry[0] === designation && entry[1] === role)
                this.#context.delete(entry);
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

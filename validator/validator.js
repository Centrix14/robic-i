class Relation {
    static Type = Object.freeze({
	    Independance: 'Independance',
	    Compatibility: 'Compatibility',
	    Incompatibility: 'Incompatibility'
    });
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
}

class Property extends Component {
    #possibleValues = [];
    #referenceValue = null;
    #actualValue = null;
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
}

class Process extends Component {
    #iteration = 0;
    #isHiding = 0;
    #subprocesses = [];
    #elements = [];
}

class ComponentManager {
    #repository = new Map();

    copyRepository(componentClass=Component) {
        let copy = new Map();

        for (let component of this.#repository) {
            if (component[1] instanceof componentClass)
                copy.set(component[0], structuredClone(component[1]));
        }

        return copy;
    }

    countComponents(componentClass=Component) {
        return this.copyRepository(componentClass).size;
    }
    
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

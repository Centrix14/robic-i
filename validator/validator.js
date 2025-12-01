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

// todo: сделать единый репозиторий, воспользоваться полиморфизмом и убрать switch
class ComponentManager {
    #processRepository = [];
    #elementRepository = [];
    #propertyRepository = [];

    // это не трогать, так быть и должно!
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
            return "";
        }
    }

    countComponents(componentClass) {
        switch (componentClass) {
        case Process:
            return this.#processRepository.length;
            break;
        case Element:
            return this.#elementRepository.length;
            break;
        case Property:
            return this.#propertyRepository.length;
            break;
        default:
            return -1;
        }
    }
    
    createProcess(parent=0, name="") {
        let designation = ComponentManager.designate();
        let process = new Process(designation, name);
        this.#processRepository.push(process);
        
        return this.#processRepository.length - 1;
    }

    createElement(parent=0, name="", elementType=Element.Type.Input) {
        let designation = ComponentManager.designate();
        let element = new Element(designation, name, elementType);
        this.#elementRepository.push(element);
        
        return this.#elementRepository.length - 1;
    }

    createProperty(parent=0, name="") {
        let designation = ComponentManager.designate();
        let property = new Property(designation, name);
        this.#propertyRepository.push(property);
        
        return this.#propertyRepository.length - 1;
    }

    deleteComponent(componentClass, index) {
        let repository = null;
        
        switch (componentClass) {
        case Process:
            repository = this.#processRepository;
            break;
        case Element:
            repository = this.#elementRepository;
            break;
        case Property:
            repository = this.#propertyRepository;
            break;
        default:
            return false;
        }

        repository.splice(index, 1);
        return true;
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

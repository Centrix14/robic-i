class ErrorType {
    static Void = 'Void'
    static SubnodeNotFound = 'Subnode not found'
    static InconsistentNodeTree = 'Inconsistent node tree'
    static ImpossibleSelectCondition = 'Impossible select condition'
    static MapDeleteError = 'Map delete error'
    static InvalidArguments = 'Invalid arguments'
    static AttemptToConnectNeighbours = 'Attempt to connect neighbours'
    static AttemptToConnectRelatives = 'Attempt to connect relatives'
    static NOP = 'No operations performed'
}

class Result {
    constructor(note='', content=[]) {
        this.note = note;
        this._store = new Map(content);
    }

    get isEmpty() { return true; }
    get isOk() { return false; }
    get isFail() { return false; }

    store() {
        return this._store.entries().toArray();
    }

    set(key, value) {
        this._store.set(key, value);
    }

    get(key) {
        return this._store.get(key);
    }
}

class Success extends Result {
    constructor(content=[]) {
        super('', content);
    }

    get isEmpty() { return false; }
    get isOk() { return true; }
    get isFail() { return false; }
}

class Fail extends Result {
    constructor(errorType=ErrorType.Void, content=[]) {
        super(errorType, content);
        this._type = errorType;
    }

    get isEmpty() { return false; }
    get isOk() { return false; }
    get isFail() { return true; }
}

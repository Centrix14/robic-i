// Nothig about nodejs framework here!

class ErrorType {
    static Void = 'Void'
    static SubnodeNotFound = 'Subnode not found'
    static InconsistentNodeTree = 'Inconsistent node tree'
    static ImpossibleSelectCondition = 'Impossible select condition'
    static MapDeleteError = 'Map delete error'
    static InvalidArguments = 'Invalid arguments'
}

class Result {
    constructor(type=ErrorType.Void, description='') {
        this._type = type;
        this.description = description;
    }

    isOk() {
        return this._type === ErrorType.Void;
    }

    isFail() {
        return !this.isOk();
    }
}

class Identifier {
    constructor(seed) {
        this._val = seed;
    }

    next() {
        return this._val++;
    }

    isValid(id) {
        return typeof(id) === 'number';
    }

    isUsed(id) {
        return id < this._val;
    }

    isFree(id) {
        return !this.isUsed(id);
    }
}

class Relation {
    
}

class Accordance {
    
}

class Deviation {
    
}

class Node {
    constructor(id, definition) {
        this._id = id;
        this._relation = definition?.relation ?? new Relation();
        this._subnodes = definition?.subnodes ?? new Map();
        this._accordance = definition?.accordance ?? new Accordance();
        this._deviation = definition?.deviation ?? new Deviation();
    }

    get id() { return this._id; }

    isEmpty() { return false; }
    isPresent() { return true; }

    subnodes(rootNode) {
        const root = rootNode ?? this;
        let sample = [];

        for (let container of this._subnodes.values()) {
            const node = container.node;

            if (container._logicalOwn === SubnodeOwnership.Here) {
                let subnode;
                
                switch (container._physicalOwn) {
                case SubnodeOwnership.Here:
                    subnode = node;
                    break;

                case SubnodeOwnership.Supnode:
                    const subnodeContainer = root._subnodes.get(container.id);
                    subnode = subnodeContainer.node;
                    break;

                case SubnodeOwnership.Subnode:
                    for (let element of sample) {
                        if (element._subnodes.has(container.id)) {
                            subnode = element._subnodes.get(container.id).node;
                            break;
                        }
                    }
                    break;
                }

                sample.push(subnode);
            }
        }

        return sample;
    }

    selectNodes(condition, recursive, container=null, parent=null) {
        const sample = [];

        if (condition(this, container, parent))
            sample.push(this);

        if (recursive) {
            for (let container of this._subnodes.values()) {
                const node = container.node; // !!!
                if (node) {
                    const inner = node.selectNodes(condition,
                                                   recursive,
                                                   container,
                                                   this);
                    sample.push(...inner.sample);
                }
            }
        }

        const result = new Result();
        result.sample = sample;
        return result;
    }

    getNodeById(id, recursive=true) {
        return this
            .selectNodes((n, c, p) => (n.id === id), recursive)
            .sample[0];
    }

    addSubnode(node, definition, id) {
        const nodeId = node?.id ?? id;
        if (!nodeId)
            return new Result(ErrorType.InvalidArguments,
                              `addSubnode requires presence of a node or id argument`);
        
        const container = new Subnode(nodeId, node, definition);
        this._subnodes.set(nodeId, container);

        const result = new Result();
        result.id = nodeId;
    }

    removeSubnode(id) {
        const container = this._subnodes.get(id);
        
        if (!container)
            return new Result(ErrorType.SubnodeNotFound,
                              `Subnode id:${id} not found`);

        let result;
        const removed = this._subnodes.delete(id);
        if (removed)
            result = new Result();
        else
            result = new Result(ErrorType.MapDeleteError,
                                `Failed to delete entry id:${id}`);

        result.node = container.node;
        return result;
    }

    injectSubnode(parentId, node) {
        let parent;

        if (this.id === parentId)
            parent = this;
        else {
            const result = this.getSubnodeById(parentId, true);
            if (result.isOk())
                parent = result.node;
            else
                return result;
        }

        const subnode = new Subnode(IDENTIFIER.next(), node,
                                   {
                                        logicalOwn: SubnodeOwnership.Here,
                                        physicalOwn: SubnodeOwnership.Here,
                                        role: SubnodeRole.Void
                                   });
        
        parent._subnodes.set(subnode.id, subnode);

        return new Result();
    }
}

class EmptyNode {
    constructor(id, definition) {
        this._id = NaN;
    }
    
    isEmpty() { return true; }
    isPresent() { return false; }

    selectNodes() {
        const result = new Result();
        result.sample = [];
        return result;
    }
}

class SubnodeOwnership {
    static Here = 'Here'
    static Subnode = 'Subnode'
    static Supnode = 'Supnode'
}

class SubnodeRole {
    static Void = ''
}

class Subnode {
    constructor(id, node, definition) {
        this._id = id; // this is an id of node, not a special id for subnode
        this._node = node;

        this._logicalOwn = definition?.logicalOwn ?? SubnodeOwnership.Here;
        this._physicalOwn = definition?.physicalOwn ?? SubnodeOwnership.Here;
        this._role = definition?.role ?? SubnodeRole.Void;
    }

    get id() { return this._id; }
    get node() { return this._node; }
}

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
    get subnodes() {
        return Array.from(this._subnodes.values());
    }

    isEmpty() { return false; }
    isPresent() { return true; }

    selectNodesAll(condition, recursive) {
        const result = this._selectNodesAll(condition, recursive);

        if (condition(this, null, null))
            result.sample.unshift(this);

        return result;
    }

    _selectNodesAll(condition, recursive) {
        const sample = [];

        for (let container of this._subnodes.values()) {
            const node = container.node;

            if (!node) continue; // ignore inderect nodes

            if (condition(node, container, this))
                sample.push(node);
            
            if (recursive) {
                const subnodeSelection =
                      node._selectNodesAll(condition, recursive);
                if (subnodeSelection.isOk())
                    sample.push(...subnodeSelection.sample);
                else
                    return subnodeSelection;
            }
        }

        const result = new Result();
        result.sample = sample;
        return result;
    }

    selectNodes(condition, n, recursive) {
        let result;
        
        if (condition(this, null, null)) {
            result = this._selectNodes(condition, n-1, recursive);
            result.sample.unshift(this);
        }
        else {
            result = this._selectNodes(condition, n, recursive);
        }

        return result;
    }
    
    _selectNodes(condition, n, recursive) {
        const sample = [];

        for (let container of this._subnodes.values()) {
            const node = container.node;
            if (!node) continue;
            
            if (condition(node, container, this))
                sample.push(node);
            
            if (sample.length === n) {
                const result = new Result();
                result.sample = sample;
                return result;
            }
        }

        if (recursive) {
            let shortage = n - sample.length;
            
            for (let container of this._subnodes.values()) {
                const node = container.node;
                if (!node) continue;
                
                let subnodeSelection =
                    node._selectNodes(condition, shortage, recursive);
                if (subnodeSelection.isOk()) {
                    sample.push(...subnodeSelection.sample);
                    shortage = n - sample.length;
                }

                if (sample.length === n) {
                    const result = new Result();
                    result.sample = sample;
                    return result;
                }
            }
        }

        let result = new Result(ErrorType.ImpossibleSelectCondition,
                                `Select condition is impossible to satisfy`);
        result.sample = sample;
        return result;
    }

    getNodeById(id, recursive) {
        return this
            .selectNodes((n, c, p) => (n.id === id), 1, recursive)
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

    createSubnode(parentId, definition) {
        const nodeId = IDENTIFIER.next();
        const node = new Node(nodeId);
        const subnode = new Subnode(IDENTIFIER.next(), node,
                                    {
                                        logicalOwn: SubnodeOwnership.Here,
                                        physicalOwn: SubnodeOwnership.Here,
                                        role: SubnodeRole.Void
                                    });

        let target;
        if (parentId === this._id)
            target = this;
        else {
            const result = this.getSubnodeById(parentId, true);
            if (result.isFail())
                return result;
            else
                target = result.node;
        }
        
        target._subnodes.set(nodeId, node);
        
        let result = new Result();
        result.node = node;
        
        return result;
    }

    removeSubnode(id) {
        let parent;
        
        if (this._subnodes.has(id)) {
            parent = this;
        }
        else {
            const result = this.selectSubnodes(
                (node, _) => (node._subnodes.has(id)),
                1,
                true
            );

            if (result.isOk())
                parent = result.sample[0];
            else
                return result;
        }

        parent._subnodes.delete(id);
        return new Result();
    }
}

class EmptyNode {
    constructor(id, definition) {
        this._id = NaN;
    }
    
    isEmpty() { return true; }
    isPresent() { return false; }
}

class SubnodeOwnership {
    static Here = ''
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

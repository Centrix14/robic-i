// Nothig about nodejs framework here!

class ErrorType {
    static Void = 'Void'
    static SubnodeNotFound = 'Subnode not found'
    static InconsistentNodeTree = 'Inconsistent node tree'
    static ImpossibleSelectCondition = 'Impossible select condition'
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
    get subnodes() { return this._subnodes.values(); }

    isEmpty() { return false; }
    isPresent() { return true; }

    selectAllSubnodes(condition, recursive) {
        const parent = this;
        const sample = [];

        this._subnodes.forEach(function(container) {
            const node = container.node;
            
            if (condition(parent, node))
                sample.push(node);
            
            if (recursive) {
                const subnodeSelection = node.selectAllSubnodes(condition, recursive);
                if (subnodeSelection.isOk())
                    sample.push(...subnodeSelection.sample);
                else
                    return subnodeSelection;
            }
        });

        const result = new Result();
        result.sample = sample;
        return result;
    }

    selectSubnodes(condition, n, recursive) {
        const sample = [];

        for (let container of this._subnodes.values()) {
            const node = container.node;
            
            if (condition(this, node))
                sample.push(node);
            
            if (sample.length === n) {
                const result = new Result();
                result.sample = sample;
                return result;
            }
        }

        if (recursive) {
            for (let container of this._subnodes.values()) {
                const node = container.node;
                
                let subnodeSelection =
                    node.selectSubnodes(condition, n, recursive);
                if (subnodeSelection.isOk())
                    sample.push(...subnodeSelection.sample);

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

    getSubnodeById(id, recursive) {
        const node = this._subnodes.get(id);
        if (node) {
            const result = new Result();
            result.node = node;
            return result;
        }

        if (recursive) {
            for (let subnode of this._subnodes.values()) {
                const node = subnode.getSubnodeById(id, recursive);
                if (node) {
                    const result = new Result();
                    result.node = node;
                    return result;
                }
            }
        }

        return new Result(ErrorType.SubnodeNotFound,
                          `Subnode id:${id} not found`);
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
        this._id = id;
        this._node = node;

        this._logicalOwn = definition?.logicalOwn ?? SubnodeOwnership.Here;
        this._physicalOwn = definition?.physicalOwn ?? SubnodeOwnership.Here;
        this._role = definition?.role ?? SubnodeRole.Void;
    }

    get id() { return this._id; }
    get node() { return this._node; }
}

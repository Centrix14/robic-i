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
        const result = [];

        this._subnodes.forEach(function(node) {
            if (condition(this, node))
                result.push(node);
            if (recursive)
                result.push(...node.selectSubnodes(condition, recursive));
        });

        return result;
    }

    selectSubnodes(condition, n, recursive) {
        const sample = [];

        for (let node of this._subnodes.values()) {
            if (condition(this, node))
                sample.push(node);
            
            if (sample.length === n)
                return sample;
        }

        if (recursive) {
            for (let node of this._subnodes.values()) {
                let subnodeSample = node.selectSubnodes(condition, n, recursive);
                if (Array.isArray(subnodeSample) && subnodeSample.length > 0)
                    sample.push(...subnodeSample);

                if (sample.length === n)
                    return sample;
            }
        }

        let result = new Result(ErrorType.ImpossibleSelectCondition,
                                `Select condition is impossible to satisfy`);
        result.sample = sample;
        return result;
    }

    getSubnodeById(id, recursive) {
        const node = this._subnodes.get(id);
        if (node)
            return node;

        if (recursive) {
            for (let subnode of this._subnodes.values()) {
                const node = subnode.getSubnodeById(id, recursive);
                if (node)
                    return node;
            }
        }

        return new EmptyNode();
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
            const parent = this.getSubnodeById(parentId, true);
            if (parent.isEmpty())
                return new Result(ErrorType.SubnodeNotFound,
                                  `At node id:${this._id} no subnode id:${parentId}`);
            else
                target = parent;
        }
        
        target._subnodes.set(nodeId, node);
        
        let result = new Result();
        result.node = node;
        
        return result;
    }

    removeSubnode(id) {
        let parent;

        if (this.getSubnodeById(id, false).isPresent())
            parent = this;
        else {
            const parents = this.selectSubnodes(
                (node) => (node._subnodes.has(id)),
                true
            );
            
            if (parents.length === 0) {
                return new Result(ErrorType.SubnodeNotFound,
                                  `At node id:${this._id} no subnode id:${id}`);
            }
            else if (parents.length > 1) {
                return new Result(ErrorType.InconsistentNodeTree,
                                  `Node id:${this._id} is inconsistent`);
            }

            parent = parents[0];
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
    
}

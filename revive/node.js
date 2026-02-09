// Nothig about nodejs framework here!

class ErrorType {
    static Void = ''
    static SubnodeNotFound = ''
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

    isEmpty() { return false; }

    selectSubnodes(condition, recursive) {
        const result = [];

        this._subnodes.forEach(function(node) {
            if (condition(node))
                result.push(node);
            if (recursive)
                result.push(...node.selectSubnodes(condition, recursive));
        });

        return result;
    }

    getSubnode(condition, recursive) {
        const firstOne = this.selectSubnodes(condition, recursive)[0];
        return firstOne ?? new EmptyNode();
    }

    getSubnodeById(id, recursive) {
        const result = this._subnodes.get(id);
        if (result)
            return result;

        if (recursive) {
            for (let subnode of this._subnodes.values()) {
                const result = subnode.getSubnodeById(id, recursive);
                if (result)
                    return result;
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
        return new Result();
    }
}

class EmptyNode {
    constructor(id, definition) {
        this._id = NaN;
    }
    
    isEmpty() { return true; }
}

class SubnodeOwnership {
    static Here = ''
}

class SubnodeRole {
    static Void = ''
}

class Subnode {
    
}

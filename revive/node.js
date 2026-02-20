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

    isEmpty() { return false; }
    isPresent() { return true; }

    get id() { return this._id; }

    get relation() { return this._relation; }
    set relation(newRelation) { this._relation = newRelation; }

    get(id) {
        return this._subnodes.get(id).node ?? emptyNode;
    }

    has(id) {
        return this._subnodes.has(id);
    }

    isNeighbours(id1, id2) {
        return this.has(id1) && this.has(id2);
    }

    static isRelatives(parent, child) {
        if (parent.has(child.id)) {
            const container = parent._subnodes.get(child.id);
            return container.logicalOwn === SubnodeOwnership.Here;
        }
        else
            return false;
    }

    static isPhysicalRelatives(parent, child) {
        if (parent.has(child.id)) {
            const container = parent._subnodes.get(child.id);
            return container.physicalOwn === SubnodeOwnership.Here;
        }
        else
            return false;
    }

    forSubnodes(fun, thisArg) {
        for (let container of this._subnodes.values())
            fun.call(thisArg, container.node, container);
    }

    static _resolvePhysicalOwn(container, node, root) {
        switch (container.physicalOwn) {
        case SubnodeOwnership.Here:
            return node;

        case SubnodeOwnership.Supnode:
            return root.get(container.id);
            break;

        case SubnodeOwnership.Subnode:
            for (let subcontainer of root._subnodes.values()) {
                const subnode = subcontainer.node;
                if (subnode.has(container.id))
                    return subnode.get(container.id);
            }
        }
    }

    subnodes(rootNode) {
        const root = rootNode ?? this;
        let sample = [];

        this.forSubnodes(function(node, container) {
            if (container.logicalOwn === SubnodeOwnership.Here) {
                const subnode = Node._resolvePhysicalOwn(container, node, root);
                sample.push(subnode);
            }
        });

        return sample;
    }

    selectNodes(condition, recursive, container=null, parent=null) {
        const sample = [];

        if (condition(this, container, parent))
            sample.push(this);

        if (recursive) {
            this.forSubnodes(function(node, nodeContainer){
                const inner = node.selectNodes(condition, recursive,
                                               container, this);
                sample.push(...inner.sample);
            }, this);
        }

        const result = new Result();
        result.sample = sample;
        return result;
    }

    getNodeById(id, recursive=true) {
        const sample = this
              .selectNodes((n, c, p) => (n.id === id), recursive)
              .sample;
        return (sample.length === 0) ? emptyNode : sample[0];
    }

    addSubnode(node, definition, id) {
        const nodeId = node.isPresent() ? node.id : id;
        if (!nodeId)
            return new Result(ErrorType.InvalidArguments,
                              `addSubnode requires presence of a node or id argument`);
        
        const container = new Subnode(nodeId, node, definition);
        this._subnodes.set(nodeId, container);

        const result = new Result();
        result.id = nodeId;
        return result;
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

    injectNode(parentId, node) {
        const parent = this.getNodeById(parentId, true);

        if (parent.isEmpty()) {
            return new Result(ErrorType.SubnodeNotFound,
                              `Subnode id:${parentId} not found`);
        }

        parent.addSubnode(node, {
            logicalOwn: SubnodeOwnership.Here,
            physicalOwn: SubnodeOwnership.Here,
            role: SubnodeRole.Void
        });

        return new Result();
    }

    ejectNode(id) {
        const selectResult = this.selectNodes((n, c, p) => (n.has(id)), true);
        if (selectResult.isFail())
            return selectResult;

        const node = selectResult.sample[0] ?? emptyNode;
        if (node.isEmpty()) {
            return new Result(ErrorType.SubnodeNotFound,
                              `Subnode id:${id} not found`);
        }

        return node.removeSubnode(id);
    }

    isSharingPossible(subject, supplicant) {
        if (!this.has(supplicant.id))
            return false;

        const middleNode = this.selectNodes(
            (node, _, parent) => (node.has(subject.id) && parent === this),
            true
        );
        if (middleNode.sample.length === 0)
            return false;

        return middleNode.sample[0];
    }

    isDerivingPossible(subject, supplicant) {
        const middleNode = this.selectNodes(
            (node, _, parent) => (node.has(subject.id) && parent === supplicant),
            true
        );
        if (middleNode.sample.length === 0)
            return false;
        return middleNode.sample[0];
    }

    connectNodes(id1, id2) {
        const node1 = this.getNodeById(id1, true),
              node2 = this.getNodeById(id2, true);

        if (this.isNeighbours(id1, id2))
            return 'None';

        else if (Node.isRelatives(node1, node2))
            return 'None';
        else if (Node.isRelatives(node2, node1))
            return 'None';

        else if (Node.isPhysicalRelatives(node1, node2))
            return 'Connect';
        else if (Node.isPhysicalRelatives(node2, node1))
            return 'Connect';

        else if (this.isSharingPossible(node1, node2))
            return 'Sharing';
        else if (this.isSharingPossible(node2, node1))
            return 'Sharing';

        else if (this.isDerivingPossible(node1, node2))
            return 'Deriving';
        else if (this.isDerivingPossible(node2, node1))
            return 'Deriving';

        else
            return 'None';
    }
}

class EmptyNode {
    constructor() {
        this._id = NaN;
    }
    
    isEmpty() { return true; }
    isPresent() { return false; }

    get id() { return NaN; }

    get(id) {
        return new EmptyNode();
    }

    has() { return false; }

    forSubnodes() {}

    subnodes() { return []; }

    selectNodes() {
        const result = new Result();
        result.sample = [];
        return result;
    }

    getNodeById() { return new EmptyNode(); }

    addSubnode() {
        const result = new Result();
        result.id = NaN;
        return result;
    }

    removeSubnode() {
        const result = new Result();
        result.node = new EmptyNode();
        return result;
    }
}

const emptyNode = new EmptyNode();

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
        this._id = id;
        this._node = node;

        this._logicalOwn = definition?.logicalOwn ?? SubnodeOwnership.Here;
        this._physicalOwn = definition?.physicalOwn ?? SubnodeOwnership.Here;
        this._role = definition?.role ?? SubnodeRole.Void;
    }

    get id() { return this._id; }
    get node() { return this._node; }
    get logicalOwn() { return this._logicalOwn; }
    get physicalOwn() { return this._physicalOwn; }
    get role() { return this._role; }
}

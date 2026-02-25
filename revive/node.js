// Nothig about nodejs framework here!

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
                const inner = node
                      .selectNodes(condition, recursive, nodeContainer, this)
                      .get('sample');
                sample.push(...inner);
            }, this);
        }

        return new Success([['sample', sample]]);
    }

    getNodeById(id, recursive=true) {
        const sample = this
              .selectNodes((n, c, p) => (n.id === id), recursive)
              .get('sample');
        return (sample.length === 0) ? emptyNode : sample[0];
    }

    addSubnode(node, definition, id) {
        const nodeId = node.isPresent() ? node.id : id;
        if (!nodeId)
            return new Fail(ErrorType.InvalidArguments);
        
        const container = new Subnode(nodeId, node, definition);
        this._subnodes.set(nodeId, container);

        return new Success([['id', nodeId]]);
    }

    removeSubnode(id) {
        const container = this._subnodes.get(id);
        
        if (!container)
            return new Fail(ErrorType.SubnodeNotFound);

        let result;
        const removed = this._subnodes.delete(id);
        if (removed)
            result = new Success();
        else
            result = new Fail(ErrorType.MapDeleteError);

        result.set('node', container.node);
        return result;
    }

    injectNode(parentId, node, container=null) {
        const parent = this.getNodeById(parentId, true);

        if (parent.isEmpty()) {
            return new Result(ErrorType.SubnodeNotFound,
                              `Subnode id:${parentId} not found`);
        }

        const definition = container ?? {
            logicalOwn: SubnodeOwnership.Here,
            physicalOwn: SubnodeOwnership.Here,
            role: SubnodeRole.Void
        };
        parent.addSubnode(node, definition);

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

    isNeighbours(id1, id2) {
        return this.has(id1) && this.has(id2);
    }

    static isLogicalRelatives(parent, child) {
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

    _shareNode(subject, supplicant) {
        const root = this;

        const selectResult =
              this.selectNodes((n, c, p) => (n.has(subject.id)), true);
        if (selectResult.isFail())
            return selectResult;
        const subjectsParent = selectResult.sample[0];

        // 1) ejecting subject from it's parent
        let result1;

        result1 = root.ejectNode(subject.id);
        if (result1.isFail())
            return result1;

        // 2) injecting subject to root with proper ownership
        result1 = root.injectNode(root.id, subject, {
            logicalOwn: SubnodeOwnership.Subnode,
            physicalOwn: SubnodeOwnership.Here,
            role: SubnodeRole.Void
        });
        if (result1.isFail())
            return result1;

        // 3) create container definition or shared subnode
        const definition = {
            logicalOwn: SubnodeOwnership.Here,
            physicalOwn: SubnodeOwnership.Supnode
        };

        // 4) add link to shared node to subjects parent and supplicant
        let result4;

        result4 = subjectsParent.addSubnode(emptyNode, definition, subject.id);
        if (result4.isFail())
            return result4;

        result4 = supplicant.addSubnode(emptyNode, definition, subject.id);
        if (result4.isFail())
            return result4;

        return new Result();
    }

    _connectPhysicalRelatives(parent, child) {
        const container = parent._subnodes.get(child.id);
        container._logicalOwn = SubnodeOwnership.Here;
        return new Result();
    }

    _deriveNode(subject, supplicant) {
        supplicant.addSubnode(emptyNode, {
            logicalOwn: SubnodeOwnership.Here,
            physicalOwn: SubnodeOwnership.Subnode,
            role: SubnodeRole.Void
        }, subject.id);

        return new Result();
    }

    static _checkConnectionEdgeCases(thisArg, node1, node2) {
        if (node1 === emptyNode || node2 === emptyNode)
            return new Result(ErrorType.SubnodeNotFound);

        else if (thisArg.isNeighbours(node1.id, node2.id))
            return new Result(ErrorType.AttemptToConnectNeighbours);

        else if (Node.isLogicalRelatives(node1, node2))
            return new Result(ErrorType.AttemptToConnectRelatives);
        else if (Node.isLogicalRelatives(node2, node1))
            return new Result(ErrorType.AttemptToConnectRelatives);

        return new Result();
    }

    static _getOperands(thisArg, node1, node2) {
        if (Node.isPhysicalRelatives(node1, node2)) {
            return {
                type: 'physical relatives',
                list: [node1, node2]
            };
        }
        else if (Node.isPhysicalRelatives(node2, node1)) {
            return {
                type: 'physical relatives',
                list: [node2, node1]
            };
        }

        else if (thisArg.isSharingPossible(node1, node2)) {
            return {
                type: 'shared',
                list: [node1, node2]
            };
        }
        else if (thisArg.isSharingPossible(node2, node1)) { 
            return {
                type: 'shared',
                list: [node2, node1]
            };
        }

        else if (thisArg.isDerivingPossible(node1, node2)) {
            return {
                type: 'derived',
                list: [node1, node2]
            };
        }
        else if (thisArg.isDerivingPossible(node2, node1)) {
            return {
                type: 'derived',
                list: [node2, node1]
            };
        }

        return {type: 'none'};
    }

    connectNodes(id1, id2) {
        const node1 = this.getNodeById(id1, true),
              node2 = this.getNodeById(id2, true);

        const result = Node._checkConnectionEdgeCases(this, node1, node2);
        if (result.isFail())
            return result;

        const operands = Node._getOperands(this, node1, node2);

        switch (operands.type) {
        case 'physical relatives':
            return this._connectPhysicalRelatives.apply(this, operands.list);

        case 'shared':
            return this._shareNode.apply(this, operands.list);

        case 'derived':
            return this._deriveNode.apply(this, operands.list);

        case 'none':
            return new Result(ErrorType.NOP);
        }
    }

    disconnectNodes(id1, id2) {
        const node1 = this.getNodeById(id1, true),
              node2 = this.getNodeById(id2, true);

        const result = Node._checkConnectionEdgeCases(this, node1, node2);
        if (result.isFail())
            return result;

        const operands = Node._getOperands(this, node1, node2);

        switch (operands.type) {
        case 'physical relatives':
            return '';

        case 'shared':
            return '';

        case 'derived':
            return '';

        case 'none':
            return new Result(ErrorType.NOP);
        }
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
        return new Success([['sample', []]]);
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

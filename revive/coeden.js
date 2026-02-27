class NodeOwnership {
    static Here = 'Here'
    static Subnode = 'Subnode'
    static Supnode = 'Supnode'
}

class Node {
    constructor(id, definition) {
        this._id = id;
        this.data = {};

        this._subnodes = definition?.subnodes ?? new Map();

        this._logicalOwn = definition?.logicalOwn ?? NodeOwnership.Here;
        this._physicalOwn = definition?.physicalOwn ?? NodeOwnership.Here;
        this._isLink = definition?.isLink ?? false;
    }

    get isEmpty() { return false; }
    get isPresent() { return true; }

    get id() { return this._id; }

    get isLink() { return this._isLink; }
    get isReal() { return !this.isLink; }

    get logicalOwn() { return this._logicalOwn; }
    get physicalOwn() { return this._physicalOwn; }

    get(id) {
        return this._subnodes.get(id) ?? emptyNode;
    }

    has(id) {
        return this._subnodes.has(id);
    }

    forSubnodes(fun, thisArg) {
        for (let node of this._subnodes.values())
            fun.call(thisArg, node);
    }

    static _resolvePhysicalOwn(node, root) {
        switch (node.physicalOwn) {
        case NodeOwnership.Here:
            return node;

        case NodeOwnership.Supnode:
            return root.get(node.id);
            break;

        case NodeOwnership.Subnode:
            for (let subnode of root._subnodes.values()) {
                if (subnode.has(node.id))
                    return subnode.get(node.id);
            }
        }
    }

    subnodes(rootNode) {
        const root = rootNode ?? this;
        const Class = root.constructor;
        let sample = [];

        this.forSubnodes(function(node) {
            if (node.logicalOwn === NodeOwnership.Here) {
                const subnode = Class._resolvePhysicalOwn(node, root);
                sample.push(subnode);
            }
        });

        return sample;
    }

    selectNodes(condition, recursive, parent=null) {
        const sample = [];

        if (condition(this, parent))
            sample.push(this);

        if (recursive) {
            this.forSubnodes(function(node){
                const inner = node
                      .selectNodes(condition, recursive, this)
                      .get('sample');
                sample.push(...inner);
            }, this);
        }

        return new Success([['sample', sample]]);
    }

    getNodeById(id, recursive=true) {
        const sample = this
              .selectNodes((n, p) => (n.id === id), recursive)
              .get('sample');
        return (sample.length === 0) ? emptyNode : sample[0];
    }

    addSubnode(node) {
        this._subnodes.set(node.id, node);
    }

    createSubnode(id, definition=null) {
        const realDefinition = definition ?? {
            logicalOwn: NodeOwnership.Here,
            physicalOwn: NodeOwnership.Here
        };

        const node = new Node(id, realDefinition);
        this.addSubnode(node);

        return new Success([['id', id], ['node', node]]);
    }

    removeSubnode(id) {
        const node = this.get(id);
        if (node.isEmpty)
            return new Fail(ErrorType.SubnodeNotFound);

        const removed = this._subnodes.delete(id);
        if (removed)
            return new Success([['node', node]]);
        else
            return new Fail(ErrorType.MapDeleteError);
    }

    injectNode(parentId, node) {
        const parent = this.getNodeById(parentId, true);
        if (parent.isEmpty)
            return new Fail(ErrorType.SubnodeNotFound);

        parent.addSubnode(node);
        return new Success();
    }

    ejectNode(id) {
        const selectResult = this.selectNodes((n, _) => (n.has(id)), true);
        if (selectResult.isFail)
            return selectResult;

        const parent = selectResult.get('sample')[0] ?? emptyNode;
        if (parent.isEmpty)
            return new Fail(ErrorType.SubnodeNotFound);

        return parent.removeSubnode(id);
    }

    isLogicalNeighbours(id1, id2) {
        if (this.has(id1) && this.has(id2)) {
            const node1 = this._subnodes.get(id1),
                  node2 = this._subnodes.get(id2);
            return node1.logicalOwn === NodeOwnership.Here &&
                node2.logicalOwn === NodeOwnership.Here;
        }
        else
            return false;
    }

    isPhysicalNeighbours(id1, id2) {
        if (this.has(id1) && this.has(id2)) {
            const node1 = this._subnodes.get(id1),
                  node2 = this._subnodes.get(id2);
            return node1.physicalOwn === NodeOwnership.Here &&
                node2.physicalOwn === NodeOwnership.Here;
        }
        else
            return false;
    }

    static isLogicalRelatives(parent, child) {
        if (parent.has(child.id)) {
            const node = parent.get(child.id);
            return node.logicalOwn === NodeOwnership.Here;
        }
        else
            return false;
    }

    static isPhysicalRelatives(parent, child) {
        if (parent.has(child.id)) {
            const node = parent.get(child.id);
            return node.physicalOwn === NodeOwnership.Here;
        }
        else
            return false;
    }

    isLinkToShared(link, source) {
        if (link.id !== source.id) return false;
        if (link._subnodes.size > 0) return false;

        const Class = link.constructor;

        const result = this.selectNodes(
            (n, _) => (Class.isPhysicalRelatives(n, source)),
            true
        );

        if (result.get('sample').length === 0) return false;

        const sourceKeeper = result.get('sample')[0];
        const linksParent = sourceKeeper.selectNodes(
            (n, _) => (Class.isLogicalRelatives(n, link) &&
                       !Class.isPhysicalRelatives(n, link)),
            true
        );

        return linksParent.get('sample').length > 0;
    }

    isShared(node) {
        if (node.physicalOwn !== NodeOwnership.Here) return false;

        // obvious case of shared node
        if (node.logicalOwn === NodeOwnership.Subnode) return true;

        const root = this;
        const result = root.selectNodes(
            (n, _) => (root.isLinkToShared(n, node)),
            true
        );

        return result.get('sample').length > 0;
    }

    isLinkToDerived(link, source) {
        if (link.id !== source.id) return false;
        if (link._subnodes.size > 0) return false;

        if (link.logicalOwn === NodeOwnership.Here &&
            link.physicalOwn === NodeOwnership.Subnode) {

            const root = this;
            const Class = root.constructor;
            const result = root.selectNodes(
                (n, _) => (Class.isLogicalRelatives(n, source) &&
                           Class.isPhysicalRelatives(n, source)),
                true
            );
            return result.get('sample').length > 0;
        }

        return false;
    }


    isDerived(node) {
        if (node.logicalOwn !== NodeOwnership.Here ||
            node.physicalOwn !== NodeOwnership.Here)
            return false;

        const root = this;
        const result = root.selectNodes(
            (n, _) => (root.isLinkToDerived(n, node)),
            true
        );

        return result.get('sample').length > 0;
    }

    isSharingPossible(subject, supplicant) {
        if (!this.has(supplicant.id))
            return false;

        const result = this.selectNodes(
            (node, parent) => (node.has(subject.id) && parent === this),
            true
        );

        const middleNode = result.get('sample');
        if (middleNode.length === 0)
            return false;

        return middleNode[0];
    }

    isDerivingPossible(subject, supplicant) {
        const result = this.selectNodes(
            (node, parent) => (node.has(subject.id) && parent === supplicant),
            true
        );

        const middleNode = result.get('sample');
        if (middleNode.length === 0)
            return false;
        return middleNode[0];
    }

    _shareNode(subject, supplicant) {
        const root = this;

        const selectResult = this.selectNodes(
            (n, p) => (n.has(subject.id)),
            true
        );
        if (selectResult.isFail)
            return selectResult;

        const subjectsParent = selectResult.get('sample')[0];

        // 1) ejecting subject from it's parent
        let result1;

        result1 = root.ejectNode(subject.id);
        if (result1.isFail)
            return result1;

        // 2.1) reset ownership parameters
        subject._logicalOwn = NodeOwnership.Subnode;
        subject._physicalOwn = NodeOwnership.Here;

        // 2.2) injecting subject to root with proper ownership
        result1 = root.injectNode(root.id, subject);
        if (result1.isFail)
            return result1;

        // 3) create definition for link to shared node
        const definition = {
            logicalOwn: NodeOwnership.Here,
            physicalOwn: NodeOwnership.Supnode
        };

        // 4) add link to subject's parent and supplicant
        let result4;

        result4 = subjectsParent.createSubnode(subject.id, definition);
        if (result4.isFail)
            return result4;

        result4 = supplicant.createSubnode(subject.id, definition);
        if (result4.isFail)
            return result4;

        return new Success();
    }

    _connectPhysicalRelatives(parent, child) {
        const node = parent._subnodes.get(child.id);
        node._logicalOwn = NodeOwnership.Here;

        return new Success();
    }

    _deriveNode(subject, supplicant) {
        supplicant.createSubnode(subject.id, {
            logicalOwn: NodeOwnership.Here,
            physicalOwn: NodeOwnership.Subnode
        });

        return new Success();
    }

    static _checkConnectionEdgeCases(thisArg, node1, node2) {
        if (node1 === emptyNode || node2 === emptyNode)
            return new Fail(ErrorType.SubnodeNotFound);

        else if (thisArg.isPhysicalNeighbours(node1.id, node2.id))
            return new Fail(ErrorType.AttemptToConnectNeighbours);

        else if (Node.isLogicalRelatives(node1, node2))
            return new Fail(ErrorType.AttemptToConnectRelatives);
        else if (Node.isLogicalRelatives(node2, node1))
            return new Fail(ErrorType.AttemptToConnectRelatives);

        return new Success();
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
        if (result.isFail)
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
            return new Result();
        }
    }

    disconnectNodes(id1, id2) {
        const node1 = this.getNodeById(id1, true),
              node2 = this.getNodeById(id2, true);

        const result = Node._checkConnectionEdgeCases(this, node1, node2);
        if (result.isFail)
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
            return new Result();
        }
    }
}

class EmptyNode {
    constructor() {
        this._id = NaN;
    }
    
    get isEmpty() { return true; }
    get isPresent() { return false; }

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
        return new Result([['id', NaN]]);
    }

    createSubnode() {
        return new Success([['id', NaN], ['node', new EmptyNode()]]);
    }

    removeSubnode() {
        return new Result([['node', new EmptyNode()]]);
    }

    injectNode(parentId, node) {
        return new Result();
    }

    ejectNode(id) {
        return this.removeSubnode();
    }

    isLogicalNeighbours() { return false; }
    isPhysicalNeighbours(id1, id2) { return false; }
    static isLogicalRelatives(parent, child) { return false; }
    static isPhysicalRelatives(parent, child) { return false; }

    isLinkToShared(link, source) { return false; }
    isShared(node) { return false; }
    isLinkToDerived(link, source) { return false; }
    isDerived(node) { return false; }
}

const emptyNode = new EmptyNode();

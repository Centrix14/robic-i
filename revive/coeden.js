class NodeOwnership {
    static Here = 'Here'
    static Subnode = 'Subnode'
    static Supnode = 'Supnode'
}

class Node {
    constructor(id, definition) {
        this._id = id;
        this.data = definition?.data ?? {};

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

    static _resolveLink(node, root) {
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

            return emptyNode;
        }
    }

    subnodes(rootNode) {
        const root = rootNode ?? this;
        const Class = root.constructor;
        let sample = [];

        this.forSubnodes(function(node) {
            if (node.logicalOwn === NodeOwnership.Here) {
                const subnode = Class._resolveLink(node, root);
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
              .selectNodes((n, _) => (n.id === id), recursive)
              .get('sample');
        return (sample.length === 0) ? emptyNode : sample[0];
    }

    addSubnode(node) {
        if (this.isReal) {
            this._subnodes.set(node.id, node);
            return new Success();
        }
        else
            return new Fail(ErrorType.AttemptToAddNodeToLink);
    }

    createSubnode(id, definition=null) {
        const realDefinition = definition ?? {
            logicalOwn: NodeOwnership.Here,
            physicalOwn: NodeOwnership.Here
        };

        const node = new Node(id, realDefinition);
        const result = this.addSubnode(node);
        if (result.isOk)
            return new Success([['id', id], ['node', node]]);
        else
            return result;
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
        if (link.isReal) return false; // if link is not a link
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
        if (node.isLink) return false;
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
        if (link.isReal) return false; // if link is not a link
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
        if (node.isLink) return false;
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

    isAdoptionPossible(subject, supplicant) {
        return this.isShared(subject) && supplicant.isReal;
    }

    isSharingPossible(subject, supplicant) {
        if (subject.isLink || supplicant.isLink) return false;

        const root = this;
        const Class = subject.constructor;

        if (!Class.isLogicalRelatives(root, supplicant) ||
            !Class.isPhysicalRelatives(root, supplicant))
            return false;

        const result = root.selectNodes(
            (node, parent) => (Class.isLogicalRelatives(node, subject) &&
                               Class.isPhysicalRelatives(node, subject) &&
                               parent === root),
            true
        );

        const middleNode = result.get('sample')[0] ?? emptyNode;
        return middleNode.isPresent;
    }

    isDerivingPossible(subject, supplicant) {
        const root = this;
        const Class = subject.constructor;

        const result = root.selectNodes(
            (node, parent) => (Class.isLogicalRelatives(node, subject) &&
                               Class.isPhysicalRelatives(node, subject) &&
                               parent === supplicant),
            true
        );

        const middleNode = result.get('sample')[0] ?? emptyNode;
        return middleNode.isPresent;
    }

    static _classifyConnectionCase(root, node1, node2) {
        // Case 1: adopt node
        if (root.isAdoptionPossible(node1, node2))
            return {type: 'adopt', list: [node1, node2]};
        if (root.isAdoptionPossible(node2, node1))
            return {type: 'adopt', list: [node2, node1]};

        // Case 2: share node
        if (root.isSharingPossible(node1, node2))
            return {type: 'share', list: [node1, node2]};
        if (root.isSharingPossible(node2, node1))
            return {type: 'share', list: [node2, node1]};
        
        // Case 3: derive node
        if (root.isDerivingPossible(node1, node2))
            return {type: 'derive', list: [node1, node2]};
        if (root.isDerivingPossible(node2, node1))
            return {type: 'derive', list: [node2, node1]};
        
        // All other cases are wrong
        return {type: 'fail'};
    }

    _adoptNode(child, parent) {
        child._logicalOwn = NodeOwnership.Here;
        return new Success();
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

    _deriveNode(subject, supplicant) {
        supplicant.createSubnode(subject.id, {
            logicalOwn: NodeOwnership.Here,
            physicalOwn: NodeOwnership.Subnode
        });

        return new Success();
    }

    connectNodes(arg1, arg2) {
        const node1 = arg1.isPresent ? arg1 : this.getNodeById(arg1, true),
              node2 = arg2.isPresent ? arg2 : this.getNodeById(arg2, true);

        const connCase = Node._classifyConnectionCase(this, node1, node2);

        switch (connCase.type) {
        case 'adopt':
            return this._adoptNode.apply(this, connCase.list);

        case 'share':
            return this._shareNode.apply(this, connCase.list);

        case 'derive':
            return this._deriveNode.apply(this, connCase.list);

        case 'fail':
            return new Fail(ErrorType.InvalidConnectRequest);
        }
    }

    isUnadoptionPossible(subject, supplicant) {
        const Class = subject.constructor;
        const root = this;

        return Class.isLogicalRelatives(supplicant, subject) &&
            Class.isPhysicalRelatives(supplicant, subject) &&
            root.isShared(subject) &&
            supplicant.isReal;
    }

    isUnsharingPossible(subject, supplicant) {
        const Class = subject.constructor;
        const root = this;

        const source = Class._resolveLink(subject, root);
        return supplicant.isReal && root.isLinkToShared(subject, source);
    }

    isUnderivingPossible(subject, supplicant) {
        if (subject.isReal || supplicant.isLink) return false;

        const Class = subject.constructor;
        const root = this;

        const source = Class._resolveLink(subject, root);
        return source.isPresent && root.isLinkToDerived(subject, source);
    }

    static _classifyDisconnectionCase(root, node1, node2) {
        // Case 1: node unadoption
        if (root.isUnadoptionPossible(node1, node2))
            return {type: 'unadopt', list: [node1, node2]};
        if (root.isUnadoptionPossible(node2, node1))
            return {type: 'unadopt', list: [node2, node1]};

        // Case 2: node unsharing
        if (root.isUnsharingPossible(node1, node2))
            return {type: 'unshare', list: [node1, node2]};
        if (root.isUnsharingPossible(node2, node1))
            return {type: 'unshare', list: [node2, node1]};

        // Case 3: node underiving
        if (root.isUnderivingPossible(node1, node2))
            return {type: 'underive', list: [node1, node2]};
        if (root.isUnderivingPossible(node2, node1))
            return {type: 'underive', list: [node2, node1]};

        return {type: 'fail'};
    }

    _unadoptNode(subject, supplicant) {
        subject._logicalOwn = NodeOwnership.Subnode;
        return new Success();
    }

    _collectLinks(root, source) {
        const Class = source.constructor;
        let sample = [];

        root.forSubnodes((node) =>
            node.forSubnodes((subnode) =>
                {
                    if (subnode !== source &&
                        root.isLinkToShared(subnode, source))
                        sample.push([subnode, node])
                },
                root
            ),
            root
        );

        return sample;
    }

    // логика:
    // 1) subject - это ссылка, берём её источник,
    // 2) считаем общее число ссылок на источник в дереве,
    // 3) если ссылок 2, то:
    // 3.1) вырезаем все ссылки из дерева,
    // 3.2) вырезаем из корня источник,
    // 3.3) на место ссылки, которая != subject вставляем источник.
    // 4) если ссылок более 2, то:
    // 4.1) у просителя вырезаем ссылку
    _unshareNode(subject, supplicant) {
        const Class = subject.constructor;
        const root = this;

        const source = Class._resolveLink(subject, root);
        const links = root._collectLinks(root, source);
        if (links.length === 2) {
            const link1 = { parent: links[0][1], value: links[0][0] },
                  link2 = { parent: links[1][1], value: links[1][0] };
            const target = link1.value === subject ? link2.parent : link1.parent;

            let result;
            result = link1.parent.removeSubnode(link1.value.id);
            if (result.isFail) return result;

            result = link2.parent.removeSubnode(link2.value.id);
            if (result.isFail) return result;

            result = root.removeSubnode(source.id);
            if (result.isFail) return result;

            return target.addSubnode(source);
        }
        else
            return supplicant.removeSubnode(subject.id);
    }

    _underiveNode(subject, supplicant) {
        return supplicant.ejectNode(subject.id);
    }

    disconnectNodes(arg1, arg2) {
        const node1 = arg1.isPresent ? arg1 : this.getNodeById(arg1, true),
              node2 = arg2.isPresent ? arg2 : this.getNodeById(arg2, true);

        if (node1.isEmpty || node2.isEmpty)
            return new Fail(ErrorType.InvalidDisconnectRequest);

        const disconnCase = Node._classifyDisconnectionCase(this, node1, node2);

        switch (disconnCase.type) {
        case 'unadopt':
            return this._unadoptNode.apply(this, disconnCase.list);

        case 'unshare':
            return this._unshareNode.apply(this, disconnCase.list);

        case 'underive':
            return this._underiveNode.apply(this, disconnCase.list);

        case 'fail':
            return new Fail(ErrorType.InvalidDisconnectRequest);
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

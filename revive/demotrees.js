function treeWith2Childs(base=0) {
    /*
      root
      - node1
      - node2
    */
    
    const root = new Node(base);
    
    root.createSubnode(base+1);
    root.createSubnode(base+2);

    return root;
}

function treeWith3Childs(base=0) {
    const root = new Node(0);
    
    root.createSubnode(base+1);
    root.createSubnode(base+2);
    root.createSubnode(base+3);

    return root;
}

function simpleNestedTree(base=0) {
    /*
      root
      - node1
      -- node2
      -- node3
      - node4
    */
    
    const root = new Node(base);
    const node1 = new Node(base+1);

    root.addSubnode(node1);
    node1.createSubnode(base+2);
    node1.createSubnode(base+3);
    root.createSubnode(base+4);

    return root;
}

function treeWithSharing(base=0) {
    /*
      structure:
      root
      - node1
      -- node3 (logical)
      - node2
      -- node3 (logical)
      - node3 (physical)
    */

    const root = new Node(base);

    const node1 = new Node(base+1), node2 = new Node(base+2);
    const node3 = new Node(base+3, {
        logicalOwn: NodeOwnership.Subnode,
        physicalOwn: NodeOwnership.Here
    });

    root.addSubnode(node1);
    root.addSubnode(node2);
    root.addSubnode(node3);

    const definition = {
        isLink: true,
        logicalOwn: NodeOwnership.Here,
        physicalOwn: NodeOwnership.Supnode
    };

    node1.createSubnode(base+3, definition);
    node2.createSubnode(base+3, definition);

    return root;
}

function treeWithDeriving(base=0) {
    /*
      structure:
      root
      - node1
      - node2
      -- node3 (physical)
      - node3 (logical)
    */

    const root = new Node(base);

    const node1 = new Node(base+1), node2 = new Node(base+2);
    const node3 = new Node(base+3, {
        isLink: true,
        logicalOwn: NodeOwnership.Here,
        physicalOwn: NodeOwnership.Subnode
    });

    root.addSubnode(node1);
    root.addSubnode(node2);
    root.addSubnode(node3);

    node2.createSubnode(base+3, {
        logicalOwn: NodeOwnership.Here,
        physicalOwn: NodeOwnership.Here
    });

    return root;
}

function complexTree(base=0) {
    /*
      root
      - node1
      -- node3
      -- node4
      --- node5
      --- node6
      - node2
    */
    const root = new Node(base);

    const node1 = new Node(base+1);
    root.addSubnode(node1);
    root.addSubnode(new Node(base+2));

    const node4 = new Node(base+4);
    node1.addSubnode(new Node(base+3));
    node1.addSubnode(node4);

    node4.addSubnode(new Node(base+5));
    node4.addSubnode(new Node(base+6));

    return root;
}

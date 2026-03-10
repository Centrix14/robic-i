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
      -- node4 (link to node3)
      - node2
      -- node5 (link to node3)
      - node3 (source)
    */

    const root = new Node(base);

    const node1 = new Node(base+1), node2 = new Node(base+2);
    const node3 = new Node(base+3, {
        supnode: root,
        logicalOwn: NodeOwnership.Subnode,
        physicalOwn: NodeOwnership.Here,
        isLink: false,
        linkValue: null
    });

    root.addSubnode(node1);
    root.addSubnode(node2);
    root.addSubnode(node3);

    node1.createLink(base+4, node3, {
        logicalOwn: NodeOwnership.Here,
        physicalOwn: NodeOwnership.Supnode
    });

    node2.createLink(base+5, node3, {
        logicalOwn: NodeOwnership.Here,
        physicalOwn: NodeOwnership.Supnode,
    });

    return root;
}

function treeWithDeriving(base=0) {
    /*
      structure:
      root
      - node1
      - node2
      -- node3 (physical)
      - node4 (logical)
    */

    const root = new Node(base);
    root.createSubnode(base+1);

    const node2 = new Node(base+2, {
        supnode: root,
        logicalOwn: NodeOwnership.Subnode,
        physicalOwn: NodeOwnership.Here,
        isLink: false,
        linkValue: null
    });
    root.addSubnode(node2);

    const node3 = new Node(base+3, {
        supnode: node2,
        logicalOwn: NodeOwnership.Here,
        physicalOwn: NodeOwnership.Here,
        isLink: false,
        linkValue: null
    });
    node2.addSubnode(node3);

    root.createLink(base+4, node3, {
        logicalOwn: NodeOwnership.Here,
        physicalOwn: NodeOwnership.Subnode
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

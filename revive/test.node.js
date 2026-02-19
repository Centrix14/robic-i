function treeWith2Childs(base=0) {
    /*
      root
      - node1
      - node2
    */
    
    const root = new Node(base);
    
    root.addSubnode(new Node(base+1));
    root.addSubnode(new Node(base+2));

    return root;
}

function treeWith3Childs(base=0) {
    const root = new Node(0);
    
    root.addSubnode(new Node(base+1));
    root.addSubnode(new Node(base+2));
    root.addSubnode(new Node(base+3));

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
    node1.addSubnode(new Node(base+2));
    node1.addSubnode(new Node(base+3));
    root.addSubnode(new Node(base+4));

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

    const node = [new Node(base+1), new Node(base+2), new Node(base+3)];
    const definition = {
        logicalOwn: SubnodeOwnership.Here,
        physicalOwn: SubnodeOwnership.Supnode
    };

    root.addSubnode(node[0]);
    root.addSubnode(node[1]);
    root.addSubnode(node[2], {
        logicalOwn: SubnodeOwnership.Subnode,
        physicalOwn: SubnodeOwnership.Here
    });

    node[0].addSubnode(emptyNode, definition, node[2].id);
    node[1].addSubnode(emptyNode, definition, node[2].id);

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
    const node = [new Node(base+1), new Node(base+2), new Node(base+3)];

    root.addSubnode(node[0]);
    root.addSubnode(node[1]);
    root.addSubnode(emptyNode, {
        logicalOwn: SubnodeOwnership.Here,
        physicalOwn: SubnodeOwnership.Subnode
    }, node[2].id);

    node[1].addSubnode(node[2], {
        logicalOwn: SubnodeOwnership.Here,
        physicalOwn: SubnodeOwnership.Here
    });

    return root;
}

describe('Node', function(){

    describe('selectNodes', function(){

        describe('select root and subnodes', function(){
            let root, result;
            
            before(function(){
                root = treeWith2Childs();
            });

            it('selectNodes1 - result.isOk()', function(){
                result =
                    root.selectNodes((n) => (n.id % 2 === 0), true);
                assert.isTrue(result.isOk());
            });

            it('selectNodes2 - result.sample.length === 2', function(){
                assert.lengthOf(result.sample, 2);
            });

            it('selectNodes3 - node.id === 0, 2', function(){
                const node = [result.sample[0], result.sample[1]];
                assert.isTrue(node[0].id === 0 && node[1].id === 2);
            });
        });

        describe('select subnodes in hierarchy', function(){
            let root, result;
            
            before(function(){
                root = simpleNestedTree();
            });

            it('selectNodes4 - result.isOk()', function(){
                result =
                      root.selectNodes((n) => (n.id === 3), true);
                assert.isTrue(result.isOk());
            });

            it('selectNodes5 - result.sample.length === 1', function(){
                assert.lengthOf(result.sample, 1);
            });

            it('selectNodes6 - node.id === 3', function(){
                const node = result.sample[0];
                assert.equal(node.id, 3);
            });
        });

        describe('select shared subnodes unaware of ownership', function(){
            let root, result;

            before(function(){
                root = treeWithSharing();
            });

            it('selectNodes9 - result.isOk()', function(){
                result =
                    root.selectNodes((n, c, parent) => (parent === root),
                                           true);
                assert.isTrue(result.isOk());
            });

            it('selectNodes10 - result.sample.length === 3', function(){
                assert.lengthOf(result.sample, 3);
            });

            it('selectNodes11 - selected node.id === 1, 2, 3', function(){
                const node = [result.sample[0], result.sample[1],
                              result.sample[2]];
                assert.isTrue(node[0].id === 1 &&
                              node[1].id === 2 &&
                              node[2].id === 3);
            });
        });

        describe('select derived subnodes unaware of ownership', function(){
            let root, result;

            before(function(){
                root = treeWithDeriving();
            });

            it('selectNodes12 - result.isOk()', function(){
                result =
                    root.selectNodes((n, c, parent) => (parent === root),
                                           true);
                assert.isTrue(result.isOk());
            });

            it('selectNodes13 - result.sample.length === 2', function(){
                assert.lengthOf(result.sample, 2);
            });

            it('selectNodes14 - selected node.id === 1, 2', function(){
                const node = [result.sample[0], result.sample[1]];
                assert.isTrue(node[0].id === 1 &&
                              node[1].id === 2);
            });
        });

        describe('returns empty array if nothing was found', function(){
            let root, result;
            
            before(function(){
                root = simpleNestedTree();
            });

            it('selectNodes7 - result.isOk()', function(){
                result =
                      root.selectNodes((n) => (n.id === 123), true);
                assert.isTrue(result.isOk());
            });

            it('selectNodes8 - result.sample is empty', function(){
                assert.isEmpty(result.sample);
            })
        });
        
    });

    describe('subnodes', function(){

        describe('return array of direct subnodes', function(){
            let root, subnodes;

            before(function(){
                root = treeWith3Childs();
            });

            it('subnodes1 - returns array', function(){
                subnodes = root.subnodes();
                assert.isArray(subnodes);
            });

            it('subnodes2 - subnodes.length === 3', function(){
                assert.lengthOf(subnodes, 3);
            });

            it('subnodes9 - subnodes is an array of nodes', function(){
                subnodes.forEach((elm) => assert.instanceOf(elm, Node));
            });
        });

        describe('return empty array when no subnodes found', function(){
            let root, subnodes;

            before(function(){
                root = new Node(0);
            });

            it('subnodes3 - returns array', function(){
                subnodes = root.subnodes();
                assert.isArray(subnodes);
            });

            it('subnodes4 - returns empty array', function(){
                assert.isEmpty(subnodes);
            });
        });


        describe('it aware of node sharing', function(){
            let root, node1, rootSubnodes, node1Subnodes;

            before(function(){
                root = treeWithSharing();
                node1 = root.getNodeById(1);
            });

            it('subnodes5 - root has only 2 subnodes', function(){
                rootSubnodes = root.subnodes();
                assert.lengthOf(rootSubnodes, 2);
            });

            it('subnodes6 - root subnodes has id === 1, 2', function(){
                assert.equal(rootSubnodes[0].id, 1);
                assert.equal(rootSubnodes[1].id, 2);
            });

            it('subnodes7 - node1 has 1 subnode', function(){
                node1Subnodes = node1.subnodes(root);
                assert.lengthOf(node1Subnodes, 1);
            });

            it('subnodes8 - node1 subnode has id === 3', function(){
                assert.equal(node1Subnodes[0].id, 3);
            });

        });

        describe('it aware of node deriving', function(){
            let root, subnodes;

            before(function(){
                root = treeWithDeriving();
            });

            it('subnodes10 - root has 3 subnodes', function(){
                subnodes = root.subnodes();
                assert.lengthOf(subnodes, 3);
            });

            it('subnodes11 - subnodes has id === 1, 2, 3', function(){
                assert.equal(subnodes[0].id, 1);
                assert.equal(subnodes[1].id, 2);
                assert.equal(subnodes[2].id, 3);
            });
        });

    });

    describe('injectNode', function(){

        describe('inject nodes to root', function(){
            let root, result;

            before(function(){
                root = new Node(0);
            });

            it('injectNode1 - result.isOk()', function(){
                const subject = new Node(1);
                result = root.injectNode(0, subject);
                assert.isTrue(result.isOk());
            });

            it('injectNode2 - root.subnodes.length === 1', function(){
                const subnodes = root.subnodes();
                assert.lengthOf(subnodes, 1);
            });

            it('injectNode3 - subnode has id === 1', function(){
                const subnode = root.get(1);
                assert.equal(subnode.id, 1);
            });
        });

        describe('inject nodes in hierarchy', function(){
            let root, subject, result, alice, puppets;

            before(function(){
                root = treeWith3Childs(0); // => 0, 1, 2, 3
                subject = treeWith2Childs(4); // => 4, 5, 6
            });

            it('injectNode4 - result.isOk()', function(){
                result = root.injectNode(2, subject);
                assert.isTrue(result.isOk());
            });

            it('injectNode5 - node id:2 has 1 subnode (alice)', function(){
                const node2 = root.getNodeById(2);
                alice = node2.subnodes();
                assert.lengthOf(alice, 1);
            });

            it('injectNode6 - alice has 2 subnodes (puppets)', function(){
                puppets = alice[0].subnodes();
                assert.lengthOf(puppets, 2);
            });

            it('injectNode7 - puppets ids are 5 and 6', function(){
                assert.equal(puppets[0].id, 5);
                assert.equal(puppets[1].id, 6);
            });
        });

        describe('returns error when node can not be found', function(){
            let root;

            before(function(){
                root = treeWith2Childs();
            });

            it('injectNode8 - result.isFail()', function(){
                let result = root.injectNode(123, new Node(1));
                assert.isTrue(result.isFail());
            });
        });
    });

    describe('ejectNode', function(){

        describe('eject nodes from root', function(){
            let root, result;

            before(function(){
                root = treeWith3Childs();
            });

            it('ejectNode1 - result.isOk()', function(){
                result = root.ejectNode(1);
                assert.isTrue(result.isOk());
            });

            it('ejectNode2 - returns ejected node', function(){
                assert.equal(result.node.id, 1);
            });
        });

        describe('eject nodes from hierarchy', function(){
            let root, result;

            before(function(){
                root = simpleNestedTree();
            });

            it('ejectNode3 - result.isOk()', function(){
                result = root.ejectNode(3);
                assert.isTrue(result.isOk());
            });
        });

        describe('returns error when node can not be found', function(){
            let root, result;

            before(function(){
                root = treeWith3Childs();
            });

            it('ejectNode4 - result.isFail()', function(){
                result = root.ejectNode(123);
                assert.isTrue(result.isFail());
            });
        });
    });

    describe('connectNodes', function(){

        describe('not connect nodes outside tree', function(){
            let root;

            before(function(){
                root = treeWith2Childs();
            });

            it('connectNodes* - returns None if one node outside tree', function(){
                const result = root.connectNodes(1, 8);
                assert.equal(result, 'None');
            });

            it('connectNodes* - returns None if both nodes outside tree', function(){
                const result = root.connectNodes(10, 8);
                assert.equal(result, 'None');
            });
        });

        describe('not connect root and its subnode', function(){
            let root, result;

            before(function(){
                root = treeWith2Childs();
            });

            it('connectNodes* - returns None (direct order)', function(){
                result = root.connectNodes(0, 1);
                assert.equal(result, 'None');
            });

            it('connectNodes* - returns None (inverse order)', function(){
                result = root.connectNodes(1, 0);
                assert.equal(result, 'None');
            });
        });

        describe('not connect neighbours', function(){
            let root, result;

            before(function(){
                root = treeWith2Childs();
            });

            it('connectNodes* - returns Node (direct order)', function(){
                result = root.connectNodes(1, 2);
                assert.equal(result, 'None');
            });

            it('connectNodes* - returns Node (inverse order)', function(){
                result = root.connectNodes(2, 1);
                assert.equal(result, 'None');
            });
        });

        describe('share node', function(){
            let root, result;

            before(function(){
                root = simpleNestedTree();
            });

            it('connectNodes* - returns Share (direct order)', function(){
                result = root.connectNodes(2, 4);
                assert.equal(result, 'Sharing');
            });

            it('connectNodes* - returns Share (inverse order)', function(){
                result = root.connectNodes(4, 2);
                assert.equal(result, 'Sharing');
            });
        });

        describe('derive node', function(){
            let root, result;

            before(function(){
                root = simpleNestedTree();
            });

            it('connectNodes* - returns Deriving (direct order)', function(){
                result = root.connectNodes(0, 2);
                assert.equal(result, 'Deriving');
            });

            it('connectNodes* - returns Deriving (inverse order)', function(){
                result = root.connectNodes(2, 0);
                assert.equal(result, 'Deriving');
            });
        });

    });

});

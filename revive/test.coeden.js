describe('addNode', function(){

    it('addNode1 - creates new nodes', function(){
        const g = new Graph();

        const result = g.addNode(0, 'sample');

        assert.isTrue(result.isOk);
        assert.equal('sample', g.getNode(0));
    });

    it('addNode2 - prevents ID duplication', function(){
        const g = new Graph();

        g.addNode(0, 'original');
        const result = g.addNode(0, 'duplicate');

        assert.isTrue(result.isFail);
    });

});

describe('nodes', function(){

    let g;

    before(function(){
        g = new Graph();
        g.addNode(0, 'Ivan');
        g.addNode(1, 'Misha');
        g.addNode(2, 'Sasha');
    });

    it('nodes1 - returns nodes IDs', function(){
        const nodes = g.nodes(NodeFields.Id);

        assert.isArray(nodes, 'Method returns not array');
        assert.equal(0, nodes[0], 'Method miss some node');
        assert.equal(1, nodes[1], 'Method miss some node');
        assert.equal(2, nodes[2], 'Method miss some node');
    });

    it('nodes2 - returns nodes data', function(){
        const nodes = g.nodes(NodeFields.Data);

        assert.isArray(nodes, 'Method returns not array');
        assert.equal('Ivan', nodes[0], 'Method miss some node');
        assert.equal('Misha', nodes[1], 'Method miss some node');
        assert.equal('Sasha', nodes[2], 'Method miss some node');
    });

});

describe('connect', function(){

    it('connect1 - creates direct connection', function(){
        const g = new Graph();

        g.addNode(0, 'Alice');
        g.addNode(1, 'Johne');

        const result = g.connect(0, 1, {
            direction: ConnectDirections.Direct,
            data: 'friendship'
        });

        assert.isTrue(result.isOk, 'Result is fail');
        assert.isTrue(g.areAdjacents(0, 1), 'Connection not created');
        assert.isFalse(g.areAdjacents(1, 0), 'Wrong connection created');
    });

    it('connect2 - creates inverse connection', function(){
        const g = new Graph();

        g.addNode(0, 'Alice');
        g.addNode(1, 'Johne');

        const result = g.connect(0, 1, {
            direction: ConnectDirections.Inverse,
            data: 'friendship'
        });

        assert.isTrue(result.isOk, 'Result is fail');
        assert.isTrue(g.areAdjacents(1, 0), 'Connection not created');
        assert.isFalse(g.areAdjacents(0, 1), 'Wrong connection created');
    });

    it('connect3 - creates connection in both directions', function(){
        const g = new Graph();

        g.addNode(0, 'Alice');
        g.addNode(1, 'Johne');

        const result = g.connect(0, 1, {
            direction: ConnectDirections.Both,
            data: 'friendship'
        });

        assert.isTrue(result.isOk, 'Result is fail');
        assert.isTrue(g.areAdjacents(0, 1), 'Connection not created (or it is wrong)');
        assert.isTrue(g.areAdjacents(1, 0), 'Connection not created (or it is wrong)');
    });

    it('connect4 - prevents connection duplication', function(){
        const g = new Graph();

        g.addNode(0, 'Alice');
        g.addNode(1, 'Johne');

        g.connect(0, 1, {
            direction: ConnectDirections.Direct,
            data: 'friendship'
        });
        const result = g.connect(0, 1, {
            direction: ConnectDirections.Both,
            data: 'friendship'
        });

        assert.isTrue(result.isFail, 'Method not prevents duplication');
    });

    it('connect5 - allows loops', function(){
        const g = new Graph();

        g.addNode(0, 'Alice');
        const result = g.connect(0, 0, {
            direction: ConnectDirections.Direct,
            data: 'loop'
        });

        assert.isTrue(result.isOk, 'Method disallows loops');
    });

});

describe('getAdjacents', function(){

    let g;

    before(function(){
        g = new Graph();

        g.addNode(0, 'Chloe');
        g.addNode(1, 'Zoe');
        g.addNode(2, 'Lizy');

        g.connect(0, 1, {
            direction: ConnectDirections.Both,
            data: 'sisters'
        });
        g.connect(0, 2, {
            direction: ConnectDirections.Both,
            data: 'sisters'
        });
        g.connect(1, 2, {
            direction: ConnectDirections.Both,
            data: 'sisters'
        });
    });

    it('getAdjacents1 - returns adjacents IDs', function(){
        const sample = g.getAdjacents(0, NodeFields.Id);

        assert.isArray(sample, 'Method returns not array');
        assert.equal(sample[0], 1, 'Sample does not include Zoe');
        assert.equal(sample[1], 2, 'Sample does not include Lizy');
    });

    it('getAdjacents2 - returns adjacents data', function(){
        const sample = g.getAdjacents(0, NodeFields.Data);

        assert.isArray(sample, 'Method returns not array');
        assert.equal(sample[0], 'Zoe', 'Sample does not include Zoe');
        assert.equal(sample[1], 'Lizy', 'Sample does not include Lizy');
    });

});

describe('disconnect', function(){

    it('disconnect1 - disconnects directly', function(){
        const g = new Graph();

        g.addNode(0, 'Alice');
        g.addNode(1, 'Johne');

        g.connect(0, 1, {
            direction: ConnectDirections.Both,
            data: 'friendship'
        });

        const result = g.disconnect(0, 1, ConnectDirections.Direct);

        assert.isTrue(result.isOk, 'Method failed');
        assert.isFalse(g.areAdjacents(0, 1), 'Connection not destroyed');
        assert.isTrue(g.areAdjacents(1, 0), 'Wrong disconnection');
    });

    it('disconnect2 - disconnects inversely', function(){
        const g = new Graph();

        g.addNode(0, 'Alice');
        g.addNode(1, 'Johne');

        g.connect(0, 1, {
            direction: ConnectDirections.Both,
            data: 'friendship'
        });

        const result = g.disconnect(0, 1, ConnectDirections.Inverse);

        assert.isTrue(result.isOk, 'Method failed');
        assert.isFalse(g.areAdjacents(1, 0), 'Wrong disconnection');
        assert.isTrue(g.areAdjacents(0, 1), 'Connection not destroyed');
    });

    it('disconnect3 - disconnects in both directions', function(){
        const g = new Graph();

        g.addNode(0, 'Alice');
        g.addNode(1, 'Johne');

        g.connect(0, 1, {
            direction: ConnectDirections.Both,
            data: 'friendship'
        });

        const result = g.disconnect(0, 1, ConnectDirections.Both);

        assert.isTrue(result.isOk, 'Method failed');
        assert.isFalse(g.areAdjacents(0, 1), 'Connection not destroyed');
        assert.isFalse(g.areAdjacents(1, 0), 'Connection not destroyed');
    });

    it('disconnect4 - disconnect loops', function(){
        const g = new Graph();

        g.addNode(0, 'Alice');
        g.connect(0, 0, {
            direction: ConnectDirections.Direct,
            data: 'loop'
        });
        const result = g.disconnect(0, 0, ConnectDirections.Direct);

        assert.isTrue(result.isOk, 'Method disallows loops');
    });

});

describe('dropNode', function(){

    it('dropNode1 - drops given node', function(){
        const g = new Graph();

        g.addNode(0, 'target');
        g.addNode(1, 'buddy');

        const result = g.dropNode(0);
        assert.isTrue(result.isOk, 'Method failed');
        assert.isFalse(g.hasNode(0), 'Node not dropped');
        assert.isTrue(g.hasNode(1), 'Wrong node droppped');
    });

});

describe('isLinkToShared', function(){

    it('isLinkToShared1 - detects link', function(){
        const root = treeWithSharing();

        const result = root.selectNodes(
            (n, _) => (n.logicalOwn === NodeOwnership.Here
                       && n.physicalOwn === NodeOwnership.Supnode),
            true
        );

        const link = result.get('sample')[0];
        const source = root.get(3);

        assert.isTrue(link.isLinkToShared(source));
    });

    it('isLinkToShared2 - detects ordinary node', function(){
        const root = treeWithSharing();
        const node1 = root.get(1), node2 = root.get(2);

        assert.isFalse(root.isLinkToShared(node1, node2));
    });

    it('isLinkToShared3 - node is not refers itself', function(){
        const root = treeWithSharing();
        const node1 = root.get(1);

        assert.isFalse(root.isLinkToShared(node1, node1));
    });

});

describe('isShared', function(){

    it('isShared1 - detects shared node', function(){
        const root = treeWithSharing();
        const shared = root.get(3);

        assert.isTrue(root.isShared(shared));
    });

    it('isShared2 - detects ordinary node', function(){
        const root = treeWithSharing();
        const node1 = root.get(1);

        assert.isFalse(root.isShared(node1));
    });

});

describe('isLinkToDerived', function(){

    it('isLinkToDerived1 - detects link', function(){
        const root = treeWithDeriving();

        const link = root.get(3);
        const source = root.get(2).get(3);

        assert.isTrue(root.isLinkToDerived(link, source));
    });

    it('isLinkToDerived2 - detects ordinary node', function(){
        const root = treeWithDeriving();
        const node1 = root.get(1), node2 = root.get(2);

        assert.isFalse(root.isLinkToDerived(node1, node2));
    });

    it('isLinkToDerived3 - node is not refers itself', function(){
        const root = treeWithDeriving();
        const node1 = root.get(1);

        assert.isFalse(root.isLinkToDerived(node1, node1));
    });

});

describe('isDerived', function(){

    it('isDerived1 - detects derived node', function(){
        const root = treeWithDeriving();
        const derived = root.get(2).get(3);

        assert.isTrue(root.isDerived(derived));
    });

    it('isDerived2 - detects ordinary node', function(){
        const root = treeWithDeriving();
        const node1 = root.get(1);

        assert.isFalse(root.isDerived(node1));
    });

});

describe('selectNodes', function(){

    describe('select root and subnodes', function(){
        let root, result;
        
        before(function(){
            root = treeWith2Childs();
        });

        it('selectNodes1 - result.isOk', function(){
            result =
                root.selectNodes((n) => (n.id % 2 === 0), true);
            assert.isTrue(result.isOk);
        });

        it('selectNodes2 - result.sample.length === 2', function(){
            assert.lengthOf(result.get('sample'), 2);
        });

        it('selectNodes3 - node.id === 0, 2', function(){
            const sample = result.get('sample');
            const node = [sample[0], sample[1]];
            assert.isTrue(node[0].id === 0 && node[1].id === 2);
        });
    });

    describe('select subnodes in hierarchy', function(){
        let root, result;
        
        before(function(){
            root = simpleNestedTree();
        });

        it('selectNodes4 - result.isOk', function(){
            result =
                root.selectNodes((n) => (n.id === 3), true);
            assert.isTrue(result.isOk);
        });

        it('selectNodes5 - result.sample.length === 1', function(){
            assert.lengthOf(result.get('sample'), 1);
        });

        it('selectNodes6 - node.id === 3', function(){
            const node = result.get('sample')[0];
            assert.equal(node.id, 3);
        });
    });

    describe('select shared subnodes unaware of ownership', function(){
        let root, result;

        before(function(){
            root = treeWithSharing();
        });

        it('selectNodes9 - result.isOk', function(){
            result = root.selectNodes(
                (n, parent) => (parent === root),
                true
            );
            assert.isTrue(result.isOk);
        });

        it('selectNodes10 - result.sample.length === 3', function(){
            assert.lengthOf(result.get('sample'), 3);
        });

        it('selectNodes11 - selected node.id === 1, 2, 3', function(){
            const sample = result.get('sample');
            const node = [sample[0], sample[1], sample[2]];
            assert.isTrue(node[0].id === 1 &&
                          node[1].id === 2 &&
                          node[2].id === 3);
        });
    });

    describe('returns empty array if nothing was found', function(){
        let root, result;
        
        before(function(){
            root = simpleNestedTree();
        });

        it('selectNodes7 - result.isOk', function(){
            result =
                root.selectNodes((n) => (n.id === 123), true);
            assert.isTrue(result.isOk);
        });

        it('selectNodes8 - result.sample is empty', function(){
            assert.isEmpty(result.get('sample'));
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

        it('injectNode1 - result.isOk', function(){
            const subject = new Node(1);
            result = root.injectNode(0, subject);
            assert.isTrue(result.isOk);
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

        it('injectNode4 - result.isOk', function(){
            result = root.injectNode(2, subject);
            assert.isTrue(result.isOk);
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

        it('injectNode8 - result.isFail', function(){
            let result = root.injectNode(123, new Node(1));
            assert.isTrue(result.isFail);
        });
    });
});

describe('ejectNode', function(){

    describe('eject nodes from root', function(){
        let root, result;

        before(function(){
            root = treeWith3Childs();
        });

        it('ejectNode1 - result.isOk', function(){
            result = root.ejectNode(1);
            assert.isTrue(result.isOk);
        });

        it('ejectNode2 - returns ejected node', function(){
            assert.equal(result.get('node').id, 1);
        });
    });

    describe('eject nodes from hierarchy', function(){
        let root, result;

        before(function(){
            root = simpleNestedTree();
        });

        it('ejectNode3 - result.isOk', function(){
            result = root.ejectNode(3);
            assert.isTrue(result.isOk);
        });
    });

    describe('returns error when node can not be found', function(){
        let root, result;

        before(function(){
            root = treeWith3Childs();
        });

        it('ejectNode4 - result.isFail', function(){
            result = root.ejectNode(123);
            assert.isTrue(result.isFail);
        });
    });
});

describe('connectNodes', function(){

    describe('not connect nodes outside tree', function(){
        let root;

        before(function(){
            root = treeWith2Childs();
        });

        it('connectNodes1 - returns error if one node outside tree', function(){
            const result = root.connectNodes(1, 8);
            assert.isTrue(result.isFail);
        });

        it('connectNodes2 - returns error if both nodes outside tree', function(){
            const result = root.connectNodes(10, 8);
            assert.isTrue(result.isFail);
        });
    });

    describe('not connect unconnectable nodes', function(){
        let root;

        before(function(){
            root = complexTree();
        });

        it('connectNodes3 - not connect root and leaf', function(){
            const result = root.connectNodes(0, 6);
            assert.isTrue(result.isFail);
        });

        it('connectNodes4 - not connect subnode of root and leaf', function(){
            const result = root.connectNodes(2, 5);
            assert.isTrue(result.isFail);
        });
    });

    describe('not connect root and its subnode', function(){
        let root;

        before(function(){
            root = treeWith2Childs();
        });

        it('connectNodes5 - returns error (direct order)', function(){
            const result = root.connectNodes(0, 1);
            assert.isTrue(result.isFail);
        });

        it('connectNodes6 - returns error (inverse order)', function(){
            const result = root.connectNodes(1, 0);
            assert.isTrue(result.isFail);
        });
    });

    describe('not connect neighbours', function(){
        let root;

        before(function(){
            root = treeWith2Childs();
        });

        it('connectNodes7 - returns error (direct order)', function(){
            const result = root.connectNodes(1, 2);
            assert.isTrue(result.isFail);
        });

        it('connectNodes8 - returns error (inverse order)', function(){
            const result = root.connectNodes(2, 1);
            assert.isTrue(result.isFail);
        });
    });

    describe('share node', function(){
        function test(root, args, testNames) {
            it(testNames[0], function(){
                const result = root.connectNodes(args[0], args[1]);
                assert.isTrue(result.isOk);
            });

            it(testNames[1], function(){
                const node1 = root.getNodeById(1, true);
                assert.isTrue(node1.has(2));
            });

            it(testNames[2], function(){
                const node4 = root.getNodeById(4, true);
                assert.isTrue(node4.has(2));
            });
        }

        describe('direct order', function(){
            const root = simpleNestedTree();
            
            test(root, [2, 4], [
                'connectNodes9 - result.isOk',
                'connectNodes10 - node id:1 has node id:2',
                'connectNodes11 - node id:4 has node id:2'
            ]);
        });

        describe('inverse order', function(){
            const root = simpleNestedTree();

            test(root, [4, 2], [
                'connectNodes12 - result.isOk',
                'connectNodes13 - node id:1 has node id:2',
                'connectNodes14 - node id:4 has node id:2'
            ]);
        });
    });


    describe('connect shared node and root', function(){
        function test(root, args, testNames) {
            it(testNames[0], function(){
                const result = root.connectNodes(args[0], args[1]);
                assert.isTrue(result.isOk);
            });

            it(testNames[1], function(){
                const result = root.selectNodes(
                    (n, p) => (n.id === 3
                               && n.logicalOwn === NodeOwnership.Here
                               && p === root),
                    true
                );

                const node = result.get('sample')[0];
                assert.equal(node.id, 3);
            });
        }

        describe('direct order', function(){
            const root = treeWithSharing();
            const node3 = root.get(3);

            test(root, [root, node3], [
                'connectNodes15 - result.isOk',
                'connectNodes16 - root has node id:3 logically'
            ]);
        });

        describe('inverse order', function(){
            const root = treeWithSharing();
            const node3 = root.get(3);

            test(root, [node3, root], [
                'connectNodes17 - result.isOk',
                'connectNodes18 - root has node id:3 logically'
            ]);
        });
    });

    describe('derive node', function(){
        function test(root, args, testNames) {
            it(testNames[0], function(){
                const result = root.has(2);
                assert.isFalse(result);
            });

            it(testNames[1], function(){
                const result = root.connectNodes(args[0], args[1]);
                assert.isTrue(result.isOk);
            });

            it(testNames[2], function(){
                const result = root.has(2);
                assert.isTrue(result);
            });
        }

        describe('direct order', function(){
            const root = simpleNestedTree();

            test(root, [0, 2], [
                'connectNodes19 - root has not node id:2',
                'connectNodes20 - result.isOk',
                'connectNodes21 - root has node id:2'
            ]);
        });

        describe('inverse order', function(){
            const root = simpleNestedTree();

            test(root, [2, 0], [
                'connectNodes22 - root has not node id:2',
                'connectNodes23 - result.isOk',
                'connectNodes24 - root has node id:2'
            ]);
        });
    });

});

describe('disconnectNodes', function(){

    describe('not disconnect nodes outside tree', function(){
        let root;

        before(function(){
            root = treeWith2Childs();
        });

        it('disconnectNodes1 - returns error if one node outside tree', function(){
            const result = root.disconnectNodes(1, 8);
            assert.isTrue(result.isFail);
        });

        it('disconnectNodes2 - returns error if both nodes outside tree', function(){
            const result = root.disconnectNodes(10, 8);
            assert.isTrue(result.isFail);
        });
    });

    describe('not disconnect disconnected nodes', function(){
        let root;

        before(function(){
            root = complexTree();
        });

        it('disconnectNodes3 - not disconnect root and leaf', function(){
            const result = root.disconnectNodes(0, 6);
            assert.isTrue(result.isFail);
        });

        it('disconnectNodes4 - not disconnect subnode of root and leaf', function(){
            const result = root.disconnectNodes(2, 5);
            assert.isTrue(result.isFail);
        });

    });

    describe('not disconnect root and its subnode', function(){
        let root;

        before(function(){
            root = treeWith2Childs();
        });

        it('disconnectNodes5 - returns error (direct order)', function(){
            const result = root.disconnectNodes(0, 1);
            assert.isTrue(result.isFail);
        });

        it('disconnectNodes6 - returns error (inverse order)', function(){
            const result = root.disconnectNodes(1, 0);
            assert.isTrue(result.isFail);
        });
    });

    describe('not disconnect neighbours', function(){
        let root;

        before(function(){
            root = treeWith2Childs();
        });

        it('disconnectNodes7 - returns error (direct order)', function(){
            const result = root.disconnectNodes(1, 2);
            assert.isTrue(result.isFail);
        });

        it('disconnectNodes8 - returns error (inverse order)', function(){
            const result = root.disconnectNodes(2, 1);
            assert.isTrue(result.isFail);
        });
    });

    describe('disconnect adopted node', function(){
        function test(root, args, testNames) {
            before(function(){
                root.connectNodes(args[0], args[1]);
            });

            it(testNames[0], function(){
                const result = root.disconnectNodes(args[0], args[1]);
                assert.isTrue(result.isOk);
            });

            it(testNames[1], function(){
                const node = root.get(3);
                assert.equal(node.logicalOwn, NodeOwnership.Subnode);
            });
        }

        describe('direct order', function(){
            const root = treeWithSharing();
            const node1 = root, node2 = root.get(3);

            test(root, [node1, node2], [
                'disconnectNodes9 - disconnect result.isOk',
                'disconnectNodes10 - root has not node id:3 logically'
            ]);
        });

        describe('inverse order', function(){
            const root = treeWithSharing();
            const node1 = root, node2 = root.get(3);

            test(root, [node1, node2], [
                'disconnectNodes11 - result.isOk',
                'disconnectNodes12 - root has node id:3 logically'
            ]);
        });
    });

    describe('unshare node', function(){
        function test(root, args, testNames) {
            it(testNames[0], function(){
                const result = root.disconnectNodes(args[0], args[1]);
                assert.isTrue(result.isOk);
            });

            it(testNames[1], function(){
                const node0 = root.getNodeById(0, true);
                assert.isFalse(node0.has(3));
            });

            it(testNames[2], function(){
                const node1 = root.getNodeById(1, true);
                assert.isFalse(node1.has(4));
            });

            it(testNames[3], function(){
                const node2 = root.getNodeById(2, true);
                assert.isTrue(node2.has(5));
            });
        }

        describe('direct order', function(){
            const root = treeWithSharing();
            
            test(root, [1, 4], [
                'disconnectNodes10 - result.isOk',
                'disconnectNodes11 - node id:0 has not node id:3',
                'disconnectNodes12 - node id:1 has not node id:4',
                'disconnectNodes13 - node id:2 has node id:5'
            ]);
        });

        describe('inverse order', function(){
            const root = treeWithSharing();

            test(root, [4, 1], [
                'disconnectNodes15 - result.isOk',
                'disconnectNodes16 - node id:0 has not node id:3',
                'disconnectNodes17 - node id:1 has not node id:3',
                'disconnectNodes18 - node id:2 has node id:3'
            ]);
        });
    });

    describe('underive node', function(){
        function test(root, args, testNames) {
            it(testNames[0], function(){
                const result = root.disconnectNodes(args[0], args[1]);
                assert.isTrue(result.isOk);
            });

            it(testNames[1], function(){
                const node1 = args[0], node2 = args[1];
                assert.isFalse(node1.has(node2.id));
            });
        }

        describe('direct order', function(){
            let root = treeWithDeriving();

            test(root, [0, 4], [
                'disconnectNodes* - result.isOk',
                'disconnectNodes* - node underived'
            ]);
        });

        describe('inverse order', function(){
            let root = treeWithDeriving();

            test(root, [root.get(3), root], [
                'disconnectNodes* - result.isOk',
                'disconnectNodes* - node underived'
            ]);
        });

    });
});

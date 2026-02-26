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

        assert.isTrue(root.isLinkToShared(link, source));
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
        const root = treeWithSharing();
        const node1 = root.get(1);

        assert.isFalse(root.isLinkToShared(node1, node1));
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
            assert.isTrue(result.isEmpty);
        });

        it('connectNodes4 - not connect subnode of root and leaf', function(){
            const result = root.connectNodes(2, 5);
            assert.isTrue(result.isEmpty);
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

            test(root, [0, 3], [
                'connectNodes15 - result.isOk',
                'connectNodes16 - root has node id:3 logically'
            ]);
        });

        describe('inverse order', function(){
            const root = treeWithSharing();

            test(root, [3, 0], [
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
            assert.isTrue(result.isEmpty);
        });

        it('disconnectNodes4 - not disconnect subnode of root and leaf', function(){
            const result = root.disconnectNodes(2, 5);
            assert.isTrue(result.isEmpty);
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

    // остановился тут. необходимо изменить граничные условия таким образом,
    // чтобы разъединение общего узла и корня стало возможным.
    // условие того — доказать, что в дереве кто-то ссылается на этот узел,
    // как на разделяемый.
    describe('disconnect shared node and root', function(){
        function test(root, args, testNames) {
            before(function(){
                root.connectNodes(args[0], args[1]);
            });

            it(testNames[0], function(){
                const result = root.disconnectNodes(args[0], args[1]);
                assert.isTrue(result.isOk);
            });

            it(testNames[1], function(){
                const subnode = NodeOwnership.Subnode;
                const result = root.selectNodes(
                    (n, c, p) => (n.id === 3
                                  && c?.logicalOwn === subnode
                                  && p === root),
                    true
                );

                const node = result.get('sample')[0];
                assert.equal(node.id, 3);
            });
        }

        describe('direct order', function(){
            const root = treeWithSharing();

            test(root, [0, 3], [
                'disconnectNodes15 - disconnect result.isOk',
                'disconnectNodes* - root has not node id:3 logically'
            ]);
        });

        describe('inverse order', function(){
            const root = treeWithSharing();

            test(root, [3, 0], [
                'disconnectNodes17 - result.isOk',
                'disconnectNodes18 - root has node id:3 logically'
            ]);
        });
    });

    describe('unshare node', function(){
        function test(root, args, testNames) {
            it(testNames[0], function(){
                const node1 = root.getNodeById(1, true);
                assert.isTrue(node1.has(3));
            });

            it(testNames[1], function(){
                const result = root.disconnectNodes(args[0], args[1]);
                assert.isTrue(result.isOk);
            });

            it(testNames[2], function(){
                const node0 = root.getNodeById(0, true);
                assert.isFalse(node0.has(3));
            });

            it(testNames[3], function(){
                const node1 = root.getNodeById(1, true);
                assert.isFalse(node1.has(3));
            });

            it(testNames[4], function(){
                const node2 = root.getNodeById(2, true);
                assert.isTrue(node2.has(3));
            });
        }

        describe('direct order', function(){
            const root = treeWithSharing();
            
            test(root, [1, 3], [
                'disconnectNodes9 - node id:1 has node id:3',
                'disconnectNodes10 - result.isOk',
                'disconnectNodes11 - node id:0 has not node id:3',
                'disconnectNodes12 - node id:1 has not node id:3',
                'disconnectNodes13 - node id:2 has node id:3'
            ]);
        });

        describe('inverse order', function(){
            const root = treeWithSharing();

            test(root, [3, 1], [
                'disconnectNodes14 - node id:1 has node id:3',
                'disconnectNodes15 - result.isOk',
                'disconnectNodes16 - node id:0 has not node id:3',
                'disconnectNodes17 - node id:1 has not node id:3',
                'disconnectNodes18 - node id:2 has node id:3'
            ]);
        });
    });

});

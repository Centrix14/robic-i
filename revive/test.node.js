describe('Node', function(){

    describe('selectAllSubnodes', function(){

        describe('select instant subnodes', function(){
            let root, result;
            
            before(function(){
                /*
                  root
                  - node1
                  - node2
                 */
                
                root = new Node(0);
                
                const node1 = new Node(1),
                      node2 = new Node(2);
                const subnode1 = new Subnode(3, node1),
                      subnode2 = new Subnode(4, node2);

                root._subnodes.set(node1.id, subnode1);
                root._subnodes.set(node2.id, subnode2);
            });

            it('selectAllSubnodes1 - result.isOk()', function(){
                result =
                    root.selectAllSubnodes((n) => (n.id === 2), false);
                assert.isTrue(result.isOk());
            });

            it('selectAllSubnodes2 - result.sample.length === 1', function(){
                assert.lengthOf(result.sample, 1);
            });

            it('selectAllSubnodes3 - node.id === 1', function(){
                const node = result.sample[0];
                assert.equal(node.id, 2);
            });
        });

        describe('select subnodes in hierarchy', function(){
            let root, result;
            
            before(function(){
                /*
                  root
                  - node1
                  -- node2
                  -- node3
                 */
                
                root = new Node(0);

                const node1 = new Node(1),
                      node2 = new Node(2),
                      node3 = new Node(3);
                const subnode1 = new Subnode(4, node1),
                      subnode2 = new Subnode(5, node2),
                      subnode3 = new Subnode(6, node3);

                root._subnodes.set(node1.id, subnode1);
                node1._subnodes.set(node2.id, subnode2);
                node1._subnodes.set(node3.id, subnode3);
            });

            it('selectAllSubnodes4 - result.isOk()', function(){
                result =
                      root.selectAllSubnodes((n) => (n.id === 3), true);
                assert.isTrue(result.isOk());
            });

            it('selectAllSubnodes5 - result.sample.length === 1', function(){
                assert.lengthOf(result.sample, 1);
            });

            it('selectAllSubnodes6 - node.id === 3', function(){
                const node = result.sample[0];
                assert.equal(node.id, 3);
            });
        });

        describe('returns empty array if nothing was found', function(){
            let root, result;
            
            before(function(){
                root = new Node(0);

                const node1 = new Node(1),
                      node2 = new Node(2),
                      node3 = new Node(3);
                const subnode1 = new Subnode(4, node1),
                      subnode2 = new Subnode(5, node2),
                      subnode3 = new Subnode(6, node3);

                root._subnodes.set(node1.id, subnode1);
                node1._subnodes.set(node2.id, subnode2);
                node1._subnodes.set(node3.id, subnode3);
            });

            it('selectAllSubnodes7 - result.isOk()', function(){
                result =
                      root.selectAllSubnodes((n) => (n.id === 123), true);
                assert.isTrue(result.isOk());
            });

            it('selectAllSubnodes8 - result.sample is empty', function(){
                assert.isEmpty(result.sample);
            })
        });
        
    });

    describe('selectSubnodes', function(){

        describe('select first N instant subnodes', function(){
            let root, result;

            before(function(){
                root = new Node(0);
                
                const node1 = new Node(1),
                      node2 = new Node(2),
                      node3 = new Node(3);
                const subnode1 = new Subnode(4, node1),
                      subnode2 = new Subnode(5, node2),
                      subnode3 = new Subnode(6, node3);

                root._subnodes.set(node1.id, subnode1);
                root._subnodes.set(node2.id, subnode2);
                root._subnodes.set(node3.id, subnode3);
            });

            it('selectSubnodes1 - result.isOk()', function(){
                result =
                    root.selectSubnodes((n) => (n.id % 2), 2, false);
                assert.isTrue(result.isOk());
            });

            it('selectSubnodes2 - result.sample.length === 2', function(){
                assert.lengthOf(result.sample, 2);
            });

            it('selectSubnodes3 - node.id = 1, 3', function(){
                const node1 = result.sample[0],
                      node2 = result.sample[1];
                assert.equal(node1.id, 1);
                assert.equal(node2.id, 3);
            });
        });

        describe('select first N subnodes in hierarchy', function(){
            let root, result;
            
            before(function(){
                root = new Node(0);

                const node1 = new Node(1),
                      node2 = new Node(2),
                      node3 = new Node(3);
                const subnode1 = new Subnode(4, node1),
                      subnode2 = new Subnode(5, node2),
                      subnode3 = new Subnode(6, node3);

                root._subnodes.set(node1.id, subnode1);
                node1._subnodes.set(node2.id, subnode2);
                node1._subnodes.set(node3.id, subnode3);
            });

            it('selectSubnodes4 - result.isOk()', function(){
                result =
                    root.selectSubnodes((n) => (n.id % 2), 2, true);
                assert.isTrue(result.isOk());
            });

            it('selectSubnodes5 - result.sample.length === 2', function(){
                assert.lengthOf(result.sample, 2);
            });

            it('selectSubnodes6 - node.id = 1, 3', function(){
                const node1 = result.sample[0],
                      node2 = result.sample[1];
                assert.equal(node1.id, 1);
                assert.equal(node2.id, 3);
            });
        });

        describe('returns error when nothing found', function(){
            let root, result;
            
            before(function(){
                root = new Node(0);
                
                const node1 = new Node(1),
                      node2 = new Node(2);
                const subnode1 = new Subnode(3, node1),
                      subnode2 = new Subnode(4, node2);

                root._subnodes.set(node1.id, subnode1);
                root._subnodes.set(node2.id, subnode2);
            });

            it('selectSubnodes7 - result.isFail()', function(){
                result =
                    root.selectSubnodes((n) => (n.id === 3), 1, true);
                assert.isTrue(result.isFail());
            });

            it('selectSubnodes8 - result.sample is empty', function(){
                assert.isEmpty(result.sample);
            });
        });

    });

    describe('createSubnode', function(){
        it('creates instant subnodes', function(){
            const rootId = 0;
            const subnodes = new Map();
            const root = new Node(rootId,
                                  {
                                      subnodes
                                  });

            const res = root.createSubnode(rootId);

            assert.isTrue(res.isOk());
            assert.equal(subnodes.size, 1);
        });

        it('creates subnodes in subnodes 1', function(){
            const parentId = 123;
            const storage = new Map();
            const subnodes = new Map([
                [parentId, {
                    _id: parentId,
                    _subnodes: storage,
                    isEmpty: () => false,
                    selectSubnodes: (a, b) => []
                }]
            ]);
            const root = new Node(0, { subnodes });

            const res = root.createSubnode(parentId);

            assert.isTrue(res.isOk());
            assert.equal(storage.size, 1);
        });

        it('creates subnodes in subnodes 2', function(){
            const root = new Node(0);
            const result1 = root.createSubnode(root.id);
            const result2 = root.createSubnode(result1.node.id);

            const result = root.removeSubnode(result2.node.id);
            assert.isTrue(result.isOk(), result.description);
        });

        it('may return SubnodeNotFound error', function(){
            const root = new Node(0);

            const res = root.createSubnode(404);

            assert.isTrue(res.isFail());
            assert.equal(res._type, ErrorType.SubnodeNotFound);
        });

        it('returns node with result', function(){
            const root = new Node(0);

            const res = root.createSubnode(0);
            assert.property(res, 'node');
            assert.instanceOf(res.node, Node);
        });
    });

    describe('removeSubnode', function(){
        it('removes instant subnodes', function(){
            const rootId = 0;
            const subnodes = new Map();
            const root = new Node(rootId, { subnodes });

            const createResult = root.createSubnode(rootId);
            const removeResult = root.removeSubnode(createResult.node.id);

            assert.isTrue(removeResult.isOk());
            assert.equal(subnodes.size, 0);
        });

        it('remove subnodes in subnodes', function(){
            const root = new Node(0);
            const result1 = root.createSubnode(root.id);
            const result2 = root.createSubnode(result1.node.id);

            const result = root.removeSubnode(result2.node.id);
            assert.isTrue(result.isOk());

            const query = root.getSubnodeById(result2.node.id);
            assert.isTrue(query.isFail());
        });

        it('returns error when subnode can not be found', function(){
            const root = new Node(0);

            const result = root.removeSubnode(0);

            assert.isTrue(result.isFail());
        });
    });

    describe('injectNode', function(){
        it('injects subnodes to root', function(){
            const subnodes = new Map();
            const root = new Node(0, { subnodes });
            const child = new Node(IDENTIFIER.next());

            const result = root.injectSubnode(0, child);

            assert.isTrue(result.isOk());
            assert.lengthOf(subnodes, 1);
        });

        it('injects subnodes to hierarchy', function(){
            const root = new Node(0);
            
            const subnodes = new Map();
            const child = new Node(IDENTIFIER.next(), { subnodes });
            root.injectSubnode(0, child);

            const rat = new Node(IDENTIFIER.next());
            const result = root.injectSubnode(child.id, rat);

            assert.isTrue(result.isOk());
            assert.lengthOf(subnodes, 1);
        });

        it('returns error when subnode can not be found', function(){
            const root = new Node(0);

            const result = root.injectSubnode(-1, 'mock');

            assert.isTrue(result.isFail());
        });
    });

});

function flatTree1() {
    /*
      root
      - node1
      - node2
    */
    
    const root = new Node(0);
    
    root.addSubnode(new Node(1));
    root.addSubnode(new Node(2));

    return root;
}

function flatTree1a() {
    /*
      same to flatTree1, but root has 3 childs
     */

    const root = new Node(0);
    
    root.addSubnode(new Node(1));
    root.addSubnode(new Node(2));
    root.addSubnode(new Node(3));

    return root;
}

function complexTree1() {
    /*
      root
      - node1
      -- node2
      -- node3
    */
    
    const root = new Node(0);
    const node1 = new Node(1);

    root.addSubnode(node1);
    node1.addSubnode(new Node(2));
    node1.addSubnode(new Node(3));

    return root;
}

function complexTree2() {
    /*
      structure:
      root
      - node1
      -- node3 (logical)
      - node2
      -- node3 (logical)
      - node3 (physical)
    */

    const root = new Node(0);

    const node = [new Node(1), new Node(2), new Node(3)];
    const definition = {
        logicalOwn: SubnodeOwnership.Here,
        physicalOwn: SubnodeOwnership.Supnode
    };

    root.addSubnode(node[0]);
    root.addSubnode(node[1]);
    root.addSubnode(node[2], {
        logicalOwn: SubnodeOwnership.Subnode,
        physicalOwn: SubnodeOwnership.Supnode
    });

    node[0].addSubnode(node[2], definition);
    node[1].addSubnode(node[2], definition);

    return root;
}

function complexTree3() {
    /*
      structure:
      root
      - node1
      - node2
      -- node3 (physical)
      - node3 (logical)
    */

    const root = new Node(0);
    const node = [new Node(1), new Node(2), new Node(3)];

    root.addSubnode(node[0]);
    root.addSubnode(node[1]);
    root.addSubnode(null, {
        logicalOwn: SubnodeOwnership.Here,
        physicalOwn: SubnodeOwnership.Supnode
    }, node[2].id);

    node[1].addSubnode(node[2], {
        logicalOwn: SubnodeOwnership.Here,
        physicalOwn: SubnodeOwnership.Here
    });

    return root;
}

describe('Node', function(){

    describe('selectNodesAll', function(){

        describe('select root and subnodes', function(){
            let root, result;
            
            before(function(){
                root = flatTree1();
            });

            it('selectNodesAll1 - result.isOk()', function(){
                result =
                    root.selectNodesAll((n) => (n.id % 2 === 0), false);
                assert.isTrue(result.isOk());
            });

            it('selectNodesAll2 - result.sample.length === 2', function(){
                assert.lengthOf(result.sample, 2);
            });

            it('selectNodesAll3 - node.id === 0, 2', function(){
                const node = [result.sample[0], result.sample[1]];
                assert.isTrue(node[0].id === 0 && node[1].id === 2);
            });
        });

        describe('select subnodes in hierarchy', function(){
            let root, result;
            
            before(function(){
                root = complexTree1();
            });

            it('selectNodesAll4 - result.isOk()', function(){
                result =
                      root.selectNodesAll((n) => (n.id === 3), true);
                assert.isTrue(result.isOk());
            });

            it('selectNodesAll5 - result.sample.length === 1', function(){
                assert.lengthOf(result.sample, 1);
            });

            it('selectNodesAll6 - node.id === 3', function(){
                const node = result.sample[0];
                assert.equal(node.id, 3);
            });
        });

        describe('select shared subnodes unaware of ownership', function(){
            let root, result;

            before(function(){
                root = complexTree2();
            });

            it('selectNodesAll9 - result.isOk()', function(){
                result =
                    root.selectNodesAll((n, c, parent) => (parent === root),
                                           true);
                assert.isTrue(result.isOk());
            });

            it('selectNodesAll10 - result.sample.length === 3', function(){
                assert.lengthOf(result.sample, 3);
            });

            it('selectNodesAll11 - selected node.id === 1, 2, 3', function(){
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
                root = complexTree3();
            });

            it('selectNodesAll12 - result.isOk()', function(){
                result =
                    root.selectNodesAll((n, c, parent) => (parent === root),
                                           true);
                assert.isTrue(result.isOk());
            });

            it('selectNodesAll13 - result.sample.length === 2', function(){
                assert.lengthOf(result.sample, 2);
            });

            it('selectNodesAll14 - selected node.id === 1, 2', function(){
                const node = [result.sample[0], result.sample[1]];
                assert.isTrue(node[0].id === 1 &&
                              node[1].id === 2);
            });
        });

        describe('returns empty array if nothing was found', function(){
            let root, result;
            
            before(function(){
                root = complexTree1();
            });

            it('selectNodesAll7 - result.isOk()', function(){
                result =
                      root.selectNodesAll((n) => (n.id === 123), true);
                assert.isTrue(result.isOk());
            });

            it('selectNodesAll8 - result.sample is empty', function(){
                assert.isEmpty(result.sample);
            })
        });
        
    });

    describe('selectNodes', function(){

        describe('select first N subnodes and root', function(){
            let root, result;

            before(function(){
                root = flatTree1a();
            });

            it('selectNodes1 - result.isOk()', function(){
                result =
                    root.selectNodes((n) => (n.id % 2 === 0), 2, false);
                assert.isTrue(result.isOk());
            });

            it('selectNodes2 - result.sample.length === 2', function(){
                assert.lengthOf(result.sample, 2);
            });

            it('selectNodes3 - node.id = 0, 2', function(){
                const node = [result.sample[0], result.sample[1]];
                assert.equal(node[0].id, 0);
                assert.equal(node[1].id, 2);
            });
        });

        describe('select first N subnodes in hierarchy', function(){
            let root, result;
            
            before(function(){
                root = complexTree1();
            });

            it('selectNodes4 - result.isOk()', function(){
                result =
                    root.selectNodes((n) => (n.id % 2), 2, true);
                assert.isTrue(result.isOk());
            });

            it('selectNodes5 - result.sample.length === 2', function(){
                assert.lengthOf(result.sample, 2);
            });

            it('selectNodes6 - node.id = 1, 3', function(){
                const node = [result.sample[0], result.sample[1]];
                assert.equal(node[0].id, 1);
                assert.equal(node[1].id, 3);
            });
        });

        describe('select N nodes unaware of sharing', function(){
            let root, result;

            before(function(){
                root = complexTree2();
            });

            it('selectNodes11 - result.isOk()', function(){
                result =
                    root.selectNodes((n, c, parent) => (parent === root),
                                     3, true);
                assert.isTrue(result.isOk());
            });

            it('selectNodes12 - result.sample.length === 3', function(){
                assert.lengthOf(result.sample, 3);
            });

            it('selectNodes13 - selected node.id === 1, 2, 3', function(){
                const node = [result.sample[0], result.sample[1],
                              result.sample[2]];
                assert.isTrue(node[0].id === 1 &&
                              node[1].id === 2 &&
                              node[2].id === 3);
            });
        });

        describe('select N nodes unaware of deriving', function(){
            let root, result;

            before(function(){
                root = complexTree3();
            });

            it('selectNodes14 - result.isFail()', function(){
                result =
                    root.selectNodes((n, c, parent) => (parent === root),
                                     3, true);
                assert.isTrue(result.isFail());
            });

            it('selectNodes15 - result.sample.length === 2', function(){
                assert.lengthOf(result.sample, 2);
            });

            it('selectNodes16 - selected node.id === 1, 2', function(){
                const node = [result.sample[0], result.sample[1]];
                assert.isTrue(node[0].id === 1 &&
                              node[1].id === 2);
            });
        });

        describe('returns error when nothing found', function(){
            let root, result;
            
            before(function(){
                root = flatTree1();
            });

            it('selectNodes7 - result.isFail()', function(){
                result =
                    root.selectNodes((n) => (n.id === 3), 1, true);
                assert.isTrue(result.isFail());
            });

            it('selectNodes8 - result.sample is empty', function(){
                assert.isEmpty(result.sample);
            });
        });

        describe('returns error when found not enough nodes', function(){
            let root, result;
            
            before(function(){
                root = flatTree1();
            });

            it('selectNodes9 - result.isFail()', function(){
                result =
                    root.selectNodes((n) => (n.id % 2), 2, true);
                assert.isTrue(result.isFail());
            });

            // when nodes not enough, selectNodes will return all
            // relevant nodes
            it('selectNodes10 - result.sample.length === 1', function(){
                assert.lengthOf(result.sample, 1);
            });
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

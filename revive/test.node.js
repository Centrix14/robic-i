const IDENTIFIER = {
    i: 0,
    next: () => IDENTIFIER.i++
};

describe('Node', function(){

    describe('selectSubnodes', function(){
        it('selects instant subnodes', function(){
            const subnodes = new Map([
                [0,0], [1,1], [2,2], [3,3], [4,4]
            ]);
            const root = new Node(0, { subnodes });

            const array = root.selectSubnodes((n) => (n % 2 === 0), false);
            assert.deepEqual(array, [0, 2, 4]);
        });

        it('selects subnodes recursively', function(){
            const rootId = 0;
            const subnodes = new Map([
                [1,
                 {
                     selectSubnodes: (a, b) => [1, 2, 3]
                 }]
            ]);
            const root = new Node(rootId, {subnodes});

            const array = root.selectSubnodes((n) => false, true);
            assert.deepEqual(array, [1, 2, 3]);
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
            const result1 = root.createSubnode(root._id);
            const result2 = root.createSubnode(result1.node._id);

            const result = root.removeSubnode(result2.node._id);
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

            const result = root.createSubnode(rootId);
            root.removeSubnode(result.node._id);

            assert.isTrue(result.isOk());
            assert.equal(subnodes.size, 0);
        });

        it('remove subnodes in subnodes', function(){
            const root = new Node(0);
            const result1 = root.createSubnode(root._id);
            const result2 = root.createSubnode(result1.node._id);

            const result = root.removeSubnode(result2.node._id);
            assert.isTrue(result.isOk());

            const query = root.getSubnodeById(result2.node._id);
            assert.isTrue(query.isEmpty());
        });

        it('may return SubnodeNotFound', function(){
            const root = new Node(0);

            const result = root.removeSubnode(0);

            assert.isTrue(result.isFail());
            assert.equal(result._type, ErrorType.SubnodeNotFound);
        });
    });

});

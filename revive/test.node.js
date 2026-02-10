const IDENTIFIER = {
    i: 0,
    next: () => IDENTIFIER.i++
};

describe('Node', function(){

    describe('selectAllSubnodes', function(){
        it('selects instant subnodes', function(){
            const subnodes = new Map([
                [0,0], [1,1], [2,2], [3,3], [4,4]
            ]);
            const root = new Node(0, { subnodes });

            const result = root.selectAllSubnodes((_, n) => (n % 2 === 0), false);
            assert.deepEqual(result.sample, [0, 2, 4]);
        });

        it('selects subnodes recursively', function(){
            const rootId = 0;
            const subnodes = new Map([
                [1,
                 {
                     selectAllSubnodes: function(_, _) {
                         const result = new Result();
                         result.sample = [1, 2, 3];
                         return result;
                     }
                 }]
            ]);
            const root = new Node(rootId, {subnodes});

            const result = root.selectAllSubnodes((a, b) => false, true);
            assert.deepEqual(result.sample, [1, 2, 3]);
        });
    });

    describe('selectSubnodes', function(){
        it('selects first N subnodes', function(){
            const subnodes = new Map([
                [0,0], [1,1], [2,2], [3,3], [4,4]
            ]);
            const root = new Node(0, { subnodes });

            const result = root.selectSubnodes((_, n) => (n % 2 === 0), 2, false);
            assert.deepEqual(result.sample, [0, 2]);
        });

        it('selects first N subnodes recursively', function(){
            const rootId = 0;
            const subnodes = new Map([
                [1,
                 {
                     selectSubnodes: function(_, _, _) {
                         const result = new Result();
                         result.sample = [1, 2];
                         return result;
                     }
                 }]
            ]);
            const root = new Node(rootId, {subnodes});

            const result = root.selectSubnodes((_, n) => false, 2, true);
            assert.deepEqual(result.sample, [1, 2]);
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
            assert.isTrue(query.isEmpty());
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
    });

});

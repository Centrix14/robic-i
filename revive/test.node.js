let namespace, __i;

function __(message) {
    return `[${namespace}${__i++}] — ${message}`;
}

function nit(name, fn) {
    it(__(name), fn);
}

const IDENTIFIER = {
    i: 0,
    next: () => IDENTIFIER.i++
};

namespace='Node', __i=0;

describe('Node', function(){

    describe('selectAllSubnodes', function(){

        describe('select instant subnodes', function(){
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

            it('selectAllSubnodes1 - result.isOk()', function(){
                result =
                    root.selectAllSubnodes((_, n) => (n.id === 2), false);
                assert.isTrue(result.isOk());
            });

            it('selectAllSubnodes3 - result.sample.length === 1', function(){
                assert.lengthOf(result.sample, 1);
            });

            it('selectAllSubnodes2 - node.id === 1', function(){
                const node = result.sample[0];
                assert.equal(node.id, 2);
            });
        });

        describe('select subnodes in hierarchy', function(){
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

            it('selectAllSubnodes4 - result.isOk()', function(){
                result =
                      root.selectAllSubnodes((_, n) => (n.id === 3), true);
            });

            it('selectAllSubnodes5 - result.sample.length === 1', function(){
                assert.lengthOf(result.sample, 1);
            });

            it('selectAllSubnodes6 - node.id === 3', function(){
                const node = result.sample[0];
                assert.equal(node.id, 3);
            });
        });
        
    });

    describe('selectSubnodes', function(){
        nit('selects first N subnodes', function(){
            const subnodes = new Map([
                [0,0], [1,1], [2,2], [3,3], [4,4]
            ]);
            const root = new Node(0, { subnodes });

            const result = root.selectSubnodes((_, n) => (n % 2 === 0), 2, false);
            assert.deepEqual(result.sample, [0, 2]);
        });

        nit('selects first N subnodes recursively', function(){
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
        nit('creates instant subnodes', function(){
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

        nit('creates subnodes in subnodes 1', function(){
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

        nit('creates subnodes in subnodes 2', function(){
            const root = new Node(0);
            const result1 = root.createSubnode(root.id);
            const result2 = root.createSubnode(result1.node.id);

            const result = root.removeSubnode(result2.node.id);
            assert.isTrue(result.isOk(), result.description);
        });

        nit('may return SubnodeNotFound error', function(){
            const root = new Node(0);

            const res = root.createSubnode(404);

            assert.isTrue(res.isFail());
            assert.equal(res._type, ErrorType.SubnodeNotFound);
        });

        nit('returns node with result', function(){
            const root = new Node(0);

            const res = root.createSubnode(0);
            assert.property(res, 'node');
            assert.instanceOf(res.node, Node);
        });
    });

    describe('removeSubnode', function(){
        nit('removes instant subnodes', function(){
            const rootId = 0;
            const subnodes = new Map();
            const root = new Node(rootId, { subnodes });

            const createResult = root.createSubnode(rootId);
            const removeResult = root.removeSubnode(createResult.node.id);

            assert.isTrue(removeResult.isOk());
            assert.equal(subnodes.size, 0);
        });

        nit('remove subnodes in subnodes', function(){
            const root = new Node(0);
            const result1 = root.createSubnode(root.id);
            const result2 = root.createSubnode(result1.node.id);

            const result = root.removeSubnode(result2.node.id);
            assert.isTrue(result.isOk());

            const query = root.getSubnodeById(result2.node.id);
            assert.isTrue(query.isFail());
        });

        nit('returns error when subnode can not be found', function(){
            const root = new Node(0);

            const result = root.removeSubnode(0);

            assert.isTrue(result.isFail());
        });
    });

    describe('injectNode', function(){
        nit('injects subnodes to root', function(){
            const subnodes = new Map();
            const root = new Node(0, { subnodes });
            const child = new Node(IDENTIFIER.next());

            const result = root.injectSubnode(0, child);

            assert.isTrue(result.isOk());
            assert.lengthOf(subnodes, 1);
        });

        nit('injects subnodes to hierarchy', function(){
            const root = new Node(0);
            
            const subnodes = new Map();
            const child = new Node(IDENTIFIER.next(), { subnodes });
            root.injectSubnode(0, child);

            const rat = new Node(IDENTIFIER.next());
            const result = root.injectSubnode(child.id, rat);

            assert.isTrue(result.isOk());
            assert.lengthOf(subnodes, 1);
        });

        nit('returns error when subnode can not be found', function(){
            const root = new Node(0);

            const result = root.injectSubnode(-1, 'mock');

            assert.isTrue(result.isFail());
        });
    });

});

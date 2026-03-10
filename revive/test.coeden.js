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

    it('dropNode2 - drops connections from given node', function(){
        const g = new Graph();

        g.addNode(0, 'target');
        g.addNode(1, 'buddy');
        g.connect(0, 1, {
            direction: ConnectDirections.Direct,
            data: 'connection'
        });

        g.dropNode(0);

        assert.isFalse(g.areAdjacents(0, 1), 'Connection was not dropped');
    });

    it('dropNode3 - drops connection to given node too', function(){
        const g = new Graph();

        g.addNode(0, 'target');
        g.addNode(1, 'buddy1');
        g.addNode(2, 'buddy2');

        g.connect(0, 1, {
            direction: ConnectDirections.Both,
            data: 'connection'
        });
        g.connect(1, 2, {
            direction: ConnectDirections.Both,
            data: 'connection'
        });

        g.dropNode(0);

        assert.isFalse(g.areAdjacents(0, 1),
                       'Direct connection was not dropped');
        assert.isFalse(g.areAdjacents(1, 0),
                       'Inverse connection was not dropped');
        assert.isTrue(g.areAdjacents(1, 2),
                      'Wrong connection was dropped');
    });

});

describe('serialize', function(){

    let g, store, nodeFnCalled, connectionFnCalled;

    function nodeFn(value) {
        if (value === 'target' || value === 'buddy1' || value === 'buddy2')
            nodeFnCalled = true;
        else
            nodeFnCalled = false;
        return value;
    }

    function connectionFn(value) {
        if (value === 'connection')
            connectionFnCalled = true;
        else
            connectionFnCalled = false;
        return value;
    }

    before(function(){
        g = new Graph();

        g.addNode(0, 'target');
        g.addNode(1, 'buddy1');
        g.addNode(2, 'buddy2');

        g.connect(0, 1, {
            direction: ConnectDirections.Both,
            data: 'connection'
        });
        g.connect(1, 2, {
            direction: ConnectDirections.Both,
            data: 'connection'
        });

        store = g.serialize({ nodeFn, connectionFn });
    })

    it('serialize1 - return whole graph as object', function(){
        assert.isObject(store, 'Method returns not object');
    });

    it('serialize2 - serialized value includes nodes', function(){
        assert.deepPropertyVal(
            store, 'nodes',
            [
                ['0', 'target'],
                ['1', 'buddy1'],
                ['2', 'buddy2']
            ],
            'Method does not include valid nodes'
        );
    });

    it('serialize3 - serialized value includes adjacency', function(){
        assert.deepPropertyVal(
            store, 'adjacency',
            [
                ['1', [['0', 'connection'], ['2', 'connection']]],
                ['0', [['1', 'connection']]],
                ['2', [['1', 'connection']]]
            ],
            'Method does not include valid adjacency table'
        );
    });

    it('serialize4 - serializers called for graph content', function(){
        assert.isTrue(nodeFnCalled, 'Node serializer called unproperly');
        assert.isTrue(connectionFnCalled,
                      'Connection serializer called unproperly');
    });

});

describe('deserialize', function(){

    let g = new Graph();
    let nodeFnCalled, connectionFnCalled;

    function nodeFn(value) {
        if (value === 'target' || value === 'buddy1' || value === 'buddy2')
            nodeFnCalled = true;
        else
            nodeFnCalled = false;
        return value;
    }

    function connectionFn(value) {
        if (value === 'connection')
            connectionFnCalled = true;
        else
            connectionFnCalled = false;
        return value;
    }

    before(function(){
        const src = new Graph();

        src.addNode(0, 'target');
        src.addNode(1, 'buddy1');
        src.addNode(2, 'buddy2');

        src.connect(0, 1, {
            direction: ConnectDirections.Both,
            data: 'connection'
        });
        src.connect(1, 2, {
            direction: ConnectDirections.Both,
            data: 'connection'
        });

        const store = src.serialize();

        g.deserialize(store, { nodeFn, connectionFn });
    });

    it('deserialize1 - returns correct graph', function(){
        assert.isTrue(g.areAdjacents(0, 1), 'Deserialization failed');
        assert.isTrue(g.areAdjacents(1, 2), 'Deserialization failed');
    });

    it('deserialize2 - deserializers called for source content', function(){
        assert.isTrue(nodeFnCalled, 'Node serializer called unproperly');
        assert.isTrue(connectionFnCalled,
                      'Connection serializer called unproperly');
    });

});

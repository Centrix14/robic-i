const ConnectDirections = {
    Direct: 1,
    Inverse: 2,
    Both: 3
}

const NodeFields = {
    Id: 1,
    Data: 2
}

const DefaultGraphOptions = {
    nodes: null,
    adjacency: null
}

class Graph {
    constructor(options=DefaultGraphOptions) {
        this._nodes = options.nodes ?? new Map();
        this._adjacency = options.adjacency ?? new Map();
    }

    nodes(field) {
        if (field === NodeFields.Id)
            return this._nodes.keys().toArray();
        if (field === NodeFields.Data)
            return this._nodes.values().toArray();
    }

    hasNode(id) {
        return this._nodes.has(id);
    }

    getNode(id) {
        return this._nodes.get(id) ?? null;
    }

    getNodeId(data) {
        for (let [id, nodeData] of this._nodes.entries()) {
            if (data === nodeData)
                return id;
        }
    }

    hasAdjacents(id) {
        return this._adjacency.has(id);
    }

    getAdjacents(id, field=NodeFields.Id) {
        const adjacency = this._adjacency.get(id).keys();

        if (field === NodeFields.Id)
            return adjacency.toArray();
        if (field === NodeFields.Data)
            return adjacency.map((id) => this.getNode(id)).toArray();
    }

    getAdjacencyData(id1, id2) {
        return this._adjacency.get(id1).get(id2);
    }

    areAdjacents(id1, id2) {
        const adjacency = this._adjacency.get(id1) ?? new Map();
        return adjacency.has(id2);
    }

    addNode(id, data) {
        if (this.hasNode(id))
            return new Fail();

        this._nodes.set(id, data);
        return new Success();
    }

    _bareConnect(id1, id2, data) {
        if (!this.hasAdjacents(id1))
            this._adjacency.set(id1, new Map());

        const entry = this._adjacency.get(id1);
        if (entry.has(id2))
            return new Fail();

        entry.set(id2, data);

        return new Success();
    }

    connect(id1, id2, options) {
        switch (options.direction) {

        case ConnectDirections.Inverse:
            return this._bareConnect(id2, id1, options.data);

        case ConnectDirections.Both:
            const result = this._bareConnect(id2, id1, options.data);
            if (result.isFail) return result;

        case ConnectDirections.Direct:
            return this._bareConnect(id1, id2, options.data);
        }
    }

    _bareDisconnect(id1, id2) {
        const adjacency = this._adjacency.get(id1) ?? new Map();
        const data = adjacency.get(id2);

        if (adjacency.delete(id2))
            return new Success([['data', data]]);
        return new Fail([['data', data]]);
    }

    disconnect(id1, id2, direction) {
        switch (direction) {

        case ConnectDirections.Inverse:
            return this._bareDisconnect(id2, id1);

        case ConnectDirections.Both:
            const result = this._bareDisconnect(id2, id1);
            if (result.isFail) return result;

        case ConnectDirections.Direct:
            return this._bareDisconnect(id1, id2);
        }
    }

    _dropNodeConnections(id) {
        this._adjacency.delete(id);

        for (let [sourceId, targets] of this._adjacency.entries())
            targets.delete(id);
    }

    _dropNodeItself(id) {
        const node = this.getNode(id);
        this._nodes.delete(id);
        return node;
    }

    dropNode(id) {
        if (this.hasNode(id)) {
            this._dropNodeConnections(id);
            return new Success([['data', this._dropNodeItself(id)]]);
        }

        return new Fail();
    }

    _serializeNodes(serializer=((v)=>v)) {
        return Array.from(this._nodes).map(
            ([key, value]) => [key, serializer(value)]
        );
    }

    _serializeAdjacents(serializer=((v)=>v)) {
        return Array.from(this._adjacency).map(
            ([key, list]) => [key, Array.from(list).map(
                ([key, value]) => [key, serializer(value)]
            )]
        );
    }

    serialize(options) {
        return {
            nodes: this._serializeNodes(options?.nodeFn),
            adjacency: this._serializeAdjacents(options?.connectionFn)
        };
    }

    _deserializeNodes(source, deserializer=((v)=>v)) {
        return new Map(
            source.map(([key, value]) => [key, deserializer(value)])
        );
    }

    _deserializeAdjacents(source, deserializer=((v)=>v)) {
        return new Map(
            source.map(
                ([key, entry]) => [key, new Map(
                    entry.map(([target, data]) => [target, deserializer(data)])
                )]
            )
        );
    }

    deserialize(source, options) {
        this._nodes = this._deserializeNodes(source.nodes, options?.nodeFn);
        this._adjacency =
            this._deserializeAdjacents(source.adjacency, options?.connectionFn);
    }
}

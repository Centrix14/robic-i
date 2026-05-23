class ElementExport {
    static toCSV(table) {
        let csvTable = '';

        for (let row of table) {
            let csvRow = '';

            for (let column of row) {
                if (typeof column === 'string')
                    csvRow += `\"${column}\",`;
                else
                    csvRow += `${column},`;
            }

            csvTable += csvRow.slice(0, csvRow.length-1) + '\n';
        }

        return csvTable;
    }

    constructor(settings) {
        this._settings = settings;
        this.clear();
    }

    clear() {
        this._inputs = [];
        this._outputs = [];
        this._doers = [];
        this._means = [];
    }

    _addEntry(adjacent, element, role) {
        const adjacentName = adjacent._accordance.name,
              elementName = element._accordance.name;

        switch (role) {
        case Element.Role.Input:
            this._inputs.push([adjacentName, elementName, 'input']);
            break;

        case Element.Role.Output:
            this._outputs.push([adjacentName, elementName, 'output']);
            break;

        case Element.Role.Doer:
            this._doers.push([adjacentName, elementName, 'doer']);
            break;

        case Element.Role.Mean:
            this._means.push([adjacentName, elementName, 'mean']);
            break;
        }
    }

    _fill(graph) {
        const nodes = graph.nodes(NodeFields.All);

        for (let [id, node] of nodes) {
            if (node.type !== Unit.Type.Element)
                continue;

            const adjacentIds = graph.getAdjacents(id, NodeFields.Id);
            for (let adjacentId of adjacentIds) {
                const connection = graph.getAdjacencyData(id, adjacentId),
                      adjacent = graph.getNode(adjacentId);

                if (adjacent.isSystem)
                    continue;

                this._addEntry(adjacent, node, connection.role);
            }
        }
    }

    make(graph) {
        this.clear();
        this._fill(graph);

        let table = '';

        if (this._settings.inputs)
            table += ElementExport.toCSV(this._inputs);
        if (this._settings.outputs)
            table += ElementExport.toCSV(this._outputs);
        if (this._settings.doers)
            table += ElementExport.toCSV(this._doers);
        if (this._settings.means)
            table += ElementExport.toCSV(this._means);

        return table;
    }
}

class CSVExport {
    exportAccordance(units) {
        let table = [[
            'name', 'note', 'activity',
        ]];

        for (let unit of units) {
            if (!unit?.isSystem) {
                const json = Accordance.toJSON(unit._accordance);
                table.push([
                    json.name, json.note, json.activity,
                ]);
            }
        }

        return CSVPort.toCSV(table);
    }

    exportProcess(units) {
        let table = [[
            'name', 'note', 'activity',
            'objective', 'owner', 'environment', 'pov',
        ]];

        for (let unit of units) {
            if (unit.type === Unit.Type.Process && !unit?.isSystem) {
                const json = Process.toJSON(unit._accordance);
                table.push([
                    json.name, json.note, json.activity,
                    json.objective, json.owner, json.environment, json.pov,
                ]);
            }
        }

        return CSVPort.toCSV(table);
    }

    exportDeviation(units) {
        let table = [[
            'name', 'note', 'cause', 'activity',
        ]];

        for (let unit of units) {
            if (!unit?.isSystem) {
                const json = Deviation.toJSON(unit._deviation);
                if (json.name === '')
                    continue;

                table.push([
                    json.name, json.note, json.cause, json.activity,
                ]);
            }
        }

        return CSVPort.toCSV(table);
    }

    exportRisk(units) {
        let table = [[
            'name', 'note', 'cause', 'activity',
            'character', 'LCStep', 'outrunning', 'profit',
            'probability', 'score', 'error',
        ]];

        for (let unit of units) {
            if (unit.type === Unit.Type.Process && !unit?.isSystem) {
                const json = Risk.toJSON(unit._deviation);
                if (json.name === '')
                    continue;

                table.push([
                    json.name, json.note, json.cause, json.activity,
                    json.character, json.LCStep, json.outrunning, json.profit,
                    json.probability, json.score, json.error,
                ]);
            }
        }

        return CSVPort.toCSV(table);
    }
}

class CSVExportElement {
    constructor() {
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

    make(graph, roles) {
        this._fill(graph);

        let table = [['process', 'element', 'role']];
        if (roles.inputs)
            table.push(...this._inputs);
        if (roles.outputs)
            table.push(...this._outputs);
        if (roles.doers)
            table.push(...this._doers);
        if (roles.means)
            table.push(...this._means);

        return CSVPort.toCSV(table);
    }
}

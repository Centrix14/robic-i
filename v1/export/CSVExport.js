class CSVExport {
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
}

class ProcessRegistry {
    constructor() {
        this.data = {};
    }

    fill(diagram) {
        let table = [];

        const units = diagram.graph.nodes(NodeFields.Data);
        for (let unit of units) {
            if (unit?.isSystem || unit.type !== Unit.Type.Process)
                continue;

            const process = unit._accordance;
            const json = Process.toJSON(process);
            if (json.name === '')
                continue;

            table.push({
                'код': '!!!',
                'активный': json.activity,
                'имя': json.name,
                'цель': json.objective,
                'владелец': json.owner,
                'среда': json.environment,
                'точкаЗрения': json.pov,
                'заметка': json.note,
            });
        }

        const diagramJSON = Diagram.toJSON(diagram);

        let name = diagramJSON.name, author = diagramJSON.author, changed;

        if (name === '')
            name = 'Не задано';
        if (author === '')
            author = 'Не задан';

        if (diagramJSON.changed === null || diagramJSON.changed === '')
            changed = 'Не задана';
        else {
            const date = new Date(diagramJSON.changed);
            changed = date.toLocaleString();
        }

        this.data = {
            'диаграмма': {
                'имя': name,
                'автор': author,
                'редакция': changed,
            },
            'процесс': table,
        };

        return this.data;
    }

    async print(template) {
        let report;
        try {
            report = await createReport({
                template,
                cmdDelimiter: ['{', '}'],
                data: this.data,
            });
        }
        catch (error) {
            if (error instanceof CommandExecutionError) {
                console.log(`Unfulfilled fields -- ${error.command}`);
                return;
            }
            else
                throw error;
        }

        return report;
    }
}

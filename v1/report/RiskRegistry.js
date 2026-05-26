class RiskRegistry {
    constructor() {
        this.data = {};
    }

    fill(diagram) {
        let table = [];

        let id = 0;
        const units = diagram.graph.nodes(NodeFields.Data);
        for (let unit of units) {
            if (unit?.isSystem || unit.type !== Unit.Type.Process)
                continue;

            const risk = unit._deviation;
            const json = Risk.toJSON(risk);
            if (json.name === '')
                continue;

            table.push({
                'код': `Р${id}`,
                'активный': represent(json.activity),
                'имя': json.name,
                'причина': json.cause,
                'характер': represent(json.character),
                'этапЖЦ': json.LCStep,
                'опережение': json.outrunning,
                'прибыль': json.profit,
                'оценка': json.score,
                'вероятность': json.probability,
                'ошибка': json.error,
                'заметка': json.note,
            });

            id++;
        }

        const diagramJSON = Diagram.toJSON(diagram);

        let name = diagramJSON.name, author = diagramJSON.author, changed;

        if (name === '')
            name = 'Не задано';
        if (author === '')
            author = 'Не задан';

        if (diagramJSON.changed === null || diagramJSON.changed === '')
            changed = 'Не задана';
        else
            changed = diagramJSON.changed.toLocaleString();

        this.data = {
            'диаграмма': {
                'имя': name,
                'автор': author,
                'редакция': changed,
            },
            'риск': table,
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

function exportToPng(svg) {
    const serializer = new XMLSerializer();
    const data = serializer.serializeToString(svg);
    const vectorBlob = new Blob([data], { type: 'image/svg+xml' });
    const vectorURL = URL.createObjectURL(vectorBlob);

    const image = document.createElement('img');
    image.onload = () => {
        const rect = svg.getBoundingClientRect();

        const canvas = document.createElement('canvas');
        canvas.height = rect.height;
        canvas.width = rect.width;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, rect.width, rect.height);

        canvas.toBlob((rasterBlob) => {
            const rasterURL = URL.createObjectURL(rasterBlob);

            const a = document.createElement('a');
            a.href = rasterURL;
            a.download = 'export.png';
            a.click();

            URL.revokeObjectURL(vectorURL);
            URL.revokeObjectURL(rasterURL);
        });
    };
    image.src = vectorURL;
}

function exportProcessesToCSV(units) {
    let table = 'name,note,activity,objective,owner,environment,pov\n';

    for (let unit of units) {
        if (unit.type === Unit.Type.Process && !unit?.isSystem) {
            const j = Process.toJSON(unit._accordance);
            table += `${j.name},${j.note},${j.activity},${j.objective},${j.owner},${j.environment},${j.pov}\n`;
        }
    }

    return table;
}

function exportDeviationsToCSV(units) {
    let table = 'name,note,cause,activity\n';

    for (let unit of units) {
        if (!unit?.isSystem) {
            const j = Deviation.toJSON(unit._deviation);
            table += `${j.name},${j.note},${j.cause},${j.activity}\n`;
        }
    }

    return table;
}

function exportRisksToCSV(units) {
    let table = 'name,note,cause,activity,character,LCStep,outrunning,profit,probability,score,error\n';

    for (let unit of units) {
        if (!unit?.isSystem) {
            const j = Risk.toJSON(unit._deviation);
            table += `${j.name},${j.note},${j.cause},${j.activity},${j.character},${j.LCStep},${j.outrunning},${j.profit},${j.probability},${j.score},${j.error}\n`;
        }
    }

    return table;
}

function appendProps(doc, target, props) {
    for (let [prop, val] of props) {
        const propLabel = doc.createElement('span');
        propLabel.className = 'property-label';
        propLabel.textContent = prop;

        const propVal = doc.createElement('span');
        propVal.className = 'property-value';
        propVal.textContent = val;

        const entry = doc.createElement('li');
        entry.appendChild(propLabel);
        entry.appendChild(propVal);

        target.appendChild(entry);
    }
}

function buildAccordanceTree(json, doc, root) {
    appendProps(doc, root, [
        ['Заметка', json.note],
        ['Активная', json.activity],
    ]);
}

function buildProcessTree(process, doc, root) {
    const json = Process.toJSON(process);
    appendProps(doc, root, [
        ['Цель', json.objective],
        ['Владелец', json.owner],
        ['Среда', json.environment],
        ['Точка зрения', json.pov],
    ]);
}

function buildElementTree(element, doc, root) {
    const json = Element.toJSON(element);
    appendProps(doc, root, [
        ['Владелец', json.owner],
    ]);
}

function buildDeviationTree(json, doc, root) {
    appendProps(doc, root, [
        ['Заметка', json.note],
        ['Причина', json.cause],
        ['Активная', json.activity],
    ]);
}

function buildRiskTree(risk, doc, root) {
    const json = Risk.toJSON(risk);
    appendProps(doc, root, [
        ['Характер', json.character],
        ['Этап ЖЦ', json.LCStep],
        ['Опережение', json.outrunning],
        ['Прибыль', json.profit],
        ['Оценка', json.score],
        ['Вероятность', json.probability],
        ['Ошибка', json.error],
    ]);
}

function makeSummaryTitle(text, doc) {
    const title = doc.createElement('span');

    title.className = 'summary-title';
    title.textContent = text;

    return title;
}

function makeAccordanceBadge(type, doc) {
    const badge = doc.createElement('span');
    badge.className = 'accordance-badge';

    if (type === Unit.Type.Process) {
        badge.textContent = 'процесс';
        return badge;
    }
    else if (type === Unit.Type.Element) {
        badge.textContent = 'элемент';
        return badge;
    }
}

function makeDeviationBadge(type, doc) {
    const badge = doc.createElement('span');
    badge.className = 'deviation-badge';

    if (type === Unit.Type.Process) {
        badge.textContent = 'риск';
        return badge;
    }
    else if (type === Unit.Type.Element) {
        badge.textContent = 'отклонение';
        return badge;
    }
}

function appendDiagramHeading(text, doc) {
    const heading = doc.createElement('h1');
    heading.textContent = text;

    doc.body.appendChild(heading);
}

function appendDiagramCredentials(diagram, doc) {
    const table = doc.createElement('table');
    table.className = 'credentials-table';

    const rows = {
        author: doc.createElement('tr'),
        changed: doc.createElement('tr'),
    };

    const cols = {
        author: {
            name: doc.createElement('td'),
            value: doc.createElement('td'),
        },

        changed: {
            name: doc.createElement('td'),
            value: doc.createElement('td'),
        },
    };

    function content(elm, text) {
        const tag = doc.createElement('span');
        tag.className = 'credentials-table-data';
        tag.textContent = text;
        elm.appendChild(tag);
    }

    const changedDate = new Date(diagram.changed);

    content(cols.author.name, 'Автор');
    content(cols.author.value, diagram.author);
    content(cols.changed.name, 'Ревизия от');
    content(cols.changed.value, changedDate.toLocaleString());

    rows.author.appendChild(cols.author.name);
    rows.author.appendChild(cols.author.value);
    rows.changed.appendChild(cols.changed.name);
    rows.changed.appendChild(cols.changed.value);

    table.appendChild(rows.author);
    table.appendChild(rows.changed);

    doc.body.appendChild(table);
}

function buildDiagramTree(units, doc) {
    const root = doc.createElement('ul');
    root.className = 'tree';

    for (let unit of units) {
        if (unit.isSystem)
            continue;
        
        const accordance = unit._accordance;

        const accordanceJSON = Accordance.toJSON(accordance);
        if (accordanceJSON.name !== '') {
            const accordanceEntry = doc.createElement('li');

            const accordanceDetails = doc.createElement('details');
            accordanceDetails.open = 'true';

            const accordanceSummary = doc.createElement('summary');

            const accordanceProps = doc.createElement('ul');

            buildAccordanceTree(accordanceJSON, doc, accordanceProps);

            if (unit.type === Unit.Type.Process) {
                accordanceSummary.appendChild(makeAccordanceBadge(
                    Unit.Type.Process, doc,
                ));
                accordanceSummary.appendChild(makeSummaryTitle(
                    accordanceJSON.name, doc,
                ))

                buildProcessTree(accordance, doc, accordanceProps);
            }
            else if (unit.type === Unit.Type.Element) {
                accordanceSummary.appendChild(makeAccordanceBadge(
                    Unit.Type.Element, doc,
                ));
                accordanceSummary.appendChild(makeSummaryTitle(
                    accordanceJSON.name, doc,
                ))

                buildElementTree(accordance, doc, accordanceProps);
            }

            const deviation = unit._deviation,
                  deviationJSON = Deviation.toJSON(deviation);

            if (deviationJSON.name !== '') {
                const deviationEntry = doc.createElement('li');

                const deviationDetails = doc.createElement('details');
                deviationDetails.open = 'true';

                const deviationSummary = doc.createElement('summary');

                const deviationProps = doc.createElement('ul');

                buildDeviationTree(deviationJSON, doc, deviationProps);

                if (unit.type === Unit.Type.Process) {
                    deviationSummary.appendChild(
                        makeDeviationBadge(Unit.Type.Process, doc)
                    );
                    deviationSummary.appendChild(
                        makeSummaryTitle(deviationJSON.name, doc)
                    );

                    buildRiskTree(deviation, doc, deviationProps);
                }
                else if (unit.type === Unit.Type.Element) {
                    deviationSummary.appendChild(
                        makeDeviationBadge(Unit.Type.Element, doc)
                    );
                    deviationSummary.appendChild(
                        makeSummaryTitle(deviationJSON.name, doc)
                    );
                }

                deviationDetails.appendChild(deviationProps);
                deviationDetails.appendChild(deviationSummary);
                deviationEntry.appendChild(deviationDetails);
                accordanceProps.appendChild(deviationEntry);
            }

            accordanceDetails.appendChild(accordanceProps);
            accordanceDetails.appendChild(accordanceSummary);
            accordanceEntry.appendChild(accordanceDetails);
            root.appendChild(accordanceEntry);
        }
    }

    doc.body.appendChild(root);
}

function openIdf(callback) {
    const input = document.createElement('input');

    input.type = 'file';
    input.multiple = false;

    input.onchange = (event) => {
        const file = event.target.files[0];

        const reader = new FileReader();
        reader.onload = function(event) {
            callback(event.target.result);
        };
        reader.readAsText(file);
    };
    input.click();
}

function saveString(contents, type, name) {
    const blob = new Blob([contents], { type });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();

    URL.revokeObjectURL(url);
}

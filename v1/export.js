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

function buildAccordanceTree(json, doc, root) {
    const map = [
        ['note', json.note],
        ['activity', json.activity],
    ];

    for (let [prop, val] of map) {
        const entry = doc.createElement('li');
        entry.textContent = `${prop}: ${val}`;

        root.appendChild(entry);
    }
}

function buildProcessTree(process, doc, root) {
    const json = Process.toJSON(process);
    const map = [
        ['objective', json.objective],
        ['owner', json.owner],
        ['environment', json.environment],
        ['pov', json.pov],
    ];

    for (let [prop, val] of map) {
        const entry = doc.createElement('li');
        entry.textContent = `${prop}: ${val}`;

        root.appendChild(entry);
    }
}

function buildElementTree(element, doc, root) {
    const json = Element.toJSON(element);
    const map = [
        ['owner', json.owner],
    ];

    for (let [prop, val] of map) {
        const entry = doc.createElement('li');
        entry.textContent = `${prop}: ${val}`;

        root.appendChild(entry);
    }
}

function buildDeviationTree(json, doc, root) {
    const map = [
        ['name', json.name],
        ['note', json.note],
        ['cause', json.cause],
        ['activity', json.activity],
    ];

    for (let [prop, val] of map) {
        const entry = doc.createElement('li');
        entry.textContent = `${prop}: ${val}`;

        root.appendChild(entry);
    }
}

function buildRiskTree(risk, doc, root) {
    const json = Risk.toJSON(risk);
    const map = [
        ['character', json.character],
        ['LCStep', json.LCStep],
        ['outrunning', json.outrunning],
        ['profit', json.profit],
        ['probability', json.probability],
        ['score', json.score],
        ['error', json.error],
    ];

    for (let [prop, val] of map) {
        const entry = doc.createElement('li');
        entry.textContent = `${prop}: ${val}`;

        root.appendChild(entry);
    }
}

function buildDiagramTree(units, doc) {
    const root = doc.createElement('ul');

    for (let unit of units) {
        if (unit.isSystem)
            continue;
        
        const accordance = unit._accordance;

        const accordanceJSON = Accordance.toJSON(accordance);
        if (accordanceJSON.name !== '') {
            const accordanceEntry = doc.createElement('li');
            accordanceEntry.textContent = accordanceJSON.name;

            const accordanceProps = doc.createElement('ul');

            buildAccordanceTree(accordanceJSON, doc, accordanceProps);

            if (unit.type === Unit.Type.Process)
                buildProcessTree(accordance, doc, accordanceProps);
            else if (unit.type === Unit.Type.Element)
                buildElementTree(accordance, doc, accordanceProps);

            const deviation = unit._deviation,
                  deviationJSON = Deviation.toJSON(deviation);

            if (deviationJSON.name !== '') {
                const deviationEntry = doc.createElement('li');
                deviationEntry.textContent = deviationJSON.name;

                const deviationProps = doc.createElement('ul');

                buildDeviationTree(deviationJSON, doc, deviationProps);

                if (unit.type === Unit.Type.Process)
                    buildRiskTree(deviation, doc, deviationProps);

                deviationEntry.appendChild(deviationProps);
                accordanceProps.appendChild(deviationEntry);
            }

            accordanceEntry.appendChild(accordanceProps);
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

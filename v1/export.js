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
    let table = '';

    for (let unit of units) {
        if (unit.type === Unit.Type.Process && !unit?.isSystem) {
            const json = Process.toJSON(unit._accordance);

            let row = '';
            for (let prop in json) {
                if (typeof json[prop] === 'string')
                    row += `\"${json[prop]}\",`;
                else
                    row += `${json[prop]},`;
            }

            table += row.slice(0, row.length-1) + '\n';
        }
    }

    return table;
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

function saveString(contents) {
    const blob = new Blob([contents], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagram.idf';
    a.click();

    URL.revokeObjectURL(url);
}

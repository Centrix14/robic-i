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

function saveIdf(contents) {
    const blob = new Blob([contents], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'diagram.idf';
    a.click();

    URL.revokeObjectURL(url);
}

class IDFile {
    save(diagram, options) {
        const serializer = {
            nodeFn: (v) => v.getData()
        };

        return {
            name: diagram._name,
            author: diagram._author,
            changed: diagram._changed,
            index: diagram._index,
            graph: diagram._graph.serialize(serializer),
            spatia: diagram._spatia.serialize(),
        };
    }
}

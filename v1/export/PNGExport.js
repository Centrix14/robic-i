class PNGExport {
    constructor(settings) {
        this._scale = settings?.scale ?? 1;
    }

    make(svg, blobCallback) {
        const serializer = new XMLSerializer();
        const xml = serializer.serializeToString(svg);

        const blob = new Blob([xml], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);

        let png;
        const image = document.createElement('img');
        image.onload = () => {
            const rect = svg.getBoundingClientRect();

            png = document.createElement('canvas');
            png.height = rect.height * this._scale;
            png.width = rect.width * this._scale;

            const ctx = png.getContext('2d');
            ctx.drawImage(image, 0, 0, rect.width, rect.height);

            png.toBlob(blobCallback);
        }

        image.src = url;
        URL.revokeObjectURL(url);
    }
}

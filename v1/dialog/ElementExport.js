class ElementExportDialog {
    constructor(app) {
        this.app = app;

        this.dialog = elm('#element-export-dialog');
        this.setting = {
            inputs: elm('#export-inputs-checkbox'),
            outputs: elm('#export-outputs-checkbox'),
            doers: elm('#export-doers-checkbox'),
            means: elm('#export-means-checkbox'),
        };

        this.buttons = {
            close: elm('#closeElementExportDialogBtn'),
            create: elm('#makeElementExportBtn'),
        };
        this.buttons.close.onclick = () => this.close();
        this.buttons.create.onclick = () => (this.create(), this.close());
    }

    show() {
        this.dialog.showModal();
    }

    close() {
        this.dialog.close();
    }

    create() {
        const roles = {
            inputs: this.setting.inputs.checked,
            outputs: this.setting.outputs.checked,
            doers: this.setting.doers.checked,
            means: this.setting.means.checked,
        };

        const graph = this.app.diagram.graph;
        const exporter = new CSVExportElement();
        saveData(exporter.make(graph, roles),
                 MIME.csv, 'elements.csv');
    }
}

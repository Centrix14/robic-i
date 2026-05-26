class RiskRegistryDialog {
    constructor(app) {
        this.app = app;

        this.dialog = elm('#risk-registry-dialog');

        this.template = {
            name: '',
            data: null,
            ui: {
                current: elm('#risk-registry-current-template'),
                novel: elm('#risk-registry-new-template'),
            },
        };
        this.template.ui.novel.onchange = (e) => this.uploadTemplate(e);

        this.buttons = {
            close: elm('#closeRiskRegistryDialogBtn'),
            create: elm('#createRiskRegistryBtn'),
        };
        this.buttons.close.onclick = () => this.close();
        this.buttons.create.onclick = () => (this.create(), this.close());
    }

    show() {
        let name = this.template.name;
        if (name === '') {
            name = 'Не задан';
        }

        this.template.ui.current.textContent = name;
        this.dialog.showModal();
    }

    close() {
        this.dialog.close();
    }

    uploadTemplate(event) {
        const reader = new FileReader();
        reader.onload = () => this.template.data = reader.result;

        const file = event.target.files[0];
        reader.readAsArrayBuffer(file);

        this.template.name = file.name;
        this.template.ui.current.textContent = file.name;
    }

    async create() {
        if (!this.template.data)
            return;

        const registry = new RiskRegistry();
        registry.fill(this.app.diagram);

        const report = await registry.print(this.template.data);
        if (report)
            saveData(
                report,
                MIME.docx,
                'registry.docx'
            );
    }
}

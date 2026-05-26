class AboutDialog {
    constructor() {
        this.dialog = elm('#about-dialog');

        this.buttons = {
            ok: elm('#closeAboutDialogBtn'),
        };
        this.buttons.ok.onclick = () => this.close();
    }

    show() {
        this.dialog.showModal();
    }

    close() {
        this.dialog.close();
    }
}

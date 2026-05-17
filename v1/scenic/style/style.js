class Style {
    constructor() {
        this._index = 0;
        this._store = new Map();
    }

    get(id) {
        return this._store.get(id);
    }

    add(element, id=null) {
        this._store.set(id ?? this._index, element);

        if (id)
            return id;
        else
            return this._index++;
    }

    drop(id) {
        const element = this._store.delete(id);
        if (element)
            return new Success([['element', element]]);
        else
            return new Fail();
    }

    useOn(target) {
        this._store.forEach((element) => element.useOn(target));
    }

    static build(stylesheet) {
        const style = new Style();

        for (let key in stylesheet) {
            const definition = stylesheet[key];

            let element;
            switch (key) {
            case 'stroke':
                element = new Stroke(definition);
                break;
            case 'fill':
                element = new Fill(definition);
                break;
            case 'font':
                element = new Font(definition);
                break;
            case 'textAlign':
                element = new TextAlign(definition);
                break;
            case 'marker':
                element = new Marker(definition);
                break;
            case 'visibility':
                element = new Visibility(definition);
            default:
                return new Fail();
            }

            style.add(element, key);
        }

        return style;
    }
}

class StyleElement {
    useOn(target, options) {}
}

class Stroke {
    static Linecap = {
        Butt: 'Butt',
        Round: 'Round',
        Square: 'Square'
    }

    static Linejoin = {
        Arcs: 'Arcs',
        Bevel: 'Bevel',
        Miter: 'Miter',
        MiterClip: 'MiterClip',
        Round: 'Round'
    }

    constructor(definition) {
        this._color = definition?.color ?? 'black';
        this._width = definition?.width ?? '1px';
        this._dasharray = definition?.dasharray ?? '';
        this._opacity = definition?.opacity ?? '1';
        this._linecap = definition?.linecap ?? Stroke.Linecap.Butt;
        this._linejoin = definition?.linejoin ?? Stroke.Linejoin.Miter;
    }

    useOn(target) {
        target.setAttribute('stroke', this._color);
        target.setAttribute('stroke-width', this._width);
        target.setAttribute('stroke-dasharray', this._dasharray);
        target.setAttribute('stroke-opacity', this._opacity);
        target.setAttribute('stroke-linecap', this._linecap);
        target.setAttribute('stroke-linejoin', this._linejoin);
    }
}

class Fill {
    _color = '';
    _opacity = '';

    constructor(definition) {
        this._color = definition?.color ?? 'white';
        this._opacity = definition?.opacity ?? '1';
    }

    useOn(target) {
        target.setAttribute('fill', this._color);
        target.setAttribute('fill-opacity', this._opacity);
    }
}

class Font {
    static Style {
        Normal: 'Normal',
        Italic: 'Italic',
        Oblique: 'Oblique'
    }

    static Weight {
        Normal: 'Normal',
        Bold: 'Bold',
        Bolder: 'Bolder',
        Lighter: 'Lighter'
    }

    constructor(definition) {
        this._family = definition?.family ?? 'sans';
        this._size = definition?.size ?? '12px';
        this._style = definition?.style ?? Font.Style.Normal;
        this._weight = definition?.weight ?? Font.Weight.Normal;
    }

    useOn(target) {
        target.setAttribute('font-family', this._family);
        target.setAttribute('font-size', this._size);
        target.setAttribute('font-style', this._style);
        target.setAttribute('font-weight', this._weight);
    }
}

class TextAlign {
    static Anchor = {
        Start: 'Start',
        Middle: 'Middle',
        End: 'End'
    }

    static Baseline = {
        Auto: 'Auto',
        Top: 'Top',
        Middle: 'Middle',
        Bottom: 'Bottom'
    }

    constructor(definition) {
        this._anchor = definition?.anchor ?? TextAlign.Anchor.Middle;
        this._baseline = definition?.baseline ?? TextAlign.Baseline.Middle;
    }

    useOn(target) {
        target.setAttribute('text-anchor', this._anchor);
        target.setAttribute('dominant-baseline', this._baseline);
    }
}

class StyleSet {
    _name = '';
    _repository = new Map();

    constructor(name) {
        this._name = name;
    }

    get name() { return this._name; }

    get(styleName) {
        const result = this._repository.get(styleName);
        if (result)
            return result;

        return new SkeletonStyle('', new Stroke());
    }
    
    get repository() {
        return new Map(this._repository);
    }

    add(style) {
        this._repository.set(style.name, style);
        return style.name;
    }

    eject(styleName) {
        const style = this.get(styleName);
        this._repository.delete(styleName);
        return style;
    }

    useOn(target, styleName='all') {
        if (styleName === 'all') {
            this.repository.forEach((style) => style.useOn(target));
        }
        else {
            this.get(styleName).useOn(target);
        }

        return target;
    }
}

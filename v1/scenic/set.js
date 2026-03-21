class ProcessGeometrySet {
    static State = {
        Main: 'main',
        Selected: 'selected',
        Hidden: 'hidden'
    }

    static Style = {
        ShapeMain: 'Shape.Main',
        NameMain: 'Name.Main',
        DesignationMain: 'Designation.Main',

        ShapeSelected: 'Shape.Selected',

        ShapeHidden: 'Shape.Hidden',
        NameHidden: 'Name.Hidden',
        DesignationHidden: 'Designation.Hidden',
    }

    constructor(operator) {
        const State = ProcessGeometrySet.State;
        const Style = ProcessGeometrySet.Style;

        this._state = State.Main;
        this._operator = operator;

        this._geometry = new Map([[
            State.Main, new ProcessGroup()
        ]]);

        this._styles = new Map([
            [Style.ShapeMain, ProcessGeometrySet._shapeMainStyle()],
            [Style.NameMain, ProcessGeometrySet._nameMainStyle()],
            [Style.DesignationMain, ProcessGeometrySet._designationMainStyle()],

            [Style.ShapeSelected, ProcessGeometrySet._shapeSelectedStyle()],

            [Style.ShapeHidden, ProcessGeometrySet._shapeHiddenStyle()],
            [Style.NameHidden, ProcessGeometrySet._nameHiddenStyle()],
            [Style.DesignationHidden,
             ProcessGeometrySet._designationHiddenStyle()],
        ]);

        this._supplement = new Map();
    }

    combine(options) {
        const State = ProcessGeometrySet.State;
        const state = options?.state ?? State.Main;

        const group = this._geometry.get(State.Main);
        if (!group.isInitiated) {
            const id = options?.id;

            if (!id)
                return new Fail();

            group.init(id, this._operator);
        }

        return this._combine(state, group);
    }

    _combine(state, group) {
        const State = ProcessGeometrySet.State,
              Member = ProcessGroup.Member,
              Style = ProcessGeometrySet.Style;

        const shape = group.getMemberElement(Member.Shape).get('element'),
              name = group.getMemberElement(Member.Name).get('element');
        const designation =
              group.getMemberElement(Member.Designation).get('element');

        switch (state) {

        case State.Main:
            this._styles.get(Style.ShapeMain).useOn(shape);
            this._styles.get(Style.NameMain).useOn(name);
            this._styles.get(Style.DesignationMain).useOn(designation);
            break;

        case State.Selected: 
            this._styles.get(Style.ShapeSelected).useOn(shape);
            this._styles.get(Style.NameMain).useOn(name);
            this._styles.get(Style.DesignationMain).useOn(designation);
            break;

        case State.Hidden:
            this._styles.get(Style.ShapeHidden).useOn(shape);
            this._styles.get(Style.NameHidden).useOn(name);
            this._styles.get(Style.DesignationHidden).useOn(designation);
            break;
        }

        return group._selfElm;
    }

    isTouching(cursor, spatia) {
        const State = ProcessGeometrySet.State;
        return this._geometry.get(State.Main).isTouching(cursor, spatia);
    }

    shift(dX, dY) {
        const State = ProcessGeometrySet.State;
        this._geometry.get(State.Main).shift(dX, dY, this._operator);
    }

    static _shapeMainStyle() {
        const style = new Style();

        style.add(new Fill(), 'fill');
        style.add(new Stroke(), 'stroke');

        return style;
    }

    static _nameMainStyle() {
        const style = new Style();

        style.add(new Fill({
            color: 'black',
            opacity: '1'
        }), 'fill');
        style.add(new Font({
            family: 'sans',
            size: '12px'
        }), 'font');
        style.add(new TextAlign({
            anchor: TextAlign.Anchor.Middle,
            baseline: TextAlign.Baseline.Middle
        }), 'textAlign');

        return style;
    }

    static _designationMainStyle() {
        const style = new Style();

        style.add(new Fill({
            color: 'black',
            opacity: '1'
        }), 'fill');
        style.add(new Font({
            family: 'sans',
            size: '10px'
        }), 'font');
        style.add(new TextAlign({
            anchor: TextAlign.Anchor.End,
            baseline: TextAlign.Baseline.Top
        }), 'textAlign');

        return style;
    }

    static _shapeSelectedStyle() {
        const style = new Style();

        style.add(new Fill(), 'fill');
        style.add(new Stroke({
            color: 'blue'
        }), 'stroke');

        return style;
    }

    static _shapeHiddenStyle() {
        const style = new Style();

        style.add(new Fill({opacity: '0'}), 'fill');
        style.add(new Stroke({opacity: '0'}), 'stroke');

        return style;
    }

    static _nameHiddenStyle() {
        const style = new Style();

        style.add(new Fill({opacity: '0'}), 'fill');

        return style;
    }

    static _designationHiddenStyle() {
        const style = new Style();

        style.add(new Fill({opacity: '0'}), 'fill');

        return style;
    }
}

class ElementGeometrySet {
    static State = {
        Creation: 'creation',
        Main: 'main',
        Selected: 'selected',
        Hidden: 'hidden'
    }

    static Layer = {
        Process: 'process',
        Element: 'element'
    }

    static Geometry = {
        ArrowCreation: 'arrowCreation',
        ArrowMain: 'arrowMain',
        Rect: 'rect',
    }

    static Style = {
        RectMain: 'Rect.Main',
        RectSelected: 'Rect.Selected',
        RectHidden: 'Rect.Hidden',

        ArrowCreation: 'Arrow.Creation',
        ArrowMain: 'Arrow.Main',
        ArrowSelected: 'Arrow.Selected',
        ArrowHidden: 'Arrow.Hidden',

        LabelMain: 'Label.Main',
        LabelHidden: 'Label.Hidden'
    }

    constructor(operator) {
        const Layer = ElementGeometrySet.Layer;
        const State = ElementGeometrySet.State;
        const Geometry = ElementGeometrySet.Geometry;
        const Style = ElementGeometrySet.Style;

        this._operator = operator;

        this._geometry = new Map([
            [Geometry.ArrowCreation, new StraightLine()],
            [Geometry.ArrowMain, new ElementArrowGroup()],
            [Geometry.Rect, new ElementRectGroup()]
        ]);

        this._styles = new Map([
            [Style.RectMain, ElementGeometrySet._rectMainStyle],
            [Style.RectSelected, ElementGeometrySet._rectSelectedStyle],
            [Style.RectHidden, ElementGeometrySet._rectHiddenStyle],

            [Style.ArrowCreation, ElementGeometrySet._arrowCreationStyle],
            [Style.ArrowMain, ElementGeometrySet._arrowMainStyle],
            [Style.ArrowSelected, ElementGeometrySet._arrowSelectedStyle],
            [Style.ArrowHidden, ElementGeometrySet._arrowHiddenStyle],

            [Style.LabelMain, ElementGeometrySet._labelMainStyle],
            [Style.LabelHidden, ElementGeometrySet._labelHiddenStyle]
        ]);

        this._supplement = new Map();
    }

    combine(options) {
        const Layer = ElementGeometrySet.Layer, layer = options.layer;

        switch (layer) {
        case Layer.Process:
            return this._combineProcessLayer(options);
        case Layer.Element:
            return this._combineElementLayer(options);
        default:
            return new Fail();
        }
    }

    _combineProcessLayer(options) {
        const State = ElementGeometrySet.State,
              Geometry = ElementGeometrySet.Geometry;
        const state = options.state;

        if (state === State.Creation)
            ;
        else
            return this._combineArrowMain(options);
    }

    _combineArrowMain(options) {
        const State = ElementGeometrySet.State,
              Geometry = ElementGeometrySet.Geometry,
              Member = ElementArrowGroup.Member;
        const state = options.state,
              geometry = this._geometry.get(Geometry.ArrowMain);

        if (!geometry.isInitiated) {
            const id = options?.id;
            if (!id)
                return new Fail();

            geometry.init(id, this._operator);
        }

        const shape = geometry.getMemberElement(Member.Shape).get('element'),
              name = geometry.getMemberElement(Member.Name).get('element');
        const designation =
              geometry.getMemberElement(Member.Designation).get('element');

        switch (state) {
        case State.Main:
            this._styles.get(Style.ArrowMain).useOn(shape);
            this._styles.get(Style.LabelMain).useOn(name);
            this._styles.get(Style.LabelMain).useOn(designation);
            break;
        case State.Selected:
            this._styles.get(Style.ArrowSelected).useOn(shape);
            this._styles.get(Style.LabelMain).useOn(name);
            this._styles.get(Style.LabelMain).useOn(designation);
            break;
        case State.Hidden:
            this._styles.get(Style.ArrowHidden).useOn(shape);
            this._styles.get(Style.LabelHidden).useOn(name);
            this._styles.get(Style.LabelHidden).useOn(designation);
            break;
        }

        return geometry._selfElm;
    }

    _combineElementLayer(state) {
        
    }

    static _rectMainStyle() {
        const style = new Style();

        style.add(new Fill({ opacity: '0' }), 'fill');
        style.add(new Stroke(), 'stroke');

        return style;
    }

    static _rectSelectedStyle() {
        const style = new Style();

        style.add(new Fill({ opacity: '0' }), 'fill');
        style.add(new Stroke({ color: 'blue' }), 'stroke');

        return style;
    }

    static _rectHiddenStyle() {
        const style = new Style();

        style.add(new Fill({ opacity: '0' }), 'fill');
        style.add(new Stroke({ color: 'black', opacity: '0' }), 'stroke');

        return style;
    }

    static _arrowCreationStyle() {
        const style = new Style();

        style.add(new Stroke({ dasharray: '4' }), 'stroke');

        return style;
    }

    static _arrowMainStyle() {
        const style = ElementGeometrySet._rectMainStyle();

        style.add(new Marker({ end: 'url(#element-arrow-marker)' }), 'stroke');

        return style;
    }

    static _arrowSelectedStyle() {
        const style = ElementGeometrySet._rectSelectedStyle();

        style.add(new Marker({ end: 'url(#element-arrow-marker)' }), 'stroke');

        return style;
    }

    static _arrowHiddenStyle() {
        const style = ElementGeometrySet._rectMainStyle();

        style.add(new Marker({ end: 'url(#element-arrow-marker)' }), 'stroke');

        return style;
    }

    static _labelMainStyle() {
        const style = new Style();

        style.add(new Fill(), 'fill');

        return style;
    }

    static _labelHiddenStyle() {
        const style = new Style();

        style.add(new Fill({ opacity: '0' }), 'fill');

        return style;
    }
}

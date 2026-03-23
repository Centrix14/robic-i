const GeometryState = {
    Creation: 'creation',
    Main: 'main',
    Selected: 'selected',
    Hidden: 'hidden'
}

const GeometryLayer = {
    Process: 'process',
    Element: 'element'
}

class ProcessGeometrySet {
    static Stylesheet = {
        ShapeMain: Style.build({
            fill: {},
            stroke: {}
        }),
        NameMain: Style.build({
            fill: { color: 'black', opacity: '1' },
            font: { family: 'sans', size: '12px' },
            textAlign: { anchor: TextAlign.Anchor.Middle, baseline: TextAlign.Baseline.Middle }
        }),
        DesignationMain: Style.build({
            fill: { color: 'black', opacity: '1' },
            font: { family: 'sans', size: '10px' },
            textAlign: { anchor: TextAlign.Anchor.End, baseline: TextAlign.Baseline.Top }
        }),

        ShapeSelected: Style.build({
            fill: {},
            stroke: { color: 'blue' }
        }),

        ShapeHidden: Style.build({
            fill: { opacity: '0' },
            stroke: { opacity: '0' }
        }),
        NameHidden: Style.build({
            fill: { opacity: '0' }
        }),
        DesignationHidden: Style.build({
            fill: { opacity: '0' }
        })
    }

    constructor(operator) {
        const State = GeometryState;

        this._state = State.Main;
        this._operator = operator;

        this._geometry = new Map([[
            State.Main, new ProcessGroup()
        ]]);

        this._supplement = new Map();
    }

    combine(options) {
        const State = GeometryState;
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
        const State = GeometryState,
              Member = ProcessGroup.Member;

        const shape = group.getMemberElement(Member.Shape).get('element'),
              name = group.getMemberElement(Member.Name).get('element');
        const designation =
              group.getMemberElement(Member.Designation).get('element');

        const stylesheet = ProcessGeometrySet.Stylesheet;
        switch (state) {
        case State.Main:
            stylesheet.ShapeMain.useOn(shape);
            stylesheet.NameMain.useOn(name);
            stylesheet.DesignationMain.useOn(designation);
            break;

        case State.Selected:
            stylesheet.ShapeSelected.useOn(shape);
            stylesheet.NameMain.useOn(name);
            stylesheet.DesignationMain.useOn(designation);
            break;

        case State.Hidden:
            stylesheet.ShapeHidden.useOn(shape);
            stylesheet.NameHidden.useOn(name);
            stylesheet.DesignationHidden.useOn(designation);
            break;
        }

        return group._selfElm;
    }

    isTouching(cursor, spatia) {
        const State = GeometryState;
        return this._geometry.get(State.Main).isTouching(cursor, spatia);
    }

    shift(dX, dY) {
        const State = GeometryState;
        this._geometry.get(State.Main).shift(dX, dY, this._operator);
    }
}

class ElementGeometrySet {
    static Geometry = {
        ArrowCreation: 'arrowCreation',
        ArrowMain: 'arrowMain',
        Rect: 'rect',
    }

    static Stylesheet = {
        RectMain: Style.build(Styles.EGS.RectMain),
        RectSelected: Style.build(Styles.EGS.RectSelected),
        RectHidden: Style.build(Styles.EGS.RectHidden),

        ArrowCreation: Style.build(Styles.EGS.ArrowCreation),
        ArrowMain: Style.build(Styles.EGS.ArrowMain),
        ArrowSelected: Style.build(Styles.EGS.ArrowSelected),
        ArrowHidden: Style.build(Styles.EGS.ArrowHidden),

        LabelMain: Style.build(Styles.EGS.LabelMain),
        LabelHidden: Style.build(Styles.EGS.LabelHidden)
    }

    constructor(operator) {
        const Geometry = ElementGeometrySet.Geometry;

        this._operator = operator;

        this._geometry = new Map([
            [Geometry.ArrowCreation, new StraightLine()],
            [Geometry.ArrowMain, new ElementArrowGroup()],
            [Geometry.Rect, new ElementRectGroup()]
        ]);

        this._supplement = new Map();
    }

    combine(options) {
        switch (options.layer) {
        case GeometryLayer.Process:
            return this._combineProcessLayer(options);
        case GeometryLayer.Element:
            return this._combineElementLayer(options);
        default:
            return new Fail();
        }
    }

    _combineProcessLayer(options) {
        if (options.state === GeometryState.Creation)
            ;
        else
            return this._combineArrowMain(options);
    }

    _combineArrowMain(options) {
        const Member = ElementArrowGroup.Member;
        const geometry = this._geometry.get(ElementGeometrySet.Geometry.ArrowMain);

        if (!geometry.isInitiated) {
            const id = options?.id;
            if (!id)
                return new Fail();

            geometry.init(id, this._operator, options.coords);
        }

        const shape = geometry.getMemberElement(Member.Shape).get('element'),
              name = geometry.getMemberElement(Member.Name).get('element');
        const designation =
              geometry.getMemberElement(Member.Designation).get('element');

        const stylesheet = ElementGeometrySet.Stylesheet;
        switch (options.state) {
        case GeometryState.Main:
            stylesheet.ArrowMain.useOn(shape);
            stylesheet.LabelMain.useOn(name);
            stylesheet.LabelMain.useOn(designation);
            break;
        case GeometryState.Selected:
            stylesheet.ArrowSelected.useOn(shape);
            stylesheet.LabelMain.useOn(name);
            stylesheet.LabelMain.useOn(designation);
            break;
        case GeometryState.Hidden:
            stylesheet.ArrowHidden.useOn(shape);
            stylesheet.LabelHidden.useOn(name);
            stylesheet.LabelHidden.useOn(designation);
            break;
        }

        return geometry._selfElm;
    }

    _combineElementLayer(options) {
        const Member = ElementArrowGroup.Member;
        const geometry = this._geometry.get(ElementGeometrySet.Geometry.Rect);

        if (!geometry.isInitiated) {
            const id = options?.id;
            if (!id)
                return new Fail();

            geometry.init(id, this._operator, Defaults, {
                name: 'Элемент',
                designation: `Э ${id}`
            });
        }

        const shape = geometry.getMemberElement(Member.Shape).get('element'),
              name = geometry.getMemberElement(Member.Name).get('element');
        const designation =
              geometry.getMemberElement(Member.Designation).get('element');

        const stylesheet = ElementGeometrySet.Stylesheet;
        switch (options.state) {
        case GeometryState.Main:
            stylesheet.RectMain.useOn(shape);
            stylesheet.LabelMain.useOn(shape);
            stylesheet.LabelMain.useOn(shape);
            break;
        case GeometryState.Selected:
            stylesheet.RectSelected.useOn(shape);
            stylesheet.LabelMain.useOn(shape);
            stylesheet.LabelMain.useOn(shape);
            break;
        case GeometryState.Hidden:
            stylesheet.RectHidden.useOn(shape);
            stylesheet.LabelHidden.useOn(shape);
            stylesheet.LabelHidden.useOn(shape);
            break;
        }

        return geometry._selfElm;
    }
}

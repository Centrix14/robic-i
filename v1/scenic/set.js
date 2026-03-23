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
        const Style = ProcessGeometrySet.Style;

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
              Member = ProcessGroup.Member,
              Style = ProcessGeometrySet.Style;

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
        RectMain: Style.build({
            fill: { color: 'none', opacity: '0' },
            stroke: { color: 'black', opacity: '1' }
        }),
        RectSelected: Style.build({
            fill: { color: 'none', opacity: '0' },
            stroke: { color: 'blue', opacity: '1' }
        }),
        RectHidden: Style.build({
            fill: { color: 'none', opacity: '0' },
            stroke: { color: 'black', opacity: '0' }
        }),

        ArrowCreation: Style.build({
            stroke: { color: 'black', opacity: '1', dasharray: '4' }
        }),
        ArrowMain: Style.build({
            fill: { color: 'none', opacity: '0' },
            stroke: { color: 'black', opacity: '1' },
            marker: { end: 'url(#element-arrow-marker)' }
        }),
        ArrowSelected: Style.build({
            fill: { color: 'none', opacity: '0' },
            stroke: { color: 'blue', opacity: '1' },
            marker: { end: 'url(#element-arrow-marker)' }
        }),
        ArrowHidden: Style.build({
            fill: { color: 'none', opacity: '0' },
            stroke: { color: 'none', opacity: '0' },
            marker: { end: 'url(#element-arrow-marker)' }
        }),

        LabelMain: Style.build({
            fill: { color: 'black', opacity: '1' }
        }),
        LabelHidden: Style.build({
            fill: { color: 'black', opacity: '0' }
        })
    }

    constructor(operator) {
        const Layer = GeometryLayer;
        const State = GeometryState;
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
        const Layer = GeometryLayer, layer = options.layer;

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
        const State = GeometryState,
              Geometry = ElementGeometrySet.Geometry;
        const state = options.state;

        if (state === State.Creation)
            ;
        else
            return this._combineArrowMain(options);
    }

    _combineArrowMain(options) {
        const State = GeometryState,
              Geometry = ElementGeometrySet.Geometry,
              Member = ElementArrowGroup.Member;
        const state = options.state,
              geometry = this._geometry.get(Geometry.ArrowMain);

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
        switch (state) {
        case State.Main:
            stylesheet.ArrowMain.useOn(shape);
            stylesheet.LabelMain.useOn(name);
            stylesheet.LabelMain.useOn(designation);
            break;
        case State.Selected:
            stylesheet.ArrowSelected.useOn(shape);
            stylesheet.LabelMain.useOn(name);
            stylesheet.LabelMain.useOn(designation);
            break;
        case State.Hidden:
            stylesheet.ArrowHidden.useOn(shape);
            stylesheet.LabelHidden.useOn(name);
            stylesheet.LabelHidden.useOn(designation);
            break;
        }

        return geometry._selfElm;
    }

    _combineElementLayer(options) {
        const State = GeometryState,
              Geometry = ElementGeometrySet.Geometry,
              Member = ElementArrowGroup.Member;
        const state = options.state,
              geometry = this._geometry.get(Geometry.Rect);

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
        switch (state) {
        case State.Main:
            stylesheet.RectMain.useOn(shape);
            stylesheet.LabelMain.useOn(shape);
            stylesheet.LabelMain.useOn(shape);
            break;
        case State.Selected:
            stylesheet.RectSelected.useOn(shape);
            stylesheet.LabelMain.useOn(shape);
            stylesheet.LabelMain.useOn(shape);
            break;
        case State.Hidden:
            stylesheet.RectHidden.useOn(shape);
            stylesheet.LabelHidden.useOn(shape);
            stylesheet.LabelHidden.useOn(shape);
            break;
        }

        return geometry._selfElm;
    }
}

const GeometryState = {
    Main: 'main',
    Selected: 'selected',
    Hidden: 'hidden'
}

const GeometryLayer = {
    Process: 'process',
    Element: 'element'
}

class GeometrySet {
    constructor(operator) {
        this._operator = operator;
    }
}

class ProcessGeometrySet extends GeometrySet {
    static Geometry = {
        Rect: 'rect'
    }

    static Stylesheet = {
        RectMain: Style.build(Styles.PGS.RectMain),
        NameMain: Style.build(Styles.Common.NameMain),
        DesignationMain: Style.build(Styles.Common.DesignationMain),

        RectSelected: Style.build(Styles.PGS.RectSelected),

        ShapeHidden: Style.build(Styles.Common.ShapeHidden),
        LabelHidden: Style.build(Styles.Common.LabelHidden)
    }

    constructor(operator) {
        super(operator);

        this._geometry = new Map([[
            ProcessGeometrySet.Geometry.Rect, new ProcessGroup()
        ]]);

        this._supplement = new Map();
    }

    combine(layer, state, options) {
        const group = this._geometry.get(GeometryState.Main);
        if (!group.isInitiated) {
            const id = options?.id;
            if (!id)
                return new Fail();
            group.init(id, this._operator);
        }

        return this._combine(state, group);
    }

    _combine(state, group) {
        const Member = ProcessGroup.Member;

        const shape = group.getMemberElement(Member.Shape).get('element'),
              name = group.getMemberElement(Member.Name).get('element');
        const designation =
              group.getMemberElement(Member.Designation).get('element');

        const stylesheet = ProcessGeometrySet.Stylesheet;
        switch (state) {
        case GeometryState.Main:
            stylesheet.RectMain.useOn(shape);
            stylesheet.NameMain.useOn(name);
            stylesheet.DesignationMain.useOn(designation);
            break;

        case GeometryState.Selected:
            stylesheet.RectSelected.useOn(shape);
            stylesheet.NameMain.useOn(name);
            stylesheet.DesignationMain.useOn(designation);
            break;

        case GeometryState.Hidden:
            stylesheet.ShapeHidden.useOn(shape);
            stylesheet.LabelHidden.useOn(name);
            stylesheet.LabelHidden.useOn(designation);
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

class ElementGeometrySet extends GeometrySet {
    static Geometry = {
        Arrow: 'arrowMain',
        Rect: 'rect',
    }

    static Stylesheet = {
        RectMain: Style.build(Styles.EGS.RectMain),
        RectSelected: Style.build(Styles.EGS.RectSelected),

        ArrowCreation: Style.build(Styles.EGS.ArrowCreation),
        Arrow: Style.build(Styles.EGS.Arrow),
        ArrowSelected: Style.build(Styles.EGS.ArrowSelected),

        NameMain: Style.build(Styles.Common.NameMain),
        DesignationMain: Style.build(Styles.Common.DesignationMain),

        ShapeHidden: Style.build(Styles.Common.ShapeHidden),
        LabelHidden: Style.build(Styles.Common.LabelHidden)
    }

    constructor(operator) {
        super(operator);

        const Geometry = ElementGeometrySet.Geometry;

        this._geometry = new Map([
            [Geometry.Arrow, new ElementArrowGroup()],
            [Geometry.Rect, new ElementRectGroup()]
        ]);

        this._supplement = new Map();
        this._layer = GeometryLayer.Process;
    }

    combine(layer, state, options) {
        if (layer === GeometryLayer.Process) {
            return this._combineProcessLayer(state, options);
        }
        else if (layer === GeometryLayer.Element)
            return this._combineElementLayer(state, options);
        else
            return new Fail();
    }

    _combineProcessLayer(state, options) {
        const group = this._geometry.get(ElementGeometrySet.Geometry.Arrow);
        if (!group.isInitiated) {
            const id = options?.id;
            if (!id)
                return new Fail();
            group.init(id, this._operator, options.coords);
        }

        const Member = ElementArrowGroup.Member;
        const shape = group.getMemberElement(Member.Shape).get('element'),
              name = group.getMemberElement(Member.Name).get('element');
        const designation =
              group.getMemberElement(Member.Designation).get('element');

        const stylesheet = ElementGeometrySet.Stylesheet;
        switch (state) {
        case GeometryState.Main:
            stylesheet.Arrow.useOn(shape);
            stylesheet.NameMain.useOn(name);
            stylesheet.DesignationMain.useOn(designation);
            break;
        case GeometryState.Selected:
            stylesheet.ArrowSelected.useOn(shape);
            stylesheet.NameMain.useOn(name);
            stylesheet.DesignationMain.useOn(designation);
            break;
        case GeometryState.Hidden:
            stylesheet.ShapeHidden.useOn(shape);
            stylesheet.LabelHidden.useOn(name);
            stylesheet.LabelHidden.useOn(designation);
            break;
        }

        this._layer = layer;
        return group._selfElm;
    }

    _combineElementLayer(state, options) {
        const group = this._geometry.get(ElementGeometrySet.Geometry.Rect);
        if (!group.isInitiated) {
            const id = options?.id;
            if (!id)
                return new Fail();

            group.init(id, this._operator);
        }

        const Member = ElementArrowGroup.Member;
        const shape = group.getMemberElement(Member.Shape).get('element'),
              name = group.getMemberElement(Member.Name).get('element');
        const designation =
              group.getMemberElement(Member.Designation).get('element');

        const stylesheet = ElementGeometrySet.Stylesheet;
        switch (state) {
        case GeometryState.Main:
            stylesheet.RectMain.useOn(shape);
            stylesheet.NameMain.useOn(shape);
            stylesheet.DesignationMain.useOn(shape);
            break;
        case GeometryState.Selected:
            stylesheet.RectSelected.useOn(shape);
            stylesheet.NameMain.useOn(shape);
            stylesheet.DesignationMain.useOn(shape);
            break;
        case GeometryState.Hidden:
            stylesheet.ShapeHidden.useOn(shape);
            stylesheet.LabelHidden.useOn(shape);
            stylesheet.LabelHidden.useOn(shape);
            break;
        }

        this._layer = layer;
        return group._selfElm;
    }
}

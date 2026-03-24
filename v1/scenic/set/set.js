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
        NameMain: Style.build(Styles.PGS.NameMain),
        DesignationMain: Style.build(Styles.PGS.DesignationMain),

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
        const group = this._geometry.get(ProcessGeometrySet.Geometry.Rect);
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
        const group = this._geometry.get(ProcessGeometrySet.Geometry.Rect);
        return group.isTouching(cursor, spatia);
    }

    shift(dX, dY) {
        const group = this._geometry.get(ProcessGeometrySet.Geometry.Rect);
        group.shift(dX, dY, this._operator);
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

        ArrowMain: Style.build(Styles.EGS.ArrowMain),
        ArrowSelected: Style.build(Styles.EGS.ArrowSelected),

        NameMain: Style.build(Styles.EGS.NameMain),
        DesignationMain: Style.build(Styles.EGS.DesignationMain),

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
            this._layer = layer;
            return this._combineProcessLayer(state, options);
        }
        else if (layer === GeometryLayer.Element) {
            this._layer = layer;
            return this._combineElementLayer(state, options);
        }
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
            stylesheet.ArrowMain.useOn(shape);
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

        return group._selfElm;
    }

    isTouching(cursor, spatia) {
        const rect = this._geometry.get(ElementGeometrySet.Geometry.Rect),
              arrow = this._geometry.get(ElementGeometrySet.Geometry.Arrow);

        if (this._layer === GeometryLayer.Process)
            return arrow.isTouching(cursor, spatia);
        else if (this._layer === GeometryLayer.Element)
            return rect.isTouching(cursor, spatia);
        else
            return false;
    }

    shift(dX, dY) {
        let group;
        if (this._layer === GeometryLayer.Process)
            group = this._geometry.get(ElementGeometrySet.Geometry.Arrow);
        else if (this._layer === GeometryLayer.Element)
            group = this._geometry.get(ElementGeometrySet.Geometry.Rect);

        group.shift(dX, dY, this._operator);
    }
}

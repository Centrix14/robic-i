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

    constructor() {
        const State = ProcessGeometrySet.State;
        const Style = ProcessGeometrySet.Style;

        this._state = State.Main;

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
            const operator = options?.operator;

            if (!id || !operator)
                return new Fail();

            group.init(id, operator);
        }

        return this._combine(state, group);
    }

    _combine(state, group) {
        const State = ProcessGeometrySet.State,
              Member = ProcessGroup.Member,
              Style = ProcessGeometrySet.Style;

        const shape = group.getMemberElement(Member.Shape).get('element'),
              name = group.getMemberElement(Member.Name).get('element'),
              designation = group.getMemberElement(Member.Designation).get('element');

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
}

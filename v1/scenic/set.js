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
    }

    static _shapeMainStyle() {
        const style = new Style();

        style.add(new Fill(), 'fill');
        style.add(new Stroke(), 'stroke');

        return style;
    }

    static _nameMainStyle() {
        const style = new Style();

        style.add(new Font('sans', '12px'), 'font');
        style.add(new TextAlign(), 'textAlign');

        return style;
    }

    static _designationMainStyle() {
        const style = new Style();

        style.add(new Font('sans', '10px'), 'font');
        style.add(new TextAlign(TextAlign.Anchor.End, TextAlign.Baseline.Top),
                  'textAlign');

        return style;
    }

    static _shapeSelectedStyle() {
        const style = new Style();

        style.add(new Fill(), 'fill');
        style.add(new Stroke('blue'), 'stroke');

        return style;
    }

    static _shapeHiddenStyle() {
        const style = new Style();

        style.add(new Fill('white', '0'), 'fill');
        style.add(new Stroke('black', '1px', '', '0'), 'stroke');

        return style;
    }

    constructor() {
        const State = ProcessGeometrySet.State;
        const Style = ProcessGeometrySet.Style;

        this._shapes = new Map([[
            State.Main, new ProcessGroup()
        ]]);

        this._styles = new Map([
            [Style.ShapeMain, ProcessGeometrySet._shapeMainStyle()],
            [Style.NameMain, ProcessGeometrySet._nameMainStyle()],
            [Style.DesignationMain, ProcessGeometrySet._designationMainStyle()],

            [Style.ShapeSelected, ProcessGeometrySet._shapeSelectedStyle()],

            [Style.ShapeHidden, ProcessGeometrySet._shapeHiddenStyle()],
        ]);

        this._supplement = new Map();
    }
}

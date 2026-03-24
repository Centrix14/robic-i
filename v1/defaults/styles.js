const Styles = {
    Common: {
        NameMain: {
            fill: { color: 'black', opacity: '1' },
            font: { family: 'sans', size: '12px' },
            textAlign: { anchor: TextAlign.Anchor.Middle, baseline: TextAlign.Baseline.Middle }
        },

        DesignationMain: {
            fill: { color: 'black', opacity: '1' },
            font: { family: 'sans', size: '10px' },
            textAlign: { anchor: TextAlign.Anchor.End, baseline: TextAlign.Baseline.Top }
        },

        LabelHidden: {
            fill: { opacity: '0' }
        },

        ShapeHidden: {
            fill: { opacity: '0' },
            stroke: { opacity: '0' }
        }
    },

    PGS: {
        RectMain: {
            fill: {},
            stroke: {}
        },

        RectSelected: {
            fill: {},
            stroke: { color: 'blue' }
        },
    },

    EGS: {
        RectMain: {
            fill: { color: 'none', opacity: '0' },
            stroke: { color: 'black', opacity: '1' }
        },

        RectSelected: {
            fill: { color: 'none', opacity: '0' },
            stroke: { color: 'blue', opacity: '1' }
        },

        ArrowMain: {
            fill: { color: 'none', opacity: '0' },
            stroke: { color: 'black', opacity: '1' },
            marker: { end: 'url(#element-arrow-marker)' }
        },

        ArrowSelected: {
            fill: { color: 'none', opacity: '0' },
            stroke: { color: 'blue', opacity: '1' },
            marker: { end: 'url(#element-arrow-marker)' }
        }
    }
}

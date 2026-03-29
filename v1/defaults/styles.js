const Styles = {
    Common: {
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

        NameMain: {
            fill: { color: 'black', opacity: '1' },
            font: { family: 'sans', size: '12px' },
            textAlign: {
                anchor: TextAlign.Anchor.Middle,
                baseline: TextAlign.Baseline.Middle
            }
        },

        DesignationMain: {
            fill: { color: 'black', opacity: '1' },
            font: { family: 'sans', size: '10px' },
            textAlign: {
                anchor: TextAlign.Anchor.End,
                baseline: TextAlign.Baseline.Top
            }
        }
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
        },

        NameMain: {
            fill: { color: 'black', opacity: '1' },
            font: { family: 'sans', size: '12px' },
            textAlign: {
                anchor: TextAlign.Anchor.Middle,
                baseline: TextAlign.Baseline.Top
            }
        },

        DesignationMain: {
            fill: { color: 'black', opacity: '1' },
            font: { family: 'sans', size: '10px' },
            textAlign: {
                anchor: TextAlign.Anchor.Middle,
                baseline: TextAlign.Baseline.Bottom
            }
        }
    },

    EALGS: {
        LineMain: {
            stroke: { color: 'black', opacity: '1', dasharray: '4' }
        },

        LineHidden: {
            stroke: { color: 'black', opacity: '0', dasharray: '4' }
        }
    }
}

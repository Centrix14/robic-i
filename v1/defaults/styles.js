const Styles = {
    Common: {
        LabelHidden: {
            visibility: { value: Visibility.Value.Hidden },
        },

        ShapeHidden: {
            visibility: { value: Visibility.Value.Hidden },
        }
    },

    PGS: {
        RectMain: {
            fill: { color: 'floralwhite' },
            stroke: { color: 'darkgray', width: '1px' }
        },

        RectSelected: {
            fill: { color: 'floralwhite' },
            stroke: { color: 'black', width: '1px' }
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
            fill: { color: 'floralwhite' },
            stroke: { color: 'darkgray', width: '1px' }
        },

        RectSelected: {
            fill: { color: 'floralwhite' },
            stroke: { color: 'black', width: '1px' }
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
            stroke: { color: 'black', opacity: '1', dasharray: '4' },
            visibility: { value: Visibility.Value.Visible },
        },

        LineHidden: {
            visibility: { value: Visibility.Value.Hidden },
        }
    }
}

const Styles = {
    EGS: {
        RectMain: {
            fill: { color: 'none', opacity: '0' },
            stroke: { color: 'black', opacity: '1' }
        },

        RectSelected: {
            fill: { color: 'none', opacity: '0' },
            stroke: { color: 'blue', opacity: '1' }
        },

        RectHidden: {
            fill: { color: 'none', opacity: '0' },
            stroke: { color: 'black', opacity: '0' }
        },

        ArrowCreation: {
            stroke: { color: 'black', opacity: '1', dasharray: '4' }
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

        ArrowHidden: {
            fill: { color: 'none', opacity: '0' },
            stroke: { color: 'none', opacity: '0' },
            marker: { end: 'url(#element-arrow-marker)' }
        },

        LabelMain: {
            fill: { color: 'black', opacity: '1' }
        },

        LabelHidden: {
            fill: { color: 'black', opacity: '0' }
        }
    }
}

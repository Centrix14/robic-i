const SVG = {
    namespace: 'http://www.w3.org/2000/svg',

    createTag: (tag) => document.createElementNS(SVG.namespace, tag),

    createGroup: () => SVG.createTag('g'),

    createPolyline: () => SVG.createTag('polyline'),

    createRect: () => SVG.createTag('rect'),
    createText: () => SVG.createTag('text'),

    applyTo: function(element, definition) {
        for (let prop in definition) {
            if (element.tagName === 'text' && prop === 'value')
                element.textContent = definition[prop];
            else
                element.setAttribute(prop, definition[prop]);
        }
    },

    appendChild: (parent, child) => parent.appendChild(child)
};

describe('ElementGeometrySet (EGS)', function(){

    describe('EGS.combine', function(){
        it('EGS.combine1 - returns <g> SVG element', function(){
            const egs = new ElementGeometrySet(SVG);
            const tag = egs.combine({
                id: '0',
                state: ElementGeometrySet.State.Main,
                layer: ElementGeometrySet.Layer.Process
            });

            assert.equal('g', tag.tagName, '<g> tag expected');
        });
    });

});

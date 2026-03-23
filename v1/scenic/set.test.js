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

    describe('EGS.combine (layer=Process, state=Main)', function(){
        let tag;

        before(function(){
            const egs = new ElementGeometrySet(SVG);
            tag = egs.combine({
                id: '0',
                state: ElementGeometrySet.State.Main,
                layer: ElementGeometrySet.Layer.Process,
                coords: {
                    start: new Point(10,10),
                    end: new Point(50,50)
                }
            });
        });

        it('EGS.combine1 - returns <g> SVG element', function(){
            assert.equal('g', tag.tagName, '<g> tag expected');
        });

        it('EGS.combine2 - group has necessary childs', function(){
            assert.isNotNull(tag.querySelector('#shape'));
            assert.isNotNull(tag.querySelector('#name'));
            assert.isNotNull(tag.querySelector('#designation'));
        });
    });

    describe('EGS.combine (layer=Element, state=Main)', function(){
        let tag;

        before(function(){
            const egs = new ElementGeometrySet(SVG);
            tag = egs.combine({
                id: '0',
                state: ElementGeometrySet.State.Main,
                layer: ElementGeometrySet.Layer.Element
            });
        });

        it('EGS.combine1 - returns <g> SVG element', function(){
            assert.equal('g', tag.tagName, '<g> tag expected');
        });

        it('EGS.combine2 - group has necessary childs', function(){
            assert.isNotNull(tag.querySelector('#shape'));
            assert.isNotNull(tag.querySelector('#name'));
            assert.isNotNull(tag.querySelector('#designation'));
        });
    });

});

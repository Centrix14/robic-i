describe('Stroke', function(){

    it('used on SVGElement when empty, sets `black 1 solid miter` stroke', function(){
        const stroke = new Stroke();
        const elm = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

        stroke.useOn(elm);

        assert.equal(elm.getAttribute('stroke'), 'black');
        assert.equal(elm.getAttribute('stroke-width'), '1');
        assert.equal(elm.getAttribute('stroke-dasharray'), '');
        assert.equal(elm.getAttribute('stroke-linejoin'), 'miter');
    });

    it('properly sets SVGElement when non-empty', function(){
        const stroke = new Stroke('red', '3', '2,5', 'round');
        const elm = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

        stroke.useOn(elm);

        assert.equal(elm.getAttribute('stroke'), 'red');
        assert.equal(elm.getAttribute('stroke-width'), '3');
        assert.equal(elm.getAttribute('stroke-dasharray'), '2,5');
        assert.equal(elm.getAttribute('stroke-linejoin'), 'round');
    });

});

describe('Fill', function(){

    it('used on SVGElement when empty, sets `white non-opaque` fill', function(){
        const fill = new Fill();
        const elm = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

        fill.useOn(elm);

        assert.equal(elm.getAttribute('fill'), 'white');
        assert.equal(elm.getAttribute('fill-opacity'), '0');
    });

    it('properly sets when non-empty', function(){
        const fill = new Fill('blue', '0.4');
        const elm = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

        fill.useOn(elm);

        assert.equal(elm.getAttribute('fill'), 'blue');
        assert.equal(elm.getAttribute('fill-opacity'), '0.4');
    });
    
});

describe('StyleSet', function(){
    
});

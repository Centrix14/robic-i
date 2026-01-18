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

    it('adds styles', function(){
        const basicSet = new StyleSet();

        const passiveStyle = new SkeletonStyle('passive', new Stroke());
        const activeStyle = new ShapeStyle('active', new Stroke('blue'), new Fill('gray'));

        basicSet.add(passiveStyle);
        basicSet.add(activeStyle);

        assert.isDefined(basicSet.get('passive'));
        assert.isDefined(basicSet.get('active'));
    });

    it('adds styles with blank names instead of `all` since it reserved name', function(){
        const basicSet = new StyleSet();

        const wrongStyle = new SkeletonStyle('all', new Stroke());

        assert.isEmpty(basicSet.add(wrongStyle));
    });

    it('ejects styles', function(){
        const basicSet = new StyleSet();

        const passiveStyle = new SkeletonStyle('passive', new Stroke());
        const activeStyle = new ShapeStyle('active', new Stroke('blue'), new Fill('gray'));

        basicSet.add(passiveStyle);
        basicSet.add(activeStyle);

        assert.isDefined(basicSet.eject('passive'));
        assert.isDefined(basicSet.eject('active'));
        assert.lengthOf(basicSet.repository, 0);
    });

    it('properly sets specific style', function(){
        const basicSet = new StyleSet();

        const passiveStyle = new SkeletonStyle('passive', new Stroke());
        const activeStyle = new ShapeStyle('active', new Stroke('blue'), new Fill('gray'));

        basicSet.add(passiveStyle);
        basicSet.add(activeStyle);

        const elm = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        basicSet.useOn(elm, 'active');

        assert.equal(elm.getAttribute('stroke'), 'blue');
        assert.equal(elm.getAttribute('stroke-width'), '1');
        assert.equal(elm.getAttribute('stroke-dasharray'), '');
        assert.equal(elm.getAttribute('stroke-linejoin'), 'miter');
        assert.equal(elm.getAttribute('fill'), 'gray');
        assert.equal(elm.getAttribute('fill-opacity'), '0');
    });

    it('sets all styles sequently when tell useOn(, all)', function(){
        const basicSet = new StyleSet();

        const activeStyle = new ShapeStyle('active', new Stroke(), new Fill('gray'));
        const passiveStyle = new SkeletonStyle('passive', new Stroke('red', '2'));

        basicSet.add(activeStyle);
        basicSet.add(passiveStyle);

        const elm = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        basicSet.useOn(elm, 'all');

        assert.equal(elm.getAttribute('stroke'), 'red');
        assert.equal(elm.getAttribute('stroke-width'), '2');
        assert.equal(elm.getAttribute('stroke-dasharray'), '');
        assert.equal(elm.getAttribute('stroke-linejoin'), 'miter');
        assert.equal(elm.getAttribute('fill'), 'gray');
        assert.equal(elm.getAttribute('fill-opacity'), '0');
    });

});

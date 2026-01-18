describe('Point', function() {

    describe('serialize', function() {
        let point = new Point(5, 10);

        it('takes only SVGElements', function() {
            let svgElm = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            let htmlElm = document.createElement('div');

            assert.isTrue(point.serialize(svgElm).isSuccess() &&
                          point.serialize(htmlElm).hasErrors());
        });

        it('set `x` and `y` attributes', function() {
            let elm = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            point.serialize(elm);

            assert.isTrue(elm.getAttribute('x') === '5' &&
                          elm.getAttribute('y') === '10');
        });
    });

    describe('sum', function() {
        it('normally returns point', function() {
            let p1 = new Point(1,1);
            let p2 = new Point(2,2);

            assert.instanceOf(p1.sum(p2), Point);
        });

        it('abnormally returns result with errors', function() {
            let realPoint = new Point(1,1);
            let fakePoint = {x: 2, y: 2};

            assert.isTrue(realPoint.sum(fakePoint).hasErrors());
        })
    });

    describe('sub', function() {
        it('normally returns point', function() {
            let p1 = new Point(1,1);
            let p2 = new Point(2,2);

            assert.instanceOf(p1.sub(p2), Point);
        });

        it('abnormally returns result with errors', function() {
            let realPoint = new Point(1,1);
            let fakePoint = {x: 2, y: 2};

            assert.isTrue(realPoint.sub(fakePoint).hasErrors());
        })
    });

});

describe('Figure', function() {

    it('can use style on SVGElement', function(){
        const style = new SkeletonStyle('test', new Stroke('blue', '1', '', 'miter'));
        
        const set = new StyleSet();
        set.add(style);

        const figure = new Figure('1', '');
        figure.styleSet = set;

        const elm = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        figure.useStyle('test', elm);

        assert.equal(elm.getAttribute('stroke'), 'blue');
        assert.equal(elm.getAttribute('stroke-width'), '1');
        assert.equal(elm.getAttribute('stroke-dasharray'), '');
        assert.equal(elm.getAttribute('stroke-linejoin'), 'miter');
    });

});

describe('FigureManager', function(){

    it('adds style sets', function(){
        const set1 = {
            name: 'set1'
        }
        const set2 = {
            name: 'set2'
        }
        
        const manager = new FigureManager();
        manager.addStyleSet(set1);
        manager.addStyleSet(set2);

        assert.lengthOf(manager.styleSets, 2);
    });

    it('ejects style sets', function(){
        const set1 = {
            name: 'set1'
        }
        const set2 = {
            name: 'set2'
        }

        const manager = new FigureManager();
        manager.addStyleSet(set1);
        manager.addStyleSet(set2);

        assert.equal(manager.ejectStyleSet('set1').name, 'set1');
        assert.equal(manager.ejectStyleSet('set2').name, 'set2');
        assert.isEmpty(manager.styleSets);
    });

});

describe('Rect', function() {

    describe('serialize', function() {

        it('takes only SVGElement', function() {
            let svgElm = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            let htmlElm = document.createElement('div');

            const rect1 = Rect.createByMeasures(2, '', new Point(1,1), 50, 50);
            rect1.styleSet = {
                name: 'test',
                useOn: () => {}
            };

            assert.isTrue(rect1.serialize(svgElm).isSuccess() &&
                          rect1.serialize(htmlElm).hasErrors());
        });

        it('sets `x`, `y`, `width` and `height` attributes', function() {
            let elm = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

            const rect2 = Rect.createByPoints(1, '', new Point(1,1), new Point(51,51));
            rect2.styleSet = {
                name: 'test',
                useOn: () => {}
            };
            
            rect2.serialize(elm);

            assert.isTrue(elm.getAttribute('x') === '1' &&
                          elm.getAttribute('y') === '1' &&
                          elm.getAttribute('width') === '50' &&
                          elm.getAttribute('height') === '50');
        });
    });

    describe('isTouching', function() {
        const spatia = new Spatia(1, 0.2);
        const rect = Rect.createByMeasures(1, '', new Point(1, 1), 5, 5);

        it('returns `true` when cursor inside of a rect', function(){
            assert.isTrue(rect.isTouching(spatia, new Point(2, 3)));
        });

        it('returns `true` when cursor on side of a rect', function(){
            assert.isTrue(rect.isTouching(spatia, new Point(1, 2)));
        });

        it('returns `false` when cursor outside of a rect', function(){
            assert.isFalse(rect.isTouching(spatia, new Point(7, 10)));
        });
    });

});

describe('RectManager', function() {

    describe('create', function() {
        
        it('takes Point and SVGElement', function() {
            let manager = new RectManager();
            
            let realPoint = new Point(1,1),
                fakePoint = {x: 1, y: 1};
            let svgElm = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            let htmlElm = document.createElement('div');
            
            assert.isTrue(manager.create(realPoint, svgElm, '').isSuccess());
            assert.isTrue(manager.create(fakePoint, htmlElm, '').hasErrors());
        });

        it('sets `id`, coordinates and measures', function() {
            let manager = new RectManager();

            let cursor = new Point(1,1);
            let elm = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

            assert.isTrue(manager.create(cursor, elm, '0').isSuccess(), 'rect not created');
            assert.isTrue(elm.getAttribute('id') === '0')
            assert.isTrue(elm.getAttribute('x') === '1');
            assert.isTrue(elm.getAttribute('y') === '1');
            assert.isTrue(elm.getAttribute('width') === '30');
            assert.isTrue(elm.getAttribute('height') === '20');
        });
    });

    describe('select', function(){
        
        it('selects when cursor touch sth', function(){
            const manager = new RectManager();
            const spatia = new Spatia(1, 0.2);

            const elm = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            manager.create(new Point(1,1), elm);
            manager.select(spatia, new Point(2,1));

            assert.lengthOf(manager.selected, 1);
        });

        it('selects when cursor inside sth', function(){
            const manager = new RectManager();
            const spatia = new Spatia(1, 0.2);

            const elm = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            manager.create(new Point(1,1), elm);
            manager.select(spatia, new Point(2,2));

            assert.lengthOf(manager.selected, 1);
        });

        it('selects multiple primitives', function(){
            const manager = new RectManager();
            const spatia = new Spatia(1, 0.2);

            const elm1 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            const elm2 = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            manager.create(new Point(0,0), elm1, '0');
            manager.create(new Point(1,1), elm2, '1');
            
            manager.select(spatia, new Point(2,2));

            assert.lengthOf(manager.selected, 2);
        });

        it('selects nothing when cursor in empty area', function(){
            const manager = new RectManager();
            const spatia = new Spatia(1, 0.2);

            const elm = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            manager.create(new Point(1,1), elm);
            manager.select(spatia, new Point(0,0));

            assert.lengthOf(manager.selected, 0);
        });
        
    });

});

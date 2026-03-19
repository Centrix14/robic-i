describe('Point', function(){

    describe('isTouching', function(){
        it('isTouching1 - detects precise touch', function(){
            const p = new Point(0,0);
            assert.isTrue(p.isTouching(new Point(0,0), new Spatia()),
                         'Direct touch not detected');
        });

        it('isTouching2 - detects touch in precision radius', function(){
            const p = new Point(0,0), s = new Spatia();

            assert.isTrue(p.isTouching(new Point(1,4), s),
                          'Touch @ 1,4 not detected');
            assert.isTrue(p.isTouching(new Point(2,-1), s),
                          'Touch @ 2,-1 not detected');
            assert.isTrue(p.isTouching(new Point(0,-3), s),
                          'Touch @ 0,-3 not detected');
            assert.isTrue(p.isTouching(new Point(-1,-1), s),
                          'Touch @ -1,-1 not detected');
        });

        it('isTouching3 - detects touch at the edge of precision radius',
           function(){
            const p = new Point(0,0), s = new Spatia();

               assert.isTrue(p.isTouching(new Point(-1,5), s),
                             'Touch @ -1,5 not detected');
               assert.isTrue(p.isTouching(new Point(5,0), s),
                             'Touch @ 5,0 not detected');
           });

        it('isTouching4 - touch outside precision area not detected', function(){
            const p = new Point(0,0), s = new Spatia();

            assert.isFalse(p.isTouching(new Point(5,6), s),
                           'Touch @ 5,6 detected');
        });
    });

});

describe('Rect', function(){

    describe('isTouching', function(){
        const r = new Rect(new Point(0,0), 5, 5), s = new Spatia();

        it('Rect.isTouching1 - detects touch at vertices', function(){
            assert.isTrue(r.isTouching(new Point(0,0), s),
                          'Touch @ left-up vertex not detected');
            assert.isTrue(r.isTouching(new Point(5,0), s),
                          'Touch @ right-up vertex not detected');
            assert.isTrue(r.isTouching(new Point(0,5), s),
                          'Touch @ left-down vertex not detected');
            assert.isTrue(r.isTouching(new Point(5,5), s),
                          'Touch @ right-down vertex not detected');
        });

        it('Rect.isTouching2 - detects touch at rib', function(){
            assert.isTrue(r.isTouching(new Point(2,0), s),
                          'Touch @ up rib not detected');
            assert.isTrue(r.isTouching(new Point(0,3), s),
                          'Touch @ left rib not detected');
            assert.isTrue(r.isTouching(new Point(5,4), s),
                          'Touch @ right rib not detected');
            assert.isTrue(r.isTouching(new Point(3,5), s),
                          'Touch @ down rib not detected');
        });
    });

});

describe('ProcessGroup', function(){

    describe('init', function(){

        it('init1 - creates rect and two texts', function(){
            const operator = {
                rects: 0,
                texts: 0,

                createRect: () => operator.rects++,
                createText: () => operator.texts++,
                createGroup: () => {},

                applyTo: () => {},
                appendChild: () => {}
            };

            const pg = new ProcessGroup();
            pg.init('0', operator);

            assert.equal(1, operator.rects, 'Rect creation failure');
            assert.equal(2, operator.texts, 'Texts creation failure');
        });

        it('init2 - applying properties to SVG elements', function(){
            const operator = {
                createRect: () => 'rect',
                createText: () => 'text',
                createGroup: () => {},

                propertiesApplied: false,
                applyTo: function(element, definition){
                    if ((element === 'rect' || element === 'group') && definition)
                        operator.propertiesApplied = true;
                },
                appendChild: () => {}
            };

            const pg = new ProcessGroup();
            pg.init('0', operator);

            assert.isTrue(operator.propertiesApplied, 'Properties not set');
        });

        it('init3 - creates itself', function(){
            const operator = {
                groupCreated: false,
                groupIdApplied: false,

                createRect: () => {},
                createText: () => {},
                createGroup: () => (operator.groupCreated = true, 'group'),

                applyTo: function(element, definition) {
                    if (element === 'group') {
                        if (definition.id === '0')
                            operator.groupIdApplied = true;
                        else
                            operator.groupIdApplied = false;
                    }
                },
                appendChild: () => {}
            };

            const pg = new ProcessGroup();
            pg.init('0', operator);

            assert.isTrue(operator.groupCreated, 'Group does not created');
            assert.isTrue(operator.groupIdApplied,
                          'Definition does not applied');
        });

        it('init4 - appends childs to group', function(){
            const operator = {
                createRect: () => 'rect',
                createText: () => 'text',
                createGroup: () => 'group',

                applyTo: () => {},

                childs: 0,
                appendChild: function(parent, child) {
                    if (parent === 'group' && (child === 'rect'
                                               || child === 'text'))
                        operator.childs++;
                }
            };

            const pg = new ProcessGroup();
            const groupElm = pg.init('0', operator);

            assert.equal(3, operator.childs, 'Not all childs added');
            assert.equal('group', groupElm, 'Group does not returned');
        });

    });

});

describe('NaiveStepLineV', function(){

    it('NaiveStepLineV1 - makes point in degenerate case', function(){
        const line = new NaiveStepLineV(new Point(10, 10), new Point(10, 10));
        const obj = line.publish();
        assert.equal('M 10 10 v 0', obj.d, 'Incorrect path');
    });

    it('NaiveStepLineV2 - makes straight line in degenerate case', function(){
        const line = new NaiveStepLineV(new Point(10, 10), new Point(50, 10));
        const obj = line.publish();
        assert.equal('M 10 10 h 40', obj.d, 'Incorrect path');
    });

    it('NaiveStepLineV3 - makes step regular line', function(){
        const line = new NaiveStepLineV(new Point(10, 10), new Point(50, 50));
        const obj = line.publish();
        assert.equal('M 10 10 h 20 M 30 10 v 40 M 30 50 h 20', obj.d,
                     'Incorrect path');
    });

    it('NaiveStepLineV4 - makes line in III quadrant', function(){
        const line = new NaiveStepLineV(new Point(50, 50), new Point(10, 10));
        const obj = line.publish();
        assert.equal('M 50 50 h -20 M 30 50 v -40 M 30 10 h -20', obj.d,
                     'Incorrect path');
    });

    it('NaiveStepLineV5 - makes line in II quadrant', function(){
        const line = new NaiveStepLineV(new Point(10, 10), new Point(50, -30));
        const obj = line.publish();
        assert.equal('M 10 10 h 20 M 30 10 v -40 M 30 -30 h 20', obj.d,
                     'Incorrect path');
    });

});

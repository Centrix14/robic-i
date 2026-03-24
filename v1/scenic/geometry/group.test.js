describe('NaiveVerticalStepline', function(){

    describe('NaiveVerticalStepline.constructor', function(){
        it('NSLV.constructor1 - handles point as regular stepline', function(){
            const line = new NaiveVerticalStepline(new Point(10, 10),
                                            new Point(10, 10));
            const obj = line.publish();
            assert.equal('10,10 10,10 10,10 10,10', obj.points,
                         'Incorrect path');
        });

        it('NSLV.constructor2 - handles straight line as resular stepline',
           function(){
               const line = new NaiveVerticalStepline(new Point(10, 10),
                                               new Point(50, 10));
               const obj = line.publish();
               assert.equal('10,10 30,10 30,10 50,10', obj.points,
                            'Incorrect path');
           });

        it('NSLV.constructor3 - makes regular stepline', function(){
            const line = new NaiveVerticalStepline(new Point(10, 10),
                                            new Point(50, 50));
            const obj = line.publish();
            assert.equal('10,10 30,10 30,50 50,50', obj.points,
                         'Incorrect path');
        });

        it('NSLV.constructor4 - makes stepline in IV quadrant', function(){
            const line = new NaiveVerticalStepline(new Point(10, 10),
                                            new Point(50, -30));
            const obj = line.publish();
            assert.equal('10,10 30,10 30,-30 50,-30', obj.points,
                         'Incorrect path');
        });

        it('NSLV.constructor5 - makes stepline in reversed direction',
           function(){
               const line = new NaiveVerticalStepline(new Point(50, 50),
                                                      new Point(10, 10));
               const obj = line.publish();
               assert.equal('50,50 30,50 30,10 10,10', obj.points,
                            'Incorrect path');
           });

    });

    describe('NaiveVerticalStepline.isTouching', function(){
        const s = new Spatia();
        const l = new NaiveVerticalStepline(new Point(0,0),
                                     new Point(6,6));

        it('NSLV.isTouching1 - detects touch at vertices', function(){
            assert.isTrue(l.isTouching(new Point(0,0), s),
                          'Touch @ 0,0 not detected');
            assert.isTrue(l.isTouching(new Point(6,6), s),
                          'Touch @ 6,6 not detected');
        });

        it('NSLV.isTouching2 - detects touch at ribs', function(){
            assert.isTrue(l.isTouching(new Point(2,0), s),
                          'Touch @ horizontal-up rib not detected');
            assert.isTrue(l.isTouching(new Point(3,3), s),
                          'Touch @ vertical rib not detected');
            assert.isTrue(l.isTouching(new Point(4,6), s),
                          'Touch @ horizontal-down not detected');
        });

        it('NSLV.isTouching3 - detects touch inside precision area', function(){
            assert.isTrue(l.isTouching(new Point(6,4), s),
                          'Touch @ 6,4 not detected');
            assert.isTrue(l.isTouching(new Point(1,2), s),
                          'Touch @ 1,2 not detected');
        });

        it('NSLV.isTouching4 - touch outside precision area not detected',
           function(){
               assert.isFalse(l.isTouching(new Point(12,1), s),
                              'Touch @ 12,1 detected');
               assert.isFalse(l.isTouching(new Point(1,-7), s),
                              'Touch @ 1,-7 detected');
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

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

               assert.isTrue(p.isTouching(new Point(-3,4), s),
                             'Touch @ -3,4 not detected');
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

        it('Rect.isTouching3 - detects touch inside', function(){
            assert.isTrue(r.isTouching(new Point(4,1), s),
                          'Touch @ 4,1 not detected');
            assert.isTrue(r.isTouching(new Point(2,4), s),
                          'Touch @ 2,4 not detected');
        });

        it('Rect.isTouching4 - touch in precision area detected',
           function(){
               assert.isTrue(r.isTouching(new Point(-2,-2), s),
                             'Touch @ -2,-2 not detected');
               assert.isTrue(r.isTouching(new Point(7,2), s),
                             'Touch @ 7,2 not detected');
           });

        it('Rect.isTouching5 - touch outside precision area not detected',
           function(){
               assert.isFalse(r.isTouching(new Point(-6,-6), s),
                              'Touch @ -6,-6 detected');
               assert.isFalse(r.isTouching(new Point(11,2), s),
                              'Touch @ 11,2 detected');
           });
    });

});

describe('NaiveVerticalStepline', function(){

    describe('NaiveVerticalStepline.constructor', function(){
        it('NSLV.constructor1 - makes point when start=end', function(){
            const line = new NaiveVerticalStepline(new Point(10, 10),
                                            new Point(10, 10));
            const obj = line.publish();
            assert.equal('10,10 10,10 10,10 10,10', obj.points,
                         'Incorrect path');
        });

        it('NSLV.constructor2 - makes straight line in degenerate case',
           function(){
               const line = new NaiveVerticalStepline(new Point(10, 10),
                                               new Point(50, 10));
               const obj = line.publish();
               assert.equal('10,10 30,10 30,10 50,10', obj.points,
                            'Incorrect path');
           });

        it('NSLV.constructor3 - makes step regular line', function(){
            const line = new NaiveVerticalStepline(new Point(10, 10),
                                            new Point(50, 50));
            const obj = line.publish();
            assert.equal('M 10 10 h 20 M 30 10 v 40 M 30 50 h 20', obj.d,
                         'Incorrect path');
        });

        it('NSLV.constructor4 - makes line in III quadrant', function(){
            const line = new NaiveVerticalStepline(new Point(50, 50),
                                            new Point(10, 10));
            const obj = line.publish();
            assert.equal('M 50 50 h -20 M 30 50 v -40 M 30 10 h -20', obj.d,
                         'Incorrect path');
        });

        it('NSLV.constructor5 - makes line in II quadrant', function(){
            const line = new NaiveVerticalStepline(new Point(10, 10),
                                            new Point(50, -30));
            const obj = line.publish();
            assert.equal('M 10 10 h 20 M 30 10 v -40 M 30 -30 h 20', obj.d,
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

describe('Spatia', function(){

    describe('isReachable(target: point, cursor: Point)', function(){
        const s = new Spatia(),
              p = new Point(1,1);

        it('isReachable(pp) 1 - detects direct hit', function(){
            assert.isTrue(s.isReachable(p, new Point(1,1)),
                         'Direct hit not detected');
        });

        it('isReachable(pp) 2 - detects hit in precision area', function(){
            assert.isTrue(s.isReachable(p, new Point(2,3)),
                          'Hit @ 2,3 not detected');
            assert.isTrue(s.isReachable(p, new Point(-3,3)),
                          'Hit @ -3,3 not detected');
            assert.isTrue(s.isReachable(p, new Point(-2,-1)),
                          'Hit @ -2,-1 not detected');
            assert.isTrue(s.isReachable(p, new Point(1,-1)),
                          'Hit @ 1,-1 not detected');
        });

        it('isReachable(pp) 3 - not detects hit in outside precision area',
           function(){
               assert.isFalse(s.isReachable(p, new Point(4,6)),
                              'Hit @ 4,6 detected');
               assert.isFalse(s.isReachable(p, new Point(-5,1)),
                              'Hit @ -5,1 detected');
               assert.isFalse(s.isReachable(p, new Point(-3,-3)),
                              'Hit @ -3,-3 detected');
               assert.isFalse(s.isReachable(p, new Point(7,-1)),
                              'Hit @ 7,-1 not detected');
           });
    });

    describe('isReachable(target:Line, cursor:Point)', function(){
        const s = new Spatia(),
              l = new StraightLine(new Point(1,1), new Point(5,5));

        it('isReachable(lp) 1 - detects direct hit', function(){
            assert.isTrue(s.isReachable(l, new Point(2,2)),
                         'Direct hit not detected');
        });
 
        it('isReachable(lp) 2 - detects hit in precision area', function(){
            assert.isTrue(s.isReachable(l, new Point(1,6)),
                          'Cursor @ 1,6 unreachable');
            assert.isTrue(s.isReachable(l, new Point(7,2)),
                          'Cursor @ 7,2 unreachable');
            assert.isTrue(s.isReachable(l, new Point(6,6)),
                          'Cursor @ 6,6 unreachable');
            assert.isTrue(s.isReachable(l, new Point(8,9)),
                          'Cursor @ 8,9 unreachable');
        });

        it('isReachable(lp) 3 - not detects hit outside precision area',
           function(){
               assert.isFalse(s.isReachable(l, new Point(1,10)),
                              'Cursor @ 1,10 reachable');
               assert.isFalse(s.isReachable(l, new Point(11,7)),
                              'Cursor @ 11,7 reachable');
               assert.isFalse(s.isReachable(l, new Point(-3,-3)),
                              'Cursor @ -3,-3 reachable');
               assert.isFalse(s.isReachable(l, new Point(-3,5)),
                              'Cursor @ -3,5 reachable');
           });
    });

});

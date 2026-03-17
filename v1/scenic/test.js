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

describe('NaiveStepLine', function(){

    it('NaiveStepLine1 - makes point in degenerate case', function(){
        const line = new NaiveStepLine(new Point(10, 10), new Point(10, 10));
        const obj = line.publish();
        assert.equal('M 10 10 v 0', obj.d, 'Incorrect path');
    });

    it('NaiveStepLine2 - makes straight line in degenerate case', function(){
        const line = new NaiveStepLine(new Point(10, 10), new Point(50, 10));
        const obj = line.publish();
        assert.equal('M 10 10 h 40', obj.d, 'Incorrect path');
    });

    it('NaiveStepLine3 - makes step regular line', function(){
        const line = new NaiveStepLine(new Point(10, 10), new Point(50, 50));
        const obj = line.publish();
        assert.equal('M 10 10 h 20 M 20 10 v 40 M 20 50 h 20', obj.d,
                     'Incorrect path');
    });

    it('NaiveStepLine4 - makes inversed step line', function(){
        const line = new NaiveStepLine(new Point(50, 50), new Point(10, 10));
        const obj = line.publish();
        assert.equal('M 50 50 h -20 M 20 50 v -40 M 20 10 h -20', obj.d,
                     'Incorrect path');
    });

});

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
                rects: 0,
                texts: 0,

                isOk: false,

                createRect: () => operator.rects++,
                createText: () => operator.texts++,
                createGroup: () => {},

                applyTo: function(element, definition){
                    if ((element === 1 || element === 2) && definition)
                        operator.isOk = true;
                },
                appendChild: () => {}
            };

            const pg = new ProcessGroup();
            pg.init('0', operator);

            assert.isTrue(operator.isOk, 'Properties not set');
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

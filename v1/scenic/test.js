describe('ProcessGroup', function(){

    describe('init', function(){

        it('init1 - creates rect and two texts', function(){
            const operator = {
                rects: 0,
                texts: 0,

                createRect: () => operator.rects++,
                createText: () => operator.texts++,
                applyTo: () => {}
            };

            const pg = new ProcessGroup();
            pg.init(operator);

            assert.equal(operator.rects, 1, 'Rect creation failure');
            assert.equal(operator.texts, 2, 'Texts creation failure');
        });

        it('init2 - applying properties to SVG elements', function(){
            const operator = {
                rects: 0,
                texts: 0,

                isOk: false,

                createRect: () => operator.rects++,
                createText: () => operator.texts++,

                applyTo: function(element, definition){
                    if ((element === 1 || element === 2) && definition)
                        operator.isOk = true;
                }
            };

            const pg = new ProcessGroup();
            pg.init(operator);

            assert.isTrue(operator.isOk);
        });

    });

});

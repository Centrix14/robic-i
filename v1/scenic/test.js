describe('ProcessGroup', function(){

    describe('init', function(){

        it('init1 - creates rect and two texts', function(){
            const operator = {
                rects: 0,
                texts: 0,

                createRect: () => operator.rects++,
                createText: () => operator.texts++
            };

            const pg = new ProcessGroup();
            pg.init(operator);

            assert.equal(operator.rects, 1, 'Rect creation failure');
            assert.equal(operator.texts, 2, 'Texts creation failure');
        });

    });

});

describe('Point', function(){

    describe('Point.isTouching', function(){
        it('Point.isTouching1 - detects precise touch', function(){
            const p = new Point(0,0);
            assert.isTrue(p.isTouching(new Point(0,0), new Spatia()),
                         'Direct touch not detected');
        });

        it('Point.isTouching2 - detects touch in precision radius', function(){
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

        it('Point.isTouching3 - detects touch at the edge of precision radius',
           function(){
            const p = new Point(0,0), s = new Spatia();

               assert.isTrue(p.isTouching(new Point(-3,4), s),
                             'Touch @ -3,4 not detected');
               assert.isTrue(p.isTouching(new Point(5,0), s),
                             'Touch @ 5,0 not detected');
           });

        it('Point.isTouching4 - touch outside precision area not detected',
           function(){
            const p = new Point(0,0), s = new Spatia();

            assert.isFalse(p.isTouching(new Point(5,6), s),
                           'Touch @ 5,6 detected');
        });
    });

});

describe('Rect', function(){

    describe('Rect.isTouching', function(){
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

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

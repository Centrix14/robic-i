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
        const s = new Spatia(5),
              l = new StraightLine(new Point(1,1), new Point(50,50));

        it('isReachable(lp) 1 - detects direct hit', function(){
            assert.isTrue(s.isReachable(l, new Point(10,10)),
                         'Direct hit not detected');
        });
 
        it('isReachable(lp) 2 - detects hit in precision area', function(){
            assert.isTrue(s.isReachable(l, new Point(10,6)),
                          'Cursor @ 10,6 unreachable');
            assert.isTrue(s.isReachable(l, new Point(13,6)),
                          'Cursor @ 13,6 unreachable');
            assert.isTrue(s.isReachable(l, new Point(13,20)),
                          'Cursor @ 13,20 unreachable');
            assert.isTrue(s.isReachable(l, new Point(30,25)),
                          'Cursor @ 30,25 unreachable');
        });

        it('isReachable(lp) 3 - not detects hit outside precision area',
           function(){
               assert.isFalse(s.isReachable(l, new Point(20,0)),
                              'Cursor @ 20,0 reachable');
               assert.isFalse(s.isReachable(l, new Point(50,25)),
                              'Cursor @ 50,25 reachable');
               assert.isFalse(s.isReachable(l, new Point(-3,-3)),
                              'Cursor @ -3,-3 reachable');
               assert.isFalse(s.isReachable(l, new Point(-3,5)),
                              'Cursor @ -3,5 reachable');
           });
    });

});

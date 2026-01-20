describe('Spatia', function(){

    it('returns `true` if target reachable for cursor', function(){
        const spatia = new Spatia(1, 0.3);
        const target = new Point(1, 1);
        const cursor = new Point(1.2, 0.8);

        assert.isTrue(spatia.isReachable(target, cursor));
    });

    it('returns `false` if target not reachable for cursor', function(){
        const spatia = new Spatia(1, 0.3);
        const target = new Point(1, 1);
        const cursor = new Point(1.4, 0.6);

        assert.isFalse(spatia.isReachable(target, cursor));
    });
    
    it('snaps reachable point', function(){
        const spatia = new Spatia(1, 0.2);
        const cursor = new Point(0.9, 1.1);

        const snappedCusor = spatia.snapPoint(cursor);

        assert.equal(snappedCusor.X, 1);
        assert.equal(snappedCusor.Y, 1);
    });

    it('does not snap unreachable point', function(){
        const spatia = new Spatia(1, 0.2);
        const cursor = new Point(0.7, 1.3);

        const snappedCusor = spatia.snapPoint(cursor);

        assert.equal(snappedCusor.X, 0.7);
        assert.equal(snappedCusor.Y, 1.3);
    });

    it('does not snap middle point', function(){
        const spatia = new Spatia(4, 2);
        const cursor = new Point(2, 0);

        const snappedCusor = spatia.snapPoint(cursor);

        assert.equal(snappedCusor.X, 2);
        assert.equal(snappedCusor.Y, 0);
    });

    it('snaps point to the side of a rect', function(){
        const spatia = new Spatia(1, 1);
        const rect = Rect.createByPoints(0, '', new Point(0,0), new Point(10,10));
        const cursor = new Point(1, 5);

        const snappedCursor = spatia.snapToRectSide(rect.start, rect.end,
                                                    cursor);

        assert.equal(snappedCursor.X, 0);
        assert.equal(snappedCursor.Y, 5);
    });

});

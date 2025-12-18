let assert = chai.assert;

describe('Result', function() {

    describe('addError', function() {
        let result = new Result();

        it('adds custom error', function() {
            assert.isTrue(result.addError('some custom error'));
        });

        it('don`t duplicate errors', function() {
            assert.isFalse(result.addError('some custom error'));
        });

        it('adds default error', function() {
            assert.isTrue(result.addError(Result.Defaults.TestError));
        });
    });

    describe('hasErrors', function() {
        let result = new Result();

        it('returns false for empty results', function() {
            assert.isFalse(result.hasErrors());
        });

        it('returns true for non empty results', function() {
            result.addError(Result.Defaults.TestError);
            assert.isTrue(result.hasErrors());
        })
    });

    describe('isSuccess', function() {
        let result = new Result();

        it('returns true for success', function() {
            assert.isTrue(result.isSuccess());
        });

        it('returns false if any errors occured', function() {
            result.addError(Result.Defaults.TestError);
            assert.isFalse(result.isSuccess());
        })
    });

    describe('getErrors', function() {
        let result = new Result();

        it('returns array', function() {
            assert.isArray(result.getErrors());
        });

        it('for empty result returns empty array', function() {
            assert.lengthOf(result.getErrors(), 0);
        });

        it('for non empty result returns non empty array', function() {
            result.addError(Result.Defaults.TestError);
            assert.lengthOf(result.getErrors(), 1);
        });

        it('returns copy', function() {
            let errors = result.getErrors();
            errors.push('find me');
            assert.notInclude(result.getErrors(), 'find me');
        });
    });

});

describe('Point', function() {

    describe('serialize', function() {
        let point = new Point(5, 10);

        it('takes only SVGElements', function() {
            let svgElm = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            let htmlElm = document.createElement('div');

            assert.isTrue(point.serialize(svgElm).isSuccess() &&
                          point.serialize(htmlElm).hasErrors());
        });

        it('set `x` and `y` attributes', function() {
            let elm = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            point.serialize(elm);

            assert.isTrue(elm.getAttribute('x') === '5' &&
                          elm.getAttribute('y') === '10');
        });
    });

    describe('sum', function() {
        it('normally returns point', function() {
            let p1 = new Point(1,1);
            let p2 = new Point(2,2);

            assert.instanceOf(p1.sum(p2), Point);
        });

        it('abnormally returns result with errors', function() {
            let realPoint = new Point(1,1);
            let fakePoint = {x: 2, y: 2};

            assert.isTrue(realPoint.sum(fakePoint).hasErrors());
        })
    });

    describe('sub', function() {
        it('normally returns point', function() {
            let p1 = new Point(1,1);
            let p2 = new Point(2,2);

            assert.instanceOf(p1.sub(p2), Point);
        });

        it('abnormally returns result with errors', function() {
            let realPoint = new Point(1,1);
            let fakePoint = {x: 2, y: 2};

            assert.isTrue(realPoint.sub(fakePoint).hasErrors());
        })
    });

});

describe('Figure', function() {

    describe('getCaption', function() {
        let figure = new Figure(1);

        it('returns strings', function() {
            assert.typeOf(figure.getCaption(), 'string');
        });

        it('returns actual caption', function() {
            figure.setCaption('cap');

            assert.equal(figure.getCaption(), 'cap');
        })
    });

    describe('setCaption', function() {
        let figure = new Figure(1);

        it('takes only strings', function() {
            assert.isTrue(figure.setCaption('cap').isSuccess() &&
                          figure.setCaption(123).hasErrors());
        });

    });

});

describe('Rect', function() {

    describe('serialize', function() {
        let rect1 = Rect.createByMeasures(2, '', new Point(1,1), 50, 50);
        let rect2 = Rect.createByPoints(1, '', new Point(1,1), new Point(51,51));

        it('takes only SVGElement', function() {
            let svgElm = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            let htmlElm = document.createElement('div');

            assert.isTrue(rect1.serialize(svgElm).isSuccess() &&
                          rect1.serialize(htmlElm).hasErrors());
        });

        it('sets `x`, `y`, `width` and `height` attributes', function() {
            let elm = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect2.serialize(elm);
            assert.isTrue(elm.getAttribute('x') === '1' &&
                          elm.getAttribute('y') === '1' &&
                          elm.getAttribute('width') === '50' &&
                          elm.getAttribute('height') === '50');
        });
    });

    describe('isTouching', function() {
        let rect = Rect.createByMeasures(1, '', new Point(1,1), 50, 50);

        it('takes only Point', function() {
            let realPoint = new Point(1,1);
            let fakePoint = {x: 2, y: 2};

            assert.isTrue(rect.isTouching(realPoint).isSuccess());
            assert.isTrue(rect.isTouching(fakePoint).hasErrors());
        });

        it('returns bool', function() {
            let point1 = new Point(1,1);
            let point2 = new Point(0,0);

            assert.typeOf(rect.isTouching(point1), 'bool');
            assert.typeOf(rect.isTouching(point2), 'bool');
        });
    });

});

describe('RectManager', function() {

    describe('create', function() {
        
        it('takes Point and SVGElement', function() {
            let manager = new RectManager();
            
            let realPoint = new Point(1,1),
                fakePoint = {x: 1, y: 1};
            let svgElm = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            let htmlElm = document.createElement('div');
            
            assert.isTrue(manager.create(realPoint, svgElm, '').isSuccess());
            assert.isTrue(manager.create(fakePoint, htmlElm, '').hasErrors());
        });

        it('sets `id`, coordinates and measures', function() {
            let manager = new RectManager();

            let cursor = new Point(1,1);
            let elm = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

            assert.isTrue(manager.create(cursor, elm, '').isSuccess(), 'rect not created');
            assert.isTrue(elm.getAttribute('id') === '0')
            assert.isTrue(elm.getAttribute('x') === '1');
            assert.isTrue(elm.getAttribute('y') === '1');
            assert.isTrue(elm.getAttribute('width') === '30');
            assert.isTrue(elm.getAttribute('height') === '20');
        });
    });

});

// писать ли тест на Editor?

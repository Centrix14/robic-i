let assert = chai.assert;

describe('Result', function() {

    describe('addError', function() {
        let result = new Result();

        it('adding custom error', function() {
            assert.isTrue(result.addError('some custom error'));
        });

        it('adding the same error', function() {
            assert.isFalse(result.addError('some custom error'));
        });

        it('adding default error', function() {
            assert.isTrue(result.addError(Result.Defaults.TestError));
        });
    });

    describe('hasErrors', function() {
        let result = new Result();

        it('empty result has no errors', function() {
            assert.isFalse(result.hasErrors());
        });

        it('non empty result has errors', function() {
            result.addError(Result.Defaults.TestError);
            assert.isTrue(result.hasErrors());
        })
    });

    describe('isSuccess', function() {
        let result = new Result();

        it('empty result successfull', function() {
            assert.isTrue(result.isSuccess());
        });

        it('non empty result unsuccessfull', function() {
            result.addError(Result.Defaults.TestError);
            assert.isFalse(result.isSuccess());
        })
    });

    describe('getErrors', function() {
        let result = new Result();

        it('method returns array', function() {
            assert.isArray(result.getErrors());
        });

        it('for empty result it returns empty array', function() {
            assert.lengthOf(result.getErrors(), 0);
        });

        it('for non empty result it returns non empty array', function() {
            result.addError(Result.Defaults.TestError);
            assert.lengthOf(result.getErrors(), 1);
        });

        it('method returns copy', function() {
            let errors = result.getErrors();
            errors.push('find me');
            assert.notInclude(result.getErrors(), 'find me');
        });
    });

});

describe('Point', function() {

    describe('serialize', function() {
        let point = new Point(5, 10);

        it('method takes SVGElements', function() {
            let svgElm = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            assert.isTrue(point.serialize(svgElm).isSuccess());
        });

        it('method takes ONLY SVGElements', function() {
            let htmlElm = document.createElement('div');
            assert.isTrue(point.serialize(htmlElm).hasErrors());
        });

        it('method set `x` and `y` attributes', function() {
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

        it('takes strings', function() {
            assert.isTrue(figure.setCaption('cap').isSuccess());
        });

        it('takes ONLY strings', function() {
            assert.isFalse(figure.setCaption(123).isSuccess());
        })
    });

});

describe('Rect', function() {

    describe('serialize', function() {
        let rect1 = Rect.createByMeasures(2, new Point(1,1), 50, 50);
        let rect2 = Rect.createByPoints(1, new Point(1,1), new Point(51,51));

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
        let rect = Rect.createByMeasures(1, new Point(1,1), 50, 50);

        it('takes only Point', function() {
            let realPoint = new Point(1,1);
            let fakePoint = {x: 2, y: 2};

            assert.isTrue(rect.isTouching(realPoint).isSuccess &&
                          rect.isTouching(fakePoint).hasErrors);
        });

        it('returns bool', function() {
            let point1 = new Point(1,1);
            let point2 = new Point(0,0);

            assert.isTrue(typeof rect.isTouching(point1) === 'bool' &&
                          typeof rect.isTouching(point2) === 'bool');
        });
    });

    describe('isCovers', function() {
        let rect = Rect.createByMeasures(1, new Point(1,1), 50, 50);

        it('takes only Point', function() {
            let realPoint = new Point(1,1);
            let fakePoint = {x: 2, y: 2};

            assert.isTrue(rect.isCovers(realPoint).isSuccess &&
                          rect.isCovers(fakePoint).hasErrors);
        });

        it('returns bool', function() {
            let point1 = new Point(1,1);
            let point2 = new Point(0,0);

            assert.isTrue(typeof rect.isCovers(point1) === 'bool' &&
                          typeof rect.isCovers(point2) === 'bool');
        });
    });

});

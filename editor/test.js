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

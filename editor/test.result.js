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

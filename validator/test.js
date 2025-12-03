let assert = chai.assert;

describe('ElementRole', function(){

    it('creates new roles', function(){
        let er = new ElementRole();

        let r1 = er.create('r1');
        let r2 = er.create('r2');

        assert.isDefined(er.getName(r1) &&
                         er.getName(r2));
    });

    it('deletes roles', function(){
        let er = new ElementRole();

        let r = er.create('r');
        er.delete(r);

        assert.isUndefined(er.getName(r));
    });
    
});

describe('Component', function(){
    
});

describe('ComponentManager', function(){

    it('creates components', function(){
        let manager = new ComponentManager();

        let proc = manager.createProcess();
        let elm = manager.createElement();
        let prop = manager.createProperty();

        assert.isDefined(manager.get(proc) &&
                         manager.get(elm) &&
                         manager.get(prop));
    });

    it('deletes components', function(){
        let manager = new ComponentManager();

        let proc = manager.createProcess();
        let elm = manager.createElement();
        let prop = manager.createProperty();

        manager.deleteComponent(proc);
        manager.deleteComponent(elm);
        manager.deleteComponent(prop);
        
        assert.isUndefined(manager.get(proc) &&
                           manager.get(elm) &&
                           manager.get(prop));
    });

    it('creates several components of the same type', function(){
        let manager = new ComponentManager();

        let p1 = manager.createProcess();
        let p2 = manager.createProcess();

        assert.isTrue(manager.get(p1) !== manager.get(p2) &&
                      manager.get(p1) !== undefined);
    });

});

describe('UniquenessRule', function(){

    it('returns `false` for same-named processes in the same iteration', function(){
        let manager = new ComponentManager();

        manager.createProcess(0, 'proc1');

        let rule = new UniquenessRule();
        assert.isFalse(rule.check(manager, Process, 'proc1'));
    });

    it('returns `true` for same-named processes in the different iterations', function(){
        let manager = new ComponentManager();

        let older = manager.createProcess(0, 'proc1');
        older.moveToIteration(-1);

        let rule = new UniquenessRule();
        assert.isTrue(rule.check(manager, Process, 'proc1'));
    });

    it('returns `true` if non-unique processes are unnamed', function(){
        let manager = new ComponentManager();

        manager.createProcess();

        let rule = new UniquenessRule();
        assert.isTrue(rule.check(manager, Process, ''));
    });

    it('returns `false` for same-named elements', function(){
        let manager = new ComponentManager();

        manager.createElement('elm1');

        let rule = new UniquenessRule();
        assert.isTrue(rule.check(manager, Element, 'elm1'));
    });

    it('returns `true` if non-unique elements are unnamed', function(){
        let manager = new ComponentManager();

        manager.createElement();

        let rule = new UniquenessRule();
        assert.isTrue(rule.check(manager, Element, ''));
    });

    it('returns `false` for same-named properties', function(){
        let manager = new ComponentManager();

        manager.createProperty('prop1');

        let rule = new UniquenessRule();
        assert.isTrue(rule.check(manager, Property, 'prop1'));
    });

    it('returns `true` if non-unique properties are unnamed', function(){
        let manager = new ComponentManager();

        manager.createProperty();

        let rule = new UniquenessRule();
        assert.isTrue(rule.check(manager, Property, ''));
    });

    it('returns `true` for same-named components of different types', function(){
        let manager = new ComponentManager();

        manager.createProcess('com1');

        let rule = new UniquenessRule();
        assert.isTrue(rule.check(manager, Element, 'com1'))
    });

});

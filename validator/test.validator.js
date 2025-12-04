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

    it('adds nested components', function(){
        let parent = new Component('p');
        let child1 = new Component('c1');
        let child2 = new Component('c2');

        parent.addNested(child1);
        parent.addNested(child2);

        let content = parent.getNested();

        assert.isTrue(content[0] === 'c1');
        assert.isTrue(content[1] === 'c2');
    });

    it('deletes nested components', function(){
        let parent = new Component('p');
        let child1 = new Component('c1');
        let child2 = new Component('c2');

        parent.addNested(child1);
        parent.addNested(child2);

        parent.deleteNested(child1);
        parent.deleteNested(child2);

        assert.isEmpty(parent.getNested());
    });

});

describe('Property', function(){

    it('adds possible value', function(){
        let prop = new Property();

        let v1 = prop.addPossibleValue('1');
        let v2 = prop.addPossibleValue('2');

        assert.isDefined(prop.getPossibleValue(v1) && prop.getPossibleValue(v2));
    });

    it('deletes possible values', function(){
        let prop = new Property();

        let v1 = prop.addPossibleValue('1');
        let v2 = prop.addPossibleValue('2');

        prop.deletePossibleValue(v1);
        prop.deletePossibleValue(v2);

        assert.isUndefined(prop.getPossibleValue(v1) &&
                           prop.getPossibleValue(v2));
    });

    it('sets reference and actual value', function(){
        let prop = new Property();

        let v1 = prop.addPossibleValue('1');
        let v2 = prop.addPossibleValue('2');

        prop.referenceValue = v1;
        prop.actualValue = v2;

        assert.isFalse(prop.isComplete());
    });

});

describe('Element', function(){

    it('adds contexts', function(){
        let p = new Process('p1');
        let e = new Element('e1');
        let er = new ElementRole();

        let role = er.create('test');

        e.addContext(p.designation, role);

        assert.isNotEmpty(e.getContextsByDesig(p.designation));
    });

    it('deletes contexts', function(){
        let p = new Process('p1');
        let e = new Element('e1');
        let er = new ElementRole();

        let role = er.create('test');

        e.addContext(p.designation, role);
        e.deleteContext(p.designation, role);

        assert.isUndefined(e.getContextsByDesig(p.designation));
    });

});

describe('Process', function(){

    it('adds nested processes', function(){
        let p1 = new Process('p1');
        let p2 = new Process('p2');

        p1.addNested(p2);

        assert.deepEqual(p1.getNested(), ['p2']);
    });

    it('deletes nested processes', function(){
        let p1 = new Process('p1');
        let p2 = new Process('p2');

        p1.addNested(p2);
        p1.deleteNested(p2);

        assert.isEmpty(p1.getNested());
    });

    it('adds nested elements in specific roles', function(){
        let p = new Process('p');
        let e = new Element('e');

        let er = new ElementRole();
        let role = er.create('test');
        p.addNested(e, role);

        assert.deepEqual(p.getNested(), ['e']);
        assert.isNotEmpty(e.getContexts());
    });

    it('deletes nested elements in specific roles', function(){
        let p = new Process('p');
        let e = new Element('e');

        let er = new ElementRole();
        let role = er.create('test');
        p.addNested(e, role);
        p.deleteNested(e, role);

        assert.isEmpty(p.getNested());
        assert.isEmpty(e.getContexts());
    });

});

describe('ComponentManager', function(){

    it('creates components', function(){
        let manager = new ComponentManager();

        let proc = manager.createComponent(Process);
        let elm = manager.createComponent(Element);
        let prop = manager.createComponent(Property);

        assert.isDefined(manager.get(proc) &&
                         manager.get(elm) &&
                         manager.get(prop));
    });

    it('deletes components', function(){
        let manager = new ComponentManager();

        let proc = manager.createComponent(Process);
        let elm = manager.createComponent(Element);
        let prop = manager.createComponent(Property);

        manager.deleteComponent(proc);
        manager.deleteComponent(elm);
        manager.deleteComponent(prop);

        assert.isUndefined(manager.get(proc) &&
                           manager.get(elm) &&
                           manager.get(prop));
    });

    it('creates several components of the same type', function(){
        let manager = new ComponentManager();

        let p1 = manager.createComponent(Process);
        let p2 = manager.createComponent(Process);

        assert.isTrue(manager.get(p1) !== manager.get(p2) &&
                      manager.get(p1) !== undefined);
    });

});

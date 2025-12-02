let assert = chai.assert;

describe('ComponentManager', function(){

    let manager = new ComponentManager();
    let proc, elm, prop;
    
    it('creates components', function(){
        proc = manager.createProcess();
        elm = manager.createElement();
        prop = manager.createProperty();

        assert.isTrue(manager.countComponents(Process) === 1 &&
                      manager.countComponents(Element) === 1 &&
                      manager.countComponents(Property) === 1);
    });

    it('deletes components', function(){
        manager.deleteComponent(proc);
        manager.deleteComponent(elm);
        manager.deleteComponent(prop);
        
        assert.isTrue(manager.countComponents(Process) === 0 &&
                      manager.countComponents(Element) === 0 &&
                      manager.countComponents(Property) === 0);
    });

    it('creates several components of the same type', function(){
        manager.createProcess();
        manager.createProcess();

        assert.equal(manager.countComponents(Process), 2);
    });

    it('creates copy of repository', function(){
        let copy = manager.copyRepository();
        copy.clear();

        assert.isTrue(copy.size == 0 &&
                      manager.countComponents() == 2);
    });
    
});

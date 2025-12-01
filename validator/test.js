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
        manager.deleteComponent(Process, proc);
        manager.deleteComponent(Element, elm);
        manager.deleteComponent(Property, prop);
        
        assert.isTrue(manager.countComponents(Process) === 0 &&
                      manager.countComponents(Element) === 0 &&
                      manager.countComponents(Property) === 0);
    });
    
});

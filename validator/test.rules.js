describe('UniquenessRule', function(){

    it('returns `false` for same-named processes in the same iteration', function(){
        let manager = new ComponentManager();

        manager.createComponent(Process, '', 'proc1');

        let rule = new UniquenessRule();
        assert.isFalse(rule.check(manager, Process, 'proc1'));
    });

    it('returns `true` for same-named processes in the different iterations', function(){
        let manager = new ComponentManager();

        manager.createComponent(Process, '', 'proc1');
        
        let older = manager.getByName('proc1');
        older.iteration = -1;

        let rule = new UniquenessRule();
        assert.isTrue(rule.check(manager, Process, 'proc1'));
    });

    it('returns `true` if non-unique processes are unnamed', function(){
        let manager = new ComponentManager();

        manager.createComponent(Process);

        let rule = new UniquenessRule();
        assert.isTrue(rule.check(manager, Process, ''));
    });

    it('returns `false` for same-named elements', function(){
        let manager = new ComponentManager();

        manager.createComponent(Element, '', 'elm1');

        let rule = new UniquenessRule();
        assert.isFalse(rule.check(manager, Element, 'elm1'));
    });

    it('returns `true` if non-unique elements are unnamed', function(){
        let manager = new ComponentManager();

        manager.createComponent(Element);

        let rule = new UniquenessRule();
        assert.isTrue(rule.check(manager, Element, ''));
    });

    it('returns `false` for same-named properties', function(){
        let manager = new ComponentManager();

        manager.createComponent(Property, '', 'prop1');

        let rule = new UniquenessRule();
        assert.isFalse(rule.check(manager, Property, 'prop1'));
    });

    it('returns `true` if non-unique properties are unnamed', function(){
        let manager = new ComponentManager();

        manager.createComponent(Property);

        let rule = new UniquenessRule();
        assert.isTrue(rule.check(manager, Property, ''));
    });

    it('returns `true` for same-named components of different types', function(){
        let manager = new ComponentManager();

        manager.createComponent(Process, '', 'com1');

        let rule = new UniquenessRule();
        assert.isTrue(rule.check(manager, Element, 'com1'))
    });

});

describe('NestingRule', function(){

    it('returns `true` for process-to-(process, element) nesting', function(){
        
    });

    it('returns `true` for element-to-(element, property) nesting', function(){
        
    });

    it('returns `true` for property-to-property nesting', function(){
        
    });

    it('returns `false` for process-to-property nesting', function(){
        
    });

    it('returns `false` for element-to-process nesting', function(){
        
    });

    it('returns `false` for property-to-process nesting', function(){
        
    });
    
});

describe('ElementRoleSettingRule', function(){

    it('returns `true` for setting child of process as input, output, doer or mean', function(){
        
    });

    it('returns `false` for setting child of process as none', function(){
        
    });

    it('returns `false` for setting child of element as input, output, doer or mean', function(){
        
    });
    
});

describe('DynamicUniquenessRule', function(){

    it('returns `false` for same-named processes in the same iteration', function(){
        let manager = new ComponentManager();

        manager.createComponent(Process, '', 'proc1');

        let rule = new DynamicUniquenessRule();
        assert.isFalse(rule.check(manager, Process, 'proc1'));
    });

    it('returns `true` for same-named processes in the different iterations', function(){
        let manager = new ComponentManager();

        manager.createComponent(Process, '', 'proc1');

        let older = manager.getByName('proc1');
        older.iteration = -1;

        let rule = new DynamicUniquenessRule();
        assert.isTrue(rule.check(manager, Process, 'proc1'));
    });

    it('returns `true` if non-unique processes are unnamed', function(){
        let manager = new ComponentManager();

        manager.createComponent(Process);

        let rule = new DynamicUniquenessRule();
        assert.isTrue(rule.check(manager, Process, ''));
    });

    it('returns `false` for same-named elements', function(){
        let manager = new ComponentManager();

        manager.createComponent(Element, '', 'elm1');

        let rule = new DynamicUniquenessRule();
        assert.isFalse(rule.check(manager, Element, 'elm1'));
    });

    it('returns `true` if non-unique elements are unnamed', function(){
        let manager = new ComponentManager();

        manager.createComponent(Element);

        let rule = new DynamicUniquenessRule();
        assert.isTrue(rule.check(manager, Element, ''));
    });

    it('returns `false` for same-named properties', function(){
        let manager = new ComponentManager();

        manager.createComponent(Property, '', 'prop1');

        let rule = new DynamicUniquenessRule();
        assert.isFalse(rule.check(manager, Property, 'prop1'));
    });

    it('returns `true` if non-unique properties are unnamed', function(){
        let manager = new ComponentManager();

        manager.createComponent(Property);

        let rule = new DynamicUniquenessRule();
        assert.isTrue(rule.check(manager, Property, ''));
    });

    it('returns `true` for same-named components of different types', function(){
        let manager = new ComponentManager();

        manager.createComponent(Process, '', 'com1');

        let rule = new DynamicUniquenessRule();
        assert.isTrue(rule.check(manager, Element, 'com1'))
    });

});

describe('StaticUniquenessRule', function(){

    it('returns `false` for same designations', function(){
        const c1 = new Component('c1', 'c1');
        const c2 = new Component('c2', 'c2');
        const c3 = new Component('c1', 'c3');
        
        const repository = new Map();
        repository.set('c1', c1);
        repository.set('c2', c2);

        const manager = {
            repository
        };

        const rule = new StaticUniquenessRule();
        assert.isFalse(rule.check(manager, c3));
    });

    it('returns `false` for same-named components', function(){
        const c1 = new Component('c1', 'c1');
        const c2 = new Component('c2', 'c1');

        const repository = new Map();
        repository.set('c1', c1);
        
        const manager = {
            repository
        };

        let rule = new StaticUniquenessRule();
        assert.isFalse(rule.check(manager, c2));
    });

    it('returns `true` if non-unique components are unnamed', function(){
        const c1 = new Component('c1', '');
        const c2 = new Component('c2', '');
        
        const repository = new Map();
        repository.set('c1', c1);
        
        const manager = {
            repository
        };

        let rule = new StaticUniquenessRule();
        assert.isTrue(rule.check(manager, c2));
    });

    it('returns `true` for same-named components of different types', function(){
        const manager = new ComponentManager();
        manager.createComponent(Process, '', 'c1');
        const target = manager.createComponent(Element, '', 'c1');

        let rule = new StaticUniquenessRule();
        assert.isTrue(rule.check(manager, manager.get(target)));
    });

    it('returns `false` for same-named processes in the same iteration', function(){
        const p1 = new Process('p1', 'p1');
        const p2 = new Process('p2', 'p1');

        const repository = new Map();
        repository.set('p1', p1);
        
        const manager = {
            repository
        };

        let rule = new StaticUniquenessRule();
        assert.isFalse(rule.check(manager, p2));
    });

    it('returns `true` for same-named processes in the different iterations', function(){
        const p1 = new Process('p1', 'p1');
        p1.iteration = 1;
        
        const p2 = new Process('p2', 'p1');
        
        const repository = new Map();
        repository.set('p1', p1);
        
        const manager = {
            repository
        };

        let rule = new StaticUniquenessRule();
        assert.isTrue(rule.check(manager, p2));
    });

});

describe('NestingRule', function(){

    it('returns `true` for process-to-(process, element) nesting', function(){
        const rule = new NestingRule();

        assert.isTrue(rule.check(Process, Process));
        assert.isTrue(rule.check(Process, Element));
    });

    it('returns `true` for element-to-(element, property) nesting', function(){
        const rule = new NestingRule();

        assert.isTrue(rule.check(Element, Element));
        assert.isTrue(rule.check(Element, Property));
    });

    it('returns `true` for property-to-property nesting', function(){
        const rule = new NestingRule();

        assert.isTrue(rule.check(Property, Property));
    });

    it('returns `false` for process-to-property nesting', function(){
        const rule = new NestingRule();

        assert.isFalse(rule.check(Process, Property));
    });

    it('returns `false` for element-to-process nesting', function(){
        const rule = new NestingRule();

        assert.isFalse(rule.check(Element, Process));
    });

    it('returns `false` for property-to-process nesting', function(){
        const rule = new NestingRule();

        assert.isFalse(rule.check(Property, Process));
    });

});

describe('ElementRoleSettingRule', function(){

    it('returns `true` for setting child of process as input, output, doer or mean', function(){
        const roles = new ElementRole();
        roles.create('input');
        roles.create('output');
        roles.create('doer');
        roles.create('mean');

        const rule = new ElementRoleSettingRule();

        assert.isTrue(rule.check(roles, Process, roles.getId('input')));
        assert.isTrue(rule.check(roles, Process, roles.getId('output')));
        assert.isTrue(rule.check(roles, Process, roles.getId('doer')));
        assert.isTrue(rule.check(roles, Process, roles.getId('mean')));
    });

    it('returns `false` for setting child of process as none', function(){
        const roles = new ElementRole();
        roles.create('none');

        const rule = new ElementRoleSettingRule();

        assert.isFalse(rule.check(roles, Process, roles.getId('none')));
    });

    it('returns `false` for setting child of element as input, output, doer or mean', function(){
        const roles = new ElementRole();
        roles.create('input');
        roles.create('output');
        roles.create('doer');
        roles.create('mean');

        const rule = new ElementRoleSettingRule();

        assert.isFalse(rule.check(roles, Element, roles.getId('input')));
        assert.isFalse(rule.check(roles, Element, roles.getId('output')));
        assert.isFalse(rule.check(roles, Element, roles.getId('doer')));
        assert.isFalse(rule.check(roles, Element, roles.getId('mean')));
    });

});

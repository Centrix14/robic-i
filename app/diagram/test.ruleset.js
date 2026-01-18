describe('RuleSet', function(){

    it('returns undefined when no rules were performed', function(){
        const set = new RuleSet();

        assert.isUndefined(set.check());
    });
    
    it('takes set definition and runs it', function(){
        const manager = new ComponentManager();
        
        const set = new RuleSet([
            [DynamicUniquenessRule, (r) => r.check(manager, Process, 'p1')],
            [NestingRule, (r) => r.check(Process, Element)]
        ]);

        const checkResult = set.check();
        assert.isTrue(checkResult);
    });

    it('returns last failed rule', function(){
        const manager = new ComponentManager();

        manager.createComponent(Process, '', 'p1');

        const set = new RuleSet([
            [DynamicUniquenessRule, (r) => r.check(manager, Process, 'p1')],
            [NestingRule, (r) => r.check(Process, Element)]
        ]);

        const checkResult = set.check();
        assert.instanceOf(checkResult, DynamicUniquenessRule);
    });
    
});

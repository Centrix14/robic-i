class Rule {
    check() { return true; }
    explainError() { return ''; }
}

class UniquenessRule extends Rule {
    check(componentManager, componentClass, componentName='') {
        if (componentName === '') return true;
        
        const duplicate = componentManager.getByName(componentName);
        
        if (duplicate === undefined)
            return true;
        else {
            if (componentClass === Process)
                return !(duplicate.iteration === 0);
            return !(duplicate instanceof componentClass);
        }
    }
}

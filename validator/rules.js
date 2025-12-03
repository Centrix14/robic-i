class Rule {
    check() { return true; }
    explainFailedRule() { return ""; }
}


class UniquenessRule extends Rule {
    check(componentManager, componentClass, newComponentName="") {
        let repository = componentManager.copyRepository(componentClass);
        
        for (let component of repository.values()) {
            
            if (component.name === newComponentName && component.name !== '') {
                if (componentClass === Process)
                    return component.iteration !== 0;
                return false;
            }
            
        }

        return true;
    }
}

class Rule {
    check() { return true; }
    explainError() { return ''; }
}

class UniquenessRule extends Rule {
    #sameIterationError = false;
    #sameTypeError = false;
    
    check(componentManager, componentClass, componentName='') {
        if (componentName === '') return true;
        
        const duplicate = componentManager.getByName(componentName);
        
        if (duplicate === undefined)
            return true;
        else {
            if (componentClass === Process) {
                if (duplicate.iteration === 0) {
                    this.#sameIterationError = true;
                    return false;
                }
                else
                    return true;
            }

            if (duplicate instanceof componentClass) {
                this.#sameTypeError = true;
                return false;
            }
            else
                return true;
        }
    }

    explainError() {
        let explanation = 'Ошибка правила уникальности:';

        if (this.#sameIterationError)
            explanation += '\n- Процессы с одинаковыми названиями могут существовать только в разных итерациях';
        if (this.#sameTypeError)
            explanation += '\n- Компоненты с одинаковыми названиями могут существовать, только если они разных типов';

        return explanation;
    }
}

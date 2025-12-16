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

class NestingRule extends Rule {
    #nestingErrorClass = undefined;

    static _getPrecedenceFor(componentClass) {
        const precedence = [Process, Element, Property];

        for (let i = 0; i < precedence.length; i++) {
            if (precedence[i] === componentClass)
                return i;
        }
        return -1;
    }
    
    check(parentClass, childClass) {
        const parentPrecedence = NestingRule._getPrecedenceFor(parentClass);
        const childPrecedence = NestingRule._getPrecedenceFor(childClass);

        const parent_childGap = childPrecedence - parentPrecedence;
        if (parent_childGap === 0 || parent_childGap === 1)
            return true;
        else {
            this.#nestingErrorClass = parentClass;
            return false;
        }
    }

    explainError() {
        let explanation = 'Ошибка правила декомпозиции: ';

        switch (this.#nestingErrorClass) {
        case Parent:
            return explanation + 'процесс может быть декомпозирован только на процессы и элементы';

        case Element:
            return explanation + 'элемент может быть декомпозирован только на элементы и свойства';

        case Property:
            return explanation + 'свойство может быть декомпозировано только на свойства';
        }
    }
}

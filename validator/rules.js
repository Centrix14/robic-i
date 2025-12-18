class Rule {
    check() { return true; }
    
    explainError() { return ''; }
}

class DynamicUniquenessRule extends Rule {
    #sameIterationError = false;
    #sameTypeError = false;
    
    check(componentManager, componentClass, componentName='') {
        if (componentName === '') return true;
        
        const duplicate = componentManager.getByName(componentName);
        
        if (duplicate === undefined)
            return true;
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

    explainError() {
        let explanation = 'Нарушение правила динамической уникальности:';

        if (this.#sameIterationError)
            explanation += '\n- Процессы с одинаковыми названиями могут существовать только в разных итерациях';
        if (this.#sameTypeError)
            explanation += '\n- Компоненты с одинаковыми названиями могут существовать, только если они разных типов';

        return explanation;
    }
}

class StaticUniquenessRule extends Rule {
    #duplicate = undefined;

    check(componentManager, component) {
        for (let entry of componentManager.repository.values()) {
            if (entry === component)
                continue;

            if (component.equalTo(entry)) {
                this.#duplicate = structuredClone(entry);
                return false;
            }
        }

        return true;
    }

    explainError() {
        if (this.#duplicate)
            return 'Нарушение правила статической уникальности: обнаружена повторяющаяся запись ' + this.#duplicate.toString();
        else
            return '';
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
        const explanation = 'Нарушение правила декомпозиции: ';

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

class ElementRoleSettingRule extends Rule {
    #processChildRoleError = false;
    #elementChildRoleError = false;

    check(roles, parentClass, childRole) {
        const childRoleIsElementLike = (roles.getName(childRole) === 'none');

        let childRoleIsProcessLike;
        switch (roles.getName(childRole)) {
            
        case 'input':
        case 'output':
        case 'doer':
        case 'mean':
            childRoleIsProcessLike = true;
            break;

        default:
            childRoleIsProcessLike = false;
            break;
        }

        if (parentClass === Process)
            return childRoleIsProcessLike;
        else
            return childRoleIsElementLike;
    }

    explainError() {
        const explanation = 'Нарушение правила установки роли подчинённого компонента: ';

        if (processChildRoleError)
            return explanation + 'элемент процесса может быть только входом, выходом, исполнителем или средством';
        else
            return explanation + 'элемент элемента не может иметь роли';
    }
}

class RuleSet {
    _definition = [];

    constructor(definition) {
        this._definition = definition ?? [];
    }

    check() {
        let performed = undefined;
        
        for (let [ruleClass, caller] of this._definition) {
            const rule = new ruleClass();

            if (!caller(rule))
                return rule;

            performed = true;
        }
        
        return performed && true;
    }
}

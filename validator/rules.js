class Rule {
    check() { return true; }
    explainFailedRule() { return ""; }
}


class UniquenessRule extends Rule {
    check(componentManager) {
        return false;
    }
}

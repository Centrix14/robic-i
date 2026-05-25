function setEvents(definition) {
    for (let event in definition) {
        for (let [selector, scope, func] of definition[event]) {
            document
                .querySelector(selector)
                .addEventListener(event, (e) => func.call(scope, e));
        }
    }
}

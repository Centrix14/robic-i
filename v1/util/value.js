function isEmpty(value) {
    return value === null || value === undefined;
}

function isPresent(value) {
    return !isEmpty(value);
}

function represent(value) {
    const replacers = new Map([
        [true, 'Да'],
        [false, 'Нет'],
        ['possibility', 'Возможность'],
        ['treat', 'Угроза'],
        ['noValue', 'Отсутствует'],
    ]);

    if (replacers.has(value))
        return replacers.get(value);

    return value;
}

class Group {
    constructor() {
        this._store = new Map();

        this._selfElm = null;
        this._init = false;
    }
 
    get isInitiated() { return this._init; }

    init(id, operator) {
        const group = operator.createGroup();
        operator.applyTo(group, { id });
        this._selfElm = group;

        return group;
    }

    add(id, element) {
        if (this._store.has(id))
            return new Fail();

        this._store.set(id, element);
        return new Success();
    }

    drop(id) {
        if (this._store.has(id))
            return new Success([['element', this._store.delete(id)]]);

        return new Fail();
    }
}

class ProcessGroup extends Group {
    static Member = {
        Shape: 'shape',
        Name: 'name',
        Designation: 'designation'
    }

    init(id, operator) {
        const group = super.init(id, operator);

        const spawn = Defaults.process.spawn,
              size = Defaults.process.size,
              offset = Defaults.process.designationOffset;

        const store = this._store;
        store.set(ProcessGroup.Member.Shape, [
            new Rect(new Point(spawn.x, spawn.y),
                     size.width, size.height),
            operator.createRect()
        ]);
        store.set(ProcessGroup.Member.Name, [
            new Text('Процесс',
                     new Point((size.width / 2) + spawn.x,
                               (size.height / 2) + spawn.y)
                    ),
            operator.createText()
        ]);
        store.set(ProcessGroup.Member.Designation, [
            new Text(`П ${id}`,
                     new Point((spawn.x + size.width + offset.x),
                               (spawn.y + size.height + offset.y))
                    ),
            operator.createText()
        ]);

        for (let [id, [figure, element]] of store) {
            operator.applyTo(element, { id, ...figure.publish() });
            operator.appendChild(group, element);
        }

        this._init = true;
        return group;
    }

    add() { return new Fail(); }
    drop() { return new Fail(); }

    getMemberValue(member) {
        if (member === ProcessGroup.Member.Name
            || member === ProcessGroup.Member.Designation) {

            return new Success([['value', this._store.get(member)[0].value]]);
        }
        else
            return new Fail();
    }

    setMemberValue(member, value, operator) {
        if (member === ProcessGroup.Member.Name
            || member === ProcessGroup.Member.Designation) {

            const m = this._store.get(member);
            m[0].value = value;
            operator.applyTo(m[1], { value });

            return new Success();
        }
        else
            return new Fail();
    }

    getMemberElement(member) {
        if (member === ProcessGroup.Member.Shape
            || member === ProcessGroup.Member.Name
            || member === ProcessGroup.Member.Designation) {

            return new Success([['element', this._store.get(member)[1]]]);
        }
        else
            return new Fail();
    }

    isTouching(cursor, spatia) {
        const shape = this._store.get(ProcessGroup.Member.Shape)[0];
        return shape.isTouching(cursor, spatia);
    }

    shift(dX, dY, operator) {
        for (let [figure, element] of this._store.values()) {
            figure.shift(dX, dY);
            operator.applyTo(element, figure.publish());
        }
    }
}

class ElementArrowGroup extends Group {
    static Member = {
        Shape: 'shape',
        Name: 'name',
        Designation: 'designation'
    }

    init(id, operator, coords) {
        if (!coords?.start || !coords?.end)
            return new Fail();

        const Member = ElementArrowGroup.Member;

        const group = super.init(id, operator);

        const start = coords.start, end = coords.end;
        const stepline = new NaiveStepLineV(start, end),
              center = stepline.getCenter();
        const nameOffset = Defaults.element.arrow.name.offset,
              designationOffset = Defaults.element.arrow.designation.offset;

        const store = this._store;
        store.set(Member.Shape, [
            stepline,
            operator.createPath()
        ]);
        store.set(Member.Name, [
            new Text('Элемент',
                     new Point(center.x + nameOffset.x,
                               center.y + nameOffset.y)
                    ),
            operator.createText()
        ]);
        store.set(Member.Designation, [
            new Text(`Э ${id}`,
                     new Point(center.x + designationOffset.x,
                               center.y + designationOffset.y)
                    ),
            operator.createText()
        ]);

        for (let [id, [figure, element]] of store) {
            operator.applyTo(element, { id, ...figure.publish() });
            operator.appendChild(group, element);
        }

        this._init = true;
        return group;
    }

    add() { return new Fail(); }
    drop() { return new Fail(); }

    getMemberValue(member) {
        if (member === ElementArrowGroup.Member.Name
            || member === ElementArrowGroup.Member.Designation) {

            return new Success([['value', this._store.get(member)[0].value]]);
        }
        else
            return new Fail();
    }

    setMemberValue(member, value, operator) {
        if (member === ElementArrowGroup.Member.Name
            || member === ElementArrowGroup.Member.Designation) {

            const m = this._store.get(member);
            m[0].value = value;
            operator.applyTo(m[1], { value });

            return new Success();
        }
        else
            return new Fail();
    }

    getMemberElement(member) {
        if (member === ElementArrowGroup.Member.Shape
            || member === ElementArrowGroup.Member.Name
            || member === ElementArrowGroup.Member.Designation) {

            return new Success([['element', this._store.get(member)[1]]]);
        }
        else
            return new Fail();
    }

    shift(dX, dY, operator) {
        for (let [figure, element] of this._store.values()) {
            figure.shift(dX, dY);
            operator.applyTo(element, figure.publish());
        }
    }

    isTouching(cursor, spatia) {
        const shape = this._store.get(ElementArrowGroup.Member.Shape)[0];
        return shape.isTouching(cursor, spatia);
    }
}

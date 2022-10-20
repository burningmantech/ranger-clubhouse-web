import { tracked } from '@glimmer/tracking';

export default class Selectable {
    @tracked selected;

    constructor(obj) {
        Object.assign(this, obj);
    }
}

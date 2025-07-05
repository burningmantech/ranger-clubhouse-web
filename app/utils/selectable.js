import {tracked} from '@glimmer/tracking';

export default class Selectable {
  @tracked selected;

  constructor(obj, selected = false) {
    Object.assign(this, obj);
    this.selected = selected;
  }
}

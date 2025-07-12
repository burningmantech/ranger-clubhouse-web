import Component from '@glimmer/component';
import {action} from '@ember/object';
import Selectable from 'clubhouse/utils/selectable';

export default class RadioGroupComponent extends Component {
  constructor() {
    super(...arguments);

    const value = this.args.value;
    this.options = this.args.options.map((opt) => new Selectable({
      value: opt.value,
      label: opt.label
    }, (value === opt.value)));
  }

  @action
  changeEvent(optClicked, event) {
    event.preventDefault();
    this.options.forEach((opt) => opt.selected = (opt.value === optClicked.value));
    this.args.onChange(optClicked.value);

    return true;
  }
}

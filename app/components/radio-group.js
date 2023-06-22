import Component from '@glimmer/component';
import {action} from '@ember/object';
import Selectable from 'clubhouse/utils/selectable';

export default class RadioGroupComponent extends Component {
  get options() {
    const {value} = this.args;
    return this.args.options.map((opt) => new Selectable({
      selected: (value === opt.value),
      value: opt.value,
      label: opt.label
    }));
  }

  @action
  changeEvent(optClicked, event) {
    event.preventDefault();
    this.options.forEach((opt) => opt.selected = (opt === optClicked));
    this.args.onChange(optClicked.value);
  }
}

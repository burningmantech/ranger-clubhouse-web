import Component from '@glimmer/component';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';

class RadioButton {
  @tracked isSelected;

  constructor(obj) {
    Object.assign(this, obj);
  }
}

export default class RadioGroupComponent extends Component {
  get options() {
    const {value} = this.args;
    return this.args.options.map((opt) => new RadioButton({
      isSelected: (value === opt.value),
      value: opt.value,
      label: opt.label
    }));
  }

  @action
  changeEvent(optClicked, event) {
    event.preventDefault();
    this.options.forEach((opt) => opt.isSelected = (opt === optClicked));
    this.args.onChange(optClicked.value);
  }
}

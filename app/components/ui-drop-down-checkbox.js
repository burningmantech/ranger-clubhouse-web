import Component from '@glimmer/component';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';

class CheckedOption {
  @tracked isChecked = false;

  constructor(opt) {
    Object.assign(this, opt);
  }
}

export default class UiDropDownCheckbox extends Component {
  @tracked checkedBoxes;

  constructor() {
    super(...arguments);

    this.values = this.args.values;
    this.checkedBoxes = this.args.options.map((opt, index) => new CheckedOption({
      id: opt.id,
      label: opt.label,
      isChecked: this.values.includes(opt.id),
      index
    }));
  }

  @action
  clearAll(event) {
    event.preventDefault();
    this.checkedBoxes.forEach((cb) => {
      cb.isChecked = false;
    });
    this.args.updateValues([]);
  }

  @action
  clickOption(option) {
    const values = [];

    option.isChecked = !option.isChecked;
    this.checkedBoxes.forEach((cb) => {
      if (cb.isChecked) {
        values.push(cb.id);
      }
    });

    this.args.updateValues(values);
  }
}

import Component from '@glimmer/component';
import {action} from '@ember/object';
import {typeOf} from '@ember/utils';
import {assert} from '@ember/debug';
import {tracked} from '@glimmer/tracking';

export default class ChFormSelectComponent extends Component {
  @tracked isGrouped = false;

  constructor() {
    super(...arguments);
    const {options} = this.args;
    assert(`select options for field "${this.args.name}" is not an array`, typeOf(options) === 'array');
  }

  get controlClass() {
    const {fieldSize,controlClass} = this.args;
    return controlClass ?? (fieldSize ? `form-select form-select-${fieldSize}` : `form-select`);
  }

  // select change
  @action
  changeEvent(event) {
    const element = event.target;

    if (this.args.multiple) {
      let options = element.options;
      let selectedValues = [];
      for (let i = 0; i < options.length; i++) {
        if (options[i].selected) {
          selectedValues.push(this._getOptValue(options[i]));
        }
      }
      return this.args.onChange(selectedValues);
    } else {
      return this.args.onChange(this._getOptValue(element));
    }
  }

  _getOptValue(element) {
    const value = element.value;

    if (value === 'true') {
      return true;
    } else if (value === 'false') {
      return false;
    } else {
      return value;
    }
  }
  _buildSingleOption(opt) {
    const type = typeOf(opt);
    let label, value;

    switch (type) {
      case 'object':
        // { id: value, title: 'label' }
        label = opt.title ?? opt.label;
        value = opt.id ?? opt.value;
        break;

      case 'array':
        // Simple [ 'label', value ]
        [label, value] = opt;
        break;

      default:
        label = value = opt;
        break;
    }

    return {label, value};
  }

  get selectOptions() {
    const { options } = this.args;
    if (!options) {
      return [];
    }

    return options.map((opt) => {
      if (typeof (opt) === 'object' && ('groupName' in opt)) {
        return {
          groupName: opt.groupName,
          options: opt.options.map((groupOpt) => this._buildSingleOption(groupOpt))
        };
      } else {
        return this._buildSingleOption(opt);
      }
    });
  }
}

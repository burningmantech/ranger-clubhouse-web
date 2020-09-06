import Component from '@glimmer/component';
import {action} from '@ember/object';
import {typeOf} from '@ember/utils';
import {computed} from '@ember/object';
import {assert} from '@ember/debug';
import {tracked} from '@glimmer/tracking';

export default class ChFormSelectComponent extends Component {
  @tracked isGrouped = false;

  constructor() {
    super(...arguments);
    const {options} = this.args;
    assert(`select options for field "${this.args.name}" is not an array`, typeOf(options) === 'array');
    const item = options[0];
    this.isGrouped = (typeOf(item) === 'object' && ('groupName' in item));
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

  _buildOptions(options) {
    if (!options) {
      return [];
    }

    return options.map((opt) => {
      const type = typeOf(opt);
      let label, value;

      switch (type) {
        case 'object':
          // { id: value, title: 'label' }
          label = opt.title;
          value = opt.id;
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
    });
  }

  @computed('args.options.[]')
  get selectOptions() {
    return this._buildOptions(this.args.options);
  }

  @computed('args.options.[]')
  get selectGroupOptions() {
    return this.args.options.map((opt) => {
      return {groupName: opt.groupName, options: this._buildOptions(opt.options)};
    });
  }
}

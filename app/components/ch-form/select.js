import Component from '@glimmer/component';
import {action} from '@ember/object';
import {isEmpty, typeOf} from '@ember/utils';
import {assert} from '@ember/debug';
import {tracked} from '@glimmer/tracking';
import {isArray} from '@ember/array';

export default class ChFormSelectComponent extends Component {
  @tracked isGrouped = false;

  constructor() {
    super(...arguments);
    const {options} = this.args;
    assert(`select options for field "${this.args.name}" is not an array. Type is ${typeOf(options)}`, typeOf(options) === 'array');
  }

  get controlClass() {
    const {fieldSize, controlClass} = this.args;
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
    } else if (value === 'null') {
      return null;
    } else {
      return value;
    }
  }

  _buildSingleOption(opt) {
    const type = typeOf(opt);
    let label, value, disabled = false;

    switch (type) {
      case 'object':
        // { id: value, title: 'label' }
        label = opt.title ?? opt.label;
        value = ('id' in opt) ? (opt.id === null ? 'null' : opt.id) : opt.value;
        if ('disabled' in opt) {
          disabled = opt.disabled;
        }
        break;

      case 'array':
        // Simple [ 'label', value ]
        [label, value] = opt;
        if (value === null) {
          value = "null";
        }
        if (opt.length >= 3) {
          disabled = opt[2];
        }
        break;

      default:
        label = value = opt;
        break;
    }

    return {label, value, disabled};
  }

  get selectOptions() {
    const {options} = this.args;
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

  hasValue(haystack, value) {
    if (isArray(haystack)) {
      return !!haystack.find((straw) => straw == value);
    }
    // Handle comparing a selected value which is a boolean string and the
    // option value is an actual Boolean type.
    if (typeOf(value) === "boolean" && typeOf(haystack) === "string") {
      haystack = /^(true|t|1)$/i.test(haystack);
      return haystack == value;
    }

    const haystackEmpty = isEmpty(haystack);
    const valueEmpty = isEmpty(value);

    // Avoids ('' == 0) is true scenario
    if ((haystackEmpty && !valueEmpty)
      || (!haystackEmpty && valueEmpty)) {
      return false;
    }

    return haystack == value;
  }
}

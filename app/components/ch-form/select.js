import Component from '@glimmer/component';
import EmberObject, { action } from '@ember/object';
import { typeOf } from '@ember/utils';
import { computed } from '@ember/object';
import { assert } from '@ember/debug';
import { tracked } from '@glimmer/tracking';

export default class ChFormSelectComponent extends Component {
  @tracked isGrouped = false;

  constructor() {
    super(...arguments);
    const options = this.args.options;
    assert('select options is not an array', typeOf(options) == 'array');
    const item = options[0];
    this.isGrouped = (typeOf(item) == 'object' && ('groupName' in item));
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
          selectedValues.push(options[i].value);
        }
      }
      return this.args.onChange(selectedValues);
    } else {
      return this.args.onChange(element.value);
    }
  }

  _buildOptions(options) {
    if (!options) {
      return [];
    }

    return options.map((opt) => {
      const type = typeOf(opt);
      let label, value;

      if (type == 'object' && ("id" in opt)) {
        label = opt.title
        value = opt.id
      // Simple [ 'label', value ]
      } else if (type == 'array') {
        label = opt[0];
        value = opt[1];
      } else {
        // Or just [  value ]
        label = value = opt;
      }

      return EmberObject.create({ label, value });
    });
  }

  @computed('args.options.[]')
  get selectOptions() {
    return this._buildOptions(this.args.options);
  }

  @computed('args.options.[]')
  get selectGroupOptions() {
    return this.args.options.map((opt) => {
      return { groupName: opt.groupName, options: this._buildOptions(opt.options) };
    });
  }
}

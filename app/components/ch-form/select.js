import Component from '@ember/component';
import EmberObject from '@ember/object';
import { typeOf } from '@ember/utils';
import { computed } from '@ember/object';
import { tagName, className } from '@ember-decorators/component';



@tagName('select')
export default class ChFormSelectComponent extends Component {
  // HTML attributes
  name = null;
  options = null;
  disabled = null;
  size = null;
  value = null;
  multiple = null;

  @className
  controlClass = null;
  onChange = null;

  includeBlank = null;


  attributeBindings = [ 'size', 'multiple', 'disabled', 'name' ];

  didReceiveAttrs() {
    const groupName = this.get('options.firstObject.groupName');

    this.set('isGrouped', !!groupName);
  }

  // Component event..
  change() {
    if (this.multiple) {
      let options = this.element.options;
      let selectedValues = [];
      for (let i = 0; i < options.length; i++) {
        if (options[i].selected) {
          selectedValues.push(options[i].value);
        }
      }

      return this.onChange(selectedValues);
    } else {
      return this.onChange(this.element.value);
    }
  }

  _buildOptions(options) {
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

  @computed('options.[]')
  get selectOptions() {
    return this._buildOptions(this.options);
  }

  @computed('options.[]')
  get selectGroupOptions() {
    return this.options.map((opt) => {
      return { groupName: opt.groupName, options: this._buildOptions(opt.options) };
    });
  }

}

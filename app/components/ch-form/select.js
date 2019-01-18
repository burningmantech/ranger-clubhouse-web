import Component from '@ember/component';
import EmberObject from '@ember/object';
import { typeOf } from '@ember/utils';
import { computed } from '@ember-decorators/object';
import { tagName, className } from '@ember-decorators/component';
import { argument } from '@ember-decorators/argument';
import { optional } from '@ember-decorators/argument/types';

@tagName('select')
export default class ChFormSelectComponent extends Component {
  // HTML attributes
  @argument('string') name;
  @argument('object') options;
  @argument(optional('boolean')) disabled;
  @argument(optional('number')) size;
  @argument(optional('any')) value;
  @argument(optional('boolean')) multiple;

  @className
  @argument(optional('string')) controlClass;
  @argument(optional('object')) onChange;

  @argument(optional('boolean')) includeBlank;


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

      if (type == 'object' && opt.id) {
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

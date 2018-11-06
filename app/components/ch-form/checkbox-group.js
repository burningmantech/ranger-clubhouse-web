// heavily based off
// http://jarrettmeyer.com/2016/03/28/an-ember-multiselect-checkbox

import EmberObject from '@ember/object';
import Component from '@ember/component';
import { action, computed } from '@ember-decorators/object';
import { tagName } from '@ember-decorators/component';
import { argument } from '@ember-decorators/argument';
import { typeOf } from '@ember/utils';
import inGroups from 'clubhouse/utils/in-groups';

class MultiCheckboxField extends EmberObject {
}

@tagName('')
export default class ChFormCheckboxGroupComponent extends Component {
  // field name
  @argument name =  null;
  // initial value
  @argument value = '';

  @argument options = null;
  @argument labelProperty =  'label';
  @argument valueProperty = 'value';
  @argument cols =  3;

  // Callback for when the group updates (i.e., the user clicks on stuff)
  @argument onUpdate;

  @computed('options')
  get checkboxColumns() {
    const options = this.options || [];
    const labelProperty = this.labelProperty;
    const valueProperty = this.valueProperty;
    let values = this.value;

    if (typeOf(values) != 'array') {
      values = [ values ];
    }

    const columns = inGroups(options, this.cols);

    let index = 0;
    const checkboxes = [];
    this.set('checkboxes', checkboxes);

    return columns.map((column) => {
      return column.map((opt) => {
        let label, value;
        const optType = typeOf(opt);

        if (optType == 'object') {
          label = opt[labelProperty];
          value = opt[valueProperty];
        } else if (optType == 'array') {
          label = opt[0];
          value = opt[1];
        } else {
          label = value = opt;
        }

        const field =  MultiCheckboxField.create({
          label,
          value,
          domId: (this.formId + '-' + this.name + index),
          isChecked: values.includes(value),
        });

        this.checkboxes.push(field);
        index++;
        return field;
      })
    });
  }

  @action
  onClick(field) {
    let values = [];

    field.toggleProperty('isChecked');

    this.checkboxes.forEach((checkbox) => {
      if (checkbox.isChecked) {
        values.push(checkbox.value)
      }
    })

    this.onUpdate(values);
  }
}

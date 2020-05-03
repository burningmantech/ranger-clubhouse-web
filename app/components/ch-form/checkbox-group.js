// heavily based off
// http://jarrettmeyer.com/2016/03/28/an-ember-multiselect-checkbox

import EmberObject from '@ember/object';
import Component from '@ember/component';
import { action, computed } from '@ember/object';
import { typeOf } from '@ember/utils';
import inGroups from 'clubhouse/utils/in-groups';
import { isEmpty } from '@ember/utils';

class MultiCheckboxField extends EmberObject {
}

export default class ChFormCheckboxGroupComponent extends Component {
  tagName = '';

  // field name
  name = null;
  // initial value
  value = '';

  options = null;
  cols = null;
  _domId = null;

  // Callback for when the group updates (i.e., the user clicks on stuff)
  onUpdate = null;

  // Used purely to be notified when the model completely changes
  model = null;

  gridColumn = 'col-auto';

  @computed('cols')
  get _cols() {
    return isEmpty(this.cols) ? 3 : this.cols;
  }

  @computed('_cols', '_domId', 'checkboxes', 'model', 'options', 'value')
  get checkboxColumns() {
    const options = this.options || [];
    let values = this.value;

    if (typeOf(values) != 'array') {
      values = [ values ];
    }

    if (options.length == 0) {
      return [];
    }

    const columns = inGroups(options, this._cols, true);

    let index = 0;
    const checkboxes = [];
    this.set('checkboxes', checkboxes); // eslint-disable-line ember/no-side-effects

    return columns.map((column) => {
      return column.map((opt) => {
        const type = typeOf(opt);
        let label, value;

        if (type == 'object' && ('id' in opt)) {
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
        const field =  MultiCheckboxField.create({
          label,
          value,
          _domId: `${this._domId}${index}`,
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

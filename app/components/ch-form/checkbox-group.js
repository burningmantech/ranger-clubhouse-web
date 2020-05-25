import Component from '@glimmer/component';
import {action} from '@ember/object';
import {typeOf, isEmpty} from '@ember/utils';
import {tracked} from '@glimmer/tracking';
import inGroups from 'clubhouse/utils/in-groups';

class ChFormCheckboxField {
  @tracked isChecked;

  constructor(field) {
    Object.assign(this, field);
  }
}

export default class ChFormCheckboxGroupComponent extends Component {
  checkboxes = [];

  constructor() {
    super(...arguments);

    this.gridClass = this.args.gridClass || 'col-auto';
    this.cols = isEmpty(this.args.cols) ? 3 : this.args.cols;

    const options = this.args.options || [];
    let values = this.args.value;

    if (typeOf(values) !== 'array') {
      values = [values];
    }

    if (options.length === 0) {
      return [];
    }

    const columns = inGroups(options, this.cols, true);
    this.checkboxes = [];

    this.checkboxColumns = columns.map((column) => {
      return column.map((opt) => {
        const type = typeOf(opt);
        let label, value;

        switch (type) {
          case 'object':
            // { label: 'text', value: X }
            label = opt.title;
            value = opt.id;
            break;

          case 'array':
            // Simple [ 'label', value ]
            [label, value] = opt;
            break;

          default:
            // Or just [  value ]
            label = value = opt;
            break;

        }
        const field = new ChFormCheckboxField({label, value, isChecked: values.includes(value)});
        this.checkboxes.push(field);
        return field;
      })
    });
  }

  @action
  onClickEvent(field) {
    const values = [];

    field.isChecked = !field.isChecked;

    this.checkboxes.forEach((checkbox) => {
      if (checkbox.isChecked) {
        values.push(checkbox.value)
      }
    })

    this.args.onUpdate(values);
  }
}

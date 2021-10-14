import ChFormFieldBaseComponent from './field-base';
import { action} from '@ember/object';

export default class ChFormCheckboxGroupFieldComponent extends ChFormFieldBaseComponent {
  wrapClassDefault = '';
  wrapInlineClassDefault = '';
  checkboxLabelClassDefault = 'form-check-label';
  controlClassDefault = 'form-check-input';

  inputWrapClassDefault = 'form-check';
  inputInlineWrapClassDefault = 'form-check form-check-inline';
  labelInlineClassDefault = 'col-form-label col-auto pt-0';

  groupWrapClassDefault = 'col-auto';

  constructor() {
    super(...arguments);

    this.checkedBoxes = this.buildCheckedOptions();
  }

  get checkboxLabelClass() {
    return this.args.checkboxLabelClass ?? this.checkboxLabelClassDefault;
  }

  get groupWrapClass() {
    const {groupWrapClass, cols} = this.args;

    if (typeof (groupWrapClass) === 'string') {
      return groupWrapClass;
    }

    let columnCount = cols ?? 3;

    return `${this.groupWrapClassDefault} columns-container columns-${columnCount}`;
  }

  @action
  onClickEvent(option) {
    const values = [];

    option.isChecked = !option.isChecked;

    this.checkedBoxes.forEach((checkbox) => {
      if (checkbox.isChecked) {
        values.push(checkbox.value)
      }
    })

    this._updateValue(values);
  }
}

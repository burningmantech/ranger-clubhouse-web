import ChFormFieldBaseComponent from './field-base';
import {action} from '@ember/object';

export default class ChFormRadioGroupFieldComponent extends ChFormFieldBaseComponent {
  wrapClassDefault = '';
  wrapInlineClassDefault = '';
  radioLabelClassDefault = 'form-check-label';
  controlClassDefault = 'form-check-input';

  inputWrapClassDefault = 'form-check';
  inputInlineWrapClassDefault = 'form-check form-check-inline';
  labelInlineClassDefault = 'col-form-label col-auto pt-0';

  labelFixedClassDefault = 'col-form-label col-form-label-fixed pt-0';

  constructor() {
    super(...arguments);

    this.checkedBoxes = this.buildCheckedOptions();
  }

  get radioLabelClass() {
    return this.args.radioLabelClass ?? this.radioLabelClassDefault;
  }

  get groupWrapClass() {
    const {groupWrapClass, inline, inlineOptions} = this.args;

    if (typeof (groupWrapClass) === 'string') {
      return groupWrapClass;
    }

    return ((inline || inlineOptions) && !this.args.label) ? '' : 'col-auto';
  }

  @action
  changeEvent(option) {
    this.checkedBoxes.forEach((opt) => option.isChecked = (opt.value === option.value));
    this._updateValue(option.value);
  }
}

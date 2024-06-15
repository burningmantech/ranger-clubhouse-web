import ChFormFieldBaseComponent from './field-base';
import { action } from '@ember/object';

export default class ChFormTextFieldComponent extends ChFormFieldBaseComponent {
  controlClassDefault = 'form-check-input';
  labelClassDefault = 'form-check-label';
  labelInlineClassDefault  = 'form-check-label';
  wrapClassDefault = 'form-check';
  wrapInlineClassDefault = 'form-check form-check-inline';
  inputInlineWrapClassDefault = '';

  @action
  clickEvent(event) {
    event.preventDefault();
    this._updateValue(event.target.checked);
  }
}

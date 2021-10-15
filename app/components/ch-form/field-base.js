import Component from '@glimmer/component';
import {action, set, get} from '@ember/object';
import {isEmpty, typeOf} from '@ember/utils';
import {tracked} from '@glimmer/tracking';

/**
 * Track checkbox and radio group options.
 *
 */
class CheckedOption {
  @tracked isChecked;   // Is the option checked / selected?
  disabled = false;     // Is option disabled?

  constructor(field) {
    Object.assign(this, field);
  }
}

export default class ChFormFieldBaseComponent extends Component {

  /**
   * DOM Identifier (formId-name)
   *
   * @type {string}
   */
  domId = '';

  /**
   * Control class for the input field
   *
   * @type {null|string}
   */
  controlClassDefault = null;

  /**
   * Label class default. Label is placed on top of the input field.
   * @type {string}
   */
  labelClassDefault = 'form-label';

  /**
   * Label inline class default. Label is to the left.
   * @type {string}
   */
  labelInlineClassDefault = 'col-form-label col-auto';

  labelFixedClassDefault = 'col-form-label col-form-label-fixed';

  /**
   * Wrapper class around the input tag. Tag is placed below the label.
   *
   * @type {string}
   */

  inputWrapClassDefault = '';

  /**
   * Wrapper class for an inline input tag.
   *
   * @type {string}
   */

  inputInlineWrapClassDefault = 'col-auto';

  /**
   * Wrapper class for the label, input tag, hint, and error messages.
   * Full width on small screens, auto sized on desktop.
   *
   * @type {string}
   */

  wrapClassDefault = 'col-sm-12 col-lg-auto';
  wrapInlineClassDefault = '';


  /**
   * The character length of the value. Used when @showCharCount is true.
   *
   * @type {number}
   */
  @tracked charCount = 0;

  constructor() {
    super(...arguments);

    const {name} = this.args;
    this.domId = `${this.args.form.formId}-${name}`;

    if (this.args.showCharCount) {
      this.charCount = (this.modelValue ?? '').length;
    }
  }

  /**
   * Get the field's value.
   *
   * @returns {*}
   */

  get modelValue() {
    return get(this.args.form.model, this.args.name);
  }

  /**
   * Construct the label class
   *
   * @returns {string}
   */

  get labelClass() {
    const {labelClass, inline, fixedLabel} = this.args;

    if (typeof (labelClass) === 'string') {
      return labelClass;
    }

    let label;
    if (fixedLabel) {
      label =  this.labelFixedClassDefault;
    } else {
      label = inline ? this.labelInlineClassDefault : this.labelClassDefault;
    }
    return label;
  }

  /**
   * Construct the input tag wrapper class.
   *
   * @returns {string}
   */

  get inputWrapClass() {
    const {inputWrapClass, inline, inlineOptions} = this.args;

    if (typeof (inputWrapClass) === 'string') {
      return inputWrapClass;
    }

    return (inline || inlineOptions) ? this.inputInlineWrapClassDefault : this.inputWrapClassDefault;
  }

  /**
   * Construct the input tag class
   *
   * @returns {string}
   */

  get controlClass() {
    const {fieldSize, controlClass} = this.args;
    if (typeof (controlClass) === 'string') {
      return controlClass;
    }

    const control = this.controlClassDefault;

    return fieldSize ? `${control} ${control}-${fieldSize}` : control;
  }

  /**
   * Construct the wrapper class.
   *
   * @returns {string}
   */

  get wrapClass() {
    const {wrapClass} = this.args;

    if (typeof (wrapClass) === 'string') {
      return wrapClass;
    }

    return this.args.inline ? this.wrapInlineClassDefault : this.wrapClassDefault;
  }

  /**
   *
   * @returns {string[]|*|null}
   */
  get errorMessages() {
    const error = get(this.args.form.model, `error.${this.args.name}.validation`);

    if (!error) {
      return null;
    }

    return (typeof error === 'string') ? [error] : error;
  }

  buildCheckedOptions() {
    let values = this.modelValue;

    if (typeOf(values) !== 'array') {
      values = [values];
    }

    return this.args.options.map((opt, index) => {
      const type = typeOf(opt);
      let label, value, disabled = false;

      switch (type) {
        case 'object':
          // { id: value, title: 'option label' }
          label = opt.title ?? opt.label;
          value = opt.id ?? opt.value;
          if ('disabled' in opt) {
            disabled = opt.disabled;
          }
          break;

        case 'array':
          // Simple [ 'label', value ]
          [label, value] = opt;
          break;

        default:
          label = value = opt;
          break;
      }

      return new CheckedOption({
        label,
        value,
        isChecked: values.includes(value),
        index,
        disabled,
        domId: `${this.domId}${index}`
      });
    });
  }

  /**
   * The field's change / select / input event
   *
   * @param {*} value
   */

  @action
  update(value) {
    this._updateValue(value);
  }

  /**
   * Update the field's value. Massage the value (if @noSpaces set), and perform various callbacks.
   * @param value
   * @private
   */

  _updateValue(value) {
    const {noSpaces, name, onChange, showCharCount} = this.args;
    const {fieldChangeAction, model} = this.args.form;

    if (noSpaces && !isEmpty(value)) {
      value = value.replace(/ /g, '');
    }

    set(model, name, value);

    // Update the value's character length if showing the char count.
    if (showCharCount) {
      this.charCount = value.length;
    }

    if (onChange) {
      onChange(name, value, model);
    }

    if (fieldChangeAction) {
      fieldChangeAction(this);
    }
  }
}

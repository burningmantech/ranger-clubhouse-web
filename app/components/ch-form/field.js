import Component from '@glimmer/component';
import {action, set, get} from '@ember/object';
import {typeOf, isEmpty} from '@ember/utils';

export default class ChFormFieldComponent extends Component {
  constructor() {
    super(...arguments);

    const {type, labelClass} = this.args;
    this._val = this.args.value ?? get(this.args.model, this.args.name);
    this.domId = `${this.args.formId}-${this.args.name}`;

    switch (type) {
      case 'checkbox':
      case 'checkboxGroup':
      case 'radio':
      case 'radioGroup':
        this.emitTopLabel = false;
        this.labelClass = labelClass ?? 'form-check-label';
        break;

      default:
        this.emitTopLabel = true;
        this.labelClass = labelClass ?? '';
        break;
    }

    this.wrapField = (type !== 'radioGroup' && type !== 'checkboxGroup');
  }

  get wrapClass() {
    const {wrapClass, type, grid} = this.args;

    if (typeOf(wrapClass) === 'string') {
      return wrapClass;
    }

    switch (type) {
      case 'checkbox':
      case 'radio':
      case 'radioGroup':
      case 'checkboxGroup':
        return (this.args.inline ? 'form-check form-check-inline' : 'form-check');

      case 'search':
        return '';

      default:
        return `form-group ${(typeOf(grid) === 'string') ? grid : 'col-auto'}`;
    }
  }

  get controlClass() {
    const {controlClass, type} = this.args;

    if (typeOf(controlClass) === 'string') {
      return controlClass;
    }

    switch (type) {
      case 'checkbox':
      case 'checkboxGroup':
      case 'radio':
      case 'radioGroup':
        return 'form-check-input';
      default:
        return 'form-control';
    }
  }

  get wrapperBlock() {
    const {type} = this.args;
    if (type === 'checkboxGroup' || type === 'radioGroup' || type === 'search') {
      return 'd-inline-block';
    } else {
      return '';
    }
  }


  get radioOptions() {
    return this.args.options.map((opt) => {
      const type = typeOf(opt);
      let label, value;

      switch (type) {
        case 'object':
          // { id: value, title: 'option label' }
          label = opt.title;
          value = opt.id;
          break;
        case 'array':
          // Simple [ 'label', value ]
          label = opt[0];
          value = opt[1];
          break;
        default:
          label = value = opt;
          break;
      }

      return {label, value};
    });
  }

  @action
  update(value) {
    const {noSpaces, model, name, onChange, fieldChangeAction} = this.args;

    if (noSpaces && !isEmpty(value)) {
      value = value.replace(/ /g, '');
    }

    set(model, name, value);

    if (onChange) {
      onChange(name, value);
    }

    if (fieldChangeAction) {
      fieldChangeAction(this);
    }
  }
}

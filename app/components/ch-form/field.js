import Component from '@ember/component';
import EmberObject from '@ember/object';
import { action, computed, set, get } from '@ember/object';
import { typeOf, isEmpty } from '@ember/utils';

import $ from 'jquery';

export default class ChFormFieldComponent extends Component {
  tagName = '';

  static positionalParams =  [ 'name' ];

  wrapClass = null;
  formId = null;
  fieldId = null;

  model = null;

  // select, checkbox or radio options
  options = null;
  // Include a blank option for select options
  includeBlank = false;
  multiple = false; // Multiple selection

  // For checkbox & radio types, include form-check-inline on wrap class
  inline = false;

  // Common HTML properties
  type = 'text';
  name = '';
  value = null;
  size = null;
  maxlength = null;
  rows = null;
  cols = null;
  disabled = false;
  autofocus = false;
  autocomplete = null;
  placeholder = null;
  hint = null;
  inputmode = null;

  // ignore spaces entered.
  noSpaces = false;

  grid = null;
  label = '';
  labelClass =  null;
  controlClass = null;

  // For date or datetime
  startDate = null;

  // callback to client when field changes
  onChange = null;
  // callback when doing a search
  onSearch = null;

  // internal callback when field changes, used by ch-form.js
  fieldChangeAction = null;

  // callback when field receives focus
  onFocus = null;

  wrapper = null;


  elementErrorClass = 'is-invalid';
  textErrorClass  ='text-danger';
  hintClass = 'form-text text-muted';


  didReceiveAttrs() {
    if (this.wrapClass === null) {
      switch (this.type) {
      case 'checkbox':
      case 'checkboxGroup':
      case 'radio':
      case 'radioGroup':
        this.set('wrapClass', (this.inline ? 'form-check form-check-inline' : 'form-check'));
        break;

      default: {
        const gridClasses = ' '+(this.grid === null ? 'col-auto' : this.grid);
        this.set('wrapClass', 'form-group'+gridClasses);
        break;
       }
      }
    }

    if (this.controlClass === null) {
      switch (this.type) {
      case 'checkbox':
      case 'checkboxGroup':
      case 'radio':
      case 'radioGroup':
        this.set('controlClass', 'form-check-input');
        break;

      default:
        this.set('controlClass', 'form-control');
        break;
      }
    }

    if (this.labelClass === null) {
      switch (this.type) {
      case 'checkbox':
      case 'checkboxGroup':
      case 'radio':
      case 'radioGroup':
        this.set('labelClass', 'form-check-label');
        break;

      default:
        this.set('labelClass', '');
        break;
      }
    }

    if (this.wrapper === null) {
      if (this.type == 'checkboxGroup' || this.type == 'radioGroup') {
        this.set('wrapper', false);
      } else {
        this.set('wrapper', true);
      }
    }

    if (this.wrapper) {
      this.set('tagName', 'div');
      this.set('classNameBindings', [ 'wrapClass' ]);
    }
  }

  didInsertElement() {
    super.didInsertElement(...arguments);
    if (this.autofocus) {
      $('[autofocus]').focus();
    }
  }

  @computed('type')
  get emitTopLabel() {
    const type = this.type;

    return (type != 'radio' && type != 'radioGroup' && type != 'checkboxGroup' && type != 'checkbox');
  }

  @computed('name', 'formId', 'fieldId')
  get _domId() {
    if (this.fieldId) {
      return this.fieldId;
    } else {
      return `${this.formId}-${this.name}`
    }
  }

  @computed('options')
  get radioOptions() {
    return this.options.map((opt) => {
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

  // ember-changeset-validate uses model.error (singular)
  // to place validation errors
  @computed('model.error')
  get error() {
    const error = this.model.error;
    return error ? error[this.name] : null;
  }

  @computed('error')
  get isValid() {
    return !this.error;
  }

  @computed('value', 'model', 'name')
  get _val() {
    return this.value || get(this.model, this.name);
  }


  @action
  update(value) {
    if (this.noSpaces && !isEmpty(value)) {
      value = value.replace(/ /g, '');
    }

    set(this.model, this.name, value);

    if (this.onChange) {
      this.onChange(this.name, value);
    }

    if (this.fieldChangeAction) {
      this.fieldChangeAction(this);
    }
  }
}

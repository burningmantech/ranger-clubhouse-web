import Component from '@ember/component';
import EmberObject from '@ember/object';
import { action, computed } from '@ember-decorators/object';
import { tagName } from '@ember-decorators/component';
import { argument } from '@ember-decorators/argument';
import { optional } from '@ember-decorators/argument/types';
import { typeOf } from '@ember/utils';

import $ from 'jquery';

@tagName('')
export default class ChFormFieldComponent extends Component {
  static positionalParams =  [ 'name' ];

  @argument(optional('string')) wrapClass = null;
  @argument(optional('string')) formId = null;
  @argument(optional('string')) fieldId = null;

  @argument('object') model;

  // select, checkbox or radio options
  @argument(optional('any')) options = null;
  // Include a blank option for select options
  @argument(optional('boolean')) includeBlank = false;
  @argument(optional('boolean')) multiple = false; // Multiple selection

  // For checkbox & radio types, include form-check-inline on wrap class
  @argument(optional('boolean')) inline = false;

  // Common HTML properties
  @argument(optional('string')) type = 'text';
  @argument(optional('string')) name = '';
  @argument(optional('any')) value;
  @argument(optional('number')) size;
  @argument(optional('number')) maxlength;
  @argument(optional('number')) rows;
  @argument(optional('number')) cols;
  @argument(optional('boolean')) disabled = false;
  @argument(optional('boolean')) autofocus = false;
  @argument(optional('string')) autocomplete;
  @argument(optional('string')) placeholder;
  @argument(optional('string')) hint;

  @argument(optional('string')) grid = null;
  @argument(optional('string')) label = '';
  @argument(optional('string')) labelClass =  null;
  @argument(optional('string')) controlClass = null;

  // For date or datetime
  @argument(optional('string')) startDate;

  // callback to client when field changes
  @argument(optional('object')) onChange;
  // callback when doing a search
  @argument(optional('object')) onSearch;

  // internal callback when field changes, used by ch-form.js
  @argument(optional('object')) fieldChangeAction = null;

  // callback when field receives focus
  @argument(optional('object')) onFocus;

  @argument(optional('boolean')) wrapper = null;


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
    return this.value || this.model.get(this.name);
  }


  @action
  update(value) {
    this.model.set(this.name, value);

    if (this.onChange) {
      this.onChange(this.name, value);
    }

    if (this.fieldChangeAction) {
      this.fieldChangeAction(this);
    }
  }
}

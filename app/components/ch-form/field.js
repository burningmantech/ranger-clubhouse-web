import Component from '@ember/component';
import { action, computed } from '@ember-decorators/object';
import { tagName } from '@ember-decorators/component';
import { argument } from '@ember-decorators/argument';
import $ from 'jquery';

@tagName('')
export default class ChFormFieldComponent extends Component {
  static positionalParams =  [ 'name' ];

  @argument wrapClass = null;
  @argument formId = null;
  @argument fieldId = null;
  @argument model = null;

  @argument options = null;

  // For checkbox & radio types, include form-check-inline on wrap class
  @argument inline = false;

  // Common HTML properties
  @argument type = 'text';
  @argument name = '';
  @argument value;
  @argument size;
  @argument maxlength;
  @argument rows;
  @argument cols;
  @argument disabled = false;
  @argument autofocus = false;
  @argument autocomplete;
  @argument placeholder;
  @argument hint;

  @argument grid = null;
  @argument label = '';
  @argument labelClass =  null;
  @argument controlClass = null;


  // callback to client when field changes
  @argument onChange;
  // callback when doing a search
  @argument onSearch;

  // internal callback when field changes, used by ch-form.js
  @argument fieldChangeAction = null;

  @argument wrapper = null;

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

    if (this.fieldChangeAction) {
      this.fieldChangeAction(this);
    }
  }
}

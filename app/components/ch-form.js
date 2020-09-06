import Component from '@glimmer/component';
import {action, set} from '@ember/object';
import {typeOf, isEmpty} from '@ember/utils';
import Changeset from 'ember-changeset';
import lookupValidator from 'ember-changeset-validations';
import Model from '@ember-data/model';
import {tracked} from '@glimmer/tracking';
import {inject as service} from '@ember/service';
import {run} from '@ember/runloop';

export default class ChFormComponent extends Component {
  @service house;

  @tracked changeSetModel;

  watchingModel = null;

  constructor() {
    super(...arguments);

    const {changeSet, autocomplete} = this.args;

    this.changeSet = changeSet ?? true;
    this.autocomplete = autocomplete ?? 'off';
    this._buildChangeSet();
  }

  get model() {
    return this.changeSet ? this.changeSetModel : this.args.formFor;
  }

  _buildChangeSet() {
    const {formFor, validator} = this.args;

    if (!this.changeSet) {
      return;
    }

    if (validator) {
      this.changeSetModel = new Changeset(formFor, lookupValidator(validator), validator, {skipValidate: true});
    } else {
      this.changeSetModel = new Changeset(formFor);
    }

    /*
     * Magic going on here. When the backing model updates from the server,
     * the ember-changeset object will be updated as well BUT NO observers
     * will fire for properties that were not changed directly in the changeset
     *
     * Example: the user changes the person status to "past prospective", the server will set
     *  change the callsign to LastFirstYY. Any observers for status will fire since it
     *  was changed via the changeset object. Since the callsign was not
     *  originally touched in the changeset, no observers will fire.
     *
     * The solution is to watch for the record to be updated or created, and then
     * build a new changeset object which has the most recent data.
     */

    if (!this.watchingModel && formFor instanceof Model) {
      set(formFor, 'onSaved', () => this._buildChangeSet());
      this.watchingModel = formFor;
    }
  }

  /**
   * When the form is inserted into the DOM, find the first element that wants
   * to be autofocused, and focus it.
   *
   * @param element form tag inserted
   */

  @action
  insertedFormElement(element) {
    const field = element.querySelector(`[autofocus]`);
    if (field) {
      setTimeout(() => {
        run('afterRender', () => {
          field.focus();
        })
      }, 100);
    }
  }

  /**
   * Teardown the form - clear the on save callback for the model if it exists.
   */

  willDestroy() {
    // Remove the event handler for the record update
    if (this.watchingModel) {
      set(this.watchingModel, 'onSaved', null);
      this.watchingModel = null;
    }
  }

  /**
   * Scroll to the first error on the form
   * @private
   */

  _scrollToError() {
    const {errors} = this.model;

    if (isEmpty(errors)) {
      // Who's a good little user with no errors in the form.. yes, you are!
      return;
    }

    const field = `${this.args.formId}-${errors[0].key}`;
    const label = `label[for="${field}"]`;

    // Scroll the label into view if it exists, otherwise the form element
    this.house.scrollToElement(document.querySelector(label) ? label : `[name="${field}"]`);
  }

  /**
   * When the user submits the form via <enter> or similar, prevent the default
   * action from happening
   * @param event
   */
  @action
  submitEvent(event) {
    event.preventDefault();
    this.submitForm();
  }

  /**
   * Called when the user hits the submit button or presses entered in first fields (via this.submitEvent).
   * Verify the model if a validator is attached, scroll to any errors if they exist, and/or execute the
   * callbacks.
   *
   * @param {Function} callback method to call (usually set by ch-form/submit with @onSubmit arg)
   */

  @action
  submitForm(callback = null) {
    const model = this.model;
    const {formFor} = this.args;

    const submitAction = (callback ?? this.args.onSubmit);

    if (model.validate) {
      model.validate().then(() => {
        const isValid = this._isValid();
        if (!isValid) {
          this._scrollToError();
        }
        submitAction(model, isValid, formFor);
      });
    } else {
      submitAction(model, undefined, formFor);
    }
  }

  /**
   * When a particular field changes call @onFormChange
   *
   * @param field
   */

  @action
  fieldChangeAction(field) {
    const {onFormChange, formFor} = this.args;

    if (onFormChange) {
      onFormChange(field, this.model, this._isValid(), formFor);
    }
  }

  @action
  cancelForm() {
    const {onCancel, formFor} = this.args;

    if (!onCancel) {
      return;
    }

    if (typeOf(onCancel) === 'string') {
      this.send(onCancel, formFor)
    } else {
      onCancel(formFor)
    }
  }

  _isValid() {
    return isEmpty(this.model.errors);
  }
}

import Component from '@ember/component';
import { action, computed, set } from '@ember/object';
import { typeOf, isEmpty } from '@ember/utils';
import Changeset from 'ember-changeset';
import lookupValidator from 'ember-changeset-validations';
import Model from '@ember-data/model';

import $ from 'jquery';

export default class ChFormComponent extends Component {
  tagName = '';
  static positionalParams = ['formId', 'originalModel'];

  formId = null;
  validator = null;

  // The original model being edited.
  originalModel = null;

  onSubmit = null;
  onReset = null;
  onCancel = null;

  modalBox = false; // Open form as a modal dialog
  modalTitle = ''; // title

  // By default a changset object will be created for the model and used.
  changeSet = true;

  autocomplete = "off";

  formClass = null;

  formless = false;

  // Was the original backing model updated?
  watchingModel = false;

  formInline = false;

  @computed('originalModel')
  get model() {
    let model;
    const original = this.originalModel;
    const validator = this.validator;

    if (this.changeSet) {
      if (validator) {
        model = new Changeset(original, lookupValidator(validator), validator, { skipValidate: true });
      } else {
        model = new Changeset(original);
      }

      /*
       * Magic going on here. When the backing model updates from the server,
       * the ember-changeset object will be updated as well BUT NO observers
       * will fire for properties that were not changed directly in the changeset
       *
       * Example: the user changes the person status to "uberbonked", the server will set,
       *  user_authorized to false. Any observers for status will fire since it
       *  was changed via the changeset object. Since user_authorized was not
       *  originally touched in the changeset, no observers will fire.
       *
       * The solution is to watch for the record to be updated or created, and then
       * build a new changeset object which has the most recent data.
       */

      if (original instanceof Model) {
        original.set('onSaved', () => { this._modelUpdated() });
        this.set('watchingModel', original);
      }
    } else {
      model = original;
      set(model, 'isValid', true);
    }

    return model;
  }

  _modelUpdated() {
    this.notifyPropertyChange('model'); // Recompute model
  }

  didReceiveAttrs() {
    super.didReceiveAttrs(...arguments);

    // Remove the event handler for the record update
    if (this.watchingModel) {
      this.watchingModel.set('onSaved', null);
      this.set('watchingModel', null);
    }
  }

  didInsertElement() {
    super.didInsertElement(...arguments);

    if (!this.modalBox) {
      return;
    }

    const dialog = $('#form-dialog');

    dialog.modal({ keyboard: false });
    dialog.modal().on('show.bs.modal', () => {
      return this.onShow ?
        this.onShow() :
        null;
    });

    dialog.modal().on('hide.bs.modal', () => {
      return this.onClose ?
        this.onClose() :
        null;
    });

    $(`#${this.formId} [autofocus]`).focus();
  }

  willDestroyElement() {
    super.willDestroyElement(...arguments);

    // Remove the event handler for the record update
    if (this.watchingModel) {
      this.watchingModel.set('onSaved', null);
      this.set('watchingModel', null);
    }

    if (!this.modalBox) {
      return;
    }

    const dialog = $('#form-dialog');
    dialog.modal().off('hide.bs.modal');
    dialog.modal('hide');
    dialog.modal('dispose');
  }

  /*
   * Scroll to the first error
   */

  _scrollToError(model) {
     const errors = model.get('errors');
     if (isEmpty(errors)) {
       return;
     }

     const field = errors[0].key;
     const label = `label[for="${this.formId}-${field}"]`;

     // Scroll the label into view if it exists, otherwise the element
     if (document.querySelector(label)) {
       this.house.scrollToElement(label);
     } else {
       this.house.scrollToElement(`[name="${this.formId}-${field}"]`);
     }
  }

  @action
  submitForm(callback) {
    const model = this.model;
    const original = this.originalModel;

    const submitAction = (callback || this.onSubmit);

    if (model.validate) {
      model.validate().then(() => {
        const isValid = this._isValid();

        if (!isValid) {
          this._scrollToError(model);
        }
        if (submitAction) {
          return submitAction(model, isValid, original);
        }
      });
    } else if (submitAction) {
      return submitAction(model, undefined, original);
    }
  }

  @action
  fieldChangeAction(field) {
    const model = this.model;
    const formChange = this.onFormChange;

    if (formChange) {
      formChange(field, model, this._isValid(), this.originalModel);
    }
  }

  @action
  resetForm() {
    const model = this.model;
    const onReset = this.onReset;
    if (onReset) {
      onReset(model)
    } else if (model.rollback) {
      model.rollback();
    }
  }

  @action
  cancelForm() {
    const onCancel = this.onCancel;

    if (!onCancel) {
      return;
    }

    if (typeOf(onCancel) == 'string') {
      this.send(onCancel, this.originalModel)
    } else {
      onCancel(this.originalModel)
    }
  }

  _isValid() {
    return isEmpty(this.model.errors);
  }
}

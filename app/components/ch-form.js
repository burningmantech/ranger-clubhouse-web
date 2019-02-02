import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { optional } from '@ember-decorators/argument/types';
import { action, computed } from '@ember-decorators/object';
import { tagName } from '@ember-decorators/component';
import { typeOf } from '@ember/utils';
import Changeset from 'ember-changeset';
import lookupValidator from 'ember-changeset-validations';
import DS from 'ember-data';

import $ from 'jquery';

@tagName('')
export default class ChFormComponent extends Component {
  static positionalParams = ['formId', 'originalModel'];

  @argument(optional('string')) formId;
  @argument(optional('object')) validator;

  // The original model being edited.
  @argument('object') originalModel;

  @argument(optional('object')) onSubmit;
  @argument(optional('object')) onReset;
  @argument(optional('object')) onCancel;
  @argument(optional('object')) onFormChange;

  @argument(optional('boolean')) modalBox = false; // Open form as a modal dialog
  @argument(optional('string')) modalTitle = ''; // title

  // By default a changset object will be created for the model and used.
  @argument(optional('boolean')) changeSet = true;

  @argument(optional('string')) autocomplete = "off";

  @argument(optional('string')) formClass;

  // Was the original backing model updated?
  watchingModel = false;

  @computed('originalModel')
  get model() {
    let model;
    const original = this.originalModel;
    const validator = this.validator;

    if (this.changeSet) {
      if (validator) {
        model = new Changeset(original, lookupValidator(validator), validator);
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

      if (original instanceof DS.Model) {
        // Watch for the original model being updated.

        this.set('watchingModelEvent', (original.isNew ? 'didCreate' : 'didUpdate'));
        original.on(this.watchingModelEvent, this, this._modelUpdated);
      }
    } else {
      model = original;
      model.set('isValid', true);
    }

    return model;
  }

  _modelUpdated() {
    this.notifyPropertyChange('model'); // Recompute model
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

    $('[autofocus]').focus();
  }

  willDestroyElement() {
    super.willDestroyElement(...arguments);

    // Remove the event handler for the record update
    if (this.watchingModelEvent) {
      this.originalModel.off(this.watchingModelEvent, this, this._modelUpdated);
    }

    if (!this.modalBox) {
      return;
    }

    const dialog = $('#form-dialog');
    dialog.modal().off('hide.bs.modal');
    dialog.modal('hide');
    dialog.modal('dispose');
  }

  @action
  submitForm(action) {
    const model = this.model;
    const original = this.originalModel;

    const submitAction = (action || this.onSubmit);

    if (model.validate) {
      model.validate().then(() => {
        if (submitAction) {
          return submitAction(model, this.model.isValid, original);
        }
      });
    } else if (submitAction) {
      return submitAction(model, undefined, original);
    }
  }

  @action
  fieldChangeAction(field) {
    const model = this.model;
    const original = this.originalModel;
    const fieldChange = field.onChange;
    const formChange = this.onFormChange;

    /*    if (model.validate) {
          model.validate().then(() => {
              if (fieldChange) {
                fieldChange(field, model, this.model.isValid, original);
              }

              if (formChange) {
                formChange(field, model, this.model.isValid, original);
              }
          });
        } else {*/
    if (fieldChange) {
      fieldChange(field, model, this.model.isValid, original);
    }

    if (formChange) {
      formChange(field, model, this.model.isValid, original);
    }
    /*}*/
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

}

import Component from '@ember/component';
import { argument } from '@ember-decorators/argument';
import { optional } from '@ember-decorators/argument/types';
import { action } from '@ember-decorators/object';
import { tagName } from '@ember-decorators/component';

import { typeOf } from '@ember/utils';
import Changeset from 'ember-changeset';
import lookupValidator from 'ember-changeset-validations';

import $ from 'jquery';

@tagName('')
export default class ChFormComponent extends Component {
  static positionalParams = [ 'formId', 'originalModel' ];

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

  didReceiveAttrs() {
    let model;
    const original = this.originalModel;
    const validator = this.validator;

    if (this.changeSet) {
      if (validator) {
        model = new Changeset(original, lookupValidator(validator), validator);
      } else {
        model = new Changeset(original);
      }
    } else {
      model = original;
      model.set('isValid', true);
    }

    this.set('model', model);
  }

  didInsertElement() {
    super.didInsertElement(...arguments);

    if (!this.modalBox) {
      return;
    }

    const dialog = $('#form-dialog');

    dialog.modal({ keyboard: false });
    dialog.modal().on('show.bs.modal', () => {
      return this.onShow
        ? this.onShow()
        : null;
    });

    dialog.modal().on('hide.bs.modal', () => {
      return this.onClose
        ? this.onClose()
        : null;
    });

    $('[autofocus]').focus();
  }

  willDestroyElement() {
    super.willDestroyElement(...arguments);

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

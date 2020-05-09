import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class AdminAlertsController extends Controller {
  @action
  newAlert() {
    this.set('entry', this.store.createRecord('alert'));
  }

  @action
  editAlert(alert) {
    this.set('entry', alert);
  }

  @action
  cancelAlert() {
    this.set('entry', null);
  }

  @action
  saveAlert(model, isValid) {
    if (!isValid)
      return;

    const isNew = model.get('isNew');

    model.save().then((record) => {
      if (isNew) {
        this.alerts.pushObject(record);
      }

      this.toast.success(`Alert was successfully ${isNew ? 'created' : 'updated'}.`);
      this.set('entry', null);
    }).catch((response) => {
      this.house.handleErrorResponse(response);
      this.entry.rollbackAttributes();
    });
  }

  @action
  deleteAlert(alert) {
    this.modal.confirm(`Confirm alert deletion`, `Are you sure you want to delete "${alert.title}?"`,
      () => {
        alert.destroyRecord().then(() => {
          this.alerts.removeObject(alert);
          this.toast.success(`Alert was successfully deleted.`);
      })
      });
  }
}

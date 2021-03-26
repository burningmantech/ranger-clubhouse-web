import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';

export default class AdminAlertsController extends ClubhouseController {
  @tracked entry = null;

  @action
  newAlert() {
    this.entry = this.store.createRecord('alert');
  }

  @action
  editAlert(alert) {
    this.entry = alert;
  }

  @action
  cancelAlert() {
    this.entry = null;
  }

  @action
  saveAlert(model, isValid) {
    if (!isValid)
      return;

    const isNew = model.isNew;

    model.save().then((record) => {
      if (isNew) {
        this.alerts.pushObject(record);
      }

      this.toast.success(`Alert was successfully ${isNew ? 'created' : 'updated'}.`);
      this.entry = null;
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

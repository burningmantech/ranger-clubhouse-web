import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {TECH_NINJA} from 'clubhouse/constants/roles';

export default class AdminAlertsController extends ClubhouseController {
  @tracked entry = null;

  get canManageAlerts() {
    return this.session.hasRole(TECH_NINJA);
  }

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
  async saveAlert(model, isValid) {
    if (!isValid)
      return;

    const isNew = model.isNew;

    try {
      await model.save();
      if (isNew) {
        await this.alerts.update();
      }
      this.toast.success(`Alert was successfully ${isNew ? 'created' : 'updated'}.`);
      this.entry = null;
    } catch (response) {
      this.house.handleErrorResponse(response);
      this.entry.rollbackAttributes();
    }
  }

  @action
  deleteAlert() {
    this.modal.confirm(`Confirm alert deletion`, `Are you sure you want to delete "${this.entry.title}?"`,
      async () => {
        try {
          await this.entry.destroyRecord();
          this.entry = null;
          this.toast.success('Alert has been deleted.');
        } catch (response) {
          this.house.handleErrorResponse(response);
        }
      });
  }
}

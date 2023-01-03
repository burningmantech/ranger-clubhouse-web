import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class AdminCertificationsController extends ClubhouseController {
  @tracked certifications;
  @tracked entry;
  @tracked canAdministerCertifications;

  @action
  newCertificationAction() {
    this.entry = this.store.createRecord('certification');
  }

  @action
  editCertificationAction(certification) {
    this.entry = certification;
  }

  @action
  cancelCertificationAction() {
    this.entry = null;
  }

  @action
  saveCertificationAction(model, isValid) {
    if (!isValid) {
      return;
    }

    const {isNew} = model;

    model.save().then(() => {
      this.toast.success(`Certification was successfully ${isNew ? 'created' : 'updated'}.`);
      this.entry = null;
      if (isNew) {
        return this.certifications.update();
      }
    }).catch((response) => this.house.handleErrorResponse(response, model));
  }

  @action
  deleteCertificationAction() {
    this.modal.confirm(`Confirm certification deletion`, `Are you sure you want to delete "${this.entry.title}?"`,
      () => {
        this.entry.destroyRecord().then(() => {
          this.entry = null;
          this.toast.success(`Certification was successfully deleted.`);
        }).catch((response) => this.house.handleErrorResponse(response));
      });
  }
}

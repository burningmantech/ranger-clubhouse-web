import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {ReservationTypeLabels, ReservationTypeOptions, TYPE_UNCATEGORIZED} from 'clubhouse/models/handle-reservation';
import {isEmpty} from '@ember/utils';
import EmberObject from '@ember/object';
import {cached} from '@glimmer/tracking';

export default class HandleReservationController extends ClubhouseController {
  @tracked handleReservations;
  @tracked entry = null;

  @tracked showExpired = false;
  @tracked typeFilter;

  @tracked uploadForm;
  @tracked uploadResults;
  @tracked uploadType;
  @tracked didCommit = false;
  @tracked errorCount = 0;
  @tracked haveResults = false;

  @tracked isSubmitting = false;

  typeOptions = ReservationTypeOptions;

  typeFilterOptions = [
    ['All', 'all'],
    ...ReservationTypeOptions,
  ];

  typeLabel(type) {
    return ReservationTypeLabels[type] ?? type;
  }

  @cached
  get viewHandleReservations() {
    let results = this.handleReservations;

    if (this.showExpired) {
      results = results.filter((r) => r.has_expired);
    }

    if (this.typeFilter !== 'all') {
      results = results.filter((r) => r.reservation_type === this.typeFilter);
    }

    return results;
  }

  @action
  newHandleReservation() {
    this.entry = this.store.createRecord('handle-reservation');
  }

  @action
  editHandleReservation(handleReservation) {
    this.entry = handleReservation;
  }

  @action
  removeHandleReservation() {
    this.modal.confirm('Delete Handle Reservation',
      `Are you sure you wish to delete "${this.entry.handle}"? This operation cannot be undone.`,
      async () => {
        try {
          await this.entry.destroyRecord();
          this.toast.success('The handle reservation has been deleted.');
          this.entry = null;
        } catch (response) {
          this.house.handleErrorResponse(response);
        }
      });
  }

  @action
  saveHandleReservation(model, isValid) {
    if (!isValid) {
      return;
    }

    this.house.saveModel(model,
      `The handle reservation has been ${model.isNew ? 'created' : 'updated'}.`,
      () => {
        this.handleReservations.update();
        this.entry = null;
      });
  }

  @action
  cancelHandleReservation() {
    this.entry = null;
  }

  setupUploadForm() {
    this.uploadForm = EmberObject.create({
      reservation_type: TYPE_UNCATEGORIZED,
      expires_on: '',
      twii_year: '',
      handles: '',
      commit: false,
    });
  }

  @action
  verifyUpload(model, isValid) {
    if (!isValid) {
      return;
    }

    this.uploadData = {
      reservation_type: model.reservation_type,
      handles: model.handles,
    };

    ['twii_year', 'reason', 'expires_on'].forEach((attr) => {
      if (!isEmpty(model[attr])) {
        this.uploadData[attr] = model[attr];
      }
    });

    this._executeUpload(false);
  }

  @action
  submitUpload() {
    this._executeUpload(true);
  }

  async _executeUpload(commit) {
    this.didCommit = false;

    try {
      this.isSubmitting = true;
      const results = await this.ajax.request(`handle-reservation/upload`, {
        method: 'POST',
        data: {...this.uploadData, commit: commit ? 1 : 0}
      });
      this.didCommit = commit;
      this.errorCount = results.errors;
      this.uploadResults = results.handles;
      this.haveResults = true;
      this.uploadType = this.uploadData.reservation_type;
      if (commit) {
        await this.handleReservations.update();
      }
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  @action
  expireHandles() {
    this.modal.confirm('Expire Handles', `Are you sure you want to delete the expired handles at this time?`, async () => {
      try {
        this.isSubmitting = true;
        const expired = (await this.ajax.request(`handle-reservation/expire`, {method: 'POST'})).expired;
        await this.handleReservations.update();
        if (expired) {
          this.toast.success(`${expired} handle(s) successfully expired.`);
        } else {
          this.modal.info('No Handles Expired', 'No handles were found to have expired.');
        }
      } catch (response) {
        this.house.handleErrorResponse(response);
      } finally {
        this.isSubmitting = false;
      }
    });
  }
}

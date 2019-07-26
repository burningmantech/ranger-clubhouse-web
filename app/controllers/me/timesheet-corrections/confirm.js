import Controller from '@ember/controller';
import { action, computed } from '@ember/object';

/*
 * Confirm a person's entire timesheet correct/incorrect.
 */

export default class MeTimesheetCorrectionsConfirmController extends Controller {
  confirmForm = null; // setup in the route

  @computed('timesheets.@each.isUnverified')
  get unverifiedCount() {
    return this.timesheets.reduce((total, ts) => total+(ts.isUnverified ? 1 : 0), 0);
  }

  @computed('timesheets.@each.isPendingReview')
  get correctionPendingReviewCount() {
    return this.timesheets.reduce((total, ts) => total+(ts.isPendingReview ? 1 : 0), 0);
  }

  @computed('timesheetsMissing.@each.isPending')
  get missingPendingReviewCount() {
    return this.timesheetsMissing.reduce((total, ts) => total+(ts.isPending ? 1 : 0), 0);
  }

  @action
  confirmAction(model) {
    const confirmed = model.get('confirm') ? 1 : 0;
    const person_id = this.session.userId;

    this.toast.clear();
    this.set('isSubmitting', true);

    this.ajax.request(`timesheet/confirm`, {
      method: 'POST',
      data: { person_id, confirmed }
    }).then((result) => {
      const ci = result.confirm_info;
      // Update the confirmed results
      this.set('timesheetInfo.timesheet_confirmed', ci.timesheet_confirmed);
      this.set('timesheetInfo.timesheet_confirmed_at', ci.timesheet_confirmed_at);
      this.toast.success(`Your timesheet has been marked as ${ci.timesheet_confirmed ? 'CONFIRMED' : 'UNCONFIRMED'}.`);
    }).catch((response) => this.house.handleErrorResponse(response))
    .finally(() => this.set('isSubmitting', false));
  }
}

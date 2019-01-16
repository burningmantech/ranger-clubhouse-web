import Controller from '@ember/controller';
import { action } from '@ember-decorators/object';

/*
 * Confirm a person's entire timesheet correct/incorrect.
 */

export default class MeTimesheetCorrectionsConfirmController extends Controller {
  confirmForm = null; // setup in the route

  @action
  confirmAction(model) {
    const confirmed = model.get('confirm') ? 1 : 0;
    const person_id = this.session.user.id;

    this.toast.clear();

    this.ajax.request(`timesheet/confirm`, {
      method: 'POST',
      data: { person_id, confirmed }
    }).then((result) => {
      const ci = result.confirm_info;
      // Update the confirmed results
      this.set('timesheetInfo.timesheet_confirmed', ci.timesheet_confirmed);
      this.set('timesheetInfo.timesheet_confirmed_at', ci.timesheet_confirmed_at);
      this.toast.success(`Your timesheet has been marked as ${ci.timesheet_confirmed ? 'CONFIRMED' : 'UNCONFIRMED'}.`);
    }).catch((response) => this.house.handleErrorResponse(response));
  }
}

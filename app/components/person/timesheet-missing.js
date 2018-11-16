import Component from '@ember/component';
import { action } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import { validatePresence } from 'ember-changeset-validations/validators';
import validateDateTime from 'clubhouse/validators/datetime';

export default class PersonTimesheetMissingComponent extends Component {
  @argument timesheetMissing;
  @argument person;
  @argument positions;
  @argument year;

  reviewOptions = [
    'approved',
    'rejected',
    'pending'
  ];

  timesheetValidations = {
    on_duty:  [ validateDateTime({ before: 'off_duty'}), validatePresence({ presence: true })],
    off_duty:  [ validateDateTime({ after: 'on_duty'}) ],
  };

  @action
  editTimesheetAction(timesheet) {
    this.set('editTimesheet', timesheet);
    this.set('partnerInfo', timesheet.partner_info);
    this.set('partnerTimesheet', null);
  }

  @action
  cancelTimesheetAction() {
    this.set('editTimesheet', null);
  }

  @action
  saveTimesheetAction(model, isValid) {
    if (!isValid) {
      return;
    }

    this.toast.clearMessages();
    this.house.saveModel(model, 'Missing timesheet entry has been successfully updated.', () => {
      this.set('editTimesheet', null);
    });
  }

  @action
  removeTimesheetAction(timesheet) {
    this.modal.confirm('Remove Missing Timesheet', `Position: ${timesheet.position.title}<br>Time: ${timesheet.on_duty} to ${timesheet.off_duty}<br> Are you sure you wish to remove this timesheet?`, () => {
      timesheet.destroyRecord().then(() => {
        this.toast.success('The entry has been deleted.');
      }).catch((response) => this.house.handleErrorResponse(response));
    });
  }

  @action
  viewPartnerTimesheetAction(partner) {
    this.ajax.request('timesheet', { data: { year: this.year, person_id: partner.person_id }}).then((result) => {
      this.set('partnerTimesheet', result.timesheet);
      this.set('partnerCallsign', partner.callsign);
    }).catch((response) => this.house.handleErrorResponse(response));
  }

}

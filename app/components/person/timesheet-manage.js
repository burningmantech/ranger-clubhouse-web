import Component from '@ember/component';
import { action, computed } from '@ember-decorators/object';
import { argument } from '@ember-decorators/argument';
import { Role } from 'clubhouse/constants/roles';
import { validatePresence } from 'ember-changeset-validations/validators';
import validateDateTime from 'clubhouse/validators/datetime';

export default class PersonTimesheetManageComponent extends Component {
  @argument timesheets;
  @argument person;
  @argument positions;
  @argument year;

  editTimesheet = null;

  reviewOptions = [
    'approved',
    'rejected',
    'pending'
  ];

  verifyOptions = [
    [ 'Is verified', true ],
    [ 'is NOT verified', false ]
  ];

  timesheetValidations = {
    on_duty:  [ validateDateTime({ before: 'off_duty'}), validatePresence({ presence: true })],
    off_duty:  [ validateDateTime({ after: 'on_duty'}) ],
  };

  @computed('timesheets.@each.isUnverified')
  get unverifiedCount() {
    return this.timesheets.reduce((total, ts) => total+(ts.isUnverified ? 1 : 0), 0);
  }

  @computed('positions')
  get positionOptions() {
    return this.positions.map((p) => [ p.title, p.id ]);
  }

  @computed
  get canManageTimesheets() {
    const user = this.session.user;
    return user.hasRole(Role.TIMESHEET_MANAGER) || (user.hasRole(Role.ADMIN) + user.hasRole(Role.MANAGE));
  }

  @action
  editTimesheetAction(timesheet) {
    this.set('editVerification', false);
    this.set('editTimesheet', timesheet);
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
    this.house.saveModel(model, 'The timesheet entry has been successfully updated.', () => {
      this.set('editTimesheet', null);
    });
  }

  @action
  signoffAction(timesheet) {
    this.ajax.request(`timesheet/${timesheet.id}/signoff`, { method: 'POST' }).then((result) => {
      this.timesheets.update();
      this.toast.success(`${this.person.callsign} has been successfully signed off. Enjoy your rest.`);
    })
  }

  @action
  removeTimesheetAction(timesheet) {
    this.modal.confirm('Remove Timesheet', `Position: ${timesheet.position.title}<br>Time: ${timesheet.on_duty} to ${timesheet.off_duty}<br> Are you sure you wish to remove this timesheet?`, () => {
      timesheet.destroyRecord().then(() => {
        this.toast.success('The entry has been deleted.');
      }).catch((response) => this.house.handleErrorResponse(response));
    });
  }

  @action
  editVerificationAction() {
    this.set('editVerification', true);
  }
}

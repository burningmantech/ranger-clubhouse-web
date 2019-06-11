import Component from '@ember/component';
import { action, computed } from '@ember/object';
import { argument } from '@ember-decorators/argument';
import { Role } from 'clubhouse/constants/roles';
import { validatePresence } from 'ember-changeset-validations/validators';
import validateDateTime from 'clubhouse/validators/datetime';

export default class PersonTimesheetManageComponent extends Component {
  @argument('object') timesheets; // Person's timesheet
  @argument('object') person;     // The person we're dealing with
  @argument('object') positions;  // Possible positions a person can sign into.
  @argument('number') year;       // The year being viewed
  @argument('object') timesheetSummary; // breakdown on hours & credits.
  @argument('object') onChange;   // call back to refresh the various views

  editEntry = null;

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

  // Build a position list the person can be in.
  @computed('positions')
  get positionOptions() {
    return this.positions.map((p) => [ p.title, p.id ]);
  }

  // Is the user allowed to manage timesheets (edit, delete, review)
  @computed
  get canManageTimesheets() {
    const user = this.session.user;
    return user.hasRole(Role.TIMESHEET_MANAGER) || (user.hasRole(Role.ADMIN) && user.hasRole(Role.MANAGE));
  }

  // Can the user verify the person's timesheet?
  @computed
  get canVerifyTimesheets() {
    return this.session.user.hasRole(Role.MANAGE);
  }

  // Edit a timesheet - i.e. display the form
  @action
  editEntryAction(timesheet) {
    this.set('editVerification', false);
    this.set('editEntry', timesheet);
  }

  // Cancel editing - i.e. hide the form
  @action
  cancelEntryAction() {
    this.set('editEntry', null);
  }

  // Save the timesheet entry being edited
  @action
  saveEntryAction(model, isValid) {
    if (!isValid) {
      return;
    }

    this.toast.clear();
    this.house.saveModel(model, 'The timesheet entry has been successfully updated.', () => {
      this.set('editEntry', null);
      this.onChange();
    });
  }

  // Signoff the person from a shift.
  @action
  signoffAction(timesheet) {
    this.ajax.request(`timesheet/${timesheet.id}/signoff`, { method: 'POST' }).then(() => {
      this.timesheets.update();
      this.onChange();
      this.toast.success(`${this.person.callsign} has been successfully signed off. Enjoy your rest.`);
    })
  }

  // Delete the entry.
  @action
  removeEntryAction(timesheet) {
    this.modal.confirm('Remove Timesheet', `Position: ${timesheet.position.title}<br>Time: ${timesheet.on_duty} to ${timesheet.off_duty}<br> Are you sure you wish to remove this timesheet?`, () => {
      timesheet.destroyRecord().then(() => {
        this.toast.success('The entry has been deleted.');
        this.onChange();
    }).catch((response) => this.house.handleErrorResponse(response));
    });
  }

  // Display the verification fields.
  @action
  editVerificationAction() {
    this.set('editVerification', true);
  }
}

import Component from '@glimmer/component';
import {action} from '@ember/object';
import {Role} from 'clubhouse/constants/roles';
import {validatePresence} from 'ember-changeset-validations/validators';
import validateDateTime from 'clubhouse/validators/datetime';
import {tracked} from '@glimmer/tracking';
import {inject as service} from '@ember/service';

export default class PersonTimesheetManageComponent extends Component {
  @service ajax;
  @service house;
  @service modal;
  @service session;
  @service toast;

  @tracked editEntry = null;
  @tracked editVerification = false;

  @tracked positionOptions = [];

  reviewOptions = [
    ['Correction approved', 'approved'],
    ['Correction rejected', 'rejected'],
    ['Review requested', 'pending'],
    ['Entry verified', 'verified'],
    ['Entry unverified', 'unverified']
  ];

  timesheetValidations = {
    on_duty: [validateDateTime({before: 'off_duty'}), validatePresence({presence: true})],
    off_duty: [validateDateTime({after: 'on_duty'})],
  };

  constructor() {
    super(...arguments);
    const session = this.session;

    // Can the user manage this person's timesheet entries?
    this.canManageTimesheets = session.hasRole(Role.TIMESHEET_MANAGEMENT) || (session.hasRole(Role.ADMIN) && session.hasRole(Role.MANAGE));
    // Can the user mark an entry as verified?
    this.canVerifyTimesheets = session.hasRole(Role.MANAGE);
  }

  /**
   * Setup to edit an entry by reloading the entry, and then showing the form dialog.
   * @param timesheet
   */

  @action
  editEntryAction(timesheet) {
    const {positions} = this.args;

    // The positions the person can be part of
    this.positionOptions = positions.map((p) => [p.title, p.id]);

    if (!positions.find((p) => p.id === timesheet.position_id)) {
      // Might be something like a mentee shift and the person no longer has the position grant, yet
      // still need to include the option because the person did work/walk.
      this.positionOptions.unshift([timesheet.position.title, timesheet.position_id]);
    }

    timesheet.reload().then(() => {
      this.editVerification = false;
      this.editEntry = timesheet;
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  /**
   * Cancel an entry edit - i.e. hide the form dialog
   */
  @action
  cancelEntryAction() {
    this.editEntry = null;
  }

  /**
   * Save an entry
   *
   * @param model
   * @param {boolean} isValid
   */
  @action
  saveEntryAction(model, isValid) {
    if (!isValid) {
      return;
    }

    this.house.saveModel(model, 'The timesheet entry has been successfully updated.',
      () => {
        // clear out the pseudo fields.
        this.editEntry.additional_notes = '';
        this.editEntry.additional_reviewer_notes = '';
        this.editEntry = null;
        this.args.onChange();
      });
  }

  /**
   * Sign off / end a shift
   *
   * @param timesheet
   */
  @action
  signoffAction(timesheet) {
    this.ajax.request(`timesheet/${timesheet.id}/signoff`, {method: 'POST'})
      .then((result) => {
        const {onChange, person, endShiftNotify} = this.args;
        onChange();
        if (+person.id === +this.session.userId) {
          // Clear out the position title in user's navigation bar.
          this.session.loadUser();
        }
        switch (result.status) {
          case 'success':
            this.toast.success(`${person.callsign} has been successfully signed off.`);
            if (endShiftNotify) {
              endShiftNotify();
            }
            break;

          case 'already-signed-off':
            this.toast.error(`${person.callsign} was already signed off.`);
            break;

          default:
            this.toast.error(`Unknown signoff response [${result.status}].`);
            break;
        }
      }).catch((response) => this.house.handleErrorResponse(response))
  }

  /**
   * Delete the entry
   */
  @action
  removeEntryAction() {
    const ts = this.editEntry;
    this.modal.confirm('Remove Timesheet',
      `Position: ${ts.position.title}<br>Time: ${ts.on_duty} to ${ts.off_duty}<br> Are you sure you wish to remove this timesheet?`,
      () => {
        ts.destroyRecord().then(() => {
          this.editEntry = null;
          this.toast.success('The entry has been deleted.');
          this.args.onChange();
        }).catch((response) => this.house.handleErrorResponse(response));
      });
  }
}

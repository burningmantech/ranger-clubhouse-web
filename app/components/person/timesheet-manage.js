import Component from '@glimmer/component';
import {action} from '@ember/object';
import {Role} from 'clubhouse/constants/roles';
import {validatePresence} from 'ember-changeset-validations/validators';
import validateDateTime from 'clubhouse/validators/datetime';
import {cached, tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
import {isEmpty} from '@ember/utils';
import dayjs from 'dayjs';
import {NON_RANGER} from "clubhouse/constants/person_status";


export default class PersonTimesheetManageComponent extends Component {
  @service ajax;
  @service house;
  @service modal;
  @service session;
  @service toast;

  @tracked editEntry = null;
  @tracked editVerification = false;
  @tracked deleteEntry = null;

  @tracked positionOptions = [];

  reviewOptions = [
    ['Correction approved', 'approved'],
    ['Correction rejected', 'rejected'],
    ['Correction requested', 'pending'],
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

    this._markOverlapping();
  }

  /**
   * Run through all the entries and mark those which overlap in time.
   *
   * @private
   */

  _markOverlapping() {
    const {timesheets} = this.args;

    // Clear out overlapping flags
    timesheets.forEach((ts) => ts.isOverlapping = false);

    let prevEndTime = 0, prevTs = null;
    timesheets.forEach(function (ts) {
      if (!ts.off_duty) {
        // Don't bother with still on duty shifts.
        return;
      }
      if (ts.onDutyTime < prevEndTime) {
        ts.isOverlapping = true;
        prevTs.isOverlapping = true;
      }
      prevEndTime = ts.offDutyTime;
      prevTs = ts;
    });
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
      this._markOverlapping();
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  /**
   * Check if the entry has abnormal on duty or off duty times.
   * Allow an unrestricted date range if the years don't match, or the months
   * are not August or September.
   *
   * @param {string} restrictTime
   * @returns {undefined|string}
   * @private
   */

  _restrictCheck(restrictTime) {
    if (!isEmpty(this.editEntry.on_duty) && !isEmpty(this.editEntry.off_duty)) {
      const onDuty = dayjs(this.editEntry.on_duty), offDuty = dayjs(this.editEntry.off_duty);
      if (onDuty.year() !== offDuty.year()
        || onDuty.month() < 7 || onDuty.month() > 9
        || offDuty.month() < 7 || offDuty.month() > 9) {
        return undefined;
      }
    }
    return restrictTime;
  }

  /**
   * Return the earliest on duty date allowed
   *
   * @returns {string|undefined}
   */

  @cached
  get minDate() {
    return this._restrictCheck(`${this.args.year}-07-01`);
  }

  /**
   * Return the latest off duty date allowed
   *
   * @returns {string|undefined}
   */

  @cached
  get maxDate() {
    return this._restrictCheck(`${this.args.year}-10-31`);
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

    const {person} = this.args;
    if (model._changes['is_non_ranger'] && model.is_non_ranger && person.status !== NON_RANGER) {
      this.modal.confirm('Department Volunteer Flag Checked',
        `Warning: The department volunteer (aka non ranger) flag is checked on this timesheet entry, however, ${person.callsign} is status ${person.status}. Normally, the flag is used to indicate the entry is for a non ranger status person and the entry WILL NOT count towards any service years. Are you sure you want to do this?`,
        () => this._saveCommon(model));

    } else {
      this._saveCommon(model);
    }
  }

  async _saveCommon(model) {
    this.house.saveModel(model, 'The timesheet entry has been successfully updated.',
      async () => {
        this.editEntry.additional_notes = '';
        this.editEntry.additional_reviewer_notes = '';
        this.editEntry = null;
        await this.args.timesheets.update();
        this.args.onChange();
        this._markOverlapping();
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
        this._markOverlapping();
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
   *
   * @param {boolean} saveFirst - save the model first before deleted (allows comments to be recorded in the audit log)
   */

  @action
  async deleteEntryAction(saveFirst) {
    try {
      if (saveFirst) {
        await this.deleteEntry.save();
      }
      await this.editEntry.destroyRecord();
      this.editEntry = null;
      this.toast.success('The entry has been deleted.');
      this.args.onChange();
      this._markOverlapping();
    } catch (e) {
      this.house.handleErrorResponse(e);
    } finally {
      this.deleteEntry = null;
    }
  }

  @action
  showDeleteDialogAction(model) {
    this.deleteEntry = model;
  }

  @action
  cancelDeleteDialogAction() {
    this.deleteEntry = false;
  }

  /**
   * Do any of the entries overlap?
   *
   * @returns {boolean}
   */

  get hasOverlapping() {
    return this.args.timesheets.find((ts) => ts.isOverlapping) !== undefined;
  }

  /**
   * Return the duration in hours & minutes. Takes into account invalid or blank dates.
   *
   * @param model
   * @returns {string}
   */

  entryDuration(model) {
    if (isEmpty(model.on_duty) || isEmpty(model.off_duty)) {
      return '-';
    }

    const start = dayjs(model.on_duty), end = dayjs(model.off_duty);
    if (!start.isValid() || !end.isValid()) {
      return '-';
    }

    const duration = end.diff(start, 's');
    const minutes = Math.floor((duration / 60) % 60);
    const hours = Math.floor(duration / 3600);

    let time = `${minutes} min${minutes === 1 ? '' : 's'}`;

    if (hours) {
      time = `${hours} hour${hours === 1 ? '' : 's'} ${time}`;
    }

    return time;
  }
}

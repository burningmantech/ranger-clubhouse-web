import Component from '@glimmer/component';
import {action} from '@ember/object';
import {Role} from 'clubhouse/constants/roles';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
import {NON_RANGER} from "clubhouse/constants/person_status";
import {STATUS_PENDING, STATUS_REJECTED} from "clubhouse/models/timesheet";
import {APPROVED} from "clubhouse/models/timesheet-missing";

export default class PersonTimesheetManageComponent extends Component {
  @service ajax;
  @service house;
  @service modal;
  @service session;
  @service shiftManage;
  @service toast;

  @tracked editEntry = null;
  @tracked editVerification = false;
  @tracked deleteEntry = null;

  @tracked correctingInProgress = false;

  @tracked positionOptions = [];


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
  async editEntryAction(timesheet) {
    const {positions} = this.args;

    // The positions the person can be part of
    this.positionOptions = positions.filter((p) => !p.not_timesheet_eligible).map((p) => [p.title, p.id]);

    if (!positions.find((p) => p.id === timesheet.position_id)) {
      // Might be something like a mentee shift and the person no longer has the position grant, yet
      // still need to include the option because the person did work/walk.
      this.positionOptions.unshift([timesheet.position.title, timesheet.position_id]);
    }

    try {
      this.isSubmitting = true;
      await timesheet.reload();
      this.editVerification = false;
      this.editEntry = timesheet;
      this._markOverlapping();
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
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
        () => this._saveCheckTimes(model));

    } else {
      this._saveCheckTimes(model);
    }
  }

  /**
   * Check to see if the datetime ranges make sense for the position.
   *
   * @param model
   * @returns {Promise<void>}
   * @private
   */

  _saveCheckTimes(model) {
    if (model._changes['position_id'] || model._changes['on_duty'] || model._changes['off_duty']) {
      if (model.review_status === STATUS_REJECTED) {
        model.rollbackProperty('position_id');
        model.rollbackProperty('on_duty');
        model.rollbackProperty('off_duty');
        this.modal.info('Correction Rejected - Position and times not changed',
          `You changed position and/or times while corrections were rejected. The new positions and/or times have NOT be saved.`, this._saveCheckTimesCommon(model));
      } else if (model.stillOnDuty) {
        this._saveCommon(model);
      } else {
        this._saveCheckTimesCommon(model);
      }
    } else {
      this._saveCommon(model);
    }
  }

  _saveCheckTimesCommon(model) {
    this.shiftManage.checkDateTime(model.position_id, model.on_duty, model.off_duty, () => this._checkForOverlaps(model));
  }

  _checkForOverlaps(model) {
    this.shiftManage.checkForOverlap(this.args.person.id, model.on_duty, model.off_duty, model.id, () => this._saveCommon(model));
  }

  /**
   * Try to save the entry.
   *
   * @param model
   * @returns {Promise<void>}
   * @private
   */

  async _saveCommon(model) {
    const changes = model._changes;
    const didChange = (changes['on_duty'] || changes['off_duty'] || changes['position_id']);

    if (model.review_status === STATUS_PENDING && didChange) {
      this.modal.confirm('Entry modified but not approved',
        'The on duty time, off duty time, and/or position has been updated, but not saved yet, and the status remains as "Correction Requested." Are you sure you want to save the modifications without updating the status?',
        () => this._performSave(model))
    } else if (model.review_status === APPROVED && changes['review_status'] && !didChange) {
      this.modal.confirm('No changes happened',
        'You have indicated that the correction request is to be approved, but no changes have been made (i.e., neither the on duty time, off duty time, nor position was changed). Do you still want to proceed with updating the status to approved?',
        () => this._performSave(model))
    } else {
      this._performSave(model);
    }
  }

  async _performSave(model) {
    this.house.saveModel(model, 'The timesheet entry has been successfully updated.',
      async () => {
        this.editEntry.additional_notes = '';
        this.editEntry.additional_wrangler_notes = '';
        this.editEntry.additional_admin_notes = '';
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
}

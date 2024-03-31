import Component from '@glimmer/component';
import {action} from '@ember/object';
import {cached, tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
import {validatePresence} from 'ember-changeset-validations/validators';
import validateDateTime from 'clubhouse/validators/datetime';
import validatePresenceIf from 'clubhouse/validators/presence-if';
import {htmlSafe} from '@ember/template';
import {DIRT} from 'clubhouse/constants/positions';
import {ADMIN, TIMESHEET_MANAGEMENT} from 'clubhouse/constants/roles';
import {APPROVED, PENDING, REJECTED} from "clubhouse/models/timesheet-missing";
import {shiftFormat} from "clubhouse/helpers/shift-format";

export default class PersonTimesheetMissingComponent extends Component {
  @tracked newEntry = null;
  @tracked editEntry = null;
  @tracked nextEntry = null;

  @tracked havePartnerTimesheet = false;
  @tracked partnerCallsign = null;
  @tracked partnerInfo = null;
  @tracked partnerTimesheet = null;

  @tracked viewEntry = null;

  @tracked isSubmitting = false;

  @service ajax;
  @service house;
  @service modal;
  @service session;
  @service shiftManage;
  @service store;
  @service toast;


  hasTimesheetManagement = this.session.hasRole(TIMESHEET_MANAGEMENT);

  reviewOptions = [
    APPROVED,
    REJECTED,
    PENDING
  ];

  timesheetValidations = {
    new_on_duty: [
      validateDateTime({
        before: 'new_off_duty',
        if_set: 'create_entry',
        message: 'Date/time must be before Off Duty'
      }),
      validatePresence({presence: true})
    ],
    new_off_duty: [
      validateDateTime({
        after: 'new_on_duty',
        if_set: 'create_entry',
        message: 'Date/time must be after On Duty'
      }),
      validatePresence({presence: true})
    ],
  };


  constructor() {
    super(...arguments);

    this.newEntryValidations = {
      on_duty: [validateDateTime({before: 'off_duty'}), validatePresence({presence: true})],
      off_duty: [validateDateTime({after: 'on_duty'}), validatePresence({presence: true})],
    };

    if (this.hasTimesheetManagement) {
      this.newEntryValidations.additional_notes = [validatePresenceIf({
        if_blank: 'additional_wrangler_notes',
        message: 'Either a requester or reviewer note must be entered.'
      })]

      this.newEntryValidations.additional_wrangler_notes = [validatePresenceIf({
        if_blank: 'additional_notes',
        message: 'Either a requester or reviewer note must be entered.'
      })];
    } else {
      this.newEntryValidations.additional_notes = [validatePresence({
        presence: true,
        message: 'Enter a note from the requester.'
      })]
    }
  }

  /**
   * Setup to edit a Missing Timesheet request.
   * - Find the position of the entry in the Missing Timesheet list
   * - Find the next entry that needs attention after this one.
   * - Reload the entry so the most recent version is edited.
   * @param {TimesheetMissingModel} timesheet
   * @private
   */

  async _setupEdit(timesheet) {
    const {timesheetMissing} = this.args;

    let idx = timesheetMissing.indexOf(timesheet);
    let nextEntry;

    // Find the next entry that may need managing.
    if (idx >= 0) {
      idx++;
      while (idx < timesheetMissing.length) {
        const entry = timesheetMissing.objectAt(idx);
        if (entry.isPending) {
          nextEntry = entry;
          break;
        }

        idx++;
      }
    }

    try {
      await timesheet.reload();
      timesheet.new_on_duty = timesheet.on_duty;
      timesheet.new_off_duty = timesheet.off_duty;
      timesheet.new_position_id = timesheet.position_id;
      timesheet.create_entry = 0;
      timesheet.additional_notes = '';
      timesheet.additional_admin_notes = '';
      timesheet.additional_reviewer_notes = '';
      timesheet.additional_wrangler_notes = '';

      this.editEntry = timesheet;
      this.nextEntry = nextEntry;
      this.partnerInfo = timesheet.partner_info;
      this.havePartnerTimesheet = false;

    } catch (response) {
      this.house.handleErrorResponse(response);
      this.editEntry = null;
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * Edit a missing timesheet entry
   * @param {TimesheetMissingModel} timesheet
   */
  @action
  editEntryAction(timesheet) {
    this._setupEdit(timesheet);
  }

  /**
   * Cancel editing an entry
   */

  @action
  cancelEntryAction() {
    this.editEntry = null;
  }

  /**
   * Save an entry
   * @param model
   * @param {boolean} isValid
   * @param {TimesheetMissingModel} nextEntry
   * @private
   */

  _saveEntry(model, isValid, nextEntry) {
    if (!isValid) {
      return;
    }

    if (model.create_entry) {
      this.shiftManage.checkDateTime(model.position_id, model.new_on_duty, model.new_off_duty, () => this._checkSaveOverlap(model, nextEntry));
    } else {
      this._saveCommon(model, nextEntry);
    }
  }

  _checkSaveOverlap(model, nextEntry) {
    this.shiftManage.checkForOverlap(this.args.person.id, model.new_on_duty, model.new_off_duty, null, () => this._saveCommon(model, nextEntry));
  }

  _saveCommon(model, nextEntry) {
    const createEntry = model.create_entry;
    this.house.saveModel(model, 'Missing timesheet entry has been successfully updated.',
      async () => {
        this.editEntry = null;
        this.nextEntry = null;
        this.newEntry = null;
        this.havePartnerTimesheet = null;

        const {timesheets, onChange} = this.args;
        // Refresh the timesheet entries if a new one was created
        if (createEntry && timesheets) {
          try {
            this.isSubmitting = true;
            await timesheets.update();
          } catch (response) {
            this.house.handleErrorResponse(response);
          } finally {
            this.isSubmitting = false;
          }
        }

        if (nextEntry) {
          await this._setupEdit(nextEntry);
        }

        onChange();
      });
  }

  @action
  viewEntryAction(entry) {
    this.viewEntry = entry;
  }

  @action
  closeViewEntry() {
    this.viewEntry = null;
  }

  /**
   * Save an entry
   * @param model
   * @param isValid
   */

  @action
  saveEntryAction(model, isValid) {
    this._saveEntry(model, isValid);
  }

  /**
   * Save an entry and then edit the next entry for review
   *
   * @param model
   * @param {boolean} isValid
   */

  @action
  saveAndManageNextEntryAction(model, isValid) {
    this._saveEntry(model, isValid, this.nextEntry);
  }

  /**
   * Delete a missing timesheet request. Confirm with the user they actually want to do this.
   */

  @action
  deleteEntryAction() {
    const ts = this.editEntry;
    this.modal.confirm('Delete Missing Timesheet',
      `Position: ${ts.position.title}<br>Time: ${ts.on_duty} to ${ts.off_duty}<br> Are you sure you wish to delete this timesheet?`,
      async () => {
        try {
          this.isSubmitting = true;
          await ts.destroyRecord();
          this.toast.success('The entry has been deleted.');
          this.editEntry = null;
        } catch (response) {
          this.house.handleErrorResponse(response);
        } finally {
          this.isSubmitting = false;
        }
      });
  }

  /**
   * View a partner's timesheet
   *
   * @param {Object} partner
   */

  @action
  async viewPartnerTimesheetAction(partner) {
    try {
      this.isSubmitting = true;
      const {timesheet} = await this.ajax.request('timesheet', {
        data: {
          year: this.args.year,
          person_id: partner.person_id
        }
      });
      this.havePartnerTimesheet = true;
      this.partnerTimesheet = timesheet;
      this.partnerCallsign = partner.callsign;
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * Called when user chooses a new review status. If approving a request, show the
   * timesheet entry fields for the new entry.
   *
   * @param {string} field
   * @param {string} value
   */

  @action
  statusChangeAction(field, value) {
    if (value === APPROVED) {
      (this.newEntry || this.editEntry)['create_entry'] = 1;
    }
  }

  /**
   * Setup to show a new missing timesheet request dialog
   */
  @action
  newEntryAction() {
    const {person, positions} = this.args;
    if (!positions.length) {
      this.modal.info('No positions', `${person.callsign} has no positions granted. A missing timesheet request cannot be created.`);
      return;
    }
    this.newEntry = this.store.createRecord('timesheet-missing', {
      person_id: person.id,
      position_id: positions.find((p) => p.id === DIRT) ? DIRT : positions[0]?.id,
      review_status: PENDING,
    });
  }

  /**
   * Cancel a new missing timesheet request
   */
  @action
  cancelNewEntryAction() {
    this.newEntry = null;
  }

  /**
   * Create a new missing timesheet request
   *
   * @param model
   * @param {boolean} isValid
   */
  @action
  createEntryAction(model, isValid) {
    if (!isValid) {
      return;
    }

    this.shiftManage.checkDateTime(model.position_id, model.on_duty, model.off_duty, () => model.create_entry ? this._checkForCreateOverlap(model) : this._createCommon(model));
  }

  _checkForCreateOverlap(model) {
    this.shiftManage.checkForOverlap(this.args.person.id, model.on_duty, model.off_duty, null, () => this._createCommon(model));
  }

  _createCommon(model) {
    this.house.saveModel(model, 'A new missing timesheet request has been successfully created.',
      async () => {
        this.newEntry = null;
        try {
          const {timesheets, onChange} = this.args;
          this.isSubmitting = false;
          model.additional_admin_notes = null;
          model.additional_wranger_notes = null;
          model.additional_reviewer_notes = null;
          await this.args.timesheetMissing.update();
          if (model.create_entry) {
            await timesheets?.update();
          }
          onChange?.();
        } catch (response) {
          this.house.handleErrorResponse(response);
        } finally {
          this.isSubmitting = false;
        }
      });
  }

  get canManageTimesheets() {
    return this.session.hasRole([ADMIN, TIMESHEET_MANAGEMENT]);
  }

  @cached
  get timeWarningsMessage() {
    const tw = this.editEntry.time_warnings;

    return htmlSafe(
      this._alertRange('On Duty', tw.start, tw.start_status, tw.begins, tw.ends)
      + this._alertRange('Off Duty', tw.finished, tw.finished_status, tw.begins, tw.ends)
    );
  }

  _alertRange(label, date, status, begins, ends) {
    if (status === 'success') {
      return '';
    }

    if (status === 'before-begins') {
      return `<li >The ${label} time ${shiftFormat([date], {})} <b class="text-danger">is BEFORE the first shift</b> starting on ${shiftFormat([begins], {})}.</li>`;
    } else {
      return `<li>The ${label} time ${shiftFormat([date], {})} <b class="text-danger">is AFTER the last shift</b> ending on ${shiftFormat([ends], {})}.</li>`;
    }
  }
}

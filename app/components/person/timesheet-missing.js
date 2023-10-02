import Component from '@glimmer/component';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';
import {validatePresence} from 'ember-changeset-validations/validators';
import validateDateTime from 'clubhouse/validators/datetime';
import validatePresenceIf from 'clubhouse/validators/presence-if';

import {DIRT} from 'clubhouse/constants/positions';
import {TIMESHEET_MANAGEMENT} from 'clubhouse/constants/roles';

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
  @service store;
  @service toast;


  hasTimesheetManagement = this.session.hasRole(TIMESHEET_MANAGEMENT);

  reviewOptions = [
    'approved',
    'rejected',
    'pending'
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
        if_blank: 'additional_reviewer_notes',
        message: 'Either a requester or reviewer note must be entered.'
      })]

      this.newEntryValidations.additional_reviewer_notes = [validatePresenceIf({
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
      timesheet.set('new_on_duty', timesheet.on_duty);
      timesheet.set('new_off_duty', timesheet.off_duty);
      timesheet.set('new_position_id', timesheet.position_id);
      timesheet.set('create_entry', 0);
      timesheet.set('additional_notes', '');
      timesheet.set('additional_reviewer_notes', '');

      this.editEntry = timesheet;
      this.nextEntry = nextEntry;
      this.editEntry = timesheet;
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
   * Suggest a starting date for the datetime picker when creating a new request.
   * @returns {string|null}
   */

  get startDateForEntry() {
    if (this.newEntry.isNew) {
      return `${this.args.year}-08-15`;
    }

    return null;
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

    const createEntry = model.create_entry;
    this.toast.clear();
    this.house.saveModel(model, 'Missing timesheet entry has been successfully updated.',
      async () => {
        this.editEntry = null;
        this.nextEntry = null;
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
   * Obtain the earliest start date allowed
   *
   * @returns {string}
   */

  get minDate() {
    return `${this.args.year}-07-01`;
  }

  /**
   * Obtain the latest start date allowed
   *
   * @returns {string}
   */

  get maxDate() {
    return `${this.args.year}-10-31`;
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
    if (value === 'approved') {
      this.editEntry.set('create_entry', 1);
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
      position_id: positions.find((p) => p.id === DIRT) ? DIRT : positions[0]?.id
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

    this.house.saveModel(model, 'A new missing timesheet request has been successfully created.',
      async () => {
        this.newEntry = null;
        try {
          this.isSubmitting = false;
          await this.args.timesheetMissing.update();
        } catch (response) {
          this.house.handleErrorResponse(response);
        } finally {
          this.isSubmitting = false;
        }
      });
  }
}

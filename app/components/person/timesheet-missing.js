import Component from '@glimmer/component';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {inject as service} from '@ember/service';
import {validatePresence} from 'ember-changeset-validations/validators';
import validateDateTime from 'clubhouse/validators/datetime';

export default class PersonTimesheetMissingComponent extends Component {
  @tracked newEntry = null;
  @tracked editEntry = null;
  @tracked nextEntry = null;

  @tracked havePartnerTimesheet = false;
  @tracked partnerCallsign = null;
  @tracked partnerInfo = null;
  @tracked partnerTimesheet = null;

  @service ajax;
  @service house;
  @service modal;
  @service store;
  @service toast;

  reviewOptions = [
    'approved',
    'rejected',
    'pending'
  ];

  timesheetValidations = {
    new_on_duty: [
      validateDateTime({
        before: 'new_off_duty',
        if_set: 'create_entry'
      }),
      validatePresence({presence: true})
    ],
    new_off_duty: [
      validateDateTime({
        after: 'new_on_duty',
        if_set: 'create_entry'
      }),
      validatePresence({presence: true})
    ],
  };

  newEntryValidations = {
    on_duty: [validateDateTime({before: 'off_duty'}), validatePresence({presence: true})],
    off_duty: [validateDateTime({after: 'on_duty'}), validatePresence({presence: true})],
    additional_notes: [validatePresence({presence: true})],
  };

  /**
   * Setup to edit a Missing Timesheet request.
   * - Find the position of the entry in the Missing Timesheet list
   * - Find the next entry that needs attention after this one.
   * - Reload the entry so the most recent version is edited.
   * @param {TimesheetMissingModel} timesheet
   * @private
   */

  _setupEdit(timesheet) {
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

    timesheet.reload().then(() => {
      timesheet.set('new_on_duty', timesheet.on_duty);
      timesheet.set('new_off_duty', timesheet.off_duty);
      timesheet.set('new_position_id', timesheet.position_id);
      timesheet.set('create_entry', 0);

      this.nextEntry = nextEntry;
      this.editEntry = timesheet;
      this.partnerInfo = timesheet.partner_info;
      this.havePartnerTimesheet = false;
    }).catch((response) => {
      this.house.handleErrorResponse(response);
      this.editEntry = null;
    });
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
    this.house.saveModel(model, 'Missing timesheet entry has been successfully updated.', () => {
      this.editEntry = null;
      this.nextEntry = null;
      this.havePartnerTimesheet = null;

      const {timesheets, onChange} = this.args;
      // Refresh the timesheet entries if a new one was created
      if (createEntry && timesheets) {
        timesheets.update();
      }

      if (nextEntry) {
        this._setupEdit(nextEntry);
      }

      onChange();
    });
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
      () => {
        ts.destroyRecord().then(() => {
          this.toast.success('The entry has been deleted.');
          this.editEntry = null;
        }).catch((response) => this.house.handleErrorResponse(response));
      });
  }

  /**
   * View a partner's timesheet
   *
   * @param {Object} partner
   */

  @action
  viewPartnerTimesheetAction(partner) {
    this.ajax.request('timesheet', {data: {year: this.args.year, person_id: partner.person_id}})
      .then((result) => {
        this.havePartnerTimesheet = true;
        this.partnerTimesheet = result.timesheet;
        this.partnerCallsign = partner.callsign;
      }).catch((response) => this.house.handleErrorResponse(response));
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
    this.newEntry = this.store.createRecord('timesheet-missing', {
      person_id: person.id,
      position_id: positions.firstObject.id
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
      () => {
        this.newEntry = null;
        this.args.timesheetMissing.update();
      });
  }
}

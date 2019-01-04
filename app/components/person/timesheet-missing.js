import Component from '@ember/component';
import { action } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';

import { argument } from '@ember-decorators/argument';
import { validatePresence } from 'ember-changeset-validations/validators';
import validateDateTime from 'clubhouse/validators/datetime';

export default class PersonTimesheetMissingComponent extends Component {
  @argument timesheetMissing; // Missing Timesheet Requests
  @argument timesheets;       // The timesheets
  @argument person;           // The person we're dealing with
  @argument positions;        // The possible positions a person can be in.
  @argument year;             // The year being viewed

  @service store;

  reviewOptions = [
    'approved',
    'rejected',
    'pending'
  ];

  timesheetValidations = {
    new_on_duty:  [ validateDateTime({ before: 'new_off_duty', if_set: 'create_entry'}), validatePresence({ presence: true })],
    new_off_duty:  [ validateDateTime({ after: 'new_on_duty', if_set: 'create_entry'}), validatePresence({ presence: true }) ],
  };

  newEntryValidations = {
    on_duty:  [ validateDateTime({ before: 'off_duty'}), validatePresence({ presence: true })],
    off_duty:  [ validateDateTime({ after: 'on_duty'}), validatePresence({ presence: true }) ],
    notes:  [ validatePresence({ presence: true }) ],
  };

  // Setup to edit a requets
  _setupEdit(timesheet) {
    let idx = this.timesheetMissing.indexOf(timesheet);
    let nextEntry;

    // Find the next entry that may need managing.
    if (idx >= 0) {
      idx++;
      while (idx < this.timesheetMissing.length) {
        const entry = this.timesheetMissing.objectAt(idx);
        if (entry.isPending) {
            nextEntry = entry;
            break;
        }

        idx++;
      }
    }

    timesheet.set('new_on_duty', timesheet.on_duty);
    timesheet.set('new_off_duty', timesheet.off_duty);
    timesheet.set('new_position_id', timesheet.position_id);
    timesheet.set('create_entry', 0);

    this.set('nextEntry', nextEntry);
    this.set('editEntry', timesheet);
    this.set('partnerInfo', timesheet.partner_info);
    this.set('havePartnerTimesheet', false);
  }

  @action
  editEntryAction(timesheet) {
    this._setupEdit(timesheet);
  }

  @action
  cancelEntryAction() {
    this.set('editEntry', null);
  }

  _saveEntry(model, isValid, nextEntry) {
    if (!isValid) {
      return;
    }

    const createEntry = model.get('create_entry');
    this.toast.clear();
    this.house.saveModel(model, 'Missing timesheet entry has been successfully updated.', () => {
      this.set('editEntry', null);
      this.set('nextEntry', null);
      this.set('havePartnerTimesheet', null);

      // Refresh the timesheet entries if a new one was created
      if (createEntry && this.timesheets) {
        this.timesheets.update();
      }

      if (nextEntry) {
        this._setupEdit(nextEntry);
      }
    });
  }

  @action
  saveEntryAction(model, isValid) {
    this._saveEntry(model, isValid);
  }

  @action
  saveAndManageNextEntryAction(model, isValid) {
    this._saveEntry(model, isValid, this.get('nextEntry'));
  }

  @action
  removeEntryAction(timesheet) {
    this.modal.confirm('Remove Missing Timesheet', `Position: ${timesheet.position.title}<br>Time: ${timesheet.on_duty} to ${timesheet.off_duty}<br> Are you sure you wish to remove this timesheet?`, () => {
      timesheet.destroyRecord().then(() => {
        this.toast.success('The entry has been deleted.');
      }).catch((response) => this.house.handleErrorResponse(response));
    });
  }

  // View the partner's timesheet entries for a given year.
  @action
  viewPartnerTimesheetAction(partner) {
    this.ajax.request('timesheet', { data: { year: this.year, person_id: partner.person_id }}).then((result) => {
      this.set('havePartnerTimesheet', true);
      this.set('partnerTimesheet', result.timesheet);
      this.set('partnerCallsign', partner.callsign);
    }).catch((response) => this.house.handleErrorResponse(response));
  }

  // If the review status changed to approved, go ahead
  // and mark the create a new entry flag
  @action
  statusChangeAction(field, value) {
    if (value == 'approved') {
      this.editEntry.set('create_entry', 1);
    }
  }

  // Create a new missing timesheet request
  @action
  newEntryAction() {
    this.set('newEntry', this.store.createRecord('timesheet-missing', {
      person_id: this.person.id,
      position_id: this.positions.firstObject.id
    }));
  }

  // Cancel out creating a new entry
  @action
  cancelNewEntryAction() {
    this.set('newEntry', null);
  }

  // Save/create a new entry
  @action
  createEntryAction(model, isValid) {
    if (!isValid) {
      return;
    }

    this.house.saveModel(model, 'A new missing timesheet request has been succesfully created.', () => {
      this.set('newEntry', null);
      this.timesheetMissing.update();
    });

  }
}

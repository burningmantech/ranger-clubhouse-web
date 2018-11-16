import Component from '@ember/component';
import { action } from '@ember-decorators/object';
import { service } from '@ember-decorators/service';

import { argument } from '@ember-decorators/argument';
import { validatePresence } from 'ember-changeset-validations/validators';
import validateDateTime from 'clubhouse/validators/datetime';

export default class PersonTimesheetMissingComponent extends Component {
  @argument timesheetMissing;
  @argument timesheets;
  @argument person;
  @argument positions;
  @argument year;

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

  @action
  editTimesheetAction(timesheet) {
    timesheet.set('new_on_duty', timesheet.on_duty);
    timesheet.set('new_off_duty', timesheet.off_duty);
    timesheet.set('new_position_id', timesheet.position_id);
    timesheet.set('create_entry', 0);

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

    const createEntry = model.get('create_entry');
    this.toast.clearMessages();
    this.house.saveModel(model, 'Missing timesheet entry has been successfully updated.', () => {
      this.set('editTimesheet', null);
      if (createEntry && this.timesheets) {
        this.timesheets.update();
      }
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

  @action
  statusChangeAction(field, value) {
    if (value == 'approved') {
      this.editTimesheet.set('create_entry', 1);
    }
  }

  @action
  newEntryAction() {
    this.set('newEntry', this.store.createRecord('timesheet-missing', {
      person_id: this.person.id,
      position_id: this.positions.firstObject.id
    }));
  }

  @action
  cancelNewEntryAction() {
    this.set('newEntry', null);
  }

  @action
  createEntryAction(model, isValid) {
    if (!isValid) {
      return;
    }

    this.house.saveModel(model, 'A new missing timesheet request has been succesfully created.', () => {
      this.set('newEntry', 0);
      this.timesheetMissing.update();
    });

  }
}

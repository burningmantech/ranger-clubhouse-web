import Component from '@glimmer/component';
import {service} from '@ember/service';
import {tracked} from '@glimmer/tracking';

const ACTION_LABELS = {
  'signon': 'Shift started',
  'signoff': 'Shift ended',
  'update': 'Updated',
  'delete': 'Deleted',
  'confirmed': 'Entire timesheet confirmed',
  'unconfirmed': 'Entire timesheet unconfirmed',
  'unverified': 'Unverified',
  'verify': 'Verified',
  'created': 'Created'
};


export default class PersonTimesheetLogComponent extends Component {
  @service ajax;
  @service house;

  @tracked isLoading = true;
  @tracked logs;
  @tracked otherLogs;

  constructor() {
    super(...arguments);

    this._loadLogs();
  }

  async _loadLogs() {
    try {
      const result = await this.ajax.request(`timesheet/log`, {
        data: {person_id: this.args.person.id, year: this.args.year}
      });

      this.logs = result.logs;
      this.otherLogs = result.other_logs;
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isLoading = false;
    }
  }


  actionLabel(act) {
    return ACTION_LABELS[act] ?? act;
  }
}

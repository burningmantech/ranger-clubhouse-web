import Component from '@glimmer/component';
import {service} from '@ember/service';
import {tracked} from '@glimmer/tracking';
import {buildBlockerAuditLabels} from "clubhouse/models/timesheet";
import {htmlSafe} from '@ember/template';
import {escape} from 'lodash';
import {action} from '@ember/object';

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

      this.positions = (await this.ajax.request('position')).position;
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isLoading = false;
    }
  }


  actionLabel(act) {
    return ACTION_LABELS[act] ?? act;
  }

  forceReasons(data) {
    const {forced} = data;
    if (forced === true) {
      // New 2025 format.
      return htmlSafe(buildBlockerAuditLabels(data.blockers).map(blocker => `<div class="text-danger">${blocker}</div><div>Force Reason:<br>${escape(data.signin_force_reason)}</div>`).join(''));
    } else {
      return htmlSafe(`<div class="text-danger">Forced - Unqualified "{{data.forced.message}}"</div>`);
    }
  }

  @action
  positionTitle(positionId) {
    positionId = +positionId;
    return this.positions.find((p) => p.id === positionId)?.title ?? `Position #${positionId}`;
  }
}

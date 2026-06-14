import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';

export default class PersonScheduleLogComponent extends Component {
  @tracked isLoading;
  @tracked auditLogs;

  @service ajax;
  @service errors;
  constructor() {
    super(...arguments);
    this.personId = +this.args.person.id; // stored as  string sometime. grr.
    this._loadAuditLogs();
  }

  async _loadAuditLogs() {
    this.isLoading = true;
    try {
      const {logs} = await this.ajax.request(`person/${this.personId}/schedule/log`, {data: {year: this.args.year}});
      this.auditLogs = logs;
    } catch (response) {
      this.errors.handleErrorResponse(response);
    } finally {
      this.isLoading = false;
    }
  }

  get isBefore2019() {
    return this.args.year < 2019;
  }
}

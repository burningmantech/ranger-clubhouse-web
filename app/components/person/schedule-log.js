import Component from '@glimmer/component';
import {tracked} from '@glimmer/tracking';
import {service} from '@ember/service';

export default class PersonScheduleLogComponent extends Component {
  @tracked isLoading;
  @tracked auditLogs;

  @service ajax;
  @service house;

  constructor() {
    super(...arguments);
    this.personId = +this.args.person.id; // stored as  string sometime. grr.
    this.isLoading = true;
    this.ajax.request(`person/${this.personId}/schedule/log`, {data: {year: this.args.year}})
      .then(({logs}) => this.auditLogs = logs)
      .catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isLoading = false);
  }

  get isBefore2019() {
    return this.args.year < 2019;
  }
}

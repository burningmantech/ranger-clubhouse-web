import Component from '@glimmer/component';
import { action }from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class PersonScheduleLogComponent extends Component {
  @service ajax;
  @service house;

  @tracked showLog = false
  @tracked isLoading = false;

  constructor() {
    super(...arguments);
    this.personId = +this.args.person.id; // stored as  string sometime. grr.
  }
  @action
  showLogAction() {
    this.isLoading = true;
    this.ajax.request(`person/${this.args.person.id}/schedule/log`, { data: { year: this.args.year }})
      .then((result) => {
        this.showLog = true;
        this.logs = result.logs;
      }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => this.isLoading = false);
  }

  @action
  closeAction() {
    this.showLog = false;
  }
}

import Component from '@glimmer/component';
import {service} from '@ember/service';
import {tracked} from '@glimmer/tracking';

export default class ScheduledHoursCreditsComponent extends Component {
  @service ajax;
  @service house;

  @tracked scheduleSummary;
  @tracked isLoading = true;

  constructor() {
    super(...arguments);

    this._loadSummary();
  }

  async _loadSummary() {
    try {
      this.scheduleSummary = await this.ajax.request(`person/${this.args.person.id}/schedule/summary`, {data: {year: this.args.year}})
        .then(({summary}) => summary);
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isLoading = false;
    }
  }
}

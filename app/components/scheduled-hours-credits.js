import Component from '@glimmer/component';
import {service} from '@ember/service';
import {tracked} from '@glimmer/tracking';

export default class ScheduledHoursCreditsComponent extends Component {
  @service ajax;
  @service errors;
  @tracked scheduleSummary;
  @tracked isLoading = true;

  constructor() {
    super(...arguments);

    this._loadSummary();
  }

  async _loadSummary() {
    try {
      const {summary} = await this.ajax.request(`person/${this.args.person.id}/schedule/summary`, {data: {year: this.args.year}});
      this.scheduleSummary = summary;
    } catch (response) {
      this.errors.handleErrorResponse(response);
    } finally {
      this.isLoading = false;
    }
  }
}

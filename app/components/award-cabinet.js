import Component from '@glimmer/component';
import {service}from '@ember/service';
import {tracked} from '@glimmer/tracking';

export default class AwardCabinetComponent extends Component {
  @service ajax;
  @service errors;
  @tracked isLoading = false;
  @tracked special;
  @tracked positions;
  @tracked teams;

  constructor() {
    super(...arguments);

    this._loadAwards();
  }

  async _loadAwards() {
    this.isLoading = true;
    try {
      const {teams,special,positions} = await this.ajax.request(`person-award/person/${this.args.person.id}/awards`);

      this.teams = teams;
      this.special = special;
      this.positions = positions;
    } catch (e) {
      this.errors.handleErrorResponse(e);
    } finally {
      this.isLoading = false;
    }
  }
}

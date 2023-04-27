import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class PersonTicketsProvisionsController extends ClubhouseController {
  @tracked isLoading = false;
  @tracked documents;
  @tracked ticketingInfo;
  @tracked ticketingPackage;
  @tracked provisions;

  @action
  async loadStuff() {
    this.isLoading = true;
    const data = { person_id: this.person.id };

    try {
      this.documents = await this.store.query('access-document', data);
      this.provisions = await this.store.query('provision', data);
      this.ticketingInfo = await this.ajax.request(`ticketing/info`).then(({ticketing_info}) => ticketing_info);
      this.ticketingPackage = await this.ajax.request(`ticketing/${this.person.id}/package`).then((results) => results.package);
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isLoading = false;
    }
  }
}

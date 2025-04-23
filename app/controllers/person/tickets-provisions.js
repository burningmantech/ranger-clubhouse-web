import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import BmidModel from "clubhouse/models/bmid";

export default class PersonTicketsProvisionsController extends ClubhouseController {
  @tracked isLoading = false;
  @tracked documents;
  @tracked ticketingInfo;
  @tracked ticketingPackage;
  @tracked bmid;

  @action
  async loadStuff() {
    this.isLoading = true;
    const data = {person_id: this.person.id};

    try {
      this.documents = await this.store.query('access-document', data);
      this.ticketingInfo = (await this.ajax.request(`ticketing/info`)).ticketing_info;
      this.ticketingPackage = (await this.ajax.request(`ticketing/${this.person.id}/package`)).package;
      const {bmid} = await this.ajax.request(`bmid/manage-person`, {
        data: {
          person_id: this.person.id,
          year: this.house.currentYear()
        }
      });
      this.bmid = BmidModel.pushToStore(this, bmid)
    } catch (response) {
      this.house.handleErrorResponse(response);
    } finally {
      this.isLoading = false;
    }
  }
}

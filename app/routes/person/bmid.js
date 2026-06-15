import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import BmidModel from "clubhouse/models/bmid";

export default class PersonBmidRoute extends ClubhouseRoute {
  async model() {
    const person_id = this.modelFor('person').id;
    return {
      bmid: (await this.ajax.request(`bmid/manage-person`, { data: { person_id, year: this.session.currentYear() }})).bmid,
      ticketingInfo: (await this.ajax.request('ticketing/info')).ticketing_info
    };
  }

  setupController(controller, {bmid, ticketingInfo}) {
    this.store.unloadAll('bmid');

    controller.bmid = BmidModel.pushToStore(this, bmid);
    controller.person = this.modelFor('person');
    controller.year = this.session.currentYear();
    controller.ticketingInfo = ticketingInfo;
  }
}

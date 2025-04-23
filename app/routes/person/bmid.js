import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import RSVP from 'rsvp';
import BmidModel from "clubhouse/models/bmid";

export default class PersonBmidRoute extends ClubhouseRoute {
  model() {
    const person_id = this.modelFor('person').id;
    return RSVP.hash({
      bmid: this.ajax.request(`bmid/manage-person`, { data: { person_id, year: this.house.currentYear() }}).then((result) => result.bmid),
      ticketingInfo: this.ajax.request('ticketing/info').then((result) => result.ticketing_info)
    });
  }

  setupController(controller, {bmid, ticketingInfo}) {
    this.store.unloadAll('bmid');

    controller.bmid = BmidModel.pushToStore(this, bmid);
    controller.person = this.modelFor('person');
    controller.year = this.house.currentYear();
    controller.ticketingInfo = ticketingInfo;
  }
}

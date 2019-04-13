import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default class PersonBmidRoute extends Route {
  model() {
    const person_id = this.modelFor('person').id;
    return RSVP.hash({
      bmid: this.ajax.request(`bmid/manage-person`, { data: { person_id, year: this.house.currentYear() }}).then((result) => result.bmid),
      ticketingInfo: this.ajax.request('ticketing/info').then((result) => result.ticketing_info)
    });
  }

  setupController(controller, model) {
    let bmid;
    this.store.unloadAll('bmid');

    if (model.bmid.id) {
      bmid = this.house.pushPayload('bmid', model.bmid);
    } else {
      bmid = this.store.createRecord('bmid', model.bmid);
    }

    controller.set('bmid', bmid);
    controller.set('person', this.modelFor('person'));
    controller.set('year', this.house.currentYear());
    controller.set('ticketingInfo', model.ticketingInfo);
  }
}

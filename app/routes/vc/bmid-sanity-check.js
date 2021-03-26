import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import { ADMIN, EDIT_BMIDS } from 'clubhouse/constants/roles';
import requestYear from 'clubhouse/utils/request-year';
import RSVP from 'rsvp';

export default class VcBmidSanityCheckRoute extends ClubhouseRoute {
  roleRequired = [ ADMIN, EDIT_BMIDS];

  model(params) {
    const year = requestYear(params);

    return RSVP.hash({
      year,
      bmidMadHouse: this.ajax.request(`bmid/sanity-check`, { data: { year }}),
      ticketingInfo: this.ajax.request('ticketing/info').then((result) => result.ticketing_info)
    });
  }

  setupController(controller, model) {
    controller.setProperties(model);
  }
}

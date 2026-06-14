import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import { ADMIN, EDIT_BMIDS } from 'clubhouse/constants/roles';
import requestYear from 'clubhouse/utils/request-year';

export default class VcBmidSanityCheckRoute extends ClubhouseRoute {
  roleRequired = [ ADMIN, EDIT_BMIDS];

  async model(params) {
    const year = requestYear(params);

    return {
      year,
      bmidMadHouse: await this.ajax.request(`bmid/sanity-check`, { data: { year }}),
      ticketingInfo: (await this.ajax.request('ticketing/info')).ticketing_info
    };
  }

  setupController(controller, model) {
    controller.setProperties(model);
  }
}

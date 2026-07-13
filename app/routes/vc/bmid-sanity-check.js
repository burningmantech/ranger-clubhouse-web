import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import { ADMIN, EDIT_BMIDS } from 'clubhouse/constants/roles';
import requestYear from 'clubhouse/utils/request-year';

export default class VcBmidSanityCheckRoute extends ClubhouseRoute {
  roleRequired = [ ADMIN, EDIT_BMIDS];

  queryParams = {
    year: {refreshModel: true},
  };

  async model(params) {
    const year = requestYear(params);

    const [bmidMadHouse, ticketing] = await Promise.all([
      this.ajax.request(`bmid/sanity-check`, { data: { year }}),
      this.ajax.request('ticketing/info')
    ]);

    return {
      year,
      bmidMadHouse,
      ticketingInfo: ticketing.ticketing_info
    };
  }

  setupController(controller, model) {
    controller.setProperties(model);
  }
}

import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN, EDIT_BMIDS} from 'clubhouse/constants/roles';
import requestYear from 'clubhouse/utils/request-year';
import BmidModel from "clubhouse/models/bmid";

export default class VcBmidRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, EDIT_BMIDS];

  queryParams = {
    year: {refreshModel: true},
    filter: {refreshModel: true},
  };

  async model(params) {
    const year = requestYear(params);
    const filter = params.filter || 'special';

    this.store.unloadAll('bmid');

    return {
      year,
      filter,
      bmids: (await this.ajax.request(`bmid/manage`, {data: {year, filter}})).bmids,
      ticketingInfo: (await this.ajax.request('ticketing/info')).ticketing_info
    };
  }

  setupController(controller, model) {
    // Loop through the list
    const bmids = BmidModel.pushToStore(this, model.bmids);

    controller.set('bmids', bmids);
    controller.set('year', model.year);
    controller.set('filter', model.filter);
    controller.set('ticketingInfo', model.ticketingInfo);
    controller.set('sortColumn', 'callsign');
    controller.set('titleFilter', 'All');
    controller.set('teamFilter', 'All');
    controller.set('textFilterInput', '');
    controller.set('textFilter', '');
    controller.set('textFilterError', '');

    controller.set('editMode', false);
    controller._buildViewBmids();
  }

  resetController(controller) {
    // Clear up the controller - otherwise a race condition might happen
    // when refreshing the route where the same record(s) is shown between
    // two different views.
    controller.set('bmids', []);
    controller.set('renderedBmids', []);
    controller.set('entry', null);

    this.store.unloadAll('bmid');
  }
}

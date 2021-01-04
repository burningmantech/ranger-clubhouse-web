import Route from '@ember/routing/route';
import { Role } from 'clubhouse/constants/roles';
import requestYear from 'clubhouse/utils/request-year';
import RSVP from 'rsvp';

export default class VcBmidRoute extends Route {
  queryParams = {
    year: { refreshModel: true },
    filter: { refreshModel: true },
  };

  beforeModel() {
    this.house.roleCheck([ Role.ADMIN, Role.EDIT_BMIDS ]);
  }

  model(params) {
    const year = requestYear(params);
    const filter = params.filter || 'special';

    this.store.unloadAll('bmid');

    return RSVP.hash({
      year,
      filter,
      bmids: this.ajax.request(`bmid/manage`, { data: { year, filter }}).then((result) => result.bmids),
      ticketingInfo: this.ajax.request('ticketing/info').then((result) => result.ticketing_info)
    });
  }

  setupController(controller, model) {
    // Loop through the list
    const bmids = model.bmids.map((bmid) => {
      let rec;
      if (bmid.id) {
        rec = this.house.pushPayload('bmid', bmid);
      } else {
        // Potential new BMID
        rec =  this.store.createRecord('bmid', bmid);
      }

      rec.sortCallsign = (bmid.person ? bmid.person.callsign.toLowerCase() : `Deleted #${bmid.person_id}`);
      return rec;
    });

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

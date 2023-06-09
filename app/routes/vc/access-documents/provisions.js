import ClubhouseRoute from "clubhouse/routes/clubhouse-route";
import {ADMIN, EDIT_ACCESS_DOCS} from "clubhouse/constants/roles";
import {AVAILABLE, BANKED, CLAIMED, SUBMITTED} from "clubhouse/models/provision";

export default class VcAccessDocumentsProvisionsRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, EDIT_ACCESS_DOCS];

  model() {
    return this.ajax.request('provision', {
      data: {
        include_person: 1,
        status: [
          AVAILABLE, CLAIMED, BANKED, SUBMITTED
        ].join(',')
      }
    })
  }

  setupController(controller, model) {
    controller.provisions = model.provision;
    controller.typeFilter = 'all';
    controller.statusFilter = 'all';
    controller.allocatedFilter = 'all';
  }
}

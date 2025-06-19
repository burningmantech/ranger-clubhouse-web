import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN, VC} from 'clubhouse/constants/roles';

export default class VcHandleReservationsRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, VC];

  model() {
    return this.store.query('handle-reservation', {});
  }

  setupController(controller, model) {
    controller.handleReservations = model;
    controller.setupUploadForm();
    controller.haveResults = false;
    controller.typeFilter = 'all';
  }
}

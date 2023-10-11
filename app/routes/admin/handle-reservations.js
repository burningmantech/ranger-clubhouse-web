import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN} from 'clubhouse/constants/roles';

export default class HandleReservationsRoute extends ClubhouseRoute {
  roleRequired = ADMIN;

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

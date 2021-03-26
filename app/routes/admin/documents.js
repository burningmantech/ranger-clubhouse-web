import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {  ADMIN, MEGAPHONE } from 'clubhouse/constants/roles';

export default class AdminDocumentsRoute extends ClubhouseRoute {
  roleRequired = [ADMIN, MEGAPHONE];

  model() {
    this.store.unloadAll('document');
    return this.store.query('document', {});
  }

  setupController(controller, model) {
    controller.set('documents', model);
  }
}

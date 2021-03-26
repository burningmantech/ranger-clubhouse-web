import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import { ADMIN } from 'clubhouse/constants/roles';

export default class AdminSettingsRoute extends ClubhouseRoute {
  roleRequired = ADMIN;

  model() {
    this.store.unloadAll('setting');
    return this.store.findAll('setting', { reload: true });
  }

  setupController(controller, model) {
    super.setupController(...arguments);
    controller.set('settings', model);
    controller.set('filterByName', '');
  }
}

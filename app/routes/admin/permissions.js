import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import { ADMIN } from 'clubhouse/constants/roles';

export default class AdminRolesRoute extends ClubhouseRoute {
  roleRequired = ADMIN;

  async model() {
    return {
      roles: await this.store.query('role', {include_associations: 1}),
      art_positions: await this.store.query('position', {art_training: 1}),
    }
  }

  setupController(controller, model) {
    controller.entry = null;
    controller.roles =  model.roles;
    controller.art_positions = model.art_positions;
  }
}

import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN} from 'clubhouse/constants/roles';

export default class AdminPositionsRoute extends ClubhouseRoute {
  roleRequired = ADMIN;

  async model() {
    this.store.unloadAll('position');
    return {
      positions: await this.store.query('position', {include_roles: 1}),
      positionLineups: await this.store.query('position-lineup', {}),
      roles: (await this.ajax.request('role')).role,
      teams: (await this.ajax.request('team')).team,
    };
  }

  setupController(controller, model) {
    controller.setProperties({...model, position: null});
    controller.resetFilters();
  }
}

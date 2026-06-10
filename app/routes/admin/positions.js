import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN} from 'clubhouse/constants/roles';
import RSVP from 'rsvp';

export default class AdminPositionsRoute extends ClubhouseRoute {
  roleRequired = ADMIN;

  model() {
    this.store.unloadAll('position');
    return RSVP.hash({
      positions: this.store.query('position', {include_roles: 1}),
      positionLineups: this.store.query('position-lineup', {}),
      roles: this.ajax.request('role').then(({role}) => role),
      teams: this.ajax.request('team').then(({team}) => team),
    });
  }

  setupController(controller, model) {
    controller.setProperties({...model, position: null});
    controller.resetFilters();
  }
}

import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import { ADMIN } from 'clubhouse/constants/roles';
import RSVP from 'rsvp';

export default class AdminPositionRoute extends ClubhouseRoute {
  roleRequired = ADMIN;

  model() {
    this.store.unloadAll('position');
    return RSVP.hash({
      positions: this.store.query('position', {include_roles: 1}),
      roles: this.ajax.request('role').then(({role}) => role),
      teams: this.ajax.request('team').then(({team}) => team),
    });
  }

  setupController(controller, model) {
    controller.setProperties(model);
    controller.setProperties({
      position: null,
      typeFilter: 'All',
      activeFilter: 'all',
      allRangersFilter: '-',
      viewAs: 'list'
    });
  }
}

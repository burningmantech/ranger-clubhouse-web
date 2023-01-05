import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN} from 'clubhouse/constants/roles';
import RSVP from 'rsvp';

export default class AdminTeamsRoute extends ClubhouseRoute {
  roleRequired = ADMIN;

  model() {
    this.store.unloadAll('team');

    return RSVP.hash({
      teams: this.store.query('team', {include_managers: 1, include_roles: 1}),
      roles: this.ajax.request('role').then(({role}) => role)
    });
  }

  setupController(controller, model) {
    controller.setProperties(model);
    controller.set('entry', null);
    controller.set('roleById', model.roles.reduce((hash, role) => {
      hash[+role.id] = role;
      return hash;
    }, {}));
  }
}

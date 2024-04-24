import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';
import {ADMIN, TECH_NINJA} from 'clubhouse/constants/roles';
import RSVP from 'rsvp';
import _ from 'lodash';

export default class AdminTeamsRoute extends ClubhouseRoute {
  roleRequired = ADMIN;

  model() {
    this.store.unloadAll('team');

    return RSVP.hash({
      teams: this.store.query('team', {include_managers: 1, include_roles: 1}),
      roles: this.ajax.request('role').then(({role}) => role)
    });
  }

  setupController(controller, {teams, roles}) {
    controller.teams = teams;
    controller.roles = roles;
    controller.entry = null;
    controller.activeFilter = 'all';
    controller.mvrEligibilityFilter = 'all';
    controller.roleById = _.keyBy(roles, (r) => r.id);
    controller.roleOptions = roles.map((r) => ({id: r.id, title: r.title}));
    controller.isTechNinja = this.session.hasRole(TECH_NINJA);
  }
}

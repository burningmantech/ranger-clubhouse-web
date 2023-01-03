import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class ReportsPeopleByRoleRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request('person/by-role');
  }

  setupController(controller, {roles}) {
    controller.roles = roles;
    controller.filter = 'all';
  }
}

import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class ReportsPeopleByRoleRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request('role/people-by-role');
  }

  setupController(controller, {roles}) {
    controller.roles = roles;
    controller.filter = 'all';
    controller.showPerson = null;

    roles.forEach((role) => {
      role.people.forEach((person) => {
          // See if the role is only assigned thru positions which requires training
          if (!person.granted && !person.teams.length
            && person.positions.filter((p) => p.require_training_for_roles).length === person.positions.length
            && !person.positions.find((p) => p.is_trained)) {
            person.notAssigned = true;
          }
        }
      );
    })
  }
}

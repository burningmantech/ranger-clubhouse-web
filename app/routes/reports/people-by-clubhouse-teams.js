import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class ReportsPeopleByClubhouseTeamsRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request('team/people-by-teams');
  }

  setupController(controller, model) {
    controller.set('teams', model.teams);
    model.teams.forEach((team) => {
      team.managers = team.members.filter((m) => m.is_manager);
    })
  }
}

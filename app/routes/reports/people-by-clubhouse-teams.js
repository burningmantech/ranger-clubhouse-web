import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class ReportsPeopleByClubhouseTeamsRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request('team/people-by-teams');
  }

  setupController(controller, {teams}) {
    controller.teams = teams;
    controller.teamsScrollList = teams.map((t) => ({id: `team-${t.id}`, title: t.title}));
  }
}

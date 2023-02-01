import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class ReportsPeopleByClubhouseTeamsRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request('team/people-by-teams');
  }

  setupController(controller, {teams}) {
    controller.set('teams', teams);
  }
}

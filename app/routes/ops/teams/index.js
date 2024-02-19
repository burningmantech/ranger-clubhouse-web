import ClubhouseRoute from "clubhouse/routes/clubhouse-route";

export default class OpsTeamsIndexRoute extends ClubhouseRoute {
  model() {
    return this.ajax.request('team', {data: {can_manage: 1}});
  }

  setupController(controller, model) {
    controller.teams = model.team.filter((t) => t.can_manage);
  }
}

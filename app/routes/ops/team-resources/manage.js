import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class OpsTeamResourcesManageRoute extends ClubhouseRoute {
  model({team_id}) {
  return this.store.findRecord('team', team_id);
  }

  setupController(controller, model) {
    controller.team = model;
  }
}

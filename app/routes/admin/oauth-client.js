import ClubhouseRoute from "clubhouse/routes/clubhouse-route";

export default class AdminOauthClientRoute extends ClubhouseRoute {

  model() {
    return this.store.query('oauth-client', {});
  }

  setupController(controller, model) {
    controller.clients = model;
  }
}

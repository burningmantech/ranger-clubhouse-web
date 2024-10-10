import ClubhouseRoute from "clubhouse/routes/clubhouse-route";

export default class MeDirectoryRoute extends ClubhouseRoute {
  beforeModel(transition) {
    if (!this.session.user.isRanger) {
      this.toast.error('Sorry, only Rangers may view this page.');
      this.router.transitionTo('me.homepage');
    } else {
      return super.beforeModel(transition);
    }
  }

  model() {
    return this.ajax.request('team/directory');
  }

  setupController(controller, model) {
    controller.teams = model.teams;
  }
}

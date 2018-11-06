import Route from '@ember/routing/route';

export default class IndexRoute extends Route {
  beforeModel() {
    if (this.session.isAuthenticated) {
      this.transitionTo('me.overview');
    } else {
      this.transitionTo('/login');
    }
  }
}

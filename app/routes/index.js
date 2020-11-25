import Route from '@ember/routing/route';

export default class IndexRoute extends Route {
  beforeModel() {
    if (this.session.isAuthenticated) {
      this.transitionTo('me.homepage');
    } else {
      this.transitionTo('/login');
    }
  }
}

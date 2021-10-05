import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class IndexRoute extends ClubhouseRoute {
  beforeModel() {
    if (this.session.isAuthenticated) {
      this.router.transitionTo('me.homepage');
    } else {
      this.router.transitionTo('/login');
    }
  }
}

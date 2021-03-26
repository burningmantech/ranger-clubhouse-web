import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class IndexRoute extends ClubhouseRoute {
  beforeModel() {
    if (this.session.isAuthenticated) {
      this.transitionTo('me.homepage');
    } else {
      this.transitionTo('/login');
    }
  }
}

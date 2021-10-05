import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class LogoutRoute extends ClubhouseRoute {
  requireAuthentication = false;

  beforeModel() {
    this.house.clearStorage();

    // Bu-bye!
    this.session.invalidate();
    this.router.transitionTo('login');
  }
}

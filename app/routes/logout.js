import ClubhouseRoute from 'clubhouse/routes/clubhouse-route';

export default class LogoutRoute extends ClubhouseRoute {
  requireAuthentication = false;

  beforeModel() {
    this.storage.clearStorage();

    // Bu-bye!
    this.session.invalidate();
    this.router.transitionTo('login');
  }
}

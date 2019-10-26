import Route from '@ember/routing/route';

export default class LogoutRoute extends Route {
  beforeModel() {
    this.house.clearStorage();

    // Bu-bye!
    this.session.invalidate();
    this.transitionTo('login');
  }
}

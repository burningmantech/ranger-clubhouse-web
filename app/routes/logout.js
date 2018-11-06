import Route from '@ember/routing/route';

export default class LogoutRoute extends Route {
  beforeModel() {
    // Bu-bye!
    this.session.invalidate();
  }
}

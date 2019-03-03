import Route from '@ember/routing/route';
import setCookie from 'clubhouse/utils/set-cookie';

export default class LogoutRoute extends Route {
  beforeModel() {
    // Invalidate the existing Classic clubhouse cookie
    setCookie('PHPSESSID', 'nothing', 0);
    setCookie('C2AUTHTOKEN', 'nothing', 0);

    // Bu-bye!
    this.session.invalidate();
    this.transitionTo('login');
  }
}

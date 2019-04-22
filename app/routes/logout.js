import Route from '@ember/routing/route';
import setCookie from 'clubhouse/utils/set-cookie';

/*
 * The logout route is for CH1 to CH2 routing.
 */

export default class LogoutRoute extends Route {
  beforeModel() {
    // Invalidate the existing Classic clubhouse cookie
    setCookie('PHPSESSID', 'nothing', 0);
    setCookie('C2AUTHTOKEN', 'nothing', 0);

    this.house.clearStorage();

    // Bu-bye!
    this.session.invalidate();
    this.transitionTo('login');
  }
}

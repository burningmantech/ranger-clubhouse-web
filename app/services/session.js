import {inject as service} from "@ember/service";
import {action} from '@ember/object';
import SessionService from "ember-simple-auth/services/session";
import User from "clubhouse/models/user";
import MobileDetect from 'mobile-detect';
import {debounce} from '@ember/runloop';
import ENV from 'clubhouse/config/environment';
import {config} from 'clubhouse/utils/config';
import {tracked} from '@glimmer/tracking';
import {Role} from 'clubhouse/constants/roles';

const MOBILE_MAX_WIDTH = 834;
const RESIZE_DEBOUNCE_DELY = 250;

export default class extends SessionService {
  @service ajax;
  @service router;

  @tracked user = null;
  @tracked unreadMessageCount = 0;

  // Temporary login token used to login & change or set the password.
  // Token becomes invalid once the password has changed.
  tempLoginToken = null;

  // Is this a PNV first time login?
  isWelcome = null;

  // Is a mobile device/cellphone being used
  isMobileDevice = false;

  // Is a tablet being used?
  isTabletDevice = false;

  // True if the mobile screen size is less than MOBILE_MAX_WIDTH
  @tracked isMobileScreen = false;

  get userId() {
    return (this.isAuthenticated && this.user) ? +this.user.id : null;
  }

  constructor() {
    super(...arguments);

    const md = new MobileDetect(navigator.userAgent);
    this.isMobileDevice = md.mobile();
    this.isTabletDevice = md.tablet();

    /*
     * Notify when the screen resizes so the layout can adjust accordingly.
      */

    this._windowResized();
    window.addEventListener('resize', this._bounceResizeEvent, false);

    this.isDevelopment = ENV.environment === 'development';
  }

  /**
   * Checks to see if the user has the Login Management role OR
   * @returns {boolean}
   */
  get isLMOPEnabled() {
    return (this.user.hasRole(Role.MANAGE) && !!config('LoginManageOnPlayaEnabled'));
  }

  @action
  _bounceResizeEvent() {
    debounce(this, this._windowResized, RESIZE_DEBOUNCE_DELY);
  }

  _windowResized() {
    this.isMobileScreen = (document.documentElement.clientWidth <= MOBILE_MAX_WIDTH);
  }

  /**
   * Called from ember-simple-auth when the addon receives a valid authentication token
   * from the backend.
   *
   * The grab the user info, and if login was done via a token (for either password
   * reset or first time PNV login) transition to the appropriate me page.
   * Otherwise let the addon transition to another page if the user attempted to visit a page without
   * being logged in first. (e.g. user hits /reports/blah but is not logged in, Clubhouse
   * shows the login page, user logs in, ember-simple-auth transitions to /reports/blah)
   *
   * @returns {Promise<void>}
   */
  handleAuthentication() {
    return this.loadUser().then(() => {
      if (this.tempLoginToken) {
        // Go to the PNV Welcome Page or password reset page.
        this.router.transitionTo(this.isWelcome ? 'me.welcome' : 'me.password');
      } else {
        // Allow the addon to transition to the page visited before user was logged in.
        super.handleAuthentication(...arguments);
      }
    });
  }

  /**
   * Called when.session.invalidate() is called or when the the authentication token expires.
   *
   * Clear out the current user and any session preferences from local storage.
   */

  handleInvalidate() {
    this.user = null;
    this.house.clearStorage();
    super.handleInvalidate(...arguments);
  }

  /**
   * Retrieve the user info from the backend. Called from a variety of locations:
   *
   * - route/application.js When the app is refreshed and the user was already logged in
   * - from here, via an event, when an authentication token was successfully retrieved
   * - when the user updates their own roles, positions, or personal info (via person manage)
   * - when the user signs themselves in to or out of a shift.
   *
   * @returns {Promise<void>|PromiseLike<void>|Promise<void>}
   */

  loadUser() {
    if (!this.isAuthenticated) {
      return Promise.resolve();
    }

    const person_id = this.data.authenticated.tokenData.sub;
    return this.ajax.request(`person/${person_id}/user-info`)
      .then(({user_info}) => {
        this.user = new User(user_info);
        this.unreadMessageCount = user_info.unread_message_count;
      });
  }

  get isStaging() {
    return config('DeploymentEnvironment') === 'Staging' && !this.isDevelopment;
  }

  get isTraining() {
    return config('DeploymentEnvironment') === 'Training';
  }
}


import {service} from "@ember/service";
import {action} from '@ember/object';
import {typeOf} from '@ember/utils';
import {debounce} from '@ember/runloop';
import {tracked} from '@glimmer/tracking';
import SessionService from "ember-simple-auth/services/session";
import User from "clubhouse/models/user";
import ENV from 'clubhouse/config/environment';
import {config} from 'clubhouse/utils/config';
import {ADMIN, MANAGE, VC, VIEW_PII, VIEW_EMAIL} from 'clubhouse/constants/roles';
import MobileDetect from 'mobile-detect';
import BrowserDetector from "../utils/browser-detect";

const MOBILE_MAX_WIDTH = 991;
const RESIZE_DEBOUNCE_DELAY = 250;

export default class extends SessionService {
  @service ajax;
  @service house;
  @service router;

  // The logged-in user
  @tracked user = null;

  // How many unread messages the user has
  @tracked unreadMessageCount = 0;

  // Temporary login token used to log in & change or set the password.
  // Token becomes invalid once the password has changed.
  tempLoginToken = null;

  // Is this a PNV first time login?
  isWelcome = null;

  // Is a mobile device/cellphone being used
  isMobileDevice = false;

  // Is a tablet being used?
  isTabletDevice = false;

  // True if the mobile screen size is less than MOBILE_MAX_WIDTH
  @tracked isSmallScreen = false;

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

    this.browserDetect = new BrowserDetector();
  }

  /**
   * Checks to see if the user has the Login Management role OR
   * @returns {boolean}
   */

  get isLMOPEnabled() {
    return (this.hasRole(MANAGE) && !!config('LoginManageOnPlayaEnabled'));
  }

  /**
   * Debounce the window resized event. Prevents excessive re-renderings when the
   * user is resizing the window or rotating the device's orientation.
   *
   * @private
   */

  @action
  _bounceResizeEvent() {
    debounce(this, this._windowResized, RESIZE_DEBOUNCE_DELAY);
  }

  /**
   * Check to see if the new screen size matches a small screen width.
   *
   * @private
   */

  _windowResized() {
    this.isSmallScreen = (document.documentElement.clientWidth <= MOBILE_MAX_WIDTH);
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
   * Called when.session.invalidate() is called or when the authentication token expires.
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

  /**
   * Update the signed in position.
   */

  updateOnDuty() {
    return this.ajax.request(`person/${this.userId}/onduty`)
      .then(({onduty}) => this.user.onduty_position = onduty)
      .catch((response) => this.house.handleErrorResponse(response))
  }

  /**
   * Return the user id if available
   *
   * @returns {number|null}
   */
  get userId() {
    return (this.isAuthenticated && this.user) ? +this.user.id : null;
  }


  /**
   * Is this the staging (aka test) server?
   * @returns {boolean}
   */

  get isStaging() {
    return config('DeploymentEnvironment') === 'Staging' && !this.isDevelopment;
  }

  /**
   * Is this the training server? (most likely running in Ground Hog Day mode as well.)
   *
   * @returns {boolean}
   */

  get isTraining() {
    return config('DeploymentEnvironment') === 'Training';
  }

  /**
   * Can the user view another person's email address?
   *
   * @returns {boolean}
   */

  get canViewEmail() {
    return this.hasRole([ADMIN, VIEW_PII, VIEW_EMAIL, VC]);
  }

  /**
   * Is the user an Admin?
   * @returns {boolean}
   */

  get isAdmin() {
    return this.hasRole(ADMIN);
  }

  /**
   * Is the user a VC?
   *
   * @returns {boolean}
   */

  get isVC() {
    return this.hasRole(VC);
  }

  /**
   * Does the user hold the given role(s)?
   * @param {number|number[]} roles
   * @returns {boolean}
   */

  hasRole(roles) {
    if (!this.user) {
      // User not logged in
      return false;
    }

    const personRoles = this.user.roles;

    if (!personRoles) {
      return false;
    }

    if (typeOf(roles) !== 'array') {
      roles = [roles];
    }

    let haveIt = false;

    roles.forEach((role) => {
      const type = typeOf(role);
      if (type === 'array' || type === 'object') {
        let haveAll = true;

        // Sub array means ALL the roles have to be present.
        role.forEach((r) => {
          if (!role) {
            throw new Error('hasRole: Unknown role - is the name spelled correctly?');
          }

          if (!personRoles.includes(r)) {
            haveAll = false;
          }
        });

        if (haveAll) {
          haveIt = true;
        }
      } else {
        if (!role) {
          throw new Error('hasRole: Unknown role - is the name spelled correctly?');
        }
        if (personRoles.includes(role)) {
          haveIt = true;
        }
      }
    })

    return haveIt;
  }

  /**
   * Obtain the JWT token
   * @returns {string|null}
   */

  get jwt() {
    return this.isAuthenticated ? this.data.authenticated.token : null;
  }
}


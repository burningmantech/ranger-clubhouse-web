import {service} from "@ember/service";
import {action} from '@ember/object';
import {typeOf} from '@ember/utils';
import {debounce} from '@ember/runloop';
import {tracked} from '@glimmer/tracking';
import SessionService from "ember-simple-auth/services/session";
import User from "clubhouse/models/user";
import ENV from 'clubhouse/config/environment';
import {setting} from 'clubhouse/utils/setting';
import {ADMIN, MANAGE, TRAINER, VC, VIEW_PII, VIEW_EMAIL} from 'clubhouse/constants/roles';
import MobileDetect from 'mobile-detect';
import BrowserDetector from "../utils/browser-detect";

const MOBILE_MAX_WIDTH = 960;
const RESIZE_DEBOUNCE_DELAY = 250;

// Use to signal other browser windows of session updates.
const MAILBOX_KEY = 'clubhouse_mailbox';

export default class extends SessionService {
  @service ajax;
  @service house;
  @service router;

  // The logged-in user
  @tracked user = null;

  // How many unread messages the user has
  @tracked unreadMessageCount = 0;

  @tracked showSearchDialog = false;

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

  // When a request is aborted due to an offline or flakey Internet, pop up a dialog letting the user
  // know something is up.
  @tracked showOfflineDialog = false;

  @tracked isOffline = false;

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
    this.isMac = navigator.userAgent.indexOf("Mac") !== -1;
    this.browserDetect = new BrowserDetector();

    // Setup browser window to browser window signalling.
    try {
      const item = window.localStorage.getItem(MAILBOX_KEY);
      if (!item) {
        window.localStorage.setItem(MAILBOX_KEY, Date.now().toString());
      }
      window.addEventListener('storage', (event) => this._mailboxUpdated(event))
    } catch {
      /* empty */
    }
  }

  /**
   * Reload the user when the mailbox has been updated.
   *
   * @params {StorageEvent} event
   * @private
   */

  async _mailboxUpdated(event) {
    if (event.key !== MAILBOX_KEY) {
      return;
    }

    if (!this.isAuthenticated) {
      return; // Not logged in yet.
    }

    await this.loadUser(true);
    await this.loadConfig(false);
  }

  /**
   * Checks to see if the user has the Login Management role OR
   * @returns {boolean}
   */

  get isLMOPEnabled() {
    return (this.hasRole(MANAGE) && !!setting('LoginManageOnPlayaEnabled'));
  }


  get hasLoginManagement() {
    return this.hasRole(MANAGE);
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
    return this.loadUser(true).then(() => {
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

  async loadUser(isAuthenticating = false) {
    if (!this.isAuthenticated) {
      return Promise.resolve();
    }

    const person_id = this.data.authenticated.tokenData.sub;
    const {user_info} = await this.ajax.request(`person/${person_id}/user-info`);
    this.user = new User(user_info);
    this.unreadMessageCount = user_info.unread_message_count;

    if (isAuthenticating) {
      return;
    }

    this._signalMailbox();
  }

  /**
   * Update the signed in position.
   */

  async updateOnDuty() {
    try {
      const {onduty} = await this.ajax.request(`person/${this.userId}/onduty`);
      const didChange = onduty?.id !== this.user.onduty_position?.id;
      this.user.onduty_position = onduty;
      if (didChange) {
        this._signalMailbox();
      }
    } catch (response) {
      this.house.handleErrorResponse(response)
    }
  }

  /**
   * Load the configuration.
   *
   * @param didUpdate
   * @returns {Promise<void>}
   */

  async loadConfig(didUpdate = false) {
    try {
      ENV['clientConfig'] = await this.ajax.request('config');
      if (didUpdate) {
        this._signalMailbox();
      }
    } catch (response) {
      this.house.handleErrorResponse(response);
    }
  }

  /**
   * Signal the other browser instances the user's permissions or setting might have changed.
   *
   * @private
   */

  _signalMailbox() {
    try {
      window.localStorage.setItem(MAILBOX_KEY, Date.now().toString());
    } catch {
      /* empty */
    }
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
    return setting('DeploymentEnvironment') === 'Staging' && !this.isDevelopment;
  }

  /**
   * Is this the training server? (most likely running in Ground Hog Day mode as well.)
   *
   * @returns {boolean}
   */

  get isTraining() {
    return setting('DeploymentEnvironment') === 'Training';
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
   * Can the user view another person's personal info (address, phone #, email)
   *
   * @returns {boolean}
   */

  get canViewPII() {
    return this.hasRole([ADMIN, VC, VIEW_PII]);
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
   * Does the person have the real Trainer role (i.e., not granted because Training Seasonal was enabled.)
   *
   * @returns {boolean}
   */

  get isRealTrainer() {
    return this.hasTrueRole(TRAINER);
  }

  /**
   * Does the user hold the given effective role(s)?
   *
   * @param {number|number[]} roles
   * @returns {boolean}
   */

  hasRole(roles) {
    if (!this.user) {
      // User not logged in
      return false;
    }

    return this._checkForRoles(roles, this.user.roles)
  }

  /**
   * Does the user hold the given un-massaged role(s)?
   *
   * @param {number|number[]} roles
   * @returns {boolean}
   */

  hasTrueRole(roles) {
    if (!this.user) {
      // User not logged in
      return false;
    }

    return this._checkForRoles(roles, this.user.true_roles);
  }

  /**
   * Does the user hold the given role(s)?
   * @param {number|number[]} roles
   * @param {number[]|null} grantedRoles
   * @returns {boolean}
   */

  _checkForRoles(roles, grantedRoles) {
    if (!this.user || !grantedRoles) {
      // User not logged in
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

          if (!grantedRoles.includes(r)) {
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

        if (grantedRoles.includes(role)) {
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


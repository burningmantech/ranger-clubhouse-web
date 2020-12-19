import {inject as service} from "@ember/service";
import {action} from '@ember/object';
import SessionService from "ember-simple-auth/services/session";
import User from "clubhouse/models/user";
import MobileDetect from 'mobile-detect';
import {debounce} from '@ember/runloop';
import ENV from 'clubhouse/config/environment';
import {config} from 'clubhouse/utils/config';
import { tracked } from '@glimmer/tracking';

const MOBILE_MAX_WIDTH = 834;
const RESIZE_DEBOUNCE_DELY = 250;

export default class extends SessionService {
  @service ajax;
  @tracked user = null;
  @tracked unreadMessageCount = 0;

  isMobileDevice = false;
  isTabletDevice = false;

  // Screen size may change due to window resize or device orientation.
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

  @action
  _bounceResizeEvent() {
    debounce(this, this._windowResized, RESIZE_DEBOUNCE_DELY);
  }

  _windowResized() {
    this.isMobileScreen = (document.documentElement.clientWidth <= MOBILE_MAX_WIDTH);
  }

  loadUser() {
    if (!this.isAuthenticated) {
      return Promise.resolve();
    }

    const person_id = this.data.authenticated.tokenData.sub;
    return this.ajax.request(`person/${person_id}/user-info`)
      .then(({ user_info }) => {
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


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
  @service store;

  @tracked user = null;

  isMobileDevice = false;
  isTabletDevice = false;

  // Screen size may change due to window resize or device orientation.
  @tracked isMobileScreen = false;

  get userId() {
    return (this.isAuthenticated && this.user) ? this.user.id : null;
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

    const person_id = this.session.get('authenticated.person_id');

    return this.store.findRecord('person', person_id, {reload: true})
      .then((person) => {
        return person.loadUserInfo().then(() => {
          this.user = User.create({
            id: person.id,
            callsign: person.callsign,
            callsign_approved: person.callsign_approved,
            roles: person.roles,
            status: person.status,
            teacher: person.teacher,
            has_hq_window: person.has_hq_window,
            onduty_position: person.onduty_position,
            unread_message_count: person.unread_message_count,
            bpguid: person.bpguid, // PNV or Actives must have a BPGUID to sign up.
            may_request_stickers: person.may_request_stickers,
          });
        });
      });
  }

  get isStaging() {
    return config('DeploymentEnvironment') === 'Staging' && !this.isDevelopment;
  }

  get isTraining() {
    return config('DeploymentEnvironment') === 'Training';
  }
}


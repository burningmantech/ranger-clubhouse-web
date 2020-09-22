import {inject as service} from "@ember/service";
import {action} from '@ember/object';
import SessionService from "ember-simple-auth/services/session";
import User from "clubhouse/models/user";
import MobileDetect from 'mobile-detect';
import {debounce} from '@ember/runloop';
import ENV from 'clubhouse/config/environment';
import {config} from 'clubhouse/utils/config';

const MOBILE_MAX_WIDTH = 719;
const RESIZE_DEBOUNCE_DELY = 250;

export default class extends SessionService {
  @service store;

  user = null;

  isMobileDevice = false;
  isMobileScreen = false;
  isTabletDevice = false;

  get userId() {
    return (this.isAuthenticated && this.user) ? this.user.id : null;
  }

  constructor() {
    super(...arguments);
    //this._super(...arguments);

    const md = new MobileDetect(navigator.userAgent);

    this.isMobileDevice = md.mobile();
    this.isTabletDevice = md.tablet();

    /*
     * Notify when the screen resizes so the layout can adjust accordingly.
      */

    window.addEventListener('resize', this._bounceResizeEvent, false);
    this._windowResized();
  }

  @action
  _bounceResizeEvent() {
    debounce(this, this._windowResized, RESIZE_DEBOUNCE_DELY);
  }

  _windowResized() {
    this.set('isMobileScreen', (document.documentElement.clientWidth <= MOBILE_MAX_WIDTH));
  }

  loadUser() {
    if (!this.isAuthenticated) {
      return Promise.resolve();
    }

    const person_id = this.session.get('authenticated.person_id');

    return this.store.findRecord('person', person_id, {reload: true})
      .then((person) => {
        return person.loadUserInfo().then(() => {
          const user = User.create({
            id: person.id,
            callsign: person.callsign,
            callsign_approved: person.callsign_approved,
            roles: person.roles,
            status: person.status,
            teacher: person.teacher,
            has_hq_window: person.has_hq_window,
            is_on_duty_at_hq: person.is_on_duty_at_hq,
            unread_message_count: person.unread_message_count,
            bpguid: person.bpguid, // PNV or Actives must have a BPGUID to sign up.
            may_request_stickers: person.may_request_stickers,
          });

          this.set('user', user);
        });
      });
  }

  get isDevelopment() {
    return ENV.environment === 'development';
  }

  get isStaging() {
    return config('DeploymentEnvironment') === 'Staging' && !this.isDevelopment;
  }

  get isTraining() {
    return config('DeploymentEnvironment') === 'Training';
  }
}

